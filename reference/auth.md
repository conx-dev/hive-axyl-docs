# Auth API — `hive.auth`

Login, session restore, and the player profile.

| Method | Returns |
| --- | --- |
| [`getLoginProviders(countryOverride?)`](#getloginproviders) | `Promise<LoginProviders>` |
| [`loginWithGoogle(idToken)`](#loginwithgoogle) | `Promise<Player>` |
| [`loginWithFacebook(accessToken)`](#loginwithfacebook) | `Promise<Player>` |
| [`loginWithApple(options)`](#loginwithapple) | `Promise<Player>` |
| [`loginAsGuest()`](#loginasguest) | `Promise<Player>` |
| [`restoreSession()`](#restoresession) | `Promise<Player \| null>` |
| [`getPlayer()`](#getplayer) | `Promise<Player \| null>` |
| [`logout()`](#logout) | `Promise<void>` |
| [`currentPlayer()`](#currentplayer) | `Player \| null` |
| [`playerValidationToken()`](#playervalidationtoken) | `string \| null` |

## getLoginProviders

```ts
getLoginProviders(countryOverride?: string): Promise<LoginProviders>
```

| Argument | Type | Required | Description |
| --- | --- | --- | --- |
| `countryOverride` | `string` | No | Test-only country override (ISO 3166-1 alpha-2, e.g. `"KR"`); omit to let the server resolve the country from the player's IP |

Returns [`LoginProviders`](#loginproviders) — the sign-in methods enabled for the resolved country, in display order. Render only what this returns.

## loginWithGoogle

```ts
loginWithGoogle(idToken: string): Promise<Player>
```

| Argument | Type | Required | Description |
| --- | --- | --- | --- |
| `idToken` | `string` | Yes | ID token obtained from Google Identity Services on the client |

Returns the logged-in [`Player`](#player). The token is verified server-side.

Errors: `BannedError` when the player is sanctioned; `HiveAxylError` with `INVALID_PROVIDER_TOKEN`, `PROVIDER_NOT_ENABLED`, or `CREDENTIAL_NOT_CONFIGURED`.

## loginWithFacebook

```ts
loginWithFacebook(accessToken: string): Promise<Player>
```

| Argument | Type | Required | Description |
| --- | --- | --- | --- |
| `accessToken` | `string` | Yes | Access token from the Facebook JS SDK |

Returns the logged-in [`Player`](#player). Same errors as `loginWithGoogle`.

## loginWithApple

```ts
loginWithApple(options: AppleLoginOptions): Promise<Player>
```

`AppleLoginOptions`

| Field | Type | Required | Description |
| --- | --- | --- | --- |
| `clientId` | `string` | Yes | Apple Services ID configured for your app |
| `timeoutMs` | `number` | No | How long to wait for the popup flow to finish |
| `popupName` | `string` | No | `window.open` popup name |
| `popupFeatures` | `string` | No | `window.open` feature string |

Opens a popup-based Apple sign-in flow and returns the logged-in [`Player`](#player). Same errors as `loginWithGoogle`.

## loginAsGuest

```ts
loginAsGuest(): Promise<Player>
```

No arguments. On the first guest login, the SDK creates and durably stores a cryptographically random installation credential. It is independent of session storage, so `logout()` and disabling session persistence do not remove it. Identity-provider login neither creates nor uses this credential.

Returns the logged-in [`Player`](#player). If the SDK cannot durably store the credential, the call fails before sending a request. Clearing persistent app or site data can create a new guest account, and the previous guest account may not be recoverable.

Creating a new guest can return `RATE_LIMITED`. Use `retry_after_seconds` in error metadata before retrying.

## restoreSession

```ts
restoreSession(): Promise<Player | null>
```

No arguments. Resumes a previous login from stored tokens — sessions persist across reloads by default (disable with `persistSession: false`). Returns the [`Player`](#player), or `null` when there is no stored session or it has expired — show the login screen in that case.

## getPlayer

```ts
getPlayer(): Promise<Player | null>
```

No arguments. Fetches the current player fresh from the server; `null` when not logged in. Throws on network or server errors.

## logout

```ts
logout(): Promise<void>
```

No arguments. Ends the session on the server (best effort) and always clears the local session.

## currentPlayer

```ts
currentPlayer(): Player | null
```

No arguments, no network call. Returns the last known [`Player`](#player), or `null` when not logged in.

## playerValidationToken

```ts
playerValidationToken(): string | null
```

No arguments, no network call. Returns the short-lived token for server-side player validation; returns `null` when missing or expired.

## Types

### Player

| Field | Type | Description |
| --- | --- | --- |
| `playerId` | `string` | Player id, unique per project |
| `projectId` | `string` | Owning project |
| `country` | `string` | ISO 3166-1 alpha-2 uppercase, e.g. `"KR"` |
| `email` | `string` | Email from the identity provider; empty when unavailable (e.g. guest) |
| `nickname` | `string` | Display nickname; the server assigns a short default for new players |
| `lastLoginPlatform` | `string` | `"web"`, `"android"`, `"ios"`, `"desktop"`, or `"unspecified"` |
| `providers` | `string[]` | Login methods linked to this player — see [provider names](#provider-names) |
| `createdAt` | `Date?` | First login (UTC) |
| `lastLoginAt` | `Date?` | Most recent login (UTC) |

### LoginProviders

| Field | Type | Description |
| --- | --- | --- |
| `providers` | `string[]` | Provider names in display order — see [provider names](#provider-names) |
| `country` | `string` | Country the server resolved (ISO 3166-1 alpha-2) |

### Provider names

`"kakao"`, `"naver"`, `"google"`, `"facebook"`, `"apple"`, `"line"`, `"truecaller"`, `"phone_otp"`, `"guest"`

The SDK ships login helpers for Google, Facebook, Apple, and guest today; other providers may appear in `getLoginProviders` but need your own identity-provider integration.
