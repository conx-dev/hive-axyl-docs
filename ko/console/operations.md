# 운영

일상적인 live operations는 **Notices**, **Maintenance**, **Mailbox**, **Remote Push** 네 메뉴에서 처리합니다. 모두 먼저 헤더에서 프로젝트를 선택해야 하며, 모든 timestamp는 UTC로 저장됩니다. 입력 필드는 로컬 시간대를 사용하고 표는 UTC를 표시합니다.

## Notices

게임 내 공지와 표시 기간을 관리하려면 **Notices**로 이동합니다.

공지 목록은 각 공지의 제목, 상태(**Live**, **Waiting**, **Ended** - 현재 시간 기준), 표시 기간, view count를 보여주며 **Copy**, **Edit**, **Delete** action을 제공합니다. 삭제 시 확인을 요청합니다.

공지를 만들려면:

1. **Notice registration** form에서 **Start time**과 **End time**을 설정합니다. 종료 시간은 시작 시간 이후여야 합니다.
2. 언어 tab(**English** / **Korean**)에서 언어별 **Title**과 **Body**를 입력합니다. Body는 HTML rich-text editor를 사용합니다. 최소 한 언어에는 title과 body가 모두 있어야 합니다.
3. **Save**를 클릭합니다.

기존 공지를 수정하려면 행에서 **Edit**을 클릭합니다. form이 기존 값으로 채워집니다. 완료 후 **Save**를 클릭하거나 **New**로 form을 초기화합니다.

기존 공지를 재사용하려면 **Copy**를 클릭합니다. 한글·영문 title과 body가 신규 공지 form에 복사되고, 새 노출 기간을 입력할 수 있도록 시작·종료 시각은 비워집니다.

## Maintenance

프로젝트 점검 창을 예약하려면 **Maintenance**로 이동합니다. 창이 active인 동안 플레이어는 게임에 접속할 수 없고 maintenance message를 받습니다. 클라이언트에는 maintenance error로 노출됩니다. [에러 코드](/ko/guide/error-codes)를 참고하세요.

프로젝트에는 한 번에 하나의 maintenance configuration만 있습니다. 페이지는 현재 상태(**Configured** 또는 **None**)와 active window의 시작/종료 시간을 보여줍니다.

### 점검 예약 또는 수정

1. **Start time**과 **End time**을 설정합니다. 종료는 시작 이후여야 합니다.
2. **English** / **Korean** tab에서 maintenance message를 입력합니다. 최소 한 언어가 필요합니다. Message는 HTML editor를 사용합니다.
3. 필요하면 bypass list를 입력합니다. 한 줄에 하나씩 또는 comma-separated로 입력할 수 있습니다.
   - **Bypass IPs** - maintenance를 건너뛸 클라이언트 IP(QA tester용).
   - **Bypass Player IDs** - maintenance를 건너뛸 player ID.
4. **Save**를 클릭합니다.

### 점검 조기 종료

**Clear**를 클릭하고 확인합니다. Maintenance configuration이 제거되고 플레이어가 다시 접속할 수 있습니다.

### 이전 점검 재사용

**Previous Maintenance Settings**는 보관된 설정을 최신순으로 보여줍니다. 현재 설정을 덮어쓰거나 해제할 때마다 기존 설정이 보관됩니다. 이력은 자동 만료 없이 유지되며 기능 배포 후 변경분부터 쌓입니다. 배포 전 과거 설정은 소급 생성하지 않습니다.

보관된 설정에서 **Copy**를 클릭하면 한글·영문 maintenance message가 form에 복사됩니다. 새 점검 창의 설정을 입력할 수 있도록 시작·종료 시각, bypass IP, bypass player ID는 비워집니다.

### 결과 preview

**Maintenance check** panel에서는 클라이언트가 경험할 결과를 확인할 수 있습니다. **Language**, **IP**, **Player ID**, 기준 **Time**을 입력하고 **Check**를 클릭합니다. 결과는 maintenance 적용 여부, bypass 여부, 반환될 정확한 message를 보여줍니다.

::: tip
점검 창이 시작되기 전에 tester IP 또는 player ID로 preview를 사용해 bypass list가 의도대로 동작하는지 확인하세요.
:::

## Mailbox

reward mail을 포함한 게임 내 메일을 보내려면 **Mailbox**로 이동합니다.

메일 목록은 title/sender, type(**Text** 또는 **Item**), audience(**All** 또는 **Individual**), claim window를 보여주며 **Copy**, **Edit**, **Delete** action을 제공합니다.

메일을 만들려면:

1. **Type**을 선택합니다.
   - **Text** - 메시지만 보냅니다.
   - **Item** - reward mail입니다. **Reward payload**가 필요합니다.
2. **Audience**를 선택합니다.
   - **All** - 프로젝트의 모든 플레이어.
   - **Individual** - **Target Player IDs**를 입력합니다. 줄바꿈 또는 comma-separated로 최대 1,000명까지 입력할 수 있습니다.
3. **Claimable from**과 **Expires at**을 설정합니다. 만료 시간은 claim 시작 이후여야 합니다.
4. 필요하면 **Sender** 이름을 설정합니다(최대 64자).
5. 언어별 **Title**과 **Body**를 입력합니다(**Korean** / **English** tab, 최소 한 언어, body는 HTML editor).
6. **Save**를 클릭합니다.

기존 메일 내용을 재사용하려면 행에서 **Copy**를 클릭합니다. 한글·영문 title과 body가 신규 메일 form에 복사됩니다. Type은 **Text**, audience는 **All**로 초기화되고 claim 기간, sender, reward payload, target player는 비워집니다.

### Reward payload

**Item** mail의 reward payload는 JSON object여야 합니다. 내부 구조는 게임에서 정합니다. 전체 payload는 `mail.item_grant` webhook event를 통해 게임 서버에 그대로 전달되고([웹훅과 서버 키](/ko/console/webhooks) 참고), `display` array만 reward preview UI를 위해 클라이언트로 내려갑니다. 예:

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
Item grant는 `mail.item_grant` webhook을 받은 **게임 서버**가 실행합니다. 플랫폼은 `grant` 구조를 해석하지 않습니다. Item mail을 보내기 전에 webhook endpoint가 설정되어 있고 payload를 처리하는지 확인하세요.
:::

## Remote Push

Push notification campaign을 예약하려면 **Remote Push**로 이동합니다. 전송하려면 먼저 **Firebase FCM** 자격 증명이 등록되어 있어야 합니다. [로그인 제공자](/ko/console/login-providers)를 참고하세요.

Campaign 목록은 상태(**Scheduled**, **Sending**, **Completed**, **Failed**, **Canceled** - filterable), 예약 시간, target platform, target count, campaign별 success / failure / invalid-target count를 보여줍니다.

Campaign을 만들려면:

1. **Scheduled time**을 설정합니다.
2. **Platform**을 선택합니다: `Android + iOS`, `Android`, `iOS`.
3. 필요하면 다음을 설정합니다.
   - **Android notification icon** - Android drawable resource name. 소문자, 숫자, underscore를 사용합니다(예: `ic_stat_push`).
   - **Notification image URL** - `http(s)` image URL.
   - **Data JSON** - notification과 함께 전달되는 flat JSON object입니다. 값은 string 또는 number여야 합니다.
4. 언어별 **Title**과 **Body**를 입력합니다(**Korean** / **English**).
5. **Save**를 클릭합니다.

**Scheduled** 상태인 campaign만 수정하거나 취소할 수 있습니다. 취소 시 확인을 요청합니다.

완료·실패·취소 상태를 포함한 모든 campaign에서 **Copy**를 클릭하면 한글·영문 title과 body가 신규 campaign form에 복사됩니다. 예약 시각, platform, notification option, data payload는 초기화됩니다.

Campaign title을 클릭하면 **Delivery** 목록이 열립니다. 플레이어별 delivery status(**Success**, **Failed**, **Invalid target**, 또는 pending), Firebase installation ID와 token preview, attempt time, error code/message를 확인할 수 있습니다.
