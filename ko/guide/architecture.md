# SDK 동작

이 문서는 Web, Unity, Android, iOS, Godot에서 Hive Axyl SDK를 연동할 때 알아야 하는 클라이언트 동작을 설명합니다.

## 로그인과 세션

1. **`auth.getLoginProviders(countryOverride?)`**를 호출하고 반환된 로그인 방식만 표시합니다. 결과에는 [로그인 제공자](/ko/console/login-providers)에서 설정한 국가별 매핑이 적용됩니다.
2. **`auth.loginWithGoogle(idToken)`**, **`auth.loginAsGuest(deviceId)`** 같은 로그인 메서드를 사용합니다. SDK는 로그인된 `Player` 또는 `BannedError` 같은 타입이 있는 에러를 반환합니다.
3. 로그인 후 SDK는 이후 호출에 활성 플레이어 세션을 자동으로 적용합니다.
4. **`auth.currentPlayer()`**로 캐시된 플레이어를 읽고 **`auth.logout()`**으로 세션을 종료하고 로컬 세션 데이터를 지웁니다.

호출이 `SESSION_EXPIRED`로 실패하면 SDK는 세션을 한 번 갱신하고 원래 호출을 재시도합니다. 갱신도 실패하면 에러가 코드에 전달되며 플레이어가 다시 로그인해야 합니다.

게임에서 서버 측 플레이어 검증을 사용한다면 로그인 직후 `playerValidationToken()`으로 수명이 짧은 토큰을 읽어 게임 서버에 전달합니다. 일반 SDK 호출에서는 이 토큰을 직접 처리할 필요가 없습니다.

## 자격 증명 관리

::: warning 서버 자격 증명을 게임 빌드에 포함하지 마세요
OAuth client secret과 market receipt-verification credential은 Hive Axyl 콘솔에만 등록합니다. 클라이언트 코드, 게임과 함께 배포되는 설정 파일, 공개 저장소에 포함하지 마세요.
:::

프로젝트 API key는 빌드 설정에서 관리하고 콘솔에서 범위와 교체를 관리합니다. SDK는 로그인 메서드로 identity-provider token을 받고 플레이어 세션을 자동으로 관리하므로 인증 헤더나 갱신 요청을 직접 만들 필요가 없습니다.

## 세션 영속성

플랫폼이 저장소를 제공하면 세션 영속성이 기본으로 활성화됩니다. 게임에서 세션을 메모리에만 유지해야 할 때 비활성화하세요.

| 플랫폼 | 기본 저장소 | 메모리 전용 설정 |
| --- | --- | --- |
| Web | `localStorage` | `persistSession: false` |
| Unity | `PlayerPrefs` | `persistSession = false` |
| Android | `Context`가 제공되면 `SharedPreferences` | `persistSession = false` |
| iOS | Keychain | 메모리 전용 token storage 구현 제공 |
| Godot | 프로젝트 사용자 데이터 디렉터리 | `persistSession: false` |

초기화 후 각 플랫폼의 `restoreSession()`에 해당하는 메서드를 호출하면 저장된 로그인을 복구할 수 있습니다. 저장된 세션이 없거나 만료되었으면 플레이어를 반환하지 않습니다.

## 재시도와 로깅

- **재시도** - 멱등 호출은 일시적인 실패를 backoff와 함께 재시도할 수 있습니다. 로그인과 같은 비멱등 작업은 자동으로 반복하지 않습니다.
- **로깅** - 각 SDK는 verbose log용 debug option을 제공합니다. 기본값은 비활성화입니다.

## 같이 보기

- [시작하기](/ko/guide/getting-started) - 콘솔 설정과 클라이언트 생명주기
- [에러 코드](/ko/guide/error-codes) - 에러 코드와 구조화된 에러 타입
- [프로젝트와 API 키](/ko/console/projects-api-keys) - SDK가 사용하는 API 키 발급과 교체
