# Unity SDK

The Hive Axyl Unity SDK is a C# UPM package (`com.hiveaxyl.sdk`) with an async/await API.

Before you start, create a project and issue a client API key in the console. See [Projects & API Keys](/console/projects-api-keys).

## Requirements

- Unity 2021.3 LTS or newer
- Target platforms: Standalone (Windows/macOS/Linux), WebGL, Android, iOS
- The package bundles its managed dependencies, so no extra package installs are needed

## Installation

Add the SDK Git dependency to `Packages/manifest.json`:

```json
{
  "dependencies": {
    "com.hiveaxyl.sdk": "https://github.com/conx-dev/hive-axyl-unity-sdk.git#<VERSION>"
  }
}
```

Replace `<VERSION>` with a published SDK version.

Unity imports the package and its bundled plugins automatically.

## Initialize

The public entry points are `HiveAxylSdk.CreateHiveAxyl(config)` and `HiveAxyl.InitializeAsync()`. Initialization connects to the platform and binds the domain APIs (`Auth`, `Notice`, `Mailbox`, `Payment`).

```csharp
using HiveAxyl.Sdk;

var config = new HiveAxylConfig
{
    ProjectId = "your-project-id",
    ApiKey = "your-api-key",
    Language = "en",
    Platform = HiveAxylClientPlatform.Auto,
};

HiveAxyl.Sdk.HiveAxyl hive = HiveAxylSdk.CreateHiveAxyl(config);
await hive.InitializeAsync();
// hive.IsReady == true
```

::: tip Fully qualified type name
The class `HiveAxyl` lives in the namespace `HiveAxyl.Sdk`. If your own code has a `HiveAxyl` symbol in scope, use the fully qualified `HiveAxyl.Sdk.HiveAxyl` for fields and locals, as the bundled sample app does.
:::

### Configuration options

| Property | Type | Required | Description |
| --- | --- | --- | --- |
| `ProjectId` | `string` | Yes | Project identifier from the console |
| `ApiKey` | `string` | Yes | Client API key issued in the console |
| `ClientVersion` | `string` | No | Defaults to `Application.version` |
| `Language` | `string` | No | Defaults to `CultureInfo.CurrentUICulture.Name` |
| `Debug` | `bool` | No | Enables SDK debug logging |
| `PersistSession` | `bool` | No | Store tokens in `PlayerPrefs` (default `true`); `false` keeps them in memory |
| `Platform` | `HiveAxylClientPlatform` | No | `Auto` (default), `Web`, `Android`, `Ios`, `Desktop` |
| `TokenStorage` | `ITokenStorage` | No | Custom token storage (overrides `PersistSession`) |

### Platform mapping

With `Platform = HiveAxylClientPlatform.Auto`, the SDK reports the runtime platform to the server:

| Unity runtime | Reported platform |
| --- | --- |
| Android | `ANDROID` |
| iOS | `IOS` |
| WebGL | `WEB` |
| Standalone / Editor | `DESKTOP` |

The server uses this to apply per-platform login and policy rules.

## Login

Fetch the provider list first — the server decides which providers are exposed per project, platform, and country, and the client should only display what the response contains.

```csharp
LoginProviders result = await hive.Auth.GetLoginProvidersAsync();
// result.Providers: lowercase names, e.g. ["google", "guest"]
```

### Guest login

```csharp
Player player = await hive.Auth.LoginAsGuestAsync();
Debug.Log($"{player.PlayerId} / {player.Nickname}");
```

The SDK creates a cryptographically random installation credential in `PlayerPrefs` on the first guest login. It is independent of session storage and remains after `LogoutAsync()`. Identity-provider login neither creates nor uses it. Guest login fails before sending a request if durable storage is unavailable. Clearing player data can create a new guest account, and the previous guest account may not be recoverable.

### Google

The SDK does not bundle a Google Sign-In plugin. Obtain a Google ID token with the sign-in solution appropriate for your target platform (for example the Google Sign-In plugin for Unity on mobile), then pass it through — the server verifies the token:

```csharp
Player player = await hive.Auth.LoginWithGoogleAsync(googleIdToken);
```

Register your OAuth client IDs for the project in the console first. See [Login Providers](/console/login-providers).

### Facebook (desktop OAuth)

For Standalone and Editor builds, `LoginWithFacebookDesktopAsync()` opens the system browser and completes Facebook login through a `127.0.0.1` loopback callback.

Configure the Facebook App ID and App Secret in the Hive Axyl console. Register the Facebook Redirect URI shown on the credential card as an exact Valid OAuth Redirect URI in Meta for Developers. This flow does not use the Facebook JavaScript SDK, so a JavaScript SDK allowed domain is not required.

### Apple

On Android, iOS, and WebGL, obtain an Apple identity token through the platform bridge and pass it to the direct API:

```csharp
Player player = await hive.Auth.LoginWithAppleAsync(appleIdentityToken);
```

For Standalone and Editor builds, `LoginWithAppleDesktopAsync(servicesId)` opens the system browser and receives the Hive Axyl result through a `127.0.0.1` form POST callback.

Register the Services ID in the Hive Axyl console. In Apple Developer, register the HTTPS Apple Redirect URI shown on the console credential card as the Services ID Return URL. Do not register the SDK's `127.0.0.1` callback with Apple; it is only used between the Hive Axyl auth server and the local game process. Apple private keys remain in the console and auth server.

## Session persistence

- By default (`PersistSession = true`) the token pair is stored in `PlayerPrefs`; set `PersistSession = false` to keep it in memory.
- After `InitializeAsync()`, call `RestoreSessionAsync()` to resume a previous login. It returns the `Player`, or `null` when there is no valid session:

```csharp
await hive.InitializeAsync();
Player restored = await hive.Auth.RestoreSessionAsync();
if (restored == null)
{
    // show the login screen
}
```

- When a call fails with `SESSION_EXPIRED`, the SDK refreshes the token pair once and retries automatically.
- Use `hive.Auth.PlayerValidationToken` immediately after login when your game uses server-side player validation.
- `LogoutAsync()` revokes the session on the server (best effort) and always clears the local session.

## Error handling

All domain errors surface as typed exceptions — branch on exception types and `ErrorCode`, never on message strings:

```csharp
using HiveAxyl.Sdk;

try
{
    Player player = await hive.Auth.LoginAsGuestAsync();
}
catch (HiveAxylBannedException banned)
{
    // banned.Reason, banned.Permanent, banned.Until (DateTime?)
}
catch (HiveAxylMaintenanceException maintenance)
{
    // maintenance.MaintenanceMessage, maintenance.StartsAt, maintenance.EndsAt
}
catch (HiveAxylException error)
{
    // error.ErrorCode (enum), error.Code (string, e.g. "PROVIDER_NOT_ENABLED"),
    // error.Metadata, error.IsTransport
}
```

You can also subscribe to ban notifications globally — the event fires whenever any auth call is rejected because the player is banned:

```csharp
hive.Auth.Banned += banned =>
{
    // show a "player banned" popup
};
```

See [Error Codes](/guide/error-codes) for the full list of platform error codes.

## WebGL notes

::: warning
- WebGL builds run under the browser's CORS policy — the platform services must allow your game's origin.
- WebGL clients are reported as `WEB`, so the server applies the web login policy (including whether guest login is allowed on web).
:::

## Beyond auth

After login, the same client exposes:

- `hive.Notice.ListActiveNoticesAsync()` — active notices in the configured language
- `hive.Mailbox.ListMailAsync(...)`, `CheckNewMailAsync()`, `ClaimMailAsync(id)` — player mailbox
- `hive.Payment` — product listing and purchase verification; see [Payments](/console/payments)

Method arguments and return types for every domain are in the [API Reference](/reference/overview).

For the overall platform flow, read the [Architecture](/guide/architecture) guide. Other platforms: [Web](/platforms/web), [Android](/platforms/android), [iOS](/platforms/ios), [Godot](/platforms/godot).
