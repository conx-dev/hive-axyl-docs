# Unity SDK

The Hive Axyl Unity SDK is a UPM package (`com.hiveaxyl.sdk`) written in C#. It uses `UnityWebRequest` for transport and `Google.Protobuf` for the wire format, and exposes an async/await API surface.

Before you start, create a project and issue a client API key in the console. See [Projects & API Keys](/console/projects-api-keys).

## Requirements

- Unity 2021.3 LTS or newer
- Target platforms: Standalone (Windows/macOS/Linux), WebGL, Android, iOS
- The package bundles its managed dependencies (`Google.Protobuf` and transitive DLLs), so no extra package installs are needed

## Installation

::: tip Distribution channels are being prepared
Publication to a UPM registry is being prepared. Until then, reference the SDK as a local UPM package.
:::

Copy (or clone) the SDK package folder somewhere accessible to your project, then add a `file:` reference to `Packages/manifest.json`:

```json
{
  "dependencies": {
    "com.hiveaxyl.sdk": "file:../../path/to/hive-axyl-unity-sdk"
  }
}
```

The path is relative to your project's `Packages/` folder. Unity imports the package and its bundled plugins automatically. The bundled sample app uses exactly this local-reference layout.

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
Player player = await hive.Auth.LoginAsGuestAsync(SystemInfo.deviceUniqueIdentifier);
Debug.Log($"{player.PlayerId} / {player.Nickname}");
```

### Google

The SDK does not bundle a Google Sign-In plugin. Obtain a Google ID token with the sign-in solution appropriate for your target platform (for example the Google Sign-In plugin for Unity on mobile), then pass it through — the server verifies the token:

```csharp
Player player = await hive.Auth.LoginWithGoogleAsync(googleIdToken);
```

Register your OAuth client IDs for the project in the console first. See [Login Providers](/console/login-providers).

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
- Use `hive.Auth.PlayerValidationToken` immediately after login when your own game server needs to call `ValidatePlayer`.
- `LogoutAsync()` revokes the session on the server (best effort) and always clears the local session.

## Error handling

All domain errors surface as typed exceptions — branch on exception types and `ErrorCode`, never on message strings:

```csharp
using HiveAxyl.Sdk;

try
{
    Player player = await hive.Auth.LoginAsGuestAsync(deviceId);
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
