# Android SDK

The Hive Axyl Android SDK is a Kotlin Gradle library (`com.hiveaxyl.sdk`). Every API is available both as a `suspend` function for coroutines and as a callback overload (`HiveAxylCallback<T>`) for Java-style call sites.

Before you start, create a project and issue a client API key in the console. See [Projects & API Keys](/console/projects-api-keys).

## Requirements

- `minSdk` 23 or higher
- Kotlin (the public API is Kotlin-first; callback overloads work from Java)
- Java 17 toolchain for compilation

## Installation

Add Maven Central to `settings.gradle.kts`:

```kotlin
dependencyResolutionManagement {
    repositoriesMode.set(RepositoriesMode.FAIL_ON_PROJECT_REPOS)
    repositories {
        google()
        mavenCentral()
    }
}
```

Then add the SDK dependency to your app module (`app/build.gradle.kts`):

```kotlin
dependencies {
    implementation("io.github.conx-dev:hive-axyl-android-sdk:0.2.0")
}
```

## Initialize

Create a client with `HiveAxylSdk.createHiveAxyl(config)` and initialize it once. Initialization connects to the platform and binds the domain APIs (`auth`, `notice`, `mailbox`, `payment`, `push`).

```kotlin
import com.hiveaxyl.sdk.HiveAxylConfig
import com.hiveaxyl.sdk.HiveAxylSdk

val hive = HiveAxylSdk.createHiveAxyl(
    HiveAxylConfig(
        projectId = "your-project-id",
        apiKey = "your-api-key",
        context = applicationContext,
        clientVersion = "1.0.0",
        language = Locale.getDefault().toLanguageTag(),
        debug = BuildConfig.DEBUG
    )
)

// coroutine style
lifecycleScope.launch {
    hive.initialize()
    // hive.isReady() == true
}
```

Callback style is available for every call:

```kotlin
hive.initialize(object : HiveAxylCallback<Unit> {
    override fun onSuccess(value: Unit) { /* ready */ }
    override fun onError(error: Throwable) { /* handle */ }
})
```

### Configuration options

| Parameter | Type | Required | Description |
| --- | --- | --- | --- |
| `projectId` | `String` | Yes | Project identifier from the console |
| `apiKey` | `String` | Yes | Client API key issued in the console |
| `context` | `Context?` | For guest login | Enables durable guest installation storage and the default persisted session storage. Without it, identity-provider login uses in-memory sessions but guest login fails locally. |
| `clientVersion` | `String` | No | Reported for version gating |
| `language` | `String` | No | Defaults to `Locale.getDefault().toLanguageTag()` |
| `debug` | `Boolean` | No | Enables SDK debug logging |
| `persistSession` | `Boolean?` | No | Defaults to persisting in `SharedPreferences` when a `context` is provided; `false` forces in-memory |
| `tokenStorage` | `TokenStorage?` | No | Custom token storage (overrides `persistSession`) |
| `httpClient` | `OkHttpClient` | No | Inject a shared OkHttp client |
| `executor` | `ExecutorService` | No | Executor for callback-style calls |

## Login

Fetch the provider list first — the server decides which providers are exposed per project and country, and the client should only display what the response contains.

```kotlin
val providers = hive.auth.getLoginProviders()
// providers.providers: lowercase names, e.g. ["google", "apple", "facebook", "guest"]
```

### Guest login

```kotlin
val player = hive.auth.loginAsGuest()
```

The SDK creates a cryptographically random installation credential in `SharedPreferences` on the first guest login. Provide `context` when constructing the SDK. The credential is independent of session storage and remains after `logout()`. Identity-provider login neither creates nor uses it. Guest login fails before sending a request if durable storage is unavailable. Clearing app data can create a new guest account, and the previous guest account may not be recoverable.

### Google

Obtain a Google ID token with Credential Manager (`androidx.credentials` + the Google identity library), then pass it to `loginWithGoogle(idToken)` — the server verifies it:

```kotlin
import androidx.credentials.CredentialManager
import androidx.credentials.CustomCredential
import androidx.credentials.GetCredentialRequest
import com.google.android.libraries.identity.googleid.GetSignInWithGoogleOption
import com.google.android.libraries.identity.googleid.GoogleIdTokenCredential

val credentialManager = CredentialManager.create(this)

suspend fun signInWithGoogle(): Player {
    val option = GetSignInWithGoogleOption
        .Builder("YOUR_GOOGLE_CLIENT_ID.apps.googleusercontent.com")
        .build()
    val request = GetCredentialRequest.Builder()
        .addCredentialOption(option)
        .build()
    val response = credentialManager.getCredential(request = request, context = this)

    val credential = response.credential as CustomCredential
    check(credential.type == GoogleIdTokenCredential.TYPE_GOOGLE_ID_TOKEN_CREDENTIAL)
    val idToken = GoogleIdTokenCredential.createFrom(credential.data).idToken

    return hive.auth.loginWithGoogle(idToken)
}
```

::: tip Google Sign-In setup
In the Google Cloud Console, register an OAuth client for your app (package name + signing certificate SHA-1) and register the resulting client IDs for your project in the Hive Axyl console. Login options are configured per project — see [Login Providers](/console/login-providers).
:::

### Facebook

Obtain an access token with the Facebook Login SDK and pass it through:

```kotlin
val player = hive.auth.loginWithFacebook(accessToken)
```

### Apple

Apple login on Android is a two-step browser flow:

1. `startAppleLogin(clientId, returnUrl)` returns an authorization URL — open it in the browser.
2. Apple redirects back into your app via deep link — pass the received `Uri` to `completeAppleLogin(uri)`.

Use Android SDK `0.2.0` or later. The SDK creates the PKCE values required for this flow and exchanges the one-time callback code for a session. Do not read access or refresh tokens from the deep-link query.

```kotlin
// Step 1: start
val returnUrl = "${BuildConfig.APPLICATION_ID}://oauth/apple"
val authorizationUrl = hive.auth.startAppleLogin("com.example.web", returnUrl)
startActivity(Intent(Intent.ACTION_VIEW, Uri.parse(authorizationUrl)))

// Step 2: complete, from the deep-link callback
override fun onNewIntent(intent: Intent) {
    super.onNewIntent(intent)
    val uri = intent.data ?: return
    if (uri.scheme == BuildConfig.APPLICATION_ID && uri.host == "oauth" && uri.path == "/apple") {
        lifecycleScope.launch {
            val player = hive.auth.completeAppleLogin(uri)
        }
    }
}
```

Declare a matching intent filter for the deep-link scheme in your manifest, and pass your Apple Services ID as `clientId`. Provide `context` in `HiveAxylConfig` so an Apple login can complete after Android recreates the app process. Without `context`, the pending login exists only in memory.

## Session persistence

- By default the token pair is stored in `SharedPreferences` when a `context` is provided; set `persistSession = false` to keep it in memory.
- After `initialize()`, call `restoreSession()` to resume a previous login. It returns the `Player`, or `null` when there is no valid session:

```kotlin
hive.initialize()
val restored = hive.auth.restoreSession()
if (restored == null) {
    // show the login screen
}
```

- When a call fails with `SESSION_EXPIRED`, the SDK refreshes the token pair once and retries automatically.
- Use `hive.auth.playerValidationToken()` immediately after login when your game uses server-side player validation.
- `logout()` revokes the session on the server (best effort) and always clears the local session.
- `currentPlayer()` returns the last known player without a network call.

## Error handling

All domain errors surface as typed exceptions — branch on exception types and `code`, never on message strings:

```kotlin
import com.hiveaxyl.sdk.BannedException
import com.hiveaxyl.sdk.HiveAxylException
import com.hiveaxyl.sdk.MaintenanceException

try {
    hive.auth.loginAsGuest()
} catch (banned: BannedException) {
    // banned.reason, banned.permanent, banned.until (Date?)
} catch (maintenance: MaintenanceException) {
    // maintenance.maintenanceMessage, maintenance.startsAt, maintenance.endsAt
} catch (error: HiveAxylException) {
    // error.errorCode (enum), error.code (string, e.g. "PROVIDER_NOT_ENABLED"),
    // error.metadata, error.isTransport
}
```

You can also register a global ban listener — it fires whenever any auth call is rejected because the player is banned:

```kotlin
hive.auth.onBanned { banned ->
    // show a "player banned" popup
}
```

See [Error Codes](/guide/error-codes) for the full list of platform error codes.

## Beyond auth

After login, the same client exposes:

- `hive.notice` — active notices in the configured language
- `hive.mailbox` — mailbox listing, new-mail check, claiming
- `hive.payment` — product listing and purchase verification; see [Payments](/console/payments)
- `hive.push` — remote push target registration

Method arguments and return types for every domain are in the [API Reference](/reference/overview).

For the overall platform flow, read the [Architecture](/guide/architecture) guide. Other platforms: [Web](/platforms/web), [Unity](/platforms/unity), [iOS](/platforms/ios), [Godot](/platforms/godot).
