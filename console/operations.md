# Operations

Day-to-day live operations are handled by four menus: **Notices**, **Maintenance**, **Mailbox**, and **Remote Push**. All of them require a project to be selected in the header first, and all timestamps are stored in UTC (input fields use your local time zone; tables display UTC).

## Notices

Go to **Notices** to manage in-game announcements and their display periods.

The notice list shows each notice's title, status (**Live**, **Waiting**, or **Ended**, based on the current time), display period, and view count, with **Copy**, **Edit**, and **Delete** actions. Deleting asks for confirmation.

To create a notice:

1. In the **Notice registration** form, set the **Start time** and **End time**. The end time must be after the start time.
2. Use the language tabs (**English** / **Korean**) to enter a **Title** and a **Body** per language. The body uses an HTML rich-text editor. At least one language must have both a title and a body.
3. Click **Save**.

To edit an existing notice, click **Edit** on its row — the form is pre-filled; click **Save** when done, or **New** to reset the form.

To reuse a notice, click **Copy**. The Korean and English title and body are copied into a new notice form, while the display period is left empty so you can set a new one.

## Maintenance

Go to **Maintenance** to schedule a maintenance window for the project. While a window is active, players are blocked from the game and receive the maintenance message (surfaced to clients as a maintenance error — see [Error Codes](/guide/error-codes)).

A project has one maintenance configuration at a time. The page shows the current status (**Configured** or **None**) with the active window's start and end times.

### Schedule or update maintenance

1. Set the **Start time** and **End time** (end must be after start).
2. Enter the maintenance message using the **English** / **Korean** tabs. At least one language is required. The message uses an HTML editor.
3. Optionally fill the bypass lists (one entry per line, or comma-separated):
   - **Bypass IPs** — client IPs that skip maintenance (for your QA testers).
   - **Bypass Player IDs** — player IDs that skip maintenance.
4. Click **Save**.

### End maintenance early

Click **Clear** and confirm. The maintenance configuration is removed and players can connect again.

### Reuse previous maintenance

**Previous Maintenance Settings** lists archived configurations newest first. The current configuration is archived whenever it is replaced or cleared. History is retained without automatic expiry and starts with changes made after this feature is deployed; older configurations are not backfilled.

Click **Copy** on an archived configuration to copy its Korean and English maintenance messages into the form. The start and end times, bypass IPs, and bypass player IDs are cleared so you can enter settings for the new maintenance window.

### Preview the result

The **Maintenance check** panel lets you verify what a client would experience: enter a **Language**, **IP**, **Player ID**, and a reference **Time**, then click **Check**. The result shows whether maintenance applies, whether the request would be bypassed, and the exact message that would be returned.

::: tip
Use the preview with a tester IP or player ID before a maintenance window starts to confirm your bypass list works as intended.
:::

## Mailbox

Go to **Mailbox** to send in-game mail, including reward mail.

The mail list shows the title/sender, type (**Text** or **Item**), audience (**All** or **Individual**), and the claim window, with **Copy**, **Edit**, and **Delete** actions.

To create mail:

1. Choose the **Type**:
   - **Text** — message only.
   - **Item** — reward mail; requires a **Reward payload**.
2. Choose the **Audience**:
   - **All** — every player in the project.
   - **Individual** — enter **Target Player IDs** (newline- or comma-separated, up to 1,000 players).
3. Set **Claimable from** and **Expires at** (expiry must be after the claim start).
4. Optionally set a **Sender** name (up to 64 characters).
5. Enter the **Title** and **Body** per language (**Korean** / **English** tabs; at least one language, HTML editor for the body).
6. Click **Save**.

To reuse mail content, click **Copy** on its row. The Korean and English title and body are copied into a new mail form. Type is reset to **Text**, audience to **All**, and the claim period, sender, reward payload, and target players are cleared.

### Reward payload

For **Item** mail the reward payload must be a JSON object. Its internal structure is up to you: the whole payload is delivered as-is to your game server through the `mail.item_grant` webhook event (see [Webhooks & Server Keys](/console/webhooks)), and only the `display` array is sent down to the client for the reward preview UI. For example:

```json
{
  "grant": {
    "currencies": { "coins": 100 },
    "items": [{ "itemId": "bubble", "quantity": 10 }]
  },
  "display": [
    { "icon": "coins", "label": "Coins", "quantity": 100 },
    { "icon": "bubble", "label": "Bubbles", "quantity": 10 }
  ]
}
```

::: warning
Item grants are executed by **your game server** when it receives the `mail.item_grant` webhook — the platform does not interpret the `grant` structure. Make sure your webhook endpoint is configured and handles the payload before sending item mail.
:::

## Remote Push

Go to **Remote Push** to schedule push notification campaigns. Sending requires the **Firebase FCM** credential to be registered first — see [Login Providers](/console/login-providers).

The campaign list shows status (**Scheduled**, **Sending**, **Completed**, **Failed**, **Canceled** — filterable), the scheduled time, target platform, target count, and per-campaign success / failure / invalid-target counts.

To create a campaign:

1. Set the **Scheduled time**.
2. Choose the **Platform**: `Android + iOS`, `Android`, or `iOS`.
3. Optionally set:
   - **Android notification icon** — an Android drawable resource name (lowercase letters, digits, underscores, e.g. `ic_stat_push`).
   - **Notification image URL** — an `http(s)` image URL.
   - **Data JSON** — a flat JSON object of key/value pairs delivered with the notification (values must be strings or numbers).
4. Enter the **Title** and **Body** per language (**Korean** / **English**).
5. Click **Save**.

Only campaigns still in the **Scheduled** state can be edited or canceled. Canceling asks for confirmation.

Click **Copy** on any campaign, including completed, failed, or canceled campaigns, to copy its Korean and English title and body into a new campaign form. The schedule, platform, notification options, and data payload are reset.

Click a campaign title to open its **Delivery** list: per-player delivery status (**Success**, **Failed**, **Invalid target**, or pending), the Firebase installation ID and token preview, the attempt time, and any error code or message.
