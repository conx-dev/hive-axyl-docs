# Errors

모든 SDK method는 typed error를 throw합니다. Message text가 아니라 error class와 `code` string으로 분기하세요. 전체 code list는 [에러 코드](/ko/guide/error-codes)에 있습니다.

```ts
import { BannedError, HiveAxylError, MaintenanceError } from "@hive-axyl/web-sdk";

try {
  await hive.auth.loginAsGuest();
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

## HiveAxylError

모든 platform error의 base class입니다.

| Field | Type | Description |
| --- | --- | --- |
| `code` | `string` | Error code name, 예: `"INVALID_ARGUMENT"`, `"SESSION_EXPIRED"`, `"DUPLICATE_RECEIPT"` |
| `message` | `string` | 사람이 읽기 위한 detail. 이 값으로 분기하지 마세요 |

## BannedError

플레이어가 제재 상태일 때 throw됩니다. Login 중 또는 player-scoped call에서 발생합니다. `code`는 항상 `"PLAYER_BANNED"`입니다.

| Field | Type | Description |
| --- | --- | --- |
| `reason` | `string` | Admin이 입력한 reason. 표시해도 안전함 |
| `permanent` | `boolean` | 영구 ban이면 true(`until` 없음) |
| `until` | `Date?` | Ban 해제 시각(UTC). 임시 ban에만 있음 |

## MaintenanceError

점검 진행 중에 throw됩니다. `init()`, login, domain call에서 발생할 수 있습니다. `code`는 항상 `"MAINTENANCE_IN_PROGRESS"`입니다.

| Field | Type | Description |
| --- | --- | --- |
| `maintenanceMessage` | `string` | 설정된 `language`의 maintenance notice. 표시해도 안전함 |
| `startsAt` | `Date?` | Maintenance window start (UTC) |
| `endsAt` | `Date?` | Maintenance window end (UTC) |

## Entry checks

Maintenance, geo restriction, sanction은 클라이언트 초기화와 로그인 시 플랫폼에서 강제됩니다. 따로 호출할 method는 없습니다. 각각 `MaintenanceError`, `"GEO_BLOCKED"` 또는 `"CLIENT_VERSION_UNSUPPORTED"`를 가진 `HiveAxylError`, `BannedError`로 노출됩니다.

## Helpers

```ts
errorCodeOf(err: unknown): ErrorCode
errorDetailOf(err: unknown): ErrorDetail | undefined
```

이미 `HiveAxylError` instance가 아닌 error에서도 platform error code(`ErrorCode` enum)와 raw error detail(`code`와 `metadata` string map)을 추출합니다. Error에 platform detail이 없으면 `errorCodeOf`는 `ErrorCode.UNSPECIFIED`를 반환합니다.
