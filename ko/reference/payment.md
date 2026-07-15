# Payment API - `hive.payment`

Product catalog, purchase flow, receipt verification을 처리합니다. Login이 필요합니다. Product와 product별 policy는 [콘솔](/ko/console/payments)에서 설정합니다.

| Method | Returns |
| --- | --- |
| [`listProducts(options)`](#listproducts) | `Promise<PaymentProduct[]>` |
| [`startPurchase(options)`](#startpurchase) | `Promise<string>` (purchase intent id) |
| [`verifyPurchase(options)`](#verifypurchase) | `Promise<PaymentPurchase>` |
| [`getPurchase(purchaseId)`](#getpurchase) | `Promise<PaymentPurchase>` |
| [`waitForPaymentGrant(purchaseId, timeoutMillis?)`](#waitforpaymentgrant) | `Promise<PaymentPurchase>` |

Purchase flow는 `startPurchase` -> market payment UI 열기 -> `verifyPurchase` -> `grantMode`가 `"webhook_required"`인 product는 game server가 delivery를 확인할 때까지 `waitForPaymentGrant` 순서입니다.

## listProducts

```ts
listProducts(options: ListPaymentProductsOptions): Promise<PaymentProduct[]>
```

`ListPaymentProductsOptions`

| Field | Type | Required | Description |
| --- | --- | --- | --- |
| `market` | `string` | Yes | [market values](#string-values) 중 하나 |
| `appIdentifier` | `string` | Yes | Market app identifier(package name / bundle id / app id) |
| `productType` | `string` | No | `"one_time"` 또는 `"subscription"`. 생략하면 전체 |

Market/app에서 enabled 상태인 [`PaymentProduct`](#paymentproduct) list를 반환합니다.

## startPurchase

```ts
startPurchase(options: StartPaymentPurchaseOptions): Promise<string>
```

`StartPaymentPurchaseOptions`

| Field | Type | Required | Description |
| --- | --- | --- | --- |
| `market` | `string` | Yes | [market values](#string-values) 중 하나 |
| `appIdentifier` | `string` | Yes | Market app identifier |
| `productId` | `string` | Yes | Market product id |
| `productType` | `string` | Yes | `"one_time"` 또는 `"subscription"` |

Market payment window를 열기 전에 호출합니다. **Purchase intent id**를 반환합니다. `verifyPurchase`에 전달해 receipt가 이 attempt에 연결되게 하세요.

## verifyPurchase

```ts
verifyPurchase(options: VerifyPaymentPurchaseOptions): Promise<PaymentPurchase>
```

`VerifyPaymentPurchaseOptions` - 모든 `StartPaymentPurchaseOptions` field와 다음 field를 포함합니다.

| Field | Type | Required | Description |
| --- | --- | --- | --- |
| `receiptPayload` | `string` | 둘 중 하나 | Raw market receipt(JSON/base64) |
| `purchaseToken` | `string` | 둘 중 하나 | Market purchase token(Google Play) |
| `purchaseIntentId` | `string` | No | `startPurchase`에서 받은 intent id |

`receiptPayload` 또는 `purchaseToken` 중 하나 이상이 필요합니다. 없으면 `INVALID_ARGUMENT`입니다. Receipt는 서버 측에서 검증되며, 검증된 [`PaymentPurchase`](#paymentpurchase)를 반환합니다.

Errors (`HiveAxylError.code`): 이미 처리된 receipt면 `DUPLICATE_RECEIPT`; market이 receipt를 거절하면 `RECEIPT_VERIFICATION_FAILED`; webhook-based web payment에서 confirmation이 아직 도착하지 않았으면 `PURCHASE_PENDING`이며 retry하세요; market 측 일시 장애면 `INTERNAL`이며 같은 receipt로 retry하세요.

## getPurchase

```ts
getPurchase(purchaseId: string): Promise<PaymentPurchase>
```

| Argument | Type | Required | Description |
| --- | --- | --- | --- |
| `purchaseId` | `string` | Yes | 로그인된 플레이어 purchase 중 하나의 `PaymentPurchase.id` |

현재 [`PaymentPurchase`](#paymentpurchase) state를 반환합니다.

## waitForPaymentGrant

```ts
waitForPaymentGrant(purchaseId: string, timeoutMillis?: number): Promise<PaymentPurchase>
```

| Argument | Type | Required | Description |
| --- | --- | --- | --- |
| `purchaseId` | `string` | Yes | 기다릴 purchase |
| `timeoutMillis` | `number` | No | 최대 대기 시간(기본값 `30_000`, 양수여야 함) |

증가하는 delay로 `getPurchase`를 polling하고 item grant가 완료되면(`grantStatus`가 `"delivered"` 또는 `"not_required"`) 즉시 resolve합니다. Purchase가 failed state(`"failed"`, `"canceled"`, `"refunded"`, `"expired"`)가 되어도 resolve합니다. Timeout 시 최신 state로 resolve되므로 `grantStatus`를 직접 확인하세요.

## Types

### PaymentProduct

| Field | Type | Description |
| --- | --- | --- |
| `projectId` | `string` | Owning project |
| `market` | `string` | [Market value](#string-values) |
| `appIdentifier` | `string` | Market app identifier |
| `productId` | `string` | Market product id |
| `productType` | `string` | `"one_time"` 또는 `"subscription"` |
| `marketStatus` | `string` | Market이 보고한 raw status |
| `title` | `string` | Display title |
| `description` | `string` | Display description |
| `amountMinor` | `bigint` | Currency minor unit 기준 price |
| `currency` | `string` | ISO 4217 code, 예: `"USD"` |
| `consumePolicy` | `string` | `"none"` 또는 `"consume_after_grant"` |
| `grantMode` | `string` | `"webhook_required"`, `"no_grant"`, 또는 `"client_grant"` |
| `enabled` | `boolean` | Client에 노출 가능 여부 |

### PaymentPurchase

| Field | Type | Description |
| --- | --- | --- |
| `id` | `string` | Purchase id. `getPurchase` / `waitForPaymentGrant`에 사용 |
| `projectId` | `string` | Owning project |
| `playerId` | `string` | 구매 player |
| `market` | `string` | [Market value](#string-values) |
| `productType` | `string` | `"one_time"` 또는 `"subscription"` |
| `productId` | `string` | Market product id |
| `packageName` | `string` | 구매 시점의 market app identifier |
| `purchaseIntentId` | `string` | `startPurchase`의 intent |
| `amountMinor` | `bigint` | Minor unit 기준 paid amount |
| `currency` | `string` | ISO 4217 code |
| `status` | `string` | `"pending"`, `"verified"`, `"failed"`, `"refunded"`, `"canceled"`, 또는 `"expired"` |
| `grantStatus` | `string` | Grant progress, 예: `"delivered"`, `"not_required"` |
| `consumeStatus` | `string` | Consumption progress |
| `marketOrderId` | `string` | Market-side order id |
| `purchasedAt` | `Date?` | Market purchase time (UTC) |
| `verifiedAt` | `Date?` | Receipt verification time (UTC). 아직 unverified면 없음 |

### String values

| Field | Valid values |
| --- | --- |
| `market` | `"google_play"`, `"app_store"`, `"steam"`, `"web"` |
| `productType` | `"one_time"`, `"subscription"` |
| `status` | `"pending"`, `"verified"`, `"failed"`, `"refunded"`, `"canceled"`, `"expired"` |
| `consumePolicy` | `"none"`, `"consume_after_grant"` |
| `grantMode` | `"webhook_required"`, `"no_grant"`, `"client_grant"` |
