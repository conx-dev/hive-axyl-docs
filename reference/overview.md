# API Reference Overview

This section is the field-level reference for the SDK: every method you can call, the arguments it takes, and the exact shape and types of what it returns.

After `init()`, the client exposes one API object per domain:

| Domain | Methods | Reference |
| --- | --- | --- |
| `hive.auth` | login, session, player profile | [Auth](/reference/auth) |
| `hive.notice` | active notices | [Notice](/reference/notice) |
| `hive.mailbox` | mail list, unread badge, claiming | [Mailbox](/reference/mailbox) |
| `hive.payment` | product catalog, purchase flow | [Payment](/reference/payment) |
| errors | typed error classes and helpers | [Errors](/reference/errors) |

Signatures are shown in TypeScript (the [Web SDK](/platforms/web)). The public API is the same on every platform — same method names, same argument and result shapes — with each platform's usual casing (`ListMailAsync` in Unity, `list_mail` in Godot, and so on). See the platform guides for language-specific setup and examples.

## Conventions

**Timestamps.** All times are UTC and surface as the platform's native date type (`Date` in the web SDK). Optional timestamp fields (`claimedAt?`, `verifiedAt?`) are absent until the event has happened.

**64-bit integers.** Count and amount fields (`total`, `viewCount`, `amountMinor`) are `bigint` in the web SDK to preserve precision.

**Localized text.** Player-facing strings (notice titles, mail bodies) are authored per language in the console. The SDK resolves them to a single string using the configured `language`, falling back in this order: exact tag (`"en-US"`) → base language (`"en"`) → `"en"` → `"ko"` → first available language.

**Enum-like values.** Fields such as `market`, `productType`, and login provider names are lowercase strings (`"google_play"`, `"one_time"`, `"guest"`). Each page lists the valid values.

**Pagination.** List methods take `pageSize` and `pageToken` and return `nextPageToken` plus `total`. Pass an empty (or omitted) `pageToken` for the first page; an empty `nextPageToken` means you reached the last page. `total` is computed only for the first page — requests with a `pageToken` return `0`, so keep the first page's value if you need it while paging.

**Sessions and auth.** You never handle tokens directly. After a login method succeeds, the SDK attaches the player's session to every call and transparently refreshes it once when it expires; a failed refresh surfaces as a `SESSION_EXPIRED` error.

**Errors.** Every method throws typed errors — branch on the error class and `code`, never on message text. See [Errors](/reference/errors) and the full [Error Codes](/guide/error-codes) list.

**Environments.** Every project has separate **sandbox** and **live** environments, selected by which client API key you configure. Players, mail, and purchases are fully separated between the two.
