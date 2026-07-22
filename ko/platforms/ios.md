# iOS SDK

Hive Axyl iOS SDK(`HiveAxylSDK`)는 async/await API를 제공하는 Swift package입니다. Session token은 기본적으로 Keychain에 저장됩니다.

시작하기 전에 콘솔에서 프로젝트를 만들고 client API key를 발급하세요. [프로젝트와 API 키](/ko/console/projects-api-keys)를 참고하세요.

## 요구 사항

- iOS 14+ 또는 macOS 12+
- Swift 5.9+ (Xcode 15 이상)
- Swift Package Manager

## 설치

GitHub Swift package를 추가하고 `HiveAxylSDK` product를 app target에 연결합니다.

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

`<VERSION>`을 배포된 SDK 버전으로 바꾸세요.

## 초기화

`HiveAxyl(config:)`로 클라이언트를 만들고(잘못된 config면 throw) `initialize()`를 한 번 호출합니다. 초기화는 플랫폼에 연결하고 도메인 API(`auth`, `notice`, `mailbox`, `payment`, `push`)를 binding합니다.

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

### 설정 옵션

| Parameter | Type | Required | Description |
| --- | --- | --- | --- |
| `projectId` | `String` | Yes | 콘솔의 project identifier |
| `apiKey` | `String` | Yes | 콘솔에서 발급한 client API key |
| `clientVersion` | `String` | No | Version gating용으로 보고됨 |
| `language` | `String` | No | 기본값은 현재 locale identifier |
| `debug` | `Bool` | No | SDK debug logging 활성화 |
| `tokenStorage` | `TokenStorage?` | No | Custom token storage. 기본값은 Keychain |
| `urlSessionConfiguration` | `URLSessionConfiguration?` | No | Custom `URLSession` configuration 주입 |

## 로그인

먼저 provider list를 조회하세요. 서버는 프로젝트와 국가별로 노출할 provider를 결정하며, 클라이언트는 응답에 포함된 것만 표시해야 합니다.

```swift
let providers = try await hive.auth.getLoginProviders()
// providers.providers: lowercase names, e.g. ["google", "apple", "facebook", "guest"]
```

### Guest login

```swift
let player = try await hive.auth.loginAsGuest()
print(player.playerId, player.nickname)
```

SDK는 첫 게스트 로그인에서 암호학적으로 안전한 무작위 설치 식별자를 Keychain에 저장합니다. 설치 식별자는 세션 저장소와 분리되며 `logout()` 후에도 유지됩니다. IdP 로그인은 이 값을 만들거나 사용하지 않습니다. 영구 저장소를 사용할 수 없으면 네트워크 요청 전에 게스트 로그인이 실패합니다. 설치 식별자를 지우면 새 게스트 계정이 생성될 수 있습니다. 이전 게스트 계정은 복구하지 못할 수 있습니다.

### Google

SDK는 Google Sign-In을 포함하지 않습니다. GoogleSignIn SDK로 ID token을 얻고 `loginWithGoogle(idToken:)`에 전달하세요. 서버가 검증합니다.

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

Google Cloud Console에서 iOS OAuth client(bundle ID)를 등록하고 reversed client ID URL scheme을 앱에 추가한 뒤, client ID를 Hive Axyl 콘솔의 프로젝트에 등록하세요. [로그인 제공자](/ko/console/login-providers)를 참고하세요.

### Apple

Sign in with Apple(`AuthenticationServices`)로 identity token을 얻고 `loginWithApple(identityToken:)`에 전달합니다.

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

Facebook Login SDK로 access token을 얻고 그대로 전달합니다.

```swift
let player = try await hive.auth.loginWithFacebook(accessToken: accessToken)
```

## 세션 영속성

- Token은 기본적으로 Keychain(`KeychainTokenStorage`)에 저장되므로 별도 설정 없이 app restart 후에도 세션이 유지됩니다.
- `initialize()` 후 `restoreSession()`을 호출해 이전 로그인을 복구합니다. 유효한 세션이 없으면 `nil`을 반환합니다. 이 메서드는 throw하지 않습니다.

```swift
try await hive.initialize()
if let restored = await hive.auth.restoreSession() {
    // signed in as restored.nickname
} else {
    // show the login screen
}
```

- 호출이 `SESSION_EXPIRED`로 실패하면 SDK는 token pair를 한 번 갱신하고 자동으로 재시도합니다.
- 게임에서 서버 측 플레이어 검증을 사용한다면 로그인 직후 `hive.auth.playerValidationToken()`을 사용하세요.
- `logout()`은 서버에서 세션을 폐기하고(best effort) 항상 로컬 세션을 지웁니다.
- `currentPlayer()`는 network call 없이 마지막 known player를 반환합니다. `getPlayer()`는 서버에서 조회합니다.

## 에러 처리

모든 도메인 에러는 `HiveAxylError` enum으로 노출됩니다. Message string이 아니라 case로 분기하세요.

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

전체 case list: `.notInitialized`, `.invalidArgument(String)`, `.maintenance(MaintenanceInfo)`, `.geoBlocked(country:)`, `.banned(reason:until:permanent:)`, `.duplicateReceipt`, `.code(ErrorCode, message:)`, `.transport(String)`.

전역 ban listener를 등록할 수도 있습니다. Auth call이 player banned로 reject될 때마다 발생합니다.

```swift
hive.auth.onBanned { reason, until, permanent in
    // show a "player banned" popup
}
```

전체 platform error code 목록은 [에러 코드](/ko/guide/error-codes)를 참고하세요.

## Auth 이후

로그인 후 같은 클라이언트에서 다음을 사용할 수 있습니다.

- `hive.notice` - 설정된 언어의 active notices
- `hive.mailbox` - mailbox listing, new-mail check, claiming
- `hive.payment` - product listing과 purchase verification. [결제](/ko/console/payments) 참고
- `hive.push` - remote push target registration(APNs via your push provider setup)

같은 Firebase installation에서 player를 전환할 때 새 player가 보내는 FCM registration token은 이전 player가 등록한 token과 같아야 합니다. Firebase가 token을 먼저 갱신했다면 이전 player session으로 새 token을 등록한 뒤 player를 전환하세요.

모든 domain의 method argument와 return type은 [API 레퍼런스](/ko/reference/overview)에 있습니다.

전체 플랫폼 흐름은 [아키텍처](/ko/guide/architecture) 가이드를 읽어보세요. 다른 플랫폼: [Web](/ko/platforms/web), [Unity](/ko/platforms/unity), [Android](/ko/platforms/android), [Godot](/ko/platforms/godot).
