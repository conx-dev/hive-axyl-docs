# Godot SDK

The Hive Axyl Godot SDK is a runtime GDScript addon (`addons/hive_axyl`) for Godot 4.x desktop games. It talks to the platform with plain `HTTPRequest` calls using the Connect JSON protocol — no native extensions or protobuf tooling required.

Before you start, create a project and issue a client API key in the console. See [Projects & API Keys](/console/projects-api-keys).

## Requirements

- Godot 4.x (the bundled sample project targets Godot 4.6+)
- Desktop targets (Windows, macOS, Linux)

## Supported scope

| Domain | Included |
| --- | --- |
| Auth (providers, guest, Google desktop, session restore, logout) | Yes |
| Notice (active notices) | Yes |
| Mailbox (list, check new, claim) | Yes |
| Payments | No — planned via Steam payment integration |
| Push | No |

## Installation

Copy the `addons/hive_axyl` directory into your Godot project as `addons/hive_axyl` (a symlink also works).

::: tip Runtime addon, not an editor plugin
There is nothing to enable under Project Settings → Plugins. You create a `HiveAxyl` node in code (or in a scene) and add it to the scene tree.
:::

## Initialize

`HiveAxyl` is a `Node` and **must be inside the scene tree** before `initialize()` — it creates child `HTTPRequest` nodes for every call.

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

`initialize()` connects to the platform and prepares the domain APIs. There is also a one-step factory: `HiveAxyl.create_hive_axyl(config)` returns a configured node (you still add it to the tree yourself).

### Configuration keys

`configure(config: Dictionary)` accepts both `camelCase` and `snake_case` keys:

| Key | Required | Description |
| --- | --- | --- |
| `projectId` | Yes | Project identifier from the console |
| `apiKey` | Yes | Client API key issued in the console |
| `clientVersion` | No | Reported for version gating |
| `language` | No | Defaults to `OS.get_locale_language()` |
| `persistSession` | No | Persist tokens to `user://` (default `true`); `false` keeps them in memory |
| `googleClientId` | No | Google OAuth **desktop** client ID for `login_with_google_desktop()` |
| `debug` | No | Prints SDK logs (default `false`) |

`configure()` returns `false` and sets `last_error` when a required key is missing.

## Login

Fetch the provider list first — the server decides which providers are exposed per project and country (the Godot SDK reports the `DESKTOP` platform), and the client should only display what the response contains.

```gdscript
var result = await hive.auth.get_login_providers()
# result: { "providers": ["google", "guest"], "country": "US" }
```

### Guest login

```gdscript
var player = await hive.auth.login_as_guest(OS.get_unique_id())
if not player.is_empty():
    print("guest login: ", player.get("player_id", ""))
```

### Google (desktop OAuth)

`login_with_google_desktop()` runs the full desktop OAuth flow for you:

1. Opens the system browser with a Google authorization URL.
2. Listens on a `127.0.0.1` loopback port for the redirect and captures the authorization code.
3. Exchanges the code for an `id_token` using PKCE — **no client secret is needed or stored**.
4. Sends the `id_token` to the server, which verifies it and signs the player in.

```gdscript
# Uses the configured googleClientId; you can also pass one explicitly.
var player = await hive.auth.login_with_google_desktop()
# or: await hive.auth.login_with_google_desktop("YOUR_GOOGLE_CLIENT_ID.apps.googleusercontent.com")
```

Create an OAuth 2.0 **Desktop app** client in the Google Cloud Console and register the client ID for your project in the Hive Axyl console. See [Login Providers](/console/login-providers).

If you obtain a Google ID token through some other integration, pass it directly:

```gdscript
var player = await hive.auth.login_with_google(id_token)
```

## Session persistence

- By default (`persistSession: true`) the token pair is saved to `user://hive_ng_session.cfg`; set `persistSession: false` to keep it in memory.
- After `initialize()`, call `restore_session()` to resume a previous login. It returns the player Dictionary, or an empty Dictionary when there is no valid session:

```gdscript
var player = await hive.auth.restore_session()
if player.is_empty():
    _show_login_screen()
```

- When a call fails with `SESSION_EXPIRED`, the SDK refreshes the token pair once and retries automatically.
- Use `hive.auth.player_validation_token()` immediately after login when your own game server needs to call `ValidatePlayer`.
- `logout()` revokes the session on the server (best effort), always clears the local session, and returns `true` on success.
- Idempotent read calls (providers, player, notices, mailbox reads) are retried with backoff on transient transport errors.

## Error handling

GDScript has no exceptions, so failed calls return an empty value (`{}`, `null`, or `false`) and record the error in `hive.last_error`:

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

`last_error` fields: `code` (string error code), `message`, `metadata` (Dictionary), `http_status`, `retryable`.

You can also react to every error in one place through the signal:

```gdscript
hive.error_occurred.connect(func(error: Dictionary) -> void:
    print(error.get("code"), ": ", error.get("message"))
)
```

The `session_changed(player: Dictionary)` signal fires on login, restore, and logout (with an empty Dictionary).

See [Error Codes](/guide/error-codes) for the full list of platform error codes.

## Notices and mailbox

```gdscript
# Active notices in the configured language
var notices: Array = await hive.notice.list_active_notices()

# Mailbox
var mailbox: Dictionary = await hive.mailbox.list_mail(50, "", true)
var check: Dictionary = await hive.mailbox.check_new_mail()
var claimed: Dictionary = await hive.mailbox.claim_mail(mail_id)
```

Method arguments and return types for every domain are in the [API Reference](/reference/overview).

For the overall platform flow, read the [Architecture](/guide/architecture) guide. Other platforms: [Web](/platforms/web), [Unity](/platforms/unity), [Android](/platforms/android), [iOS](/platforms/ios).
