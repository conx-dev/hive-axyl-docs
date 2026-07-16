# Errors

Every SDK method throws typed errors. Branch on the error class and its `code` string — never on message text. The full code list is in [Error Codes](/guide/error-codes).

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

The base class for all platform errors.

| Field | Type | Description |
| --- | --- | --- |
| `code` | `string` | Error code name, e.g. `"INVALID_ARGUMENT"`, `"SESSION_EXPIRED"`, `"DUPLICATE_RECEIPT"` |
| `message` | `string` | Human-readable detail; do not branch on this |

## BannedError

Thrown when the player is sanctioned — during login and on player-scoped calls. `code` is always `"PLAYER_BANNED"`.

| Field | Type | Description |
| --- | --- | --- |
| `reason` | `string` | Admin-entered reason, safe to display |
| `permanent` | `boolean` | True for a permanent ban (`until` is absent) |
| `until` | `Date?` | When the ban lifts (UTC); only for temporary bans |

## MaintenanceError

Thrown while maintenance is in progress — during `init()`, login, and domain calls. `code` is always `"MAINTENANCE_IN_PROGRESS"`.

| Field | Type | Description |
| --- | --- | --- |
| `maintenanceMessage` | `string` | Maintenance notice in the configured `language`, safe to display |
| `startsAt` | `Date?` | Maintenance window start (UTC) |
| `endsAt` | `Date?` | Maintenance window end (UTC) |

## Entry checks

Maintenance, geo restriction, and sanctions are enforced by the platform when the client initializes and logs in — there is no method to call. They surface as `MaintenanceError`, `HiveAxylError` with `"GEO_BLOCKED"` or `"CLIENT_VERSION_UNSUPPORTED"`, and `BannedError` respectively.

## Helpers

```ts
errorCodeOf(err: unknown): ErrorCode
errorDetailOf(err: unknown): ErrorDetail | undefined
```

For errors that are not already `HiveAxylError` instances, these extract the platform error code (the `ErrorCode` enum) and the raw error detail (`code` plus a `metadata` string map) from any thrown value. `errorCodeOf` returns `ErrorCode.UNSPECIFIED` when the error carries no platform detail.
