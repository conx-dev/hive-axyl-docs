# iOS SDK

The Hive Axyl iOS SDK (`HiveAxylSDK`) is a Swift package with an async/await API. Session tokens are stored in the Keychain by default.

Before you start, create a project and issue a client API key in the console. See [Projects & API Keys](/console/projects-api-keys).

## Requirements

- iOS 14+ or macOS 12+
- Swift 5.9+ (Xcode 15 or newer)
- Swift Package Manager

## Installation

Add the GitHub Swift package and link the `HiveAxylSDK` product to your target.

```swift
dependencies: [
    .package(
        url: "https://github.com/conx-dev/hive-axyl-ios-sdk.git",
        from: "<VERSION>"
    )
]

.target(
    name: "YourApp",
    dependencies: [
        .product(name: "HiveAxylSDK", package: "hive-axyl-ios-sdk")
    ]
)
```

Replace `<VERSION>` with a published SDK version.

## Initialize

Create the client with `HiveAxyl(config:)` (throws on invalid config) and call `initialize()` once. Initialization connects to the platform and binds the domain APIs (`auth`, `notice`, `mailbox`, `payment`, `push`).

```swift
import HiveAxylSDK

let hive = try HiveAxyl(config: HiveAxylConfig(
    projectId: "your-project-id",
    apiKey: "your-api-key",
    clientVersion: "1.0.0",
    language: "en"
))

try await hive.initialize()
// hive.isReady == true
```

### Configuration options

| Parameter | Type | Required | Description |
| --- | --- | --- | --- |
| `projectId` | `String` | Yes | Project identifier from the console |
| `apiKey` | `String` | Yes | Client API key issued in the console |
| `clientVersion` | `String` | No | Reported for version gating |
| `language` | `String` | No | Defaults to the current locale identifier |
| `debug` | `Bool` | No | Enables SDK debug logging |
| `tokenStorage` | `TokenStorage?` | No | Custom token storage; defaults to the Keychain |
| `urlSessionConfiguration` | `URLSessionConfiguration?` | No | Inject a custom `URLSession` configuration |

## Login

Fetch the provider list first — the server decides which providers are exposed per project and country, and the client should only display what the response contains.

```swift
let providers = try await hive.auth.getLoginProviders()
// providers.providers: lowercase names, e.g. ["google", "apple", "facebook", "guest"]
```

### Guest login

```swift
let player = try await hive.auth.loginAsGuest()
print(player.playerId, player.nickname)
```

The SDK creates a cryptographically random installation credential in Keychain on the first guest login. It is independent of session storage and remains after `logout()`. Identity-provider login neither creates nor uses it. Guest login fails before sending a request if durable storage is unavailable. Clearing the credential can create a new guest account, and the previous guest account may not be recoverable.

### Google

The SDK does not bundle Google Sign-In. Use the GoogleSignIn SDK to obtain an ID token, then pass it to `loginWithGoogle(idToken:)` — the server verifies it:

```swift
import GoogleSignIn

GIDSignIn.sharedInstance.configuration = GIDConfiguration(
    clientID: "YOUR_GOOGLE_CLIENT_ID.apps.googleusercontent.com"
)

GIDSignIn.sharedInstance.signIn(withPresenting: presenter) { result, error in
    guard error == nil, let idToken = result?.user.idToken?.tokenString else {
        return
    }
    Task {
        let player = try await hive.auth.loginWithGoogle(idToken: idToken)
    }
}
```

Register an iOS OAuth client (bundle ID) in the Google Cloud Console, add the reversed client ID URL scheme to your app, and register the client ID for your project in the Hive Axyl console. See [Login Providers](/console/login-providers).

### Apple

Use Sign in with Apple (`AuthenticationServices`) to obtain the identity token, then pass it to `loginWithApple(identityToken:)`:

```swift
import AuthenticationServices
import SwiftUI

SignInWithAppleButton(
    onRequest: { request in
        request.requestedScopes = [.email]
    },
    onCompletion: { result in
        guard case let .success(authorization) = result,
              let credential = authorization.credential as? ASAuthorizationAppleIDCredential,
              let tokenData = credential.identityToken,
              let identityToken = String(data: tokenData, encoding: .utf8) else {
            return
        }
        Task {
            let player = try await hive.auth.loginWithApple(identityToken: identityToken)
        }
    }
)
```

### Facebook

Obtain an access token with the Facebook Login SDK and pass it through:

```swift
let player = try await hive.auth.loginWithFacebook(accessToken: accessToken)
```

## Session persistence

- Tokens are stored in the Keychain by default (`KeychainTokenStorage`), so sessions survive app restarts without any configuration.
- After `initialize()`, call `restoreSession()` to resume a previous login. It returns the `Player`, or `nil` when there is no valid session (it does not throw):

```swift
try await hive.initialize()
if let restored = await hive.auth.restoreSession() {
    // signed in as restored.nickname
} else {
    // show the login screen
}
```

- When a call fails with `SESSION_EXPIRED`, the SDK refreshes the token pair once and retries automatically.
- Use `hive.auth.playerValidationToken()` immediately after login when your game uses server-side player validation.
- `logout()` revokes the session on the server (best effort) and always clears the local session.
- `currentPlayer()` returns the last known player without a network call; `getPlayer()` fetches it from the server.

## Error handling

All domain errors surface as the `HiveAxylError` enum — branch on cases, never on message strings:

```swift
do {
    let player = try await hive.auth.loginAsGuest()
} catch let HiveAxylError.banned(reason, until, permanent) {
    // show a ban notice
} catch let HiveAxylError.maintenance(info) {
    // info.message, info.startsAt, info.endsAt
} catch let HiveAxylError.code(errorCode, message) {
    // typed platform error code, e.g. .providerNotEnabled
} catch {
    // transport or other errors
}
```

The full case list: `.notInitialized`, `.invalidArgument(String)`, `.maintenance(MaintenanceInfo)`, `.geoBlocked(country:)`, `.banned(reason:until:permanent:)`, `.duplicateReceipt`, `.code(ErrorCode, message:)`, `.transport(String)`.

You can also register a global ban listener — it fires whenever any auth call is rejected because the player is banned:

```swift
hive.auth.onBanned { reason, until, permanent in
    // show a "player banned" popup
}
```

See [Error Codes](/guide/error-codes) for the full list of platform error codes.

## Beyond auth

After login, the same client exposes:

- `hive.notice` — active notices in the configured language
- `hive.mailbox` — mailbox listing, new-mail check, claiming
- `hive.payment` — product listing and purchase verification; see [Payments](/console/payments)
- `hive.push` — remote push target registration (APNs via your push provider setup)

Method arguments and return types for every domain are in the [API Reference](/reference/overview).

For the overall platform flow, read the [Architecture](/guide/architecture) guide. Other platforms: [Web](/platforms/web), [Unity](/platforms/unity), [Android](/platforms/android), [Godot](/platforms/godot).
