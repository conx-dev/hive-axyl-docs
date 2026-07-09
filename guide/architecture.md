# Architecture

This page explains how the Hive Axyl SDK talks to the platform: what goes over the wire, how players authenticate, and where secrets live. The behavior described here is identical across Web, Unity, Android, iOS, and Godot.

## Wire protocol

All RPCs are **ConnectRPC unary calls over HTTP POST**. There is no persistent socket to manage — every call is a plain HTTP request, which works with standard proxies, CDNs, and browser networking.

| Platform | Encoding |
| --- | --- |
| Web, Unity, Android, iOS | Binary protobuf (`application/proto`) |
| Godot | Connect JSON (no generated protobuf code) |

The request and response shapes are defined once in the platform's protobuf schemas and generated into each SDK, so all platforms agree on the contract byte-for-byte.

## Authentication flow

1. **`auth.getLoginProviders(countryOverride?)`** returns `{ providers, country }`. The server decides which sign-in methods to expose — and in what order — based on your project settings and the player's country (configured in [Login Providers](/console/login-providers)). The client renders **only** what the server returns; there is no client-side provider list to maintain.
2. **`auth.loginWithGoogle(idToken)`** — your game obtains the `idToken` itself using the platform's Google Sign-In library, then hands it to the SDK unchanged. The server validates the token with the provider and returns a `Player { playerId, nickname, ... }`. If the account is sanctioned, the call fails with a `BannedError` carrying `reason`, `until`, and `permanent` (see [Error Codes](/guide/error-codes)). Some platforms expose additional providers (for example, Apple on Web and mobile) following the same pattern: the client obtains the provider token, the server verifies it.
3. **`auth.loginAsGuest(deviceId)`** — logs in with a device identifier your game supplies, no external account required.
4. **`auth.currentPlayer()`** — returns the signed-in player, if any.
5. **`auth.logout()`** — ends the session and clears stored tokens.

Login and refresh also return a short-lived **player validation token**. If your game uses its own game server, send this token to that server immediately after login; your server calls `GameServerPlayerService.ValidatePlayer` with the token to confirm that the player just logged in successfully.

## Headers and token refresh

The SDK manages credentials on every domain call:

- **`Authorization: Bearer <api-key>`** — your project's API key, attached to all domain service requests.
- **`X-Player-Token`** — attached automatically after login.

When a call fails with `SESSION_EXPIRED`, the SDK refreshes the session **once** automatically and retries the original call. You do not write refresh logic yourself; if the refresh also fails, the error is surfaced to your code and the player must log in again.

The player validation token is separate from `X-Player-Token`. The SDK exposes it for your game-server handoff, but it is not used as the normal player session token for SDK domain calls.

## Security model

::: warning What the SDK never holds
The SDK **never contains OAuth client secrets or market receipt-verification keys**. Those credentials are registered in the console, stored server-side, and all verification (provider tokens, purchase receipts) happens on the server. The only secrets the SDK handles are your **API key** and the **player token**.
:::

This is why login methods take a provider token as input: the client proves identity with a token it obtained from the platform's own sign-in UI, and the server — not the client — decides whether that token is valid.

## Session persistence

By default, sessions live in memory and disappear when the game closes. Opt in to persistence and each platform stores the session in its native mechanism:

| Platform | Storage | How to enable |
| --- | --- | --- |
| Web | `localStorage` | `persistSession: true` |
| Unity | `PlayerPrefs` (`PlayerPrefsTokenStorage`) | `persistSession = true` |
| Android | `SharedPreferences` | `persistSession = true` |
| iOS | Keychain (`KeychainTokenStorage`) | default |
| Godot | Local session file in the project's user data directory | `persist_session: true` |

## Retries and logging

- **Retries** — only idempotent calls are retried, with exponential backoff, up to 2 attempts. Non-idempotent calls (such as login) are never silently repeated.
- **Logging** — each SDK has a debug flag that toggles verbose logging on and off; it is off by default.

## See also

- [Getting Started](/guide/getting-started) — console setup and the five-step client lifecycle
- [Error Codes](/guide/error-codes) — the full error code table and structured error types
- [Projects & API Keys](/console/projects-api-keys) — issuing and rotating the API key the SDK uses
