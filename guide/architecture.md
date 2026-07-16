# SDK Behavior

This page summarizes the client behavior that affects a Hive Axyl integration across Web, Unity, Android, iOS, and Godot.

## Login and sessions

1. Call **`auth.getLoginProviders(countryOverride?)`** and render only the sign-in methods it returns. The result follows the country mapping configured in [Login Providers](/console/login-providers).
2. Use the matching login method, such as **`auth.loginWithGoogle(idToken)`** or **`auth.loginAsGuest()`**. The SDK returns the signed-in `Player` or a typed error such as `BannedError`.
3. After login, the SDK applies the active player session to subsequent calls automatically.
4. Use **`auth.currentPlayer()`** to read the cached player and **`auth.logout()`** to end the session and clear locally stored session data.

When a call fails with `SESSION_EXPIRED`, the SDK refreshes the session once and retries the original call. If refresh fails, the error is returned to your code and the player must log in again.

The first guest login creates a cryptographically random installation credential and stores it separately from session tokens. Logout does not remove it. Identity-provider login neither creates nor uses it. Guest login fails before sending a request if durable storage is unavailable. Clearing persistent app or site data can create a new guest account, and the previous guest account may not be recoverable.

If your game uses server-side player validation, read `playerValidationToken()` immediately after login and pass the returned short-lived token to your game server. Normal SDK calls do not require you to handle this token.

## Credential handling

::: warning Keep server credentials out of game builds
Register OAuth client secrets and market receipt-verification credentials only in the Hive Axyl console. Do not include them in client code, configuration files shipped with the game, or public repositories.
:::

Keep the project API key in your build configuration and manage its scope and rotation from the console. The SDK accepts identity-provider tokens through its login methods and manages the player session automatically; you do not need to construct authentication headers or refresh requests.

## Session persistence

Session persistence is enabled by default where the platform provides storage. Disable it when the game should keep the session in memory only.

| Platform | Default storage | Memory-only setting |
| --- | --- | --- |
| Web | `localStorage` | `persistSession: false` |
| Unity | `PlayerPrefs` | `persistSession = false` |
| Android | `SharedPreferences` when a `Context` is provided | `persistSession = false` |
| iOS | Keychain | Provide a memory-only token storage implementation |
| Godot | Project user data directory | `persistSession: false` |

After initialization, call the platform's `restoreSession()` equivalent to resume a stored login. It returns no player when the stored session is missing or expired.

## Retries and logging

- **Retries** — idempotent calls may retry transient failures with backoff. Login and other non-idempotent operations are not repeated silently.
- **Logging** — each SDK provides a debug option for verbose logs. It is disabled by default.

## See also

- [Getting Started](/guide/getting-started) — console setup and the client lifecycle
- [Error Codes](/guide/error-codes) — error codes and structured error types
- [Projects & API Keys](/console/projects-api-keys) — issue and rotate the API key used by the SDK
