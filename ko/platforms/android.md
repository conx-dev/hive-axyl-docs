# Android SDK

Hive Axyl Android SDK는 OkHttp와 protobuf-javalite 기반의 Kotlin Gradle 라이브러리(`com.hiveaxyl.sdk`)입니다. 모든 API는 coroutine용 `suspend` 함수와 Java 스타일 call site를 위한 callback overload(`HiveAxylCallback<T>`)를 모두 제공합니다.

시작하기 전에 콘솔에서 프로젝트를 만들고 client API key를 발급하세요. [프로젝트와 API 키](/ko/console/projects-api-keys)를 참고하세요.

## 요구 사항

- `minSdk` 23 이상
- Kotlin(public API는 Kotlin-first이며 callback overload는 Java에서 사용 가능)
- 컴파일용 Java 17 toolchain

## 설치

`settings.gradle.kts`에 Maven Central을 추가합니다.

```kotlin
dependencyResolutionManagement {
    repositoriesMode.set(RepositoriesMode.FAIL_ON_PROJECT_REPOS)
    repositories {
        google()
        mavenCentral()
    }
}
```

그리고 app module(`app/build.gradle.kts`)에 SDK dependency를 추가합니다.

```kotlin
dependencies {
    implementation("io.github.conx-dev:hive-axyl-android-sdk:<VERSION>")
}
```

`<VERSION>`을 배포된 SDK 버전으로 바꾸세요.

## 초기화

`HiveAxylSdk.createHiveAxyl(config)`로 클라이언트를 만들고 한 번 초기화합니다. 초기화는 플랫폼에 연결하고 도메인 API(`auth`, `notice`, `mailbox`, `payment`, `push`)를 binding합니다.

```kotlin
import com.hiveaxyl.sdk.HiveAxylConfig
import com.hiveaxyl.sdk.HiveAxylSdk

val hive = HiveAxylSdk.createHiveAxyl(
    HiveAxylConfig(
        projectId = "your-project-id",
        apiKey = "your-api-key",
        context = applicationContext,   // enables the default persisted session storage
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

모든 호출에는 callback style도 제공됩니다.

```kotlin
hive.initialize(object : HiveAxylCallback<Unit> {
    override fun onSuccess(value: Unit) { /* ready */ }
    override fun onError(error: Throwable) { /* handle */ }
})
```

### 설정 옵션

| Parameter | Type | Required | Description |
| --- | --- | --- | --- |
| `projectId` | `String` | Yes | 콘솔의 project identifier |
| `apiKey` | `String` | Yes | 콘솔에서 발급한 client API key |
| `context` | `Context?` | For persistence | 기본 persisted session storage 활성화. 없으면 SDK가 in-memory로 fallback |
| `clientVersion` | `String` | No | Version gating용으로 보고됨 |
| `language` | `String` | No | 기본값은 `Locale.getDefault().toLanguageTag()` |
| `debug` | `Boolean` | No | SDK debug logging 활성화 |
| `persistSession` | `Boolean?` | No | `context`가 제공되면 기본적으로 `SharedPreferences`에 저장. `false`는 in-memory 강제 |
| `tokenStorage` | `TokenStorage?` | No | Custom token storage(`persistSession` override) |
| `httpClient` | `OkHttpClient` | No | Shared OkHttp client 주입 |
| `executor` | `ExecutorService` | No | Callback-style call용 executor |

## 로그인

먼저 provider list를 조회하세요. 서버는 프로젝트와 국가별로 노출할 provider를 결정하며, 클라이언트는 응답에 포함된 것만 표시해야 합니다.

```kotlin
val providers = hive.auth.getLoginProviders()
// providers.providers: lowercase names, e.g. ["google", "apple", "facebook", "guest"]
```

### Guest login

```kotlin
val player = hive.auth.loginAsGuest(deviceId)
```

### Google

Credential Manager(`androidx.credentials` + Google identity library)로 Google ID token을 얻고 `loginWithGoogle(idToken)`에 전달하세요. 서버가 검증합니다.

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
Google Cloud Console에서 앱의 OAuth client(package name + signing certificate SHA-1)를 등록하고, 생성된 client ID를 Hive Axyl 콘솔의 프로젝트에 등록하세요. Login option은 프로젝트별로 설정됩니다. [로그인 제공자](/ko/console/login-providers)를 참고하세요.
:::

### Facebook

Facebook Login SDK로 access token을 얻고 그대로 전달합니다.

```kotlin
val player = hive.auth.loginWithFacebook(accessToken)
```

### Apple

Android의 Apple login은 2단계 browser flow입니다.

1. `startAppleLogin(clientId, returnUrl)`이 authorization URL을 반환합니다. 브라우저에서 엽니다.
2. Apple이 deep link로 앱에 redirect합니다. 받은 `Uri`를 `completeAppleLogin(uri)`에 전달합니다.

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

Manifest에 deep-link scheme과 일치하는 intent filter를 선언하고 Apple Services ID를 `clientId`로 전달하세요.

## 세션 영속성

- 기본적으로 `context`가 제공되면 token pair가 `SharedPreferences`에 저장됩니다. `persistSession = false`를 설정하면 memory only입니다.
- `initialize()` 후 `restoreSession()`을 호출해 이전 로그인을 복구합니다. 유효한 세션이 없으면 `null`을 반환합니다.

```kotlin
hive.initialize()
val restored = hive.auth.restoreSession()
if (restored == null) {
    // show the login screen
}
```

- 호출이 `SESSION_EXPIRED`로 실패하면 SDK는 token pair를 한 번 갱신하고 자동으로 재시도합니다.
- 자체 게임 서버가 `ValidatePlayer`를 호출해야 한다면 로그인 직후 `hive.auth.playerValidationToken()`을 사용하세요.
- `logout()`은 서버에서 세션을 폐기하고(best effort) 항상 로컬 세션을 지웁니다.
- `currentPlayer()`는 network call 없이 마지막 known player를 반환합니다.

## 에러 처리

모든 도메인 에러는 typed exception으로 노출됩니다. Message string이 아니라 exception type과 `code`로 분기하세요.

```kotlin
import com.hiveaxyl.sdk.BannedException
import com.hiveaxyl.sdk.HiveAxylException
import com.hiveaxyl.sdk.MaintenanceException

try {
    hive.auth.loginAsGuest(deviceId)
} catch (banned: BannedException) {
    // banned.reason, banned.permanent, banned.until (Date?)
} catch (maintenance: MaintenanceException) {
    // maintenance.maintenanceMessage, maintenance.startsAt, maintenance.endsAt
} catch (error: HiveAxylException) {
    // error.errorCode (enum), error.code (string, e.g. "PROVIDER_NOT_ENABLED"),
    // error.metadata, error.isTransport
}
```

전역 ban listener를 등록할 수도 있습니다. Auth call이 player banned로 reject될 때마다 발생합니다.

```kotlin
hive.auth.onBanned { banned ->
    // show a "player banned" popup
}
```

전체 platform error code 목록은 [에러 코드](/ko/guide/error-codes)를 참고하세요.

## Auth 이후

로그인 후 같은 클라이언트에서 다음을 사용할 수 있습니다.

- `hive.notice` - 설정된 언어의 active notices
- `hive.mailbox` - mailbox listing, new-mail check, claiming
- `hive.payment` - product listing과 purchase verification. [결제](/ko/console/payments) 참고
- `hive.push` - remote push target registration

모든 domain의 method argument와 return type은 [API 레퍼런스](/ko/reference/overview)에 있습니다.

전체 플랫폼 흐름은 [아키텍처](/ko/guide/architecture) 가이드를 읽어보세요. 다른 플랫폼: [Web](/ko/platforms/web), [Unity](/ko/platforms/unity), [iOS](/ko/platforms/ios), [Godot](/ko/platforms/godot).
