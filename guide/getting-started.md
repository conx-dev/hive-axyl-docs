# Getting Started

Hive Axyl is a game platform that gives your game authentication, notices, mailbox, payments, and live operations through a single SDK. This guide walks you from an empty console account to your first authenticated player.

## What you need

Every SDK, on every platform, is configured with the same two values. Both come from the Hive Axyl console:

| Value | What it is |
| --- | --- |
| **Project ID** | Identifies your game project. The SDK sends it to the platform during initialization. |
| **API key** | A client credential scoped to your project. The SDK applies it automatically. |

::: warning Keep your API key out of source control
The full API key is shown only once, at issue time. Store it in your build configuration, not in a public repository.
:::

## Set up your project in the console

Before writing any client code, complete these steps in the console:

1. **Sign up / log in** to the Hive Axyl console. See [Console Overview](/console/overview).
2. **Create a project and register your app identifiers** (package name, bundle ID, and so on). See [Projects & API Keys](/console/projects-api-keys).
3. **Issue an API key.** The full key is shown only once — copy it immediately. See [Projects & API Keys](/console/projects-api-keys).
4. **Register OAuth credentials** for the identity providers you plan to support (for example, Google). Client secrets stay on the server; the SDK never holds them. See [Login Providers](/console/login-providers).
5. **Map login providers per country** so each region sees the sign-in options you want, in the order you want. See [Login Providers](/console/login-providers).

## Pick your platform

The public API is the same on every platform — same method names, same behavior. Choose the package for your engine or runtime:

| Platform | Package | Distribution | Guide |
| --- | --- | --- | --- |
| Web (browser) | `@hive-axyl/web-sdk` | npm (ESM/CJS, React bindings, CDN build) | [Web SDK](/platforms/web) |
| Unity | `com.hiveaxyl.sdk` | UPM package (Standalone, WebGL, Android, iOS) | [Unity SDK](/platforms/unity) |
| Android | `com.hiveaxyl.sdk` | Gradle Android library (Kotlin) | [Android SDK](/platforms/android) |
| iOS | `HiveAxylSDK` | Swift Package Manager | [iOS SDK](/platforms/ios) |
| Godot | `addons/hive_axyl` | Godot 4.x addon (GDScript, desktop) | [Godot SDK](/platforms/godot) |

## Five-minute quickstart (Web)

Install the SDK:

```bash
npm install @hive-axyl/web-sdk
```

Create a client, initialize it, and log a player in:

```ts
import { createHiveAxyl } from "@hive-axyl/web-sdk";

const hive = createHiveAxyl({
  projectId: "your-project-id",
  apiKey: "your-api-key",
});

await hive.init();

const loginProviders = await hive.auth.getLoginProviders();
const player = await hive.auth.loginAsGuest("device-id");
const applePlayer = await hive.auth.loginWithApple({
  clientId: "com.example.web",
});
```

That is a working integration: after `loginAsGuest` resolves, the SDK attaches the player's session to every subsequent call automatically. For React bindings, the CDN build, and provider-specific login details, see the [Web SDK guide](/platforms/web).

## The client lifecycle

Every platform follows the same five-step lifecycle:

1. **Configure** — create the client with `projectId` and `apiKey` (plus optional `clientVersion` and `persistSession`).
2. **Initialize** — call `init()` (or `initialize()`, depending on platform naming). The SDK connects to the platform and prepares the domain APIs. The client is `ready` once this succeeds.
3. **Ask what logins to show** — call `auth.getLoginProviders()`. The server returns the sign-in methods enabled for your project and the player's country, in display order. Render only what the server returns.
4. **Log in** — call a login method such as `auth.loginWithGoogle(idToken)` or `auth.loginAsGuest(deviceId)`. You get back a `Player` with `playerId`, `nickname`, and more.
5. **Make authenticated calls** — after login, the SDK attaches the player token to every request and refreshes it automatically when the session expires. Use `auth.currentPlayer()` to read the signed-in player and `auth.logout()` to end the session.

## Next steps

- Review session persistence, retries, and credential handling: [SDK Behavior](/guide/architecture)
- Handle bans, maintenance windows, and other failures the right way: [Error Codes](/guide/error-codes)
- Set up notices, maintenance, and mailbox from the console: [Operations](/console/operations)
