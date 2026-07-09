# 결제

**Payments**로 이동합니다. 먼저 프로젝트를 선택해야 합니다. 페이지에는 구매/구독 기록을 보는 **Payments** tab과 product catalog를 관리하는 **Products** tab이 있습니다.

Receipt verification에는 해당 market 자격 증명(Google Play, App Store, PortOne)이 등록되어 있어야 합니다. [로그인 제공자](/ko/console/login-providers)를 참고하세요. Web product는 프로젝트의 **Web** app identifier에 속합니다. [프로젝트와 API 키](/ko/console/projects-api-keys)를 참고하세요.

## 구매 기록

Purchases section은 프로젝트의 one-time 및 subscription purchase를 나열합니다.

다음 기준으로 필터링할 수 있습니다.

- **Market** - Google Play, App Store, Steam, Web
- **Product type** - One-time, Subscription
- **Status** - Pending, Verified, Failed, Refunded, Canceled, Expired
- **Player ID** - 정확한 UUID
- **From / To** - request time range

필터를 적용하려면 **Search**를 클릭합니다. 표는 status badge, product type과 product ID, player ID, currency 포함 amount, market order ID, request time을 보여줍니다.

행의 **Detail**을 클릭하면 전체 record가 열립니다. purchase ID, player ID, product, app identifier, status, amount, market order ID, purchase token hash, failure reason(있는 경우), requested/verified timestamp를 확인할 수 있습니다.

## 구독 기록

아래 subscriptions section은 subscription state를 나열하며 다음으로 필터링할 수 있습니다.

- **Market**
- **Status** - Active, In grace period, On hold, Paused, Canceled, Expired, Pending, Failed

표는 status, product ID, player ID, auto-renewal state, expiry time, last update time을 보여줍니다. **Detail**을 클릭하면 start, expiry, verification timestamp, market order ID, purchase token hash를 포함한 전체 record를 볼 수 있습니다.

## Products

App identifier별 product catalog를 관리하려면 **Products** tab을 엽니다.

1. **App identifier**를 선택합니다. 프로젝트에 등록된 식별자 중 하나입니다. 필요하면 **Product type** filter를 선택합니다.
2. **Search**를 클릭해 플랫폼이 이미 알고 있는 product를 나열합니다.

### Store product 가져오기

**Google Play**와 **App Store** 식별자에서는 **Import Products**를 클릭해 store에서 product catalog를 가져올 수 있습니다. 가져온 product는 store status, price, last-imported time과 함께 표시됩니다. App Store import에는 App Store credential의 선택 App Store Connect 필드가 필요합니다.

### Product별 policy

각 product 행에서 policy를 수정하고 행의 **Save** 버튼으로 저장할 수 있습니다.

- **Enabled** - 클라이언트에 product를 노출할지 여부.
- **Consume policy** - 반복 구매 가능한 consumable(coins, gems)은 **Consume after grant**를 사용합니다. 재구매 가능해지면 안 되는 항목(ad removal, permanent items, subscriptions)은 **No consume**을 사용합니다. Subscription은 no consume으로 고정됩니다.
- **Grant mode** - **Webhook grant**: payment webhook을 받은 게임 서버가 아이템을 지급합니다(운영 환경 권장). **Client grant**: 클라이언트가 직접 지급하며 sample과 test에 적합합니다.

### Web product 생성

Store product는 store catalog에서 오지만 **Web** product는 콘솔에서 직접 생성합니다.

1. **Web** app identifier를 선택합니다. **New Product** 버튼은 이때만 활성화됩니다.
2. **New Product**를 클릭하고 다음을 입력합니다.
   - **Product ID**와 **Title**(필수)
   - **Amount (minor units)** - currency minor unit 기준의 양의 정수
   - **Currency** - 세 글자 ISO 4217 code(예: `USD`, `KRW`)
   - **Consume policy**, **Grant mode**, **Description**, **Enabled** flag
3. **Create**를 클릭합니다.

### Web product 삭제

Web product에만 **Delete** 버튼이 표시됩니다.

::: warning
Web product 삭제는 되돌릴 수 없습니다. 제거 전에 확인을 요청합니다.
:::

## 관련 페이지

- Payment와 subscription event(`payment.verified`, `subscription.updated` 등)는 webhook으로 게임 서버에 전달됩니다. [웹훅과 서버 키](/ko/console/webhooks)를 참고하세요.
- 구매 실패는 SDK에서 platform error code로 노출됩니다. [에러 코드](/ko/guide/error-codes)를 참고하세요.
