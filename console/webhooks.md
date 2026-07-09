# Webhooks & Server Keys

The **Webhooks** menu configures both directions of server-to-server integration between your game server and Hive Axyl:

- **Server keys** — used when *your game server calls Hive Axyl* (for example to verify players).
- **Webhooks** — used when *Hive Axyl calls your game server* to deliver platform events.

Select your project in the header, then go to **Webhooks**.

## Server keys

Server keys authenticate calls from your game server to Hive Axyl. They are separate from the client API keys described in [Projects & API Keys](/console/projects-api-keys) and must never be embedded in a game client.

### Issue a server key

1. Click **Issue Server Key**.
2. Enter a **Key name** (for example `game-server-prod`) and click **Issue**.
3. Copy the full key from the dialog.

::: warning The full key is shown only once
The complete server key is displayed only immediately after issuing. Afterwards the console shows only the key prefix. Store the key in your server's secret store before closing the dialog; if you lose it, revoke the key and issue a new one.
:::

### Restrict by IP / CIDR

Each active server key has an **Allowed IP/CIDR** list:

- With no entries, the key is not IP-restricted.
- Add an entry by typing an IP or CIDR (for example `203.0.113.10/32`) into the key's input field and clicking **Add**.
- Remove an entry with its **Delete** button (asks for confirmation).

::: tip
For production keys, restrict the allowed list to your game server's egress IPs so a leaked key cannot be used from elsewhere.
:::

### Revoke a server key

Click **Revoke** on an active key and confirm. Revocation is immediate and cannot be undone.

## Game server event webhook

Hive Axyl delivers platform events to your game server by HTTP POST.

### Configure the endpoint

In the **Game server event webhook** form:

1. Enter the **Endpoint URL** where your server receives events (for example `https://gateway.example.com/hiveng/webhook` on your side).
2. Enter a **Signing Secret**. This value is write-only: after saving, it is never displayed again, and the field placeholder indicates an existing secret is kept unless you type a new one. To rotate it, enter a new value and save.
3. Use the **Enabled** checkbox to turn delivery on or off. Disabling keeps the URL and secret but stops sending events.
4. Click **Save**.

### Verify the signature

Every delivery is signed with **HMAC-SHA256** using your signing secret. Your server should recompute the signature from the request and compare it against the `X-Hiveng-Signature` header, which carries `sha256=HMAC(timestamp.body)`. Reject requests whose signature does not match — this proves the event came from Hive Axyl unmodified.

### Delivered events

The webhook delivers the following event types, grouped by domain:

| Group | Event types |
| --- | --- |
| Player | `player.created`, `player.nickname_updated`, `player.banned`, `player.unbanned` |
| Maintenance | `maintenance.scheduled`, `maintenance.updated`, `maintenance.cancelled`, `maintenance.ended` |
| Mail | `mail.item_grant` |
| Payment | `payment.started`, `payment.requested`, `payment.verified`, `payment.failed` |
| Subscription | `subscription.verified`, `subscription.updated`, `subscription.failed` |

`mail.item_grant` carries the reward payload you entered in the Mailbox — see [Operations](/console/operations). Payment and subscription events drive server-side item granting — see [Payments](/console/payments).

## Delivery history

Two sections at the bottom of the page let you trace deliveries:

- **Delivery successes** — successful deliveries from the last 24 hours: event type and event ID (with a copy button), player ID, attempt number, HTTP status, game-server processing latency, and total latency, plus the completion time. Use **Refresh** to reload.
- **Delivery failures** — failed deliveries with a status of **Failed** (still retrying) or **DLQ** (retries exhausted, moved to the dead-letter queue), the event, player ID, attempt number, HTTP status, error message, and occurrence time.

::: tip
If events appear under failures with your endpoint returning non-2xx statuses or timeouts, fix the endpoint and watch the attempt counter — deliveries are retried before landing in the DLQ. Use the event ID to correlate a delivery with your server logs.
:::
