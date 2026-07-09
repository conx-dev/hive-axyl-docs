# Notice API — `hive.notice`

Active notices for display in the game client. Notices are authored in the [Console](/console/operations).

| Method | Returns |
| --- | --- |
| [`listActiveNotices()`](#listactivenotices) | `Promise<Notice[]>` |

## listActiveNotices

```ts
listActiveNotices(): Promise<Notice[]>
```

No arguments. The server returns only notices currently inside their display window, sorted by creation time. No pagination — the active set is expected to be small.

## Types

### Notice

| Field | Type | Description |
| --- | --- | --- |
| `id` | `string` | Notice id |
| `projectId` | `string` | Owning project |
| `title` | `string` | Title, already resolved to the configured `language` |
| `body` | `string` | Body, already resolved to the configured `language` |
| `startsAt` | `Date?` | Display window start (UTC) |
| `endsAt` | `Date?` | Display window end (UTC) |
| `viewCount` | `bigint` | Impression count |

`title` and `body` are written per language in the console; the SDK picks one string using the fallback order described in [Conventions](/reference/overview#conventions).
