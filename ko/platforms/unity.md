# Unity SDK

Hive Axyl Unity SDK는 C#으로 작성된 UPM 패키지(`com.hiveaxyl.sdk`)입니다. Transport에는 `UnityWebRequest`, wire format에는 `Google.Protobuf`를 사용하며 async/await API를 제공합니다.

시작하기 전에 콘솔에서 프로젝트를 만들고 client API key를 발급하세요. [프로젝트와 API 키](/ko/console/projects-api-keys)를 참고하세요.

## 요구 사항

- Unity 2021.3 LTS 이상
- Target platforms: Standalone (Windows/macOS/Linux), WebGL, Android, iOS
- 패키지는 managed dependency(`Google.Protobuf`와 transitive DLL)를 포함하므로 추가 package install이 필요 없습니다.

## 설치

`Packages/manifest.json`에 SDK Git dependency를 추가합니다.

```json
{
  "dependencies": {
    "com.hiveaxyl.sdk": "https://github.com/conx-dev/hive-axyl-unity-sdk.git#0.1.0"
  }
}
```

Unity는 package와 bundled plugin을 자동으로 import합니다.

## 초기화

공개 entry point는 `HiveAxylSdk.CreateHiveAxyl(config)`와 `HiveAxyl.InitializeAsync()`입니다. 초기화는 플랫폼에 연결하고 도메인 API(`Auth`, `Notice`, `Mailbox`, `Payment`)를 binding합니다.

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
`HiveAxyl` class는 `HiveAxyl.Sdk` namespace에 있습니다. 자체 코드 scope에 `HiveAxyl` symbol이 있다면 bundled sample app처럼 field와 local에 fully qualified `HiveAxyl.Sdk.HiveAxyl`을 사용하세요.
:::

### 설정 옵션

| Property | Type | Required | Description |
| --- | --- | --- | --- |
| `ProjectId` | `string` | Yes | 콘솔의 project identifier |
| `ApiKey` | `string` | Yes | 콘솔에서 발급한 client API key |
| `ClientVersion` | `string` | No | 기본값은 `Application.version` |
| `Language` | `string` | No | 기본값은 `CultureInfo.CurrentUICulture.Name` |
| `Debug` | `bool` | No | SDK debug logging 활성화 |
| `PersistSession` | `bool` | No | Token을 `PlayerPrefs`에 저장(기본값 `true`). `false`면 memory only |
| `Platform` | `HiveAxylClientPlatform` | No | `Auto`(기본값), `Web`, `Android`, `Ios`, `Desktop` |
| `TokenStorage` | `ITokenStorage` | No | Custom token storage(`PersistSession` override) |

### Platform mapping

`Platform = HiveAxylClientPlatform.Auto`일 때 SDK는 runtime platform을 서버에 보고합니다.

| Unity runtime | Reported platform |
| --- | --- |
| Android | `ANDROID` |
| iOS | `IOS` |
| WebGL | `WEB` |
| Standalone / Editor | `DESKTOP` |

서버는 이 값을 사용해 platform별 login과 policy rule을 적용합니다.

## 로그인

먼저 provider list를 조회하세요. 서버는 프로젝트, platform, 국가별로 노출할 provider를 결정하며, 클라이언트는 응답에 포함된 것만 표시해야 합니다.

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

SDK는 Google Sign-In plugin을 포함하지 않습니다. 대상 platform에 맞는 sign-in solution(예: 모바일의 Google Sign-In plugin for Unity)으로 Google ID token을 얻고 그대로 전달하세요. 서버가 token을 검증합니다.

```csharp
Player player = await hive.Auth.LoginWithGoogleAsync(googleIdToken);
```

먼저 콘솔에서 프로젝트의 OAuth client ID를 등록하세요. [로그인 제공자](/ko/console/login-providers)를 참고하세요.

### Facebook (desktop OAuth)

Standalone과 Editor build에서는 `LoginWithFacebookDesktopAsync()`가 system browser를 열고 `127.0.0.1` loopback callback을 통해 Facebook 로그인을 완료합니다.

Facebook App ID와 App Secret은 Hive Axyl 콘솔에만 등록하세요. 자격증명 카드에 표시되는 Facebook Redirect URI를 Meta for Developers의 Valid OAuth Redirect URI에 정확히 등록해야 합니다. Facebook JavaScript SDK를 사용하지 않으므로 JavaScript SDK 허용 도메인은 필요하지 않습니다.

## 세션 영속성

- 기본값(`PersistSession = true`)에서는 token pair가 `PlayerPrefs`에 저장됩니다. `PersistSession = false`를 설정하면 memory only입니다.
- `InitializeAsync()` 후 `RestoreSessionAsync()`를 호출해 이전 로그인을 복구합니다. 유효한 세션이 없으면 `null`을 반환합니다.

```csharp
await hive.InitializeAsync();
Player restored = await hive.Auth.RestoreSessionAsync();
if (restored == null)
{
    // show the login screen
}
```

- 호출이 `SESSION_EXPIRED`로 실패하면 SDK는 token pair를 한 번 갱신하고 자동으로 재시도합니다.
- 자체 게임 서버가 `ValidatePlayer`를 호출해야 한다면 로그인 직후 `hive.Auth.PlayerValidationToken`을 사용하세요.
- `LogoutAsync()`는 서버에서 세션을 폐기하고(best effort) 항상 로컬 세션을 지웁니다.

## 에러 처리

모든 도메인 에러는 typed exception으로 노출됩니다. Message string이 아니라 exception type과 `ErrorCode`로 분기하세요.

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

전역 ban notification을 구독할 수도 있습니다. Auth call이 player banned로 reject될 때마다 event가 발생합니다.

```csharp
hive.Auth.Banned += banned =>
{
    // show a "player banned" popup
};
```

전체 platform error code 목록은 [에러 코드](/ko/guide/error-codes)를 참고하세요.

## WebGL notes

::: warning
- WebGL build는 브라우저 CORS policy 아래에서 실행됩니다. Platform service는 게임 origin을 허용해야 합니다.
- WebGL client는 `WEB`으로 보고되므로 서버는 web login policy를 적용합니다. 여기에는 web에서 guest login 허용 여부도 포함됩니다.
:::

## Auth 이후

로그인 후 같은 클라이언트에서 다음을 사용할 수 있습니다.

- `hive.Notice.ListActiveNoticesAsync()` - 설정된 언어의 active notices
- `hive.Mailbox.ListMailAsync(...)`, `CheckNewMailAsync()`, `ClaimMailAsync(id)` - player mailbox
- `hive.Payment` - product listing과 purchase verification. [결제](/ko/console/payments) 참고

모든 domain의 method argument와 return type은 [API 레퍼런스](/ko/reference/overview)에 있습니다.

전체 플랫폼 흐름은 [아키텍처](/ko/guide/architecture) 가이드를 읽어보세요. 다른 플랫폼: [Web](/ko/platforms/web), [Android](/ko/platforms/android), [iOS](/ko/platforms/ios), [Godot](/ko/platforms/godot).
