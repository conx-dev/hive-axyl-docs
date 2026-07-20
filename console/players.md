# Players & Sanctions

Two menus cover player operations: **Player Search** for looking players up, and **Player Sanctions** for banning and unbanning them. Both require a project to be selected in the header.

## Player Search

Go to **Player Search**:

1. Pick a **Search field**:
   - **Nickname** — prefix match (default)
   - **Email** — exact match
   - **Player ID** — exact match
2. Enter the search term and click **Search**. Leaving the term empty lists all players.

The result table shows each player's Player ID, nickname, email, country, creation date, last login time, and last login platform (Web / Android / iOS / Desktop).

## Player Sanctions

Go to **Player Sanctions** to register and lift bans.

### Ban a single player

1. Search for the player (same search fields as Player Search; the default field here is **Player ID**). Each result row shows the player's current sanction status: **Normal**, **Banned until** a date, or **Permanently banned**.
2. Click **Ban** on the player's row.
3. In the ban dialog, enter:
   - **Reason** — required; pick one of the common reasons from the list, or select **Custom reason** and enter text (up to 255 characters). This text is shown to the player's client.
   - **Permanent** — check for a permanent ban, or
   - **Until** — the scheduled release time (must be in the future) for a temporary ban.
4. Click **Register**.

::: warning Permanent bans require extra confirmation
When you register a permanent ban, the console shows a confirmation dialog warning that the player cannot log in until the ban is lifted. Review the player ID carefully before confirming — the ban takes effect immediately.
:::

### Lift a ban

Click **Unban** on the player's row and confirm. The player's active sanction is lifted and they can log in again.

### Bulk bans

The **Bulk ban** section registers up to 100 bans at once from CSV input:

```
player_id,reason,permanent,until
018f0000-0000-7000-8000-000000000001,Policy violation,false,2099-06-30T00:00:00Z
018f0000-0000-7000-8000-000000000002,Payment abuse,true,
```

Rules validated before submission:

- The header row must be exactly `player_id,reason,permanent,until`.
- `player_id` — UUID format, no duplicates.
- `reason` — required, 255 characters or fewer. Wrap in double quotes if it contains commas.
- `permanent` — `true` or `false`.
- `until` — for temporary bans (`permanent=false`), a future UTC timestamp in `YYYY-MM-DDTHH:mm:ssZ` format; must be empty for permanent bans.

Check **Also replace bans for players who are already banned** if existing active sanctions should be overwritten with the new ones; otherwise already-banned players are skipped.

Click **Execute bulk ban**. A confirmation dialog summarizes how many players will be banned and how many of those bans are permanent. After execution, a result table lists each row's outcome: **Applied**, **Skipped** (already banned), or **Failed**, with a message.

### Sanction list

The **Sanction list** section shows the project's sanction records: player ID, reason, period (banned-at through release time, or permanent), type (**Permanent** / **Temporary**), and status (**Active** / **Lifted**). Check **Active sanctions only** and click **Search** to filter to bans currently in force.

## What banned players see

When a banned player tries to log in, the SDK surfaces a banned error to your game, including the ban reason you entered. See [Error Codes](/guide/error-codes) for how to detect and handle this in your client code, and [Webhooks & Server Keys](/console/webhooks) for the `player.banned` / `player.unbanned` events your game server receives when sanctions change.
