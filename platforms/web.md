# Web SDK

The Hive Axyl Web SDK (`@hive-axyl/web-sdk`) is a TypeScript SDK for browser games. It handles authentication, session persistence, notices, mailbox, and payments.

Before you start, create a project and issue a client API key in the console. See [Projects & API Keys](/console/projects-api-keys).

## Requirements

- A modern browser with `fetch` support
- For npm consumption: any bundler or runtime that supports ESM or CJS (Vite, Next.js, webpack, Node)
- For React bindings: React 18 or newer (optional peer dependency)
- No build tooling is required when using the CDN build

## Installation

```bash
npm install @hive-axyl/web-sdk@<VERSION>
```

Replace `<VERSION>` with a published SDK version.

The package ships three consumption formats:

| How you consume it | Output | Entry point |
| --- | --- | --- |
| npm + bundler | ESM + CJS + type declarations | `import { createHiveAxyl } from "@hive-axyl/web-sdk"` |
| React bindings | ESM + CJS subpath export | `import { HiveProvider, useAuth } from "@hive-axyl/web-sdk/react"` |
| CDN `<script>` (no build step) | Self-contained IIFE bundle, global `HiveAxyl` | `https://cdn.jsdelivr.net/npm/@hive-axyl/web-sdk@<VERSION>` (also available on unpkg) |

## Initialize

Create a client with `createHiveAxyl(config)` and call `init()` once. `init()` connects to the platform and wires up the per-domain clients (`auth`, `notice`, `mailbox`, `payment`).

```ts
import { createHiveAxyl } from "@hive-axyl/web-sdk";

const hive = createHiveAxyl({
  projectId: "your-project-id",
  apiKey: "your-api-key",
});

await hive.init();
```

### Configuration options

| Option | Type | Required | Description |
| --- | --- | --- | --- |
| `projectId` | `string` | Yes | Project identifier from the console |
| `apiKey` | `string` | Yes | Client API key issued in the console |
| `clientVersion` | `string` | No | Reported for version gating |
| `language` | `string` | No | Language tag for localized content; defaults to `navigator.language` |
| `debug` | `boolean` | No | Enables SDK debug logging (default `false`) |
| `persistSession` | `boolean` | No | Store tokens in `localStorage` (default `true`); `false` keeps them in memory only |

::: warning API keys are not secrets, but scope them anyway
The client API key identifies your project to the platform. The SDK never holds OAuth client secrets or market verification keys — all identity-provider verification happens on the server. See [Login Providers](/console/login-providers) for how server-side credentials are registered.
:::

## Login

Always fetch the login providers first. The server decides which providers to expose per project and country, and the client should only display what the response contains.

```ts
const { providers, country } = await hive.auth.getLoginProviders();
// providers: lowercase names, e.g. ["google", "apple", "facebook", "guest"]
```

### Guest login

Pass a stable device identifier of your choosing:

```ts
const player = await hive.auth.loginAsGuest("device-id");
console.log(player.playerId, player.nickname);
```

### Google

The SDK does not bundle Google Identity Services. Load GIS in your page, obtain an ID token, and hand it to `loginWithGoogle(idToken)` — the server verifies it:

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
The GIS script loads asynchronously — poll for `window.google?.accounts?.id` (or use the script's `onload`) before calling `initialize`. The bundled sample app shows a complete polling pattern.
:::

### Facebook

Obtain an access token with the Facebook JS SDK (`FB.login`) and pass it to `loginWithFacebook(accessToken)`:

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

Apple login runs as a popup flow driven entirely by the SDK — pass your Apple Services ID as `clientId`:

```ts
const player = await hive.auth.loginWithApple({
  clientId: "com.example.web",
  // timeoutMs?: number     — default 120000
  // popupName?: string     — default "hive-axyl-apple-login"
  // popupFeatures?: string — default "popup,width=480,height=720"
});
```

::: warning Popup blockers
Call `loginWithApple` synchronously from a user gesture (e.g. a click handler). If the browser blocks the popup, the SDK throws a `FAILED_PRECONDITION` error; closing the popup rejects with `CANCELLED`.
:::

## Session persistence

- By default (`persistSession: true`) the token pair is stored in `localStorage`, so sessions survive reloads; set `persistSession: false` to keep tokens in memory only (lost on reload).
- After `init()`, call `restoreSession()` to resume a previous login. It returns the `Player` or `null` when there is no valid session:

```ts
await hive.init();
const player = await hive.auth.restoreSession();
if (player === null) {
  // show the login screen
}
```

- When a call fails with `SESSION_EXPIRED`, the SDK refreshes the token pair once and retries automatically.
- Use `hive.auth.playerValidationToken()` immediately after login when your game uses server-side player validation.
- `logout()` revokes the session on the server (best effort) and always clears the local session.

## React

The React bindings mount the client once, run `init()` + `restoreSession()` automatically, and expose auth state through hooks.

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

`useAuth()` returns `{ ready, initError, player, pending, error, getLoginProviders, loginWithGoogle, loginWithFacebook, loginWithApple, loginAsGuest, playerValidationToken, logout }`. For direct client access (notices, mailbox, payments), use `useHiveAxyl()` which returns `{ hive, ready, initError }`.

## CDN

The IIFE bundle inlines all dependencies and exposes the global `HiveAxyl`:

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

## API reference

Method arguments and full return-type shapes — `Player`, `Notice`, `Mail`, `PaymentPurchase`, and more — are in the [API Reference](/reference/overview).

### Client

| Member | Description |
| --- | --- |
| `createHiveAxyl(config)` | Creates a `HiveAxylClient` |
| `hive.init()` | Connects to the platform and binds domain clients |
| `hive.isReady()` | `true` after `init()` succeeds |
| `hive.auth` / `hive.notice` / `hive.mailbox` / `hive.payment` | Domain APIs |

### Auth methods

| Method | Returns | Description |
| --- | --- | --- |
| `getLoginProviders(countryOverride?)` | `Promise<LoginProviders>` | Server-driven provider list and resolved country |
| `loginWithGoogle(idToken)` | `Promise<Player>` | Login with a Google Identity Services ID token |
| `loginWithFacebook(accessToken)` | `Promise<Player>` | Login with a Facebook JS SDK access token |
| `loginWithApple(options)` | `Promise<Player>` | Popup-based Apple login; `options: { clientId, timeoutMs?, popupName?, popupFeatures? }` |
| `loginAsGuest(deviceId)` | `Promise<Player>` | Guest login with a device identifier |
| `restoreSession()` | `Promise<Player \| null>` | Resume from stored tokens; `null` if missing/expired |
| `getPlayer()` | `Promise<Player \| null>` | Fetch the current player from the server (throws on error) |
| `logout()` | `Promise<void>` | Server logout (best effort) + local session clear |
| `currentPlayer()` | `Player \| null` | Last known player without a network call |
| `playerValidationToken()` | `string \| null` | Short-lived token for your game server to validate the login |

### Exported types and errors

| Export | Kind | Notes |
| --- | --- | --- |
| `HiveAxylError` | class | `code: string` + `message` |
| `BannedError` | class | `reason`, `until?: Date`, `permanent` — code `PLAYER_BANNED` |
| `MaintenanceError` | class | `maintenanceMessage`, `startsAt?`, `endsAt?` — code `MAINTENANCE_IN_PROGRESS` |
| `errorCodeOf(err)` / `errorDetailOf(err)` | function | Extract the platform `ErrorCode` / detail from any thrown error |
| `ErrorCode`, `IdentityProvider`, `MailType` | enum | SDK enums |
| `Player`, `LoginProviders`, `AppleLoginOptions`, `HiveAxylConfig` | type | Public types |
| `Notice`, `Mail`, `ListMailResult`, `CheckNewMailResult`, `PaymentProduct`, `PaymentPurchase` | type | Domain API types |

## Error handling

All domain errors carry a typed code — branch on classes and codes, never on message strings:

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

See [Error Codes](/guide/error-codes) for the full list of platform error codes.

## Beyond auth

After login, the same client exposes:

- `hive.notice.listActiveNotices()` — active notices in the configured language
- `hive.mailbox.listMail(...)`, `checkNewMail()`, `claimMail(...)` — player mailbox
- `hive.payment.listProducts(...)`, purchase start/verify — see [Payments](/console/payments)

For the overall platform flow, read the [Architecture](/guide/architecture) guide. Other platforms: [Unity](/platforms/unity), [Android](/platforms/android), [iOS](/platforms/ios), [Godot](/platforms/godot).
