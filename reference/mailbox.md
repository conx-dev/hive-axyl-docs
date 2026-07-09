# Mailbox API — `hive.mailbox`

The logged-in player's mailbox: list, unread badge, and reward claiming. Requires login. Mail is authored in the [Console](/console/operations).

| Method | Returns |
| --- | --- |
| [`listMail(options?)`](#listmail) | `Promise<ListMailResult>` |
| [`checkNewMail()`](#checknewmail) | `Promise<CheckNewMailResult>` |
| [`claimMail(mailId)`](#claimmail) | `Promise<Mail>` |

## listMail

```ts
listMail(options?: ListMailOptions): Promise<ListMailResult>
```

`ListMailOptions`

| Field | Type | Required | Description |
| --- | --- | --- | --- |
| `pageSize` | `number` | No | Items per page (default `20`) |
| `pageToken` | `string` | No | Omit for the first page; pass `nextPageToken` from the previous result |
| `includeClaimed` | `boolean` | No | Include already-claimed mail (default `false`) |

`ListMailResult`

| Field | Type | Description |
| --- | --- | --- |
| `mail` | [`Mail[]`](#mail) | Mail for the current page |
| `nextPageToken` | `string` | Empty when this is the last page |
| `total` | `bigint` | Total mail count; computed only on the first page (`0` when `pageToken` is set) |

## checkNewMail

```ts
checkNewMail(): Promise<CheckNewMailResult>
```

No arguments. Lightweight call for the mailbox badge.

`CheckNewMailResult`

| Field | Type | Description |
| --- | --- | --- |
| `hasNewMail` | `boolean` | Whether unclaimed/unread mail exists |

## claimMail

```ts
claimMail(mailId: string): Promise<Mail>
```

| Argument | Type | Required | Description |
| --- | --- | --- | --- |
| `mailId` | `string` | Yes | The **`Mail.id`** value |

Returns the same [`Mail`](#mail) with `claimed` / `claimedAt` updated.

Errors (`HiveAxylError.code`): `MAIL_NOT_FOUND`, `MAIL_ALREADY_CLAIMED`, `MAIL_NOT_CLAIMABLE` (outside the `claimableFrom`–`expiresAt` window).

## Types

### Mail

| Field | Type | Description |
| --- | --- | --- |
| `id` | `string` | Mail id — pass this to `claimMail` |
| `mailId` | `string` | Same mail id, kept for SDK compatibility |
| `projectId` | `string` | Owning project |
| `type` | `MailType` | `MailType.TEXT` (no reward) or `MailType.ITEM` (claimable reward) |
| `title` | `string` | Title, resolved to the configured `language` |
| `body` | `string` | Body, resolved to the configured `language` |
| `sender` | `string` | Display sender name |
| `rewardPreview` | `Record<string, string>` | Reward summary for display, keyed by item label |
| `rewardDisplay` | [`MailRewardDisplayItem[]`](#mailrewarddisplayitem) | Structured reward rows for richer UI |
| `claimed` | `boolean` | Whether this recipient already claimed it |
| `claimableFrom` | `Date?` | Claim window start (UTC) |
| `expiresAt` | `Date?` | Claim window end (UTC) |
| `claimedAt` | `Date?` | When claimed (UTC); absent if not claimed |
| `createdAt` | `Date?` | Created (UTC) |

### MailRewardDisplayItem

| Field | Type | Description |
| --- | --- | --- |
| `icon` | `string` | Icon identifier or URL |
| `label` | `string` | Item name |
| `quantity` | `string` | Quantity as display text |
