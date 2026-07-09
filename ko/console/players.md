# 플레이어와 제재

플레이어 운영은 두 메뉴에서 처리합니다. **Player Search**는 플레이어 조회용이고, **Player Sanctions**는 ban/unban용입니다. 둘 다 헤더에서 프로젝트를 먼저 선택해야 합니다.

## Player Search

**Player Search**로 이동합니다.

1. **Search field**를 선택합니다.
   - **Nickname** - prefix match(기본값)
   - **Email** - exact match
   - **Player ID** - exact match
2. 검색어를 입력하고 **Search**를 클릭합니다. 검색어를 비우면 모든 플레이어를 나열합니다.

결과 표는 각 플레이어의 Player ID, nickname, email, country, creation date, last login time, last login platform(Web / Android / iOS / Desktop)을 보여줍니다.

## Player Sanctions

Ban을 등록하거나 해제하려면 **Player Sanctions**로 이동합니다.

### 단일 플레이어 ban

1. 플레이어를 검색합니다. Player Search와 같은 검색 필드를 사용하며, 여기서 기본 필드는 **Player ID**입니다. 각 결과 행은 플레이어의 현재 제재 상태를 보여줍니다: **Normal**, **Banned until** 날짜, 또는 **Permanently banned**.
2. 플레이어 행에서 **Ban**을 클릭합니다.
3. Ban dialog에 다음을 입력합니다.
   - **Reason** - 필수. 이 텍스트는 플레이어 클라이언트에 표시됩니다.
   - **Permanent** - 영구 ban이면 체크합니다. 또는
   - **Until** - 임시 ban의 예약 해제 시간입니다. 미래 시각이어야 합니다.
4. **Register**를 클릭합니다.

::: warning 영구 ban에는 추가 확인이 필요합니다
영구 ban을 등록하면 콘솔은 ban이 해제될 때까지 플레이어가 로그인할 수 없다는 확인 dialog를 표시합니다. 확인 전에 player ID를 주의 깊게 검토하세요. Ban은 즉시 적용됩니다.
:::

### Ban 해제

플레이어 행에서 **Unban**을 클릭하고 확인합니다. 플레이어의 active sanction이 해제되고 다시 로그인할 수 있습니다.

### Bulk bans

**Bulk ban** section은 CSV input으로 한 번에 최대 100개의 ban을 등록합니다.

```
player_id,reason,permanent,until
018f0000-0000-7000-8000-000000000001,Policy violation,false,2099-06-30T00:00:00Z
018f0000-0000-7000-8000-000000000002,Payment abuse,true,
```

제출 전에 검증되는 규칙:

- Header row는 정확히 `player_id,reason,permanent,until`이어야 합니다.
- `player_id` - UUID 형식이며 중복이 없어야 합니다.
- `reason` - 필수이며 255자 이하여야 합니다. comma를 포함하면 double quote로 감싸세요.
- `permanent` - `true` 또는 `false`.
- `until` - 임시 ban(`permanent=false`)에서는 미래 UTC timestamp여야 하며 `YYYY-MM-DDTHH:mm:ssZ` 형식입니다. 영구 ban에서는 비어 있어야 합니다.

이미 ban된 플레이어의 active sanction을 새 값으로 덮어써야 한다면 **Also replace bans for players who are already banned**를 체크하세요. 체크하지 않으면 이미 ban된 플레이어는 skipped 처리됩니다.

**Execute bulk ban**을 클릭합니다. 확인 dialog는 ban될 플레이어 수와 그중 영구 ban 수를 요약합니다. 실행 후 result table은 각 행의 outcome을 보여줍니다: **Applied**, **Skipped**(already banned), **Failed**와 message.

### Sanction list

**Sanction list** section은 프로젝트의 sanction record를 보여줍니다. Player ID, reason, period(banned-at부터 release time까지 또는 permanent), type(**Permanent** / **Temporary**), status(**Active** / **Lifted**)를 표시합니다. 현재 적용 중인 ban만 보려면 **Active sanctions only**를 체크하고 **Search**를 클릭합니다.

## Ban된 플레이어에게 보이는 내용

Ban된 플레이어가 로그인하려고 하면 SDK는 입력한 ban reason을 포함해 banned error를 게임에 노출합니다. 클라이언트 코드에서 이를 감지하고 처리하는 방법은 [에러 코드](/ko/guide/error-codes)를 참고하세요. 제재 변경 시 게임 서버가 받는 `player.banned` / `player.unbanned` event는 [웹훅과 서버 키](/ko/console/webhooks)를 참고하세요.
