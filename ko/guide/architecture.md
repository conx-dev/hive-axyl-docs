# 아키텍처

이 문서는 Hive Axyl SDK가 플랫폼과 통신하는 방식, 네트워크로 전달되는 내용, 플레이어 인증 방식, 시크릿이 보관되는 위치를 설명합니다. 여기서 설명하는 동작은 Web, Unity, Android, iOS, Godot에서 동일합니다.

## Wire protocol

모든 RPC는 **HTTP POST 기반 ConnectRPC unary call**입니다. 유지해야 하는 영구 소켓은 없습니다. 모든 호출은 일반 HTTP 요청이므로 표준 프록시, CDN, 브라우저 네트워킹과 함께 동작합니다.

| 플랫폼 | 인코딩 |
| --- | --- |
| Web, Unity, Android, iOS | Binary protobuf (`application/proto`) |
| Godot | Connect JSON (생성된 protobuf 코드 없음) |

요청과 응답 형태는 플랫폼 protobuf schema에서 한 번 정의되고 각 SDK로 생성되므로, 모든 플랫폼이 바이트 단위로 같은 계약을 공유합니다.

## 인증 흐름

1. **`auth.getLoginProviders(countryOverride?)`**는 `{ providers, country }`를 반환합니다. 서버는 프로젝트 설정과 플레이어 국가([로그인 제공자](/ko/console/login-providers)에서 설정)를 기준으로 어떤 로그인 방식을 어떤 순서로 노출할지 결정합니다. 클라이언트는 서버가 반환한 것만 렌더링하며, 클라이언트에 제공자 목록을 따로 유지하지 않습니다.
2. **`auth.loginWithGoogle(idToken)`** - 게임은 플랫폼의 Google Sign-In 라이브러리로 `idToken`을 직접 얻고, SDK에 그대로 전달합니다. 서버는 제공자에서 토큰을 검증하고 `Player { playerId, nickname, ... }`를 반환합니다. 계정이 제재 상태라면 `reason`, `until`, `permanent`를 가진 `BannedError`로 실패합니다([에러 코드](/ko/guide/error-codes) 참고). 일부 플랫폼은 Web과 모바일의 Apple처럼 같은 패턴의 추가 제공자를 노출합니다. 클라이언트가 제공자 토큰을 얻고 서버가 검증합니다.
3. **`auth.loginAsGuest(deviceId)`** - 게임이 제공한 디바이스 식별자로 로그인합니다. 외부 계정이 필요 없습니다.
4. **`auth.currentPlayer()`** - 로그인된 플레이어가 있으면 반환합니다.
5. **`auth.logout()`** - 세션을 종료하고 저장된 토큰을 지웁니다.

로그인과 갱신은 수명이 짧은 **player validation token**도 반환합니다. 게임에서 자체 게임 서버를 사용한다면 로그인 직후 이 토큰을 게임 서버로 보내세요. 게임 서버는 `GameServerPlayerService.ValidatePlayer`를 호출해 플레이어가 방금 정상 로그인했는지 확인합니다.

## 헤더와 토큰 갱신

SDK는 모든 도메인 호출에서 자격 증명을 관리합니다.

- **`Authorization: Bearer <api-key>`** - 프로젝트의 API 키이며 모든 도메인 서비스 요청에 첨부됩니다.
- **`X-Player-Token`** - 로그인 후 자동으로 첨부됩니다.

호출이 `SESSION_EXPIRED`로 실패하면 SDK는 세션을 **한 번** 자동 갱신하고 원래 호출을 재시도합니다. 직접 갱신 로직을 작성하지 않아도 됩니다. 갱신도 실패하면 에러가 코드로 전달되고 플레이어는 다시 로그인해야 합니다.

Player validation token은 `X-Player-Token`과 별개입니다. SDK는 게임 서버 전달용으로 이 토큰을 노출하지만, SDK 도메인 호출의 일반 플레이어 세션 토큰으로는 사용하지 않습니다.

## 보안 모델

::: warning SDK가 절대 보관하지 않는 것
SDK에는 **OAuth client secret 또는 market receipt-verification key가 절대 포함되지 않습니다**. 이 자격 증명은 콘솔에 등록되어 서버 측에 저장되며, 모든 검증(제공자 토큰, 구매 영수증)은 서버에서 수행됩니다. SDK가 다루는 시크릿은 **API key**와 **player token**뿐입니다.
:::

그래서 로그인 메서드는 제공자 토큰을 입력으로 받습니다. 클라이언트는 플랫폼 자체 로그인 UI에서 얻은 토큰으로 신원을 증명하고, 그 토큰이 유효한지는 클라이언트가 아니라 서버가 판단합니다.

## 세션 영속성

기본적으로 세션은 메모리에만 존재하며 게임이 종료되면 사라집니다. 영속성을 켜면 각 플랫폼은 고유한 저장 방식으로 세션을 보관합니다.

| 플랫폼 | 저장소 | 활성화 방법 |
| --- | --- | --- |
| Web | `localStorage` | `persistSession: true` |
| Unity | `PlayerPrefs` (`PlayerPrefsTokenStorage`) | `persistSession = true` |
| Android | `SharedPreferences` | `persistSession = true` |
| iOS | Keychain (`KeychainTokenStorage`) | default |
| Godot | 프로젝트 사용자 데이터 디렉터리의 로컬 세션 파일 | `persist_session: true` |

## 재시도와 로깅

- **Retries** - 멱등 호출만 exponential backoff로 최대 2회 재시도합니다. 로그인 같은 비멱등 호출은 조용히 반복하지 않습니다.
- **Logging** - 각 SDK에는 verbose logging을 켜고 끄는 debug flag가 있으며 기본값은 off입니다.

## 같이 보기

- [시작하기](/ko/guide/getting-started) - 콘솔 설정과 5단계 클라이언트 생명주기
- [에러 코드](/ko/guide/error-codes) - 전체 에러 코드 표와 구조화된 에러 타입
- [프로젝트와 API 키](/ko/console/projects-api-keys) - SDK가 사용하는 API 키 발급과 교체
