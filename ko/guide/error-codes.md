# 에러 코드

Hive Axyl의 모든 도메인 에러는 기계가 읽을 수 있는 코드를 포함합니다. 이 문서는 모든 코드, 그 위에 구성된 구조화 에러 타입, 플랫폼별 처리 방법을 설명합니다.

## 에러 모델

호출이 도메인 에러로 실패하면 서버는 응답에 `ErrorDetail`을 첨부합니다.

```
ErrorDetail {
  code: ErrorCode                  // 분기 기준의 단일 소스
  metadata: map<string, string>    // 코드별로 문서화된 추가 컨텍스트
}
```

**메시지 문자열이 아니라 코드로 분기하세요.** 에러 메시지는 사람이 읽기 위한 값이며 변경될 수 있습니다. 코드는 안정적입니다. 각 SDK는 `ErrorDetail`을 디코딩하고 플랫폼 에러 타입으로 코드를 노출합니다. 아래 [플랫폼 에러 타입](#플랫폼-에러-타입)을 참고하세요.

## 에러 코드 레퍼런스

### Common (1-99)

| Code | Value | 의미 |
| --- | --- | --- |
| `UNSPECIFIED` | 0 | 도메인 코드가 첨부되지 않음(기본값). |
| `INTERNAL` | 1 | 예상치 못한 서버 측 실패. |
| `INVALID_ARGUMENT` | 2 | 요청 필드가 누락되었거나 형식이 잘못됨. |
| `NOT_FOUND` | 3 | 요청한 리소스가 존재하지 않음. |
| `ALREADY_EXISTS` | 4 | 리소스가 이미 존재함. |
| `PERMISSION_DENIED` | 5 | 호출자가 이 작업을 수행할 권한이 없음. |
| `UNAUTHENTICATED` | 6 | 호출에 인증이 필요하지만 없거나 유효하지 않음. |
| `RATE_LIMITED` | 7 | 새 게스트 계정 요청이 너무 많음. 제공된 대기 시간 후 다시 시도해야 함. |

### Gate & Connection (100-199)

| Code | Value | 의미 |
| --- | --- | --- |
| `MAINTENANCE_IN_PROGRESS` | 100 | 서비스가 점검 중임. 구조화된 maintenance error로 노출됩니다. |
| `GEO_BLOCKED` | 101 | 플레이어 국가에서 서비스를 사용할 수 없음. |
| `CLIENT_VERSION_UNSUPPORTED` | 102 | 클라이언트 버전이 더 이상 지원되지 않음. 플레이어에게 업데이트를 안내하세요. |

### Auth & Player (200-299)

| Code | Value | 의미 |
| --- | --- | --- |
| `PLAYER_BANNED` | 200 | 계정이 제재 상태임. 구조화된 banned error로 노출됩니다. |
| `INVALID_PROVIDER_TOKEN` | 201 | ID 제공자 토큰의 서버 측 검증 실패. |
| `PROVIDER_NOT_ENABLED` | 202 | 이 프로젝트/국가에 로그인 제공자가 활성화되어 있지 않음. |
| `CREDENTIAL_NOT_CONFIGURED` | 203 | 제공자의 OAuth 자격 증명이 콘솔에 등록되어 있지 않음. |
| `SESSION_EXPIRED` | 204 | 플레이어 세션이 만료됨. SDK가 한 번 자동 갱신한 뒤에도 실패하면 노출됩니다. |
| `PLAYER_NOT_FOUND` | 205 | 요청에 맞는 플레이어가 없음. |

### Payment (300-399)

| Code | Value | 의미 |
| --- | --- | --- |
| `DUPLICATE_RECEIPT` | 300 | 구매 영수증이 이미 제출됨. |
| `RECEIPT_VERIFICATION_FAILED` | 301 | 서버 측 검증 중 market이 영수증을 거부함. |
| `MARKET_NOT_SUPPORTED` | 302 | 이 프로젝트에서 store/market을 지원하지 않음. |

### API Key (400-499)

| Code | Value | 의미 |
| --- | --- | --- |
| `API_KEY_INVALID` | 400 | API 키를 알 수 없거나 형식이 잘못됨. |
| `API_KEY_REVOKED` | 401 | API 키가 콘솔에서 폐기됨. |
| `SERVER_KEY_INVALID` | 402 | 서버 키를 알 수 없거나 형식이 잘못됨. |
| `SERVER_KEY_REVOKED` | 403 | 서버 키가 콘솔에서 폐기됨. |

### Mailbox (600-699)

| Code | Value | 의미 |
| --- | --- | --- |
| `MAIL_NOT_FOUND` | 600 | 메일 항목이 존재하지 않음. |
| `MAIL_ALREADY_CLAIMED` | 601 | 메일 첨부가 이미 수령됨. |
| `MAIL_NOT_CLAIMABLE` | 602 | 수령 가능한 첨부가 없는 메일임. |

::: info 콘솔 전용 코드
500-599 범위의 코드는 콘솔 관리(관리자 계정, 프로젝트 등록)와 관련되며 SDK를 통해 게임 클라이언트에 반환되지 않습니다.
:::

## 구조화 에러

두 코드는 모든 플랫폼에서 전용 에러 타입을 제공합니다. 그래서 가장 흔한 "여기서 플레이어를 멈춰야 하는" 케이스를 쉽게 처리할 수 있습니다. 추가 필드는 `ErrorDetail.metadata`에서 파싱됩니다.

### Banned (`PLAYER_BANNED`)

| Field | Metadata key | Type |
| --- | --- | --- |
| `reason` | `reason` | string |
| `permanent` | `permanent` (`"true"` / `"false"`) | boolean |
| `until` | `until` (or `banned_until`) | timestamp, 영구 제재에는 없음 |

### Maintenance (`MAINTENANCE_IN_PROGRESS`)

| Field | Metadata key | Type |
| --- | --- | --- |
| `maintenanceMessage` | `message` | string |
| `startsAt` | `starts_at` | timestamp, optional |
| `endsAt` | `ends_at` | timestamp, optional |

### 재시도 metadata (`RATE_LIMITED`)

새 게스트 생성만 제한될 수 있습니다. 기존 게스트 로그인과 IdP 로그인은 계속 처리됩니다.

| Metadata key | Type | 설명 |
| --- | --- | --- |
| `scope` | string | 제한 범위: `project_ip`, `project`, 또는 `service`. |
| `retry_after_seconds` | integer string | 다시 시도하기 전 최소 대기 시간. |

HTTP 응답의 `Retry-After`에도 같은 대기 시간이 포함됩니다.

### 상관관계 metadata (`INTERNAL`)

`INTERNAL` 응답은 고정 메시지 `internal error`와 고객지원용 참조 ID를 포함합니다.

| Metadata key | Type | 설명 |
| --- | --- | --- |
| `correlation_id` | UUID string | 오류 문의 시 고객지원에 전달할 참조 ID. |

## Web에서 에러 처리

Web SDK는 `BannedError`, `MaintenanceError`, 범용 `HiveAxylError`, `ErrorCode` enum, `errorCodeOf` / `errorDetailOf` helper를 export합니다.

```ts
import {
  BannedError,
  ErrorCode,
  MaintenanceError,
  errorCodeOf,
} from "@hive-axyl/web-sdk";

try {
  await hive.auth.loginAsGuest();
} catch (err) {
  if (err instanceof BannedError) {
    showBanScreen(err.reason, err.permanent, err.until);
    return;
  }
  if (err instanceof MaintenanceError) {
    showMaintenanceScreen(err.maintenanceMessage, err.startsAt, err.endsAt);
    return;
  }
  switch (errorCodeOf(err)) {
    case ErrorCode.PROVIDER_NOT_ENABLED:
      showProviderDisabledNotice();
      break;
    case ErrorCode.CLIENT_VERSION_UNSUPPORTED:
      showUpdatePrompt();
      break;
    default:
      showGenericError();
  }
}
```

에러에 `ErrorDetail`이 없을 때(예: 순수 네트워크 실패) `errorCodeOf(err)`는 `ErrorCode.UNSPECIFIED`를 반환하므로 `default` 분기는 항상 도달 가능한 fallback이 됩니다. 원본 `metadata` map이 필요하면 `errorDetailOf(err)`를 사용하세요.

## 플랫폼 에러 타입

각 SDK는 `ErrorDetail`을 언어에 맞는 에러 타입으로 매핑합니다.

| 플랫폼 | 타입 | 형태 |
| --- | --- | --- |
| Web | `HiveAxylError` | `code` (string name)와 subclass `BannedError { reason, until?, permanent }`, `MaintenanceError { maintenanceMessage, startsAt?, endsAt? }`. |
| Unity | `HiveAxylException` | `ErrorCode` (enum), `Code` (string name), `Metadata`, `IsTransport`; subclass `HiveAxylBannedException { Reason, Until?, Permanent }`, `HiveAxylMaintenanceException { MaintenanceMessage, StartsAt?, EndsAt? }`. |
| Android | `HiveAxylException` | `errorCode` (enum), `code` (string name), `metadata`, `isTransport`; subclass `BannedException { reason, until?, permanent }`, `MaintenanceException { maintenanceMessage, startsAt?, endsAt? }`. |
| iOS | `HiveAxylError` | `.banned(reason:until:permanent:)`, `.maintenance(MaintenanceInfo)`, `.geoBlocked(country:)`, `.duplicateReceipt`, `.transport(String)`, catch-all `.code(ErrorCode, message:)` 같은 Swift enum case. |
| Godot | `last_error` | Dictionary `{ code, message, metadata, http_status, retryable }`, `error_occurred` signal로도 emit됩니다. |

Unity와 Android의 `IsTransport` / `isTransport`는 네트워크 수준 실패(서버 응답 없음)와 도메인 에러를 구분합니다. Godot에서는 같은 의미를 `retryable` flag로 표현합니다.

## 같이 보기

- [아키텍처](/ko/guide/architecture) - 요청 흐름에서 에러가 발생하는 위치
- [플레이어와 제재](/ko/console/players) - `PLAYER_BANNED`의 원인이 되는 제재 등록과 해제
- [운영](/ko/console/operations) - `MAINTENANCE_IN_PROGRESS`의 원인이 되는 점검 창 예약
