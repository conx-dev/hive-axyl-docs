# Error Codes

Every domain error in Hive Axyl carries a machine-readable code. This page lists all codes, the structured error types built on top of them, and how to handle them on each platform.

## Error model

When a call fails with a domain error, the server attaches an `ErrorDetail` to the response:

```
ErrorDetail {
  code: ErrorCode                  // the single source of truth for branching
  metadata: map<string, string>    // extra context, documented per code
}
```

**Branch on the code, never on the message string.** Error messages are human-readable and may change; codes are stable. Each SDK decodes `ErrorDetail` for you and exposes the code through its platform error type (see [Platform error types](#platform-error-types) below).

## Error code reference

### Common (1–99)

| Code | Value | Meaning |
| --- | --- | --- |
| `UNSPECIFIED` | 0 | No domain code attached (default value). |
| `INTERNAL` | 1 | Unexpected server-side failure. |
| `INVALID_ARGUMENT` | 2 | A request field is missing or malformed. |
| `NOT_FOUND` | 3 | The requested resource does not exist. |
| `ALREADY_EXISTS` | 4 | The resource already exists. |
| `PERMISSION_DENIED` | 5 | The caller is not allowed to perform this action. |
| `UNAUTHENTICATED` | 6 | The call requires authentication that was missing or invalid. |
| `RATE_LIMITED` | 7 | Too many new guest accounts were requested. Retry after the supplied delay. |
| `DEPENDENCY_UNAVAILABLE` | 10 | A required service is temporarily unavailable. Retry with backoff. |

### Gate & Connection (100–199)

| Code | Value | Meaning |
| --- | --- | --- |
| `MAINTENANCE_IN_PROGRESS` | 100 | The service is under maintenance. Surfaced as a structured maintenance error. |
| `GEO_BLOCKED` | 101 | The service is not available in the player's country. |
| `CLIENT_VERSION_UNSUPPORTED` | 102 | The client version is no longer supported; prompt the player to update. |

### Auth & Player (200–299)

| Code | Value | Meaning |
| --- | --- | --- |
| `PLAYER_BANNED` | 200 | The account is sanctioned. Surfaced as a structured banned error. |
| `INVALID_PROVIDER_TOKEN` | 201 | The identity provider token failed server-side verification. |
| `PROVIDER_NOT_ENABLED` | 202 | The login provider is not enabled for this project/country. |
| `CREDENTIAL_NOT_CONFIGURED` | 203 | OAuth credentials for the provider are not registered in the console. |
| `SESSION_EXPIRED` | 204 | The player session expired. The SDK refreshes once automatically before surfacing this. |
| `PLAYER_NOT_FOUND` | 205 | No player matches the request. |

### Payment (300–399)

| Code | Value | Meaning |
| --- | --- | --- |
| `DUPLICATE_RECEIPT` | 300 | The purchase receipt was already submitted. |
| `RECEIPT_VERIFICATION_FAILED` | 301 | The market rejected the receipt during server-side verification. |
| `MARKET_NOT_SUPPORTED` | 302 | The store/market is not supported for this project. |

### API Key (400–499)

| Code | Value | Meaning |
| --- | --- | --- |
| `API_KEY_INVALID` | 400 | The API key is unknown or malformed. |
| `API_KEY_REVOKED` | 401 | The API key was revoked in the console. |
| `SERVER_KEY_INVALID` | 402 | The server key is unknown or malformed. |
| `SERVER_KEY_REVOKED` | 403 | The server key was revoked in the console. |

### Mailbox (600–699)

| Code | Value | Meaning |
| --- | --- | --- |
| `MAIL_NOT_FOUND` | 600 | The mail item does not exist. |
| `MAIL_ALREADY_CLAIMED` | 601 | The mail attachment was already claimed. |
| `MAIL_NOT_CLAIMABLE` | 602 | The mail has no claimable attachment. |

::: info Console-only codes
Codes in the 500–599 range relate to console administration (admin accounts, project registration) and are not returned to game clients through the SDK.
:::

## Structured errors

Two codes come with dedicated error types on every platform, so the most common "stop the player here" cases are easy to handle. Their extra fields are parsed from `ErrorDetail.metadata`:

### Banned (`PLAYER_BANNED`)

| Field | Metadata key | Type |
| --- | --- | --- |
| `reason` | `reason` | string |
| `permanent` | `permanent` (`"true"` / `"false"`) | boolean |
| `until` | `until` (or `banned_until`) | timestamp, absent for permanent bans |

### Maintenance (`MAINTENANCE_IN_PROGRESS`)

| Field | Metadata key | Type |
| --- | --- | --- |
| `maintenanceMessage` | `message` | string |
| `startsAt` | `starts_at` | timestamp, optional |
| `endsAt` | `ends_at` | timestamp, optional |

### Retry metadata (`RATE_LIMITED`)

New guest creation can be limited while existing guest and identity-provider logins continue normally.

| Metadata key | Type | Description |
| --- | --- | --- |
| `scope` | string | Limit scope: `project_ip`, `project`, or `service`. |
| `retry_after_seconds` | integer string | Minimum delay before retrying. |

HTTP responses also include `Retry-After` with the same delay.

### Correlation metadata (`INTERNAL`)

`INTERNAL` responses use the fixed message `internal error` and include a support reference.

| Metadata key | Type | Description |
| --- | --- | --- |
| `correlation_id` | UUID string | Reference to provide when contacting support about the failure. |

## Handling errors on Web

The Web SDK exports `BannedError`, `MaintenanceError`, the generic `HiveAxylError`, the `ErrorCode` enum, and the helpers `errorCodeOf` / `errorDetailOf`:

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

`errorCodeOf(err)` returns `ErrorCode.UNSPECIFIED` when the error carries no `ErrorDetail` (for example, a pure network failure), so the `default` branch always has something to fall through to. Use `errorDetailOf(err)` when you need the raw `metadata` map.

## Platform error types

Each SDK maps `ErrorDetail` to an idiomatic error type for its language:

| Platform | Type | Shape |
| --- | --- | --- |
| Web | `HiveAxylError` | `code` (string name) plus subclasses `BannedError { reason, until?, permanent }` and `MaintenanceError { maintenanceMessage, startsAt?, endsAt? }`. |
| Unity | `HiveAxylException` | `ErrorCode` (enum), `Code` (string name), `Metadata`, `IsTransport`; subclasses `HiveAxylBannedException { Reason, Until?, Permanent }` and `HiveAxylMaintenanceException { MaintenanceMessage, StartsAt?, EndsAt? }`. |
| Android | `HiveAxylException` | `errorCode` (enum), `code` (string name), `metadata`, `isTransport`; subclasses `BannedException { reason, until?, permanent }` and `MaintenanceException { maintenanceMessage, startsAt?, endsAt? }`. |
| iOS | `HiveAxylError` | Swift enum with cases such as `.banned(reason:until:permanent:)`, `.maintenance(MaintenanceInfo)`, `.geoBlocked(country:)`, `.duplicateReceipt`, `.transport(String)`, and the catch-all `.code(ErrorCode, message:)`. |
| Godot | `last_error` | Dictionary `{ code, message, metadata, http_status, retryable }`, also emitted via the `error_occurred` signal. |

On Unity and Android, `IsTransport` / `isTransport` distinguishes network-level failures (no server response) from domain errors; on Godot the same signal is the `retryable` flag.

## See also

- [Architecture](/guide/architecture) — where errors originate in the request flow
- [Players & Sanctions](/console/players) — issuing and lifting the bans behind `PLAYER_BANNED`
- [Operations](/console/operations) — scheduling the maintenance windows behind `MAINTENANCE_IN_PROGRESS`
