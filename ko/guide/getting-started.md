# 시작하기

Hive Axyl은 하나의 SDK로 게임에 인증, 공지, 우편함, 결제, 라이브 운영을 제공하는 게임 플랫폼입니다. 이 가이드는 빈 콘솔 계정에서 첫 인증 플레이어를 만들기까지의 흐름을 설명합니다.

## 필요한 값

모든 플랫폼의 모든 SDK는 동일한 두 값으로 설정됩니다. 두 값 모두 Hive Axyl 콘솔에서 가져옵니다.

| 값 | 설명 |
| --- | --- |
| **Project ID** | 게임 프로젝트를 식별합니다. SDK는 초기화 중 이 값을 플랫폼에 전송합니다. |
| **API key** | 프로젝트 범위의 클라이언트 자격 증명입니다. SDK가 자동으로 적용합니다. |

::: warning API 키를 소스 관리에 넣지 마세요
전체 API 키는 발급 시 한 번만 표시됩니다. 공개 저장소가 아니라 빌드 설정에 저장하세요.
:::

## 콘솔에서 프로젝트 설정

클라이언트 코드를 작성하기 전에 콘솔에서 다음 단계를 완료하세요.

1. Hive Axyl 콘솔에 **가입 / 로그인**합니다. [콘솔 개요](/ko/console/overview)를 참고하세요.
2. **프로젝트를 만들고 앱 식별자**를 등록합니다. 패키지명, 번들 ID 등이 여기에 해당합니다. [프로젝트와 API 키](/ko/console/projects-api-keys)를 참고하세요.
3. **API 키를 발급**합니다. 전체 키는 한 번만 표시되므로 즉시 복사하세요. [프로젝트와 API 키](/ko/console/projects-api-keys)를 참고하세요.
4. 지원하려는 ID 제공자(예: Google)의 **OAuth 자격 증명**을 등록합니다. 클라이언트 시크릿은 서버에만 보관되며 SDK에는 들어가지 않습니다. [로그인 제공자](/ko/console/login-providers)를 참고하세요.
5. 국가별로 **로그인 제공자 매핑**을 설정해 각 지역에 표시할 로그인 옵션과 순서를 정합니다. [로그인 제공자](/ko/console/login-providers)를 참고하세요.

## 플랫폼 선택

공개 API는 모든 플랫폼에서 동일합니다. 메서드 이름과 동작이 같습니다. 엔진 또는 런타임에 맞는 패키지를 선택하세요.

| 플랫폼 | 패키지 | 배포 | 가이드 |
| --- | --- | --- | --- |
| Web (browser) | `@hive-axyl/web-sdk` | npm (ESM/CJS, React bindings, CDN build) | [Web SDK](/ko/platforms/web) |
| Unity | `com.hiveaxyl.sdk` | UPM package (Standalone, WebGL, Android, iOS) | [Unity SDK](/ko/platforms/unity) |
| Android | `com.hiveaxyl.sdk` | Gradle Android library (Kotlin) | [Android SDK](/ko/platforms/android) |
| iOS | `HiveAxylSDK` | Swift Package Manager | [iOS SDK](/ko/platforms/ios) |
| Godot | `addons/hive_axyl` | Godot 4.x addon (GDScript, desktop) | [Godot SDK](/ko/platforms/godot) |

## 5분 quickstart (Web)

SDK를 설치합니다.

```bash
npm install @hive-axyl/web-sdk
```

클라이언트를 만들고 초기화한 뒤 플레이어를 로그인시킵니다.

```ts
import { createHiveAxyl } from "@hive-axyl/web-sdk";

const hive = createHiveAxyl({
  projectId: "your-project-id",
  apiKey: "your-api-key",
});

await hive.init();

const loginProviders = await hive.auth.getLoginProviders();
const player = await hive.auth.loginAsGuest();
const applePlayer = await hive.auth.loginWithApple({
  clientId: "com.example.web",
});
```

이것으로 동작하는 연동이 완성됩니다. `loginAsGuest`가 완료되면 SDK는 이후 모든 호출에 플레이어 세션을 자동으로 붙입니다. React 바인딩, CDN 빌드, 제공자별 로그인 세부 사항은 [Web SDK 가이드](/ko/platforms/web)를 참고하세요.

## 클라이언트 생명주기

모든 플랫폼은 동일한 5단계 생명주기를 따릅니다.

1. **Configure** - `projectId`와 `apiKey`로 클라이언트를 만듭니다. 필요하면 `clientVersion`, `persistSession`도 설정합니다.
2. **Initialize** - `init()` 또는 플랫폼 명명 규칙에 따른 `initialize()`를 호출합니다. SDK가 플랫폼에 연결하고 도메인 API를 준비합니다. 성공하면 클라이언트는 `ready` 상태가 됩니다.
3. **표시할 로그인 조회** - `auth.getLoginProviders()`를 호출합니다. 서버는 프로젝트 설정과 플레이어 국가에 맞는 로그인 방식을 표시 순서대로 반환합니다. 클라이언트는 서버가 반환한 항목만 렌더링합니다.
4. **로그인** - `auth.loginWithGoogle(idToken)` 또는 `auth.loginAsGuest()` 같은 로그인 메서드를 호출합니다. `playerId`, `nickname` 등을 포함한 `Player`를 받습니다.
5. **인증 호출 수행** - 로그인 후 SDK는 모든 요청에 플레이어 토큰을 붙이고 세션 만료 시 자동으로 갱신합니다. 로그인된 플레이어는 `auth.currentPlayer()`로 읽고, 세션 종료는 `auth.logout()`으로 처리합니다.

## 다음 단계

- 세션 영속성, 재시도, 자격 증명 관리 확인: [SDK 동작](/ko/guide/architecture)
- 제재, 점검, 기타 실패 처리: [에러 코드](/ko/guide/error-codes)
- 콘솔에서 공지, 점검, 우편함 설정: [운영](/ko/console/operations)
