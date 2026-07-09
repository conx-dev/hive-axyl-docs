# Notice API - `hive.notice`

게임 클라이언트에 표시할 active notice입니다. Notice는 [콘솔](/ko/console/operations)에서 작성합니다.

| Method | Returns |
| --- | --- |
| [`listActiveNotices()`](#listactivenotices) | `Promise<Notice[]>` |

## listActiveNotices

```ts
listActiveNotices(): Promise<Notice[]>
```

Argument가 없습니다. 서버는 현재 display window 안에 있는 notice만 creation time 기준으로 정렬해 반환합니다. Pagination은 없습니다. Active set은 작다고 가정합니다.

## Types

### Notice

| Field | Type | Description |
| --- | --- | --- |
| `id` | `string` | Notice id |
| `projectId` | `string` | Owning project |
| `title` | `string` | 설정된 `language`로 이미 resolve된 title |
| `body` | `string` | 설정된 `language`로 이미 resolve된 body |
| `startsAt` | `Date?` | Display window start (UTC) |
| `endsAt` | `Date?` | Display window end (UTC) |
| `viewCount` | `bigint` | Impression count |

`title`과 `body`는 콘솔에서 언어별로 작성됩니다. SDK는 [규칙](/ko/reference/overview#규칙)에 설명된 fallback order로 문자열 하나를 선택합니다.
