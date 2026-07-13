# Godot SDK

Hive Axyl Godot SDK는 Godot 4.x Desktop, Android, iOS, Web 게임을 위한 runtime GDScript addon(`addons/hive_axyl`)입니다. Native extension이나 protobuf tooling 없이 Connect JSON protocol을 사용하는 일반 `HTTPRequest` 호출로 플랫폼과 통신합니다.

시작하기 전에 콘솔에서 프로젝트를 만들고 client API key를 발급하세요. [프로젝트와 API 키](/ko/console/projects-api-keys)를 참고하세요.

## 요구 사항

- Godot 4.x(bundled sample project는 Godot 4.6+ 대상)
- Desktop, Android, iOS, Web export target
- Android export의 `INTERNET` 권한 활성화
- HTTPS로 배포하고 Hive Axyl endpoint CORS 정책에 배포 origin을 허용한 Web 환경

## 지원 범위

| Domain | Included |
| --- | --- |
| Auth (providers, guest, Google/Facebook 직접 token, Desktop OAuth, session restore, logout) | Yes |
| Notice (active notices) | Yes |
| Mailbox (list, check new, claim) | Yes |
| Payments | No - Steam payment integration으로 예정 |
| Push | No |

## 설치

SDK를 `addons/hive_axyl` 경로의 Git submodule로 추가합니다.

```bash
git submodule add https://github.com/conx-dev/hive-axyl-godot-sdk.git addons/hive_axyl
git -C addons/hive_axyl checkout <VERSION>
```

`<VERSION>`을 배포된 SDK 버전으로 바꾸세요.

::: tip Runtime addon이며 editor plugin이 아닙니다
Project Settings -> Plugins에서 활성화할 것은 없습니다. 코드 또는 scene에서 `HiveAxyl` node를 만들고 scene tree에 추가합니다.
:::

## 초기화

`HiveAxyl`은 `Node`이며 `initialize()` 전에 **반드시 scene tree 안에 있어야 합니다**. 각 호출용 child `HTTPRequest` node를 만들기 때문입니다.

```gdscript
const HiveAxylClient := preload("res://addons/hive_axyl/hive_axyl.gd")

var hive


func _ready() -> void:
    hive = HiveAxylClient.new()
    add_child(hive)
    hive.error_occurred.connect(_on_hive_error)
    hive.session_changed.connect(_on_session_changed)

    var configured: bool = hive.configure({
        "projectId": "your-project-id",
        "apiKey": "your-api-key",
        "language": "en",
        "googleClientId": "YOUR_GOOGLE_CLIENT_ID.apps.googleusercontent.com",
        "debug": false
    })
    if not configured:
        return

    var initialized: bool = await hive.initialize()
    if initialized:
        var player = await hive.auth.restore_session()
        if player.is_empty():
            _show_login_screen()
```

`initialize()`는 플랫폼에 연결하고 도메인 API를 준비합니다. One-step factory도 있습니다. `HiveAxyl.create_hive_axyl(config)`는 configured node를 반환합니다. 반환된 node는 직접 tree에 추가해야 합니다.

### 설정 key

`configure(config: Dictionary)`는 `camelCase`와 `snake_case` key를 모두 받습니다.

| Key | Required | Description |
| --- | --- | --- |
| `projectId` | Yes | 콘솔의 project identifier |
| `apiKey` | Yes | 콘솔에서 발급한 client API key |
| `clientVersion` | No | Version gating용으로 보고됨 |
| `language` | No | 기본값은 `OS.get_locale_language()` |
| `persistSession` | No | Token을 `user://`에 저장(기본값 `true`). `false`면 memory only |
| `googleClientId` | No | `login_with_google_desktop()`용 Google OAuth **desktop** client ID |
| `debug` | No | SDK log 출력(기본값 `false`) |

필수 key가 빠지면 `configure()`는 `false`를 반환하고 `last_error`를 설정합니다.

## 로그인

먼저 provider list를 조회하세요. SDK는 export target을 감지해 `WEB`, `ANDROID`, `IOS`, `DESKTOP` 중 하나로 보고합니다. 서버는 프로젝트, 국가, 플랫폼별로 노출할 provider를 결정하며, 클라이언트는 응답에 포함된 것만 표시해야 합니다.

```gdscript
var result = await hive.auth.get_login_providers()
# result: { "providers": ["google", "guest"], "country": "US" }
```

| Export target | Guest | Google | Facebook |
| --- | --- | --- | --- |
| Desktop | 직접 API | 직접 ID token 또는 내장 Desktop OAuth | 직접 access token 또는 내장 Desktop OAuth |
| Android | 직접 API | 플랫폼 브릿지 ID token | 플랫폼 브릿지 access token |
| iOS | 직접 API | 플랫폼 브릿지 ID token | 플랫폼 브릿지 access token |
| Web | 직접 API | JavaScript 브릿지 ID token | JavaScript 브릿지 access token |

Godot SDK는 Google/Facebook native plugin이나 JavaScript provider SDK를 포함하지 않습니다. Android, iOS, Web에서는 게임의 플랫폼 브릿지가 provider token을 획득한 뒤 Hive Axyl 직접 로그인 API를 호출합니다.

### Guest login

```gdscript
var player = await hive.auth.login_as_guest(OS.get_unique_id())
if not player.is_empty():
    print("guest login: ", player.get("player_id", ""))
```

### Google

모든 export target에서 플랫폼 provider 브릿지가 획득한 ID token을 전달할 수 있습니다.

```gdscript
var player = await hive.auth.login_with_google(id_token)
```

#### Desktop OAuth helper

`login_with_google_desktop()`은 전체 desktop OAuth flow를 대신 실행합니다.

1. Google authorization URL을 system browser로 엽니다.
2. `127.0.0.1` loopback port에서 redirect를 수신하고 authorization code를 가져옵니다.
3. PKCE로 code를 `id_token`과 교환합니다. **Client secret은 필요하지 않고 저장되지도 않습니다**.
4. `id_token`을 서버에 보내고, 서버가 검증해 플레이어를 로그인시킵니다.

```gdscript
# Uses the configured googleClientId; you can also pass one explicitly.
var player = await hive.auth.login_with_google_desktop()
# or: await hive.auth.login_with_google_desktop("YOUR_GOOGLE_CLIENT_ID.apps.googleusercontent.com")
```

Google Cloud Console에서 OAuth 2.0 **Desktop app** client를 만들고 client ID를 Hive Axyl 콘솔의 프로젝트에 등록하세요. [로그인 제공자](/ko/console/login-providers)를 참고하세요.

### Facebook

모든 export target에서 플랫폼 provider 브릿지가 획득한 access token을 전달할 수 있습니다.

```gdscript
var player = await hive.auth.login_with_facebook(access_token)
```

#### Desktop OAuth helper

`login_with_facebook_desktop()`은 system browser를 열고 `127.0.0.1`에서 Hive Axyl callback을 받은 다음 짧은 수명의 일회용 코드로 로그인을 완료합니다.

Facebook App ID와 App Secret은 Hive Axyl 콘솔에만 등록하세요. 자격증명 카드에 표시되는 Facebook Redirect URI를 Meta for Developers의 Valid OAuth Redirect URI에 정확히 등록해야 합니다. 게임은 App Secret을 받지 않으며 Facebook JavaScript SDK 허용 도메인도 필요하지 않습니다.

두 Desktop OAuth helper는 Android, iOS, Web에서 browser나 loopback listener를 열기 전에 `ERROR_CODE_FAILED_PRECONDITION`을 반환합니다.

## 세션 영속성

- 기본값(`persistSession: true`)에서는 token pair가 `user://hive_ng_session.cfg`에 저장됩니다. `persistSession: false`를 설정하면 memory only입니다.
- Web build에서는 browser 재시작 이후 session file을 사용하기 전에 `OS.is_userfs_persistent()`를 확인하세요.
- `initialize()` 후 `restore_session()`을 호출해 이전 로그인을 복구합니다. 유효한 세션이 없으면 empty Dictionary를 반환합니다.

```gdscript
var player = await hive.auth.restore_session()
if player.is_empty():
    _show_login_screen()
```

- 호출이 `SESSION_EXPIRED`로 실패하면 SDK는 token pair를 한 번 갱신하고 자동으로 재시도합니다.
- 자체 게임 서버가 `ValidatePlayer`를 호출해야 한다면 로그인 직후 `hive.auth.player_validation_token()`을 사용하세요.
- `logout()`은 서버에서 세션을 폐기하고(best effort), 항상 로컬 세션을 지우며 성공 시 `true`를 반환합니다.
- 멱등 read call(providers, player, notices, mailbox reads)은 transient transport error에서 backoff로 재시도됩니다.

## 에러 처리

GDScript에는 exception이 없으므로 실패한 호출은 empty value(`{}`, `null`, 또는 `false`)를 반환하고 에러를 `hive.last_error`에 기록합니다.

```gdscript
var player = await hive.auth.login_as_guest(device_id)
if player.is_empty():
    var code := str(hive.last_error.get("code", ""))
    match code:
        "PLAYER_BANNED":
            var meta: Dictionary = hive.last_error.get("metadata", {})
            _show_ban_popup(meta)
        "MAINTENANCE_IN_PROGRESS":
            _show_maintenance_popup(hive.last_error)
        _:
            _show_error(str(hive.last_error.get("message", "")))
```

`last_error` fields: `code`(string error code), `message`, `metadata`(Dictionary), `http_status`, `retryable`.

Signal을 통해 모든 에러를 한 곳에서 처리할 수도 있습니다.

```gdscript
hive.error_occurred.connect(func(error: Dictionary) -> void:
    print(error.get("code"), ": ", error.get("message"))
)
```

`session_changed(player: Dictionary)` signal은 login, restore, logout 때 발생합니다. Logout 시에는 empty Dictionary를 전달합니다.

전체 platform error code 목록은 [에러 코드](/ko/guide/error-codes)를 참고하세요.

## 공지와 우편함

```gdscript
# Active notices in the configured language
var notices: Array = await hive.notice.list_active_notices()

# Mailbox
var mailbox: Dictionary = await hive.mailbox.list_mail(50, "", true)
var check: Dictionary = await hive.mailbox.check_new_mail()
var claimed: Dictionary = await hive.mailbox.claim_mail(mail_id)
```

모든 domain의 method argument와 return type은 [API 레퍼런스](/ko/reference/overview)에 있습니다.

전체 플랫폼 흐름은 [아키텍처](/ko/guide/architecture) 가이드를 읽어보세요. 다른 플랫폼: [Web](/ko/platforms/web), [Unity](/ko/platforms/unity), [Android](/ko/platforms/android), [iOS](/ko/platforms/ios).
