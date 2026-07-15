# Login Providers

Player sign-in is configured in two steps, in this order:

1. **Credentials** — register the provider keys (OAuth client IDs, secrets, market keys, push keys) for your project.
2. **Login Providers** — choose which sign-in methods are shown to players, per country, and in what order.

::: warning Register credentials first
An OAuth login provider can only be enabled after its credential is registered. On the **Login Providers** page, providers without a registered credential are flagged as missing a credential and cannot be saved in a mapping. Guest login is the only exception — it needs no credential.
:::

## Credentials

Go to **Credentials** (select your project first). The page has three tabs:

- **OAuth** — sign-in provider integrations
- **Market receipt verification** — store keys used to verify purchases
- **Push** — push delivery keys

Each provider is a card showing its registration status. Fill in the fields and click **Register**. To change values later, click **Edit** and enter new values; click **Delete** (with confirmation) to remove a credential entirely.

### Secrets are write-only

Secret values are never displayed again after saving. A registered card shows only the last-updated time and a masked preview of each stored field. Editing always means overwriting with new values — there is no way to read the old ones back. Keep your own secure copy of every secret you register.

### OAuth tab

| Provider | Fields |
| --- | --- |
| Google | **Client IDs (Android/iOS/Web)** — enter the OAuth client ID for each platform, comma-separated |
| Facebook | **App ID** and **App Secret** — the App Secret is used by the server for `appsecret_proof` (HMAC) signing |
| Apple | **Client IDs** — enter the **iOS Bundle ID** and the **Web Services ID**, comma-separated. **Web Origins** — for web SDK sign-in only, the allowed origins that may receive the login result |

::: tip Apple needs two client IDs
Apple sign-in uses different client IDs per platform: the app's Bundle ID for native iOS sign-in and a Services ID for web-based sign-in. Enter both, comma-separated, in the **Client IDs** field. The Apple card also displays a **Redirect URI** with a copy button — register this URI in your Apple Services ID configuration.
:::

::: warning Web Origins are required for web Apple sign-in
For security, the server only delivers Apple login tokens to an allowlisted origin. If you use the **web SDK** for Apple sign-in, enter each site origin that runs the SDK (e.g. `https://game.example.com`) in **Web Origins**, comma-separated. Leaving it empty **blocks web Apple sign-in** for the project. Native (iOS/Android) and desktop loopback flows do not use this field.
:::

### Market receipt verification tab

| Target | Fields |
| --- | --- |
| Google Play | **Service Account JSON** — the full service account key file contents |
| App Store | **Issuer ID**, **Key ID**, **Private Key (.p8)** (full file contents), **Bundle ID**; optionally **Connect Issuer ID**, **Connect Key ID**, **Connect Private Key (.p8)** for product import |
| PortOne | **V2 API Secret** — used for web payment verification |

The optional App Store Connect fields are only needed if you want to import your product catalog on the [Payments](/console/payments) page.

### Push tab

| Target | Fields |
| --- | --- |
| Firebase FCM | **Service Account JSON** — the full Firebase service account key file contents |

This credential is required before sending campaigns from **Remote Push** — see [Operations](/console/operations).

## Login provider mappings

Go to **Login Providers** (select your project first). The page lists one row per country, each with an ordered list of sign-in methods shown to players in that country.

### How players see this

When your game starts, the SDK asks the platform which login providers to display for the player's country and shows them in the configured order. See [Architecture](/guide/architecture) for how the SDK login flow works end to end.

### Default fallback

Countries without an explicit mapping fall back to the server default mapping: **Google → Apple → Facebook → Guest**, filtered down to the providers whose credentials you have registered, plus Guest. The fallback list is displayed at the bottom of the page for reference. Adding a mapping for a country (or for `DEFAULT`) overrides the fallback.

### Add or edit a mapping

1. Click **Add Mapping** (or **Edit** on an existing row).
2. Choose a **Country**: `DEFAULT` (applies to all countries without their own mapping), a preset country, or a custom two-letter ISO 3166-1 alpha-2 code (for example `ES`). The country cannot be changed after creation.
3. Check the providers to enable. Only providers with a registered OAuth credential — plus **Guest** — are selectable.
4. Reorder providers with the up/down buttons. The top provider is shown to players first.
5. Click **Save**.

At least one provider must be enabled, and a mapping cannot be saved while it contains an OAuth provider whose credential is missing.

### Delete a mapping

Click **Delete** on a row and confirm. The country immediately reverts to the default fallback behavior described above.
