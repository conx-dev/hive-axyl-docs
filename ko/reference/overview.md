# API 레퍼런스 개요

이 섹션은 SDK의 field-level reference입니다. 호출할 수 있는 모든 method, method가 받는 argument, 반환값의 정확한 shape과 type을 설명합니다.

`init()` 후 클라이언트는 domain별 API object를 하나씩 노출합니다.

| Domain | Methods | Reference |
| --- | --- | --- |
| `hive.auth` | login, session, player profile | [Auth](/ko/reference/auth) |
| `hive.notice` | active notices | [Notice](/ko/reference/notice) |
| `hive.mailbox` | mail list, unread badge, claiming | [Mailbox](/ko/reference/mailbox) |
| `hive.payment` | product catalog, purchase flow | [Payment](/ko/reference/payment) |
| errors | typed error classes and helpers | [Errors](/ko/reference/errors) |

Signature는 TypeScript([Web SDK](/ko/platforms/web))로 표시됩니다. Public API는 모든 플랫폼에서 동일합니다. Method name, argument, result shape이 같으며 각 플랫폼의 일반적인 casing만 다릅니다(Unity의 `ListMailAsync`, Godot의 `list_mail` 등). 언어별 setup과 예시는 platform guide를 참고하세요.

## 규칙

**Timestamps.** 모든 시간은 UTC이며 플랫폼의 native date type으로 노출됩니다(Web SDK에서는 `Date`). Optional timestamp field(`claimedAt?`, `verifiedAt?`)는 해당 event가 발생하기 전까지 없습니다.

**64-bit integers.** Count와 amount field(`total`, `viewCount`, `amountMinor`)는 precision 보존을 위해 Web SDK에서 `bigint`입니다.

**Localized text.** 플레이어에게 표시되는 문자열(notice title, mail body)은 콘솔에서 언어별로 작성합니다. SDK는 설정된 `language`를 사용해 문자열 하나로 resolve하며 fallback 순서는 exact tag(`"en-US"`) -> base language(`"en"`) -> `"en"` -> `"ko"` -> first available language입니다.

**Enum-like values.** `market`, `productType`, login provider name 같은 field는 lowercase string입니다(`"google_play"`, `"one_time"`, `"guest"`). 각 페이지는 valid value를 나열합니다.

**Pagination.** List method는 `pageSize`, `pageToken`을 받고 `nextPageToken`과 `total`을 반환합니다. 첫 페이지에는 비어 있거나 생략한 `pageToken`을 전달하세요. `nextPageToken`이 비어 있으면 마지막 페이지입니다. `total`은 첫 페이지에서만 계산됩니다. `pageToken`이 있는 요청은 `0`을 반환하므로 paging 중 total이 필요하면 첫 페이지 값을 유지하세요.

**Sessions and auth.** Token을 직접 다루지 않습니다. Login method가 성공하면 SDK가 모든 호출에 플레이어 세션을 붙이고 만료 시 한 번 투명하게 갱신합니다. 갱신 실패는 `SESSION_EXPIRED` error로 노출됩니다.

**Errors.** 모든 method는 typed error를 throw합니다. Message text가 아니라 error class와 `code`로 분기하세요. [Errors](/ko/reference/errors)와 전체 [에러 코드](/ko/guide/error-codes) 목록을 참고하세요.

**Environments.** 모든 프로젝트에는 별도의 **sandbox**와 **live** environment가 있으며, 설정한 client API key에 따라 선택됩니다. Player, mail, purchase는 두 environment 사이에서 완전히 분리됩니다.
