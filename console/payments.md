# Payments

Go to **Payments** (select your project first). The page has two tabs: **Payments** for purchase and subscription history, and **Products** for the product catalog.

Receipt verification requires the corresponding market credential (Google Play, App Store, PortOne) to be registered — see [Login Providers](/console/login-providers). Web products belong to the project's **Web** app identifier — see [Projects & API Keys](/console/projects-api-keys).

## Purchase history

The purchases section lists one-time and subscription purchases for the project.

Filter by:

- **Market** — Google Play, App Store, Steam, Web
- **Product type** — One-time, Subscription
- **Status** — Pending, Verified, Failed, Refunded, Canceled, Expired
- **Player ID** — exact UUID
- **From / To** — request time range

Click **Search** to apply the filters. The table shows the status badge, product type and product ID, player ID, amount with currency, market order ID, and request time.

Click **Detail** on a row to open the full record: purchase ID, player ID, product, app identifier, status, amount, market order ID, purchase token hash, failure reason (if any), and the requested/verified timestamps.

## Subscription history

The subscriptions section below lists subscription states, filterable by:

- **Market**
- **Status** — Active, In grace period, On hold, Paused, Canceled, Expired, Pending, Failed

The table shows the status, product ID, player ID, auto-renewal state, expiry time, and last update time. Click **Detail** for the full record including start, expiry, and verification timestamps, the market order ID, and the purchase token hash.

## Products

Open the **Products** tab to manage the product catalog per app identifier.

1. Pick an **App identifier** (one of the identifiers registered on the project) and optionally a **Product type** filter.
2. Click **Search** to list products already known to the platform.

### Import store products

For **Google Play** and **App Store** identifiers, click **Import Products** to pull the product catalog from the store. Imported products appear with their store status, price, and last-imported time. (App Store import requires the optional App Store Connect fields of the App Store credential.)

### Per-product policies

Each product row lets you edit its policy and save it with the row's **Save** button:

- **Enabled** — whether the product is exposed to clients.
- **Consume policy** — **Consume after grant** for repeatable consumables (coins, gems); **No consume** for things that must not become repurchasable (ad removal, permanent items, subscriptions). Subscriptions are fixed to no consume.
- **Grant mode** — **Webhook grant**: your game server grants the item when it receives the payment webhook (recommended for production); **Client grant**: the client grants directly, suitable for samples and testing.

### Create a web product

Store products come from the store catalogs, but **Web** products are created directly in the console:

1. Select a **Web** app identifier (the **New Product** button is enabled only then).
2. Click **New Product** and fill in:
   - **Product ID** and **Title** (required)
   - **Amount (minor units)** — a positive integer in the currency's minor unit
   - **Currency** — a three-letter ISO 4217 code (for example `USD`, `KRW`)
   - **Consume policy**, **Grant mode**, **Description**, and the **Enabled** flag
3. Click **Create**.

### Delete a web product

Web products (only) show a **Delete** button.

::: warning
Deleting a web product cannot be undone. You will be asked to confirm before it is removed.
:::

## Related pages

- Payment and subscription events (`payment.verified`, `subscription.updated`, and others) are delivered to your game server as webhooks — see [Webhooks & Server Keys](/console/webhooks).
- Purchase failures surface in the SDK with platform error codes — see [Error Codes](/guide/error-codes).
