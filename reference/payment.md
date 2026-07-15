# Payment API — `hive.payment`

Product catalog, purchase flow, and receipt verification. Requires login. Products and per-product policies are configured in the [Console](/console/payments).

| Method | Returns |
| --- | --- |
| [`listProducts(options)`](#listproducts) | `Promise<PaymentProduct[]>` |
| [`startPurchase(options)`](#startpurchase) | `Promise<string>` (purchase intent id) |
| [`verifyPurchase(options)`](#verifypurchase) | `Promise<PaymentPurchase>` |
| [`getPurchase(purchaseId)`](#getpurchase) | `Promise<PaymentPurchase>` |
| [`waitForPaymentGrant(purchaseId, timeoutMillis?)`](#waitforpaymentgrant) | `Promise<PaymentPurchase>` |

The purchase flow is: `startPurchase` → open the market's payment UI → `verifyPurchase` → for products whose `grantMode` is `"webhook_required"`, `waitForPaymentGrant` until the game server confirms delivery.

## listProducts

```ts
listProducts(options: ListPaymentProductsOptions): Promise<PaymentProduct[]>
```

`ListPaymentProductsOptions`

| Field | Type | Required | Description |
| --- | --- | --- | --- |
| `market` | `string` | Yes | One of the [market values](#string-values) |
| `appIdentifier` | `string` | Yes | Market app identifier (package name / bundle id / app id) |
| `productType` | `string` | No | `"one_time"` or `"subscription"`; omit for all |

Returns the enabled [`PaymentProduct`](#paymentproduct) list for the market/app.

## startPurchase

```ts
startPurchase(options: StartPaymentPurchaseOptions): Promise<string>
```

`StartPaymentPurchaseOptions`

| Field | Type | Required | Description |
| --- | --- | --- | --- |
| `market` | `string` | Yes | One of the [market values](#string-values) |
| `appIdentifier` | `string` | Yes | Market app identifier |
| `productId` | `string` | Yes | Market product id |
| `productType` | `string` | Yes | `"one_time"` or `"subscription"` |

Call before opening the market's payment window. Returns the **purchase intent id** — pass it to `verifyPurchase` so the receipt is tied to this attempt.

## verifyPurchase

```ts
verifyPurchase(options: VerifyPaymentPurchaseOptions): Promise<PaymentPurchase>
```

`VerifyPaymentPurchaseOptions` — all `StartPaymentPurchaseOptions` fields plus:

| Field | Type | Required | Description |
| --- | --- | --- | --- |
| `receiptPayload` | `string` | One of these two | Raw market receipt (JSON/base64) |
| `purchaseToken` | `string` | One of these two | Market purchase token (Google Play) |
| `purchaseIntentId` | `string` | No | Intent id from `startPurchase` |

At least one of `receiptPayload` or `purchaseToken` is required (`INVALID_ARGUMENT` otherwise). The receipt is verified server-side; returns the verified [`PaymentPurchase`](#paymentpurchase).

Errors (`HiveAxylError.code`): `DUPLICATE_RECEIPT` when the receipt was already processed; `RECEIPT_VERIFICATION_FAILED` when the market rejected the receipt; `PURCHASE_PENDING` for webhook-based web payments whose confirmation hasn't arrived yet — retry; `INTERNAL` when the market side was temporarily unavailable — retry with the same receipt.

## getPurchase

```ts
getPurchase(purchaseId: string): Promise<PaymentPurchase>
```

| Argument | Type | Required | Description |
| --- | --- | --- | --- |
| `purchaseId` | `string` | Yes | `PaymentPurchase.id` of one of the logged-in player's purchases |

Returns the current [`PaymentPurchase`](#paymentpurchase) state.

## waitForPaymentGrant

```ts
waitForPaymentGrant(purchaseId: string, timeoutMillis?: number): Promise<PaymentPurchase>
```

| Argument | Type | Required | Description |
| --- | --- | --- | --- |
| `purchaseId` | `string` | Yes | Purchase to wait on |
| `timeoutMillis` | `number` | No | Max wait (default `30_000`; must be positive) |

Polls `getPurchase` with increasing delays and resolves as soon as the item grant is finished (`grantStatus` is `"delivered"` or `"not_required"`) or the purchase reaches a failed state (`"failed"`, `"canceled"`, `"refunded"`, `"expired"`). On timeout it resolves with the latest state — check `grantStatus` yourself.

## Types

### PaymentProduct

| Field | Type | Description |
| --- | --- | --- |
| `projectId` | `string` | Owning project |
| `market` | `string` | [Market value](#string-values) |
| `appIdentifier` | `string` | Market app identifier |
| `productId` | `string` | Market product id |
| `productType` | `string` | `"one_time"` or `"subscription"` |
| `marketStatus` | `string` | Raw status reported by the market |
| `title` | `string` | Display title |
| `description` | `string` | Display description |
| `amountMinor` | `bigint` | Price in currency minor units |
| `currency` | `string` | ISO 4217 code, e.g. `"USD"` |
| `consumePolicy` | `string` | `"none"` or `"consume_after_grant"` |
| `grantMode` | `string` | `"webhook_required"`, `"no_grant"`, or `"client_grant"` |
| `enabled` | `boolean` | Exposable to clients |

### PaymentPurchase

| Field | Type | Description |
| --- | --- | --- |
| `id` | `string` | Purchase id — use with `getPurchase` / `waitForPaymentGrant` |
| `projectId` | `string` | Owning project |
| `playerId` | `string` | Purchasing player |
| `market` | `string` | [Market value](#string-values) |
| `productType` | `string` | `"one_time"` or `"subscription"` |
| `productId` | `string` | Market product id |
| `packageName` | `string` | Market app identifier at purchase time |
| `purchaseIntentId` | `string` | Intent from `startPurchase` |
| `amountMinor` | `bigint` | Paid amount in minor units |
| `currency` | `string` | ISO 4217 code |
| `status` | `string` | `"pending"`, `"verified"`, `"failed"`, `"refunded"`, `"canceled"`, or `"expired"` |
| `grantStatus` | `string` | Grant progress, e.g. `"delivered"`, `"not_required"` |
| `consumeStatus` | `string` | Consumption progress |
| `marketOrderId` | `string` | Market-side order id |
| `purchasedAt` | `Date?` | Market purchase time (UTC) |
| `verifiedAt` | `Date?` | Receipt verification time (UTC); absent if unverified |

### String values

| Field | Valid values |
| --- | --- |
| `market` | `"google_play"`, `"app_store"`, `"steam"`, `"web"` |
| `productType` | `"one_time"`, `"subscription"` |
| `status` | `"pending"`, `"verified"`, `"failed"`, `"refunded"`, `"canceled"`, `"expired"` |
| `consumePolicy` | `"none"`, `"consume_after_grant"` |
| `grantMode` | `"webhook_required"`, `"no_grant"`, `"client_grant"` |
