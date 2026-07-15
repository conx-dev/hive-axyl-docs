# Web SDK

Hive Axyl Web SDK(`@hive-axyl/web-sdk`)는 브라우저 게임용 TypeScript SDK입니다. 인증, 세션 영속성, 공지, 우편함, 결제를 처리합니다.

시작하기 전에 콘솔에서 프로젝트를 만들고 client API key를 발급하세요. [프로젝트와 API 키](/ko/console/projects-api-keys)를 참고하세요.

## 요구 사항

- `fetch`를 지원하는 최신 브라우저
- npm 사용 시 ESM 또는 CJS를 지원하는 bundler/runtime(Vite, Next.js, webpack, Node)
- React binding 사용 시 React 18 이상(optional peer dependency)
- CDN build를 사용할 때는 build tooling이 필요 없음

## 설치

```bash
npm install @hive-axyl/web-sdk@<VERSION>
```

`<VERSION>`을 배포된 SDK 버전으로 바꾸세요.

패키지는 세 가지 사용 방식을 제공합니다.

| 사용 방식 | Output | Entry point |
| --- | --- | --- |
| npm + bundler | ESM + CJS + type declarations | `import { createHiveAxyl } from "@hive-axyl/web-sdk"` |
| React bindings | ESM + CJS subpath export | `import { HiveProvider, useAuth } from "@hive-axyl/web-sdk/react"` |
| CDN `<script>` (build step 없음) | Self-contained IIFE bundle, global `HiveAxyl` | `https://cdn.jsdelivr.net/npm/@hive-axyl/web-sdk@<VERSION>` (unpkg도 사용 가능) |

## 초기화

`createHiveAxyl(config)`로 클라이언트를 만들고 `init()`을 한 번 호출합니다. `init()`은 플랫폼에 연결하고 도메인별 클라이언트(`auth`, `notice`, `mailbox`, `payment`)를 연결합니다.

```ts
import { createHiveAxyl } from "@hive-axyl/web-sdk";

const hive = createHiveAxyl({
  projectId: "your-project-id",
  apiKey: "your-api-key",
});

await hive.init();
```

### 설정 옵션

| Option | Type | Required | Description |
| --- | --- | --- | --- |
| `projectId` | `string` | Yes | 콘솔의 project identifier |
| `apiKey` | `string` | Yes | 콘솔에서 발급한 client API key |
| `clientVersion` | `string` | No | Version gating용으로 보고됨 |
| `language` | `string` | No | Localized content용 language tag. 기본값은 `navigator.language` |
| `debug` | `boolean` | No | SDK debug logging 활성화(기본값 `false`) |
| `persistSession` | `boolean` | No | Token을 `localStorage`에 저장(기본값 `true`). `false`면 memory only |

::: warning API 키는 secret은 아니지만 범위를 제한하세요
Client API key는 플랫폼에서 프로젝트를 식별합니다. SDK는 OAuth client secret이나 market verification key를 절대 보관하지 않습니다. 모든 identity-provider verification은 서버에서 수행됩니다. 서버 측 자격 증명 등록 방식은 [로그인 제공자](/ko/console/login-providers)를 참고하세요.
:::

## 로그인

항상 먼저 login provider를 조회하세요. 서버는 프로젝트와 국가별로 노출할 provider를 결정하며, 클라이언트는 응답에 포함된 것만 표시해야 합니다.

```ts
const { providers, country } = await hive.auth.getLoginProviders();
// providers: lowercase names, e.g. ["google", "apple", "facebook", "guest"]
```

### Guest login

게임에서 선택한 안정적인 device identifier를 전달합니다.

```ts
const player = await hive.auth.loginAsGuest("device-id");
console.log(player.playerId, player.nickname);
```

### Google

SDK는 Google Identity Services를 포함하지 않습니다. 페이지에서 GIS를 로드하고 ID token을 얻은 뒤 `loginWithGoogle(idToken)`에 전달하세요. 서버가 이를 검증합니다.

```html
<script src="https://accounts.google.com/gsi/client" async></script>
```

```ts
window.google.accounts.id.initialize({
  client_id: "YOUR_GOOGLE_CLIENT_ID.apps.googleusercontent.com",
  callback: async (response) => {
    const player = await hive.auth.loginWithGoogle(response.credential);
    console.log(`Signed in as ${player.nickname || player.playerId}`);
  },
});

window.google.accounts.id.renderButton(
  document.getElementById("google-btn")!,
  { theme: "outline", size: "large" },
);
```

::: tip
GIS script는 비동기로 로드됩니다. `initialize`를 호출하기 전에 `window.google?.accounts?.id`를 polling하거나 script의 `onload`를 사용하세요. Bundled sample app은 전체 polling pattern을 보여줍니다.
:::

### Facebook

Facebook JS SDK(`FB.login`)로 access token을 얻고 `loginWithFacebook(accessToken)`에 전달합니다.

```ts
FB.init({ appId: "YOUR_FACEBOOK_APP_ID", version: "v23.0", cookie: false, xfbml: false });

FB.login(
  (res) => {
    const accessToken = res.authResponse?.accessToken;
    if (res.status === "connected" && accessToken) {
      void hive.auth.loginWithFacebook(accessToken).then((player) => {
        console.log(`Signed in as ${player.nickname || player.playerId}`);
      });
    }
  },
  { scope: "public_profile,email" },
);
```

### Apple

Apple login은 SDK가 전부 구동하는 popup flow입니다. Apple Services ID를 `clientId`로 전달합니다.

```ts
const player = await hive.auth.loginWithApple({
  clientId: "com.example.web",
  // timeoutMs?: number     - default 120000
  // popupName?: string     - default "hive-axyl-apple-login"
  // popupFeatures?: string - default "popup,width=480,height=720"
});
```

::: warning Popup blocker
`loginWithApple`은 click handler 같은 사용자 gesture에서 동기적으로 호출하세요. 브라우저가 popup을 차단하면 SDK는 `FAILED_PRECONDITION` error를 throw합니다. Popup을 닫으면 `CANCELLED`로 reject됩니다.
:::

## 세션 영속성

- 기본값(`persistSession: true`)에서는 token pair가 `localStorage`에 저장되어 reload 후에도 세션이 유지됩니다. `persistSession: false`를 설정하면 token이 memory only가 되어 reload 시 사라집니다.
- `init()` 후 `restoreSession()`을 호출해 이전 로그인을 복구합니다. 유효한 세션이 없으면 `null`을 반환합니다.

```ts
await hive.init();
const player = await hive.auth.restoreSession();
if (player === null) {
  // show the login screen
}
```

- 호출이 `SESSION_EXPIRED`로 실패하면 SDK는 token pair를 한 번 갱신하고 자동으로 재시도합니다.
- 게임에서 서버 측 플레이어 검증을 사용한다면 로그인 직후 `hive.auth.playerValidationToken()`을 사용하세요.
- `logout()`은 서버에서 세션을 폐기하고(best effort) 항상 로컬 세션을 지웁니다.

## React

React binding은 클라이언트를 한 번 mount하고 `init()` + `restoreSession()`을 자동 실행하며 hook으로 auth state를 노출합니다.

```tsx
import { HiveProvider, useAuth } from "@hive-axyl/web-sdk/react";

function App() {
  return (
    <HiveProvider
      config={{
        projectId: "your-project-id",
        apiKey: "your-api-key",
      }}
    >
      <Login />
    </HiveProvider>
  );
}

function Login() {
  const { ready, player, pending, error, loginAsGuest, logout } = useAuth();

  if (!ready) {
    return null;
  }
  if (player) {
    return <button onClick={() => logout()}>Sign out {player.nickname}</button>;
  }
  return (
    <button disabled={pending} onClick={() => loginAsGuest("device-id")}>
      Login as guest
    </button>
  );
}
```

`useAuth()`는 `{ ready, initError, player, pending, error, getLoginProviders, loginWithGoogle, loginWithFacebook, loginWithApple, loginAsGuest, playerValidationToken, logout }`를 반환합니다. 공지, 우편함, 결제 같은 직접 client access에는 `{ hive, ready, initError }`를 반환하는 `useHiveAxyl()`을 사용하세요.

## CDN

IIFE bundle은 모든 dependency를 inline하고 global `HiveAxyl`을 노출합니다.

```html
<script src="https://cdn.jsdelivr.net/npm/@hive-axyl/web-sdk@<VERSION>"></script>
<script>
  const hive = HiveAxyl.createHiveAxyl({
    projectId: "your-project-id",
    apiKey: "your-api-key",
  });
  hive.init().then(() => hive.auth.getLoginProviders()).then(console.log);
</script>
```

## API 레퍼런스

메서드 인자와 전체 반환 타입 형태(`Player`, `Notice`, `Mail`, `PaymentPurchase` 등)는 [API 레퍼런스](/ko/reference/overview)에 있습니다.

### Client

| Member | Description |
| --- | --- |
| `createHiveAxyl(config)` | `HiveAxylClient` 생성 |
| `hive.init()` | 플랫폼에 연결하고 domain client binding |
| `hive.isReady()` | `init()` 성공 후 `true` |
| `hive.auth` / `hive.notice` / `hive.mailbox` / `hive.payment` | Domain APIs |

### Auth methods

| Method | Returns | Description |
| --- | --- | --- |
| `getLoginProviders(countryOverride?)` | `Promise<LoginProviders>` | Server-driven provider list와 resolved country |
| `loginWithGoogle(idToken)` | `Promise<Player>` | Google Identity Services ID token으로 로그인 |
| `loginWithFacebook(accessToken)` | `Promise<Player>` | Facebook JS SDK access token으로 로그인 |
| `loginWithApple(options)` | `Promise<Player>` | Popup-based Apple login. `options: { clientId, timeoutMs?, popupName?, popupFeatures? }` |
| `loginAsGuest(deviceId)` | `Promise<Player>` | Device identifier로 guest login |
| `restoreSession()` | `Promise<Player \| null>` | Stored token으로 복구. 없거나 만료되면 `null` |
| `getPlayer()` | `Promise<Player \| null>` | 서버에서 현재 player 조회(에러 시 throw) |
| `logout()` | `Promise<void>` | 서버 logout(best effort) + local session clear |
| `currentPlayer()` | `Player \| null` | Network call 없이 마지막 known player 반환 |
| `playerValidationToken()` | `string \| null` | 게임 서버가 login을 검증할 수 있는 short-lived token |

### Exported types and errors

| Export | Kind | Notes |
| --- | --- | --- |
| `HiveAxylError` | class | `code: string` + `message` |
| `BannedError` | class | `reason`, `until?: Date`, `permanent` - code `PLAYER_BANNED` |
| `MaintenanceError` | class | `maintenanceMessage`, `startsAt?`, `endsAt?` - code `MAINTENANCE_IN_PROGRESS` |
| `errorCodeOf(err)` / `errorDetailOf(err)` | function | Throw된 error에서 platform `ErrorCode` / detail 추출 |
| `ErrorCode`, `IdentityProvider`, `MailType` | enum | SDK enums |
| `Player`, `LoginProviders`, `AppleLoginOptions`, `HiveAxylConfig` | type | Public types |
| `Notice`, `Mail`, `ListMailResult`, `CheckNewMailResult`, `PaymentProduct`, `PaymentPurchase` | type | Domain API types |

## 에러 처리

모든 도메인 에러는 typed code를 포함합니다. Message string이 아니라 class와 code로 분기하세요.

```ts
import { BannedError, HiveAxylError, MaintenanceError } from "@hive-axyl/web-sdk";

try {
  await hive.auth.loginAsGuest("device-id");
} catch (err) {
  if (err instanceof BannedError) {
    // err.reason, err.permanent, err.until
  } else if (err instanceof MaintenanceError) {
    // err.maintenanceMessage, err.startsAt, err.endsAt
  } else if (err instanceof HiveAxylError) {
    // err.code, e.g. "PROVIDER_NOT_ENABLED", "GEO_BLOCKED"
  }
}
```

전체 platform error code 목록은 [에러 코드](/ko/guide/error-codes)를 참고하세요.

## Auth 이후

로그인 후 같은 클라이언트에서 다음을 사용할 수 있습니다.

- `hive.notice.listActiveNotices()` - 설정된 언어의 active notices
- `hive.mailbox.listMail(...)`, `checkNewMail()`, `claimMail(...)` - player mailbox
- `hive.payment.listProducts(...)`, purchase start/verify - [결제](/ko/console/payments) 참고

전체 플랫폼 흐름은 [아키텍처](/ko/guide/architecture) 가이드를 읽어보세요. 다른 플랫폼: [Unity](/ko/platforms/unity), [Android](/ko/platforms/android), [iOS](/ko/platforms/ios), [Godot](/ko/platforms/godot).
