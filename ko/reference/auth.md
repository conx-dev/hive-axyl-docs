# Auth API - `hive.auth`

Login, session restore, player profile을 처리합니다.

| Method | Returns |
| --- | --- |
| [`getLoginProviders(countryOverride?)`](#getloginproviders) | `Promise<LoginProviders>` |
| [`loginWithGoogle(idToken)`](#loginwithgoogle) | `Promise<Player>` |
| [`loginWithFacebook(accessToken)`](#loginwithfacebook) | `Promise<Player>` |
| [`loginWithApple(options)`](#loginwithapple) | `Promise<Player>` |
| [`loginAsGuest(deviceId)`](#loginasguest) | `Promise<Player>` |
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
| `countryOverride` | `string` | No | Test-only country override(ISO 3166-1 alpha-2, 예: `"KR"`). 생략하면 서버가 플레이어 IP에서 국가를 resolve |

[`LoginProviders`](#loginproviders)를 반환합니다. Resolved country에서 활성화된 sign-in method가 표시 순서대로 들어 있습니다. 반환된 항목만 렌더링하세요.

## loginWithGoogle

```ts
loginWithGoogle(idToken: string): Promise<Player>
```

| Argument | Type | Required | Description |
| --- | --- | --- | --- |
| `idToken` | `string` | Yes | 클라이언트에서 Google Identity Services로 얻은 ID token |

로그인된 [`Player`](#player)를 반환합니다. Token은 서버 측에서 검증됩니다.

Errors: 플레이어가 제재 상태이면 `BannedError`; `INVALID_PROVIDER_TOKEN`, `PROVIDER_NOT_ENABLED`, `CREDENTIAL_NOT_CONFIGURED`를 가진 `HiveAxylError`.

## loginWithFacebook

```ts
loginWithFacebook(accessToken: string): Promise<Player>
```

| Argument | Type | Required | Description |
| --- | --- | --- | --- |
| `accessToken` | `string` | Yes | Facebook JS SDK에서 얻은 access token |

로그인된 [`Player`](#player)를 반환합니다. Error는 `loginWithGoogle`과 같습니다.

## loginWithApple

```ts
loginWithApple(options: AppleLoginOptions): Promise<Player>
```

`AppleLoginOptions`

| Field | Type | Required | Description |
| --- | --- | --- | --- |
| `clientId` | `string` | Yes | 앱에 설정한 Apple Services ID |
| `timeoutMs` | `number` | No | Popup flow 완료를 기다릴 시간 |
| `popupName` | `string` | No | `window.open` popup name |
| `popupFeatures` | `string` | No | `window.open` feature string |

Popup 기반 Apple sign-in flow를 열고 로그인된 [`Player`](#player)를 반환합니다. Error는 `loginWithGoogle`과 같습니다.

## loginAsGuest

```ts
loginAsGuest(deviceId: string): Promise<Player>
```

| Argument | Type | Required | Description |
| --- | --- | --- | --- |
| `deviceId` | `string` | Yes | 게임이 선택한 안정적인 device identifier. 같은 id는 같은 guest account로 로그인 |

로그인된 [`Player`](#player)를 반환합니다.

## restoreSession

```ts
restoreSession(): Promise<Player | null>
```

Argument가 없습니다. Stored token에서 이전 로그인을 복구합니다. Session은 기본적으로 reload 후에도 유지됩니다(`persistSession: false`로 비활성화). [`Player`](#player)를 반환하거나, stored session이 없거나 만료되었으면 `null`을 반환합니다. 이 경우 login screen을 표시하세요.

## getPlayer

```ts
getPlayer(): Promise<Player | null>
```

Argument가 없습니다. 서버에서 현재 player를 새로 조회합니다. 로그인되지 않았으면 `null`입니다. Network 또는 server error에서는 throw합니다.

## logout

```ts
logout(): Promise<void>
```

Argument가 없습니다. 서버에서 세션을 종료하고(best effort) 항상 local session을 지웁니다.

## currentPlayer

```ts
currentPlayer(): Player | null
```

Argument와 network call이 없습니다. 마지막 known [`Player`](#player)를 반환하거나 로그인되지 않았으면 `null`을 반환합니다.

## playerValidationToken

```ts
playerValidationToken(): string | null
```

Argument와 network call이 없습니다. 게임 서버가 `GameServerPlayerService.ValidatePlayer`로 login을 검증할 때 사용하는 short-lived token을 반환합니다. 없거나 만료되면 `null`입니다.

## Types

### Player

| Field | Type | Description |
| --- | --- | --- |
| `playerId` | `string` | Project 안에서 unique한 player id |
| `projectId` | `string` | Owning project |
| `country` | `string` | ISO 3166-1 alpha-2 uppercase, 예: `"KR"` |
| `email` | `string` | Identity provider의 email. 사용할 수 없으면 empty(예: guest) |
| `nickname` | `string` | Display nickname. 새 player에는 서버가 짧은 기본값을 부여 |
| `lastLoginPlatform` | `string` | `"web"`, `"android"`, `"ios"`, `"desktop"`, 또는 `"unspecified"` |
| `providers` | `string[]` | 이 player에 연결된 login method. [provider names](#provider-names) 참고 |
| `createdAt` | `Date?` | First login (UTC) |
| `lastLoginAt` | `Date?` | Most recent login (UTC) |

### LoginProviders

| Field | Type | Description |
| --- | --- | --- |
| `providers` | `string[]` | 표시 순서의 provider name. [provider names](#provider-names) 참고 |
| `country` | `string` | 서버가 resolve한 country(ISO 3166-1 alpha-2) |

### Provider names

`"kakao"`, `"naver"`, `"google"`, `"facebook"`, `"apple"`, `"line"`, `"truecaller"`, `"phone_otp"`, `"guest"`

현재 SDK는 Google, Facebook, Apple, guest용 login helper를 제공합니다. 다른 provider가 `getLoginProviders`에 나타날 수 있지만, 이 경우 자체 identity-provider integration이 필요합니다.
