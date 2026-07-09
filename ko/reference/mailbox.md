# Mailbox API - `hive.mailbox`

로그인된 플레이어의 mailbox입니다. Mail list, unread badge, reward claiming을 처리합니다. Login이 필요합니다. Mail은 [콘솔](/ko/console/operations)에서 작성합니다.

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
| `pageSize` | `number` | No | Page당 item 수(기본값 `20`) |
| `pageToken` | `string` | No | 첫 페이지에서는 생략. 이전 결과의 `nextPageToken` 전달 |
| `includeClaimed` | `boolean` | No | 이미 claimed된 mail 포함(기본값 `false`) |

`ListMailResult`

| Field | Type | Description |
| --- | --- | --- |
| `mail` | [`Mail[]`](#mail) | 현재 page의 mail |
| `nextPageToken` | `string` | 마지막 page면 empty |
| `total` | `bigint` | 전체 mail count. 첫 page에서만 계산(`pageToken`이 설정되면 `0`) |

## checkNewMail

```ts
checkNewMail(): Promise<CheckNewMailResult>
```

Argument가 없습니다. Mailbox badge용 lightweight call입니다.

`CheckNewMailResult`

| Field | Type | Description |
| --- | --- | --- |
| `hasNewMail` | `boolean` | Unclaimed/unread mail 존재 여부 |

## claimMail

```ts
claimMail(mailId: string): Promise<Mail>
```

| Argument | Type | Required | Description |
| --- | --- | --- | --- |
| `mailId` | `string` | Yes | **`Mail.id`** 값 |

`claimed` / `claimedAt`이 갱신된 같은 [`Mail`](#mail)을 반환합니다.

Errors (`HiveAxylError.code`): `MAIL_NOT_FOUND`, `MAIL_ALREADY_CLAIMED`, `MAIL_NOT_CLAIMABLE`(`claimableFrom`-`expiresAt` window 밖).

## Types

### Mail

| Field | Type | Description |
| --- | --- | --- |
| `id` | `string` | Mail id. `claimMail`에 전달 |
| `mailId` | `string` | 같은 mail id. SDK compatibility를 위해 유지 |
| `projectId` | `string` | Owning project |
| `type` | `MailType` | `MailType.TEXT`(reward 없음) 또는 `MailType.ITEM`(claimable reward) |
| `title` | `string` | 설정된 `language`로 resolve된 title |
| `body` | `string` | 설정된 `language`로 resolve된 body |
| `sender` | `string` | Display sender name |
| `rewardPreview` | `Record<string, string>` | 표시용 reward summary. item label로 keyed |
| `rewardDisplay` | [`MailRewardDisplayItem[]`](#mailrewarddisplayitem) | 더 풍부한 UI용 structured reward rows |
| `claimed` | `boolean` | 이 recipient가 이미 수령했는지 여부 |
| `claimableFrom` | `Date?` | Claim window start (UTC) |
| `expiresAt` | `Date?` | Claim window end (UTC) |
| `claimedAt` | `Date?` | Claimed time (UTC). 아직 claimed 전이면 없음 |
| `createdAt` | `Date?` | Created (UTC) |

### MailRewardDisplayItem

| Field | Type | Description |
| --- | --- | --- |
| `icon` | `string` | Icon identifier 또는 URL |
| `label` | `string` | Item name |
| `quantity` | `string` | Display text로 표시할 quantity |
