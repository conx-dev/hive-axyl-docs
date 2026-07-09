# 웹훅과 서버 키

**Webhooks** 메뉴는 게임 서버와 Hive Axyl 사이의 server-to-server 연동 양방향을 설정합니다.

- **Server keys** - *게임 서버가 Hive Axyl을 호출할 때* 사용됩니다. 예: 플레이어 검증.
- **Webhooks** - *Hive Axyl이 게임 서버를 호출할 때* 사용됩니다. 플랫폼 event를 전달합니다.

헤더에서 프로젝트를 선택한 뒤 **Webhooks**로 이동합니다.

## Server keys

Server key는 게임 서버가 Hive Axyl을 호출할 때 인증합니다. [프로젝트와 API 키](/ko/console/projects-api-keys)에서 설명한 client API key와 별개이며, 게임 클라이언트에 절대 넣으면 안 됩니다.

### 서버 키 발급

1. **Issue Server Key**를 클릭합니다.
2. **Key name**을 입력하고(예: `game-server-prod`) **Issue**를 클릭합니다.
3. Dialog에서 전체 키를 복사합니다.

::: warning 전체 키는 한 번만 표시됩니다
완전한 server key는 발급 직후에만 표시됩니다. 이후 콘솔은 key prefix만 보여줍니다. Dialog를 닫기 전에 키를 서버의 secret store에 저장하세요. 잃어버리면 해당 키를 폐기하고 새 키를 발급해야 합니다.
:::

### IP / CIDR 제한

각 active server key에는 **Allowed IP/CIDR** list가 있습니다.

- 항목이 없으면 IP 제한이 없습니다.
- Key의 input field에 IP 또는 CIDR(예: `203.0.113.10/32`)을 입력하고 **Add**를 클릭해 항목을 추가합니다.
- 항목의 **Delete** 버튼으로 제거합니다. 확인을 요청합니다.

::: tip
운영 키는 allowed list를 게임 서버 egress IP로 제한하세요. 키가 유출되어도 다른 곳에서 사용할 수 없습니다.
:::

### 서버 키 폐기

Active key에서 **Revoke**를 클릭하고 확인합니다. 폐기는 즉시 적용되며 되돌릴 수 없습니다.

## 게임 서버 event webhook

Hive Axyl은 HTTP POST로 platform event를 게임 서버에 전달합니다.

### Endpoint 설정

**Game server event webhook** form에서:

1. 서버가 event를 받을 **Endpoint URL**을 입력합니다. 예: `https://gateway.example.com/hiveng/webhook`.
2. **Signing Secret**을 입력합니다. 이 값은 write-only입니다. 저장 후 다시 표시되지 않으며, field placeholder는 새 값을 입력하지 않는 한 기존 secret이 유지된다는 것을 나타냅니다. 교체하려면 새 값을 입력하고 저장합니다.
3. **Enabled** checkbox로 delivery를 켜거나 끕니다. 끄면 URL과 secret은 유지되지만 event를 보내지 않습니다.
4. **Save**를 클릭합니다.

### Signature 검증

모든 delivery는 signing secret으로 **HMAC-SHA256** 서명됩니다. 서버는 request에서 signature를 다시 계산하고 `X-Hiveng-Signature` header와 비교해야 합니다. Header에는 `sha256=HMAC(timestamp.body)`가 들어갑니다. Signature가 일치하지 않는 요청은 거부하세요. 이것으로 event가 Hive Axyl에서 변조 없이 왔음을 확인합니다.

### 전달되는 event

Webhook은 다음 event type을 domain별로 묶어 전달합니다.

| Group | Event types |
| --- | --- |
| Player | `player.created`, `player.nickname_updated`, `player.banned`, `player.unbanned` |
| Maintenance | `maintenance.scheduled`, `maintenance.updated`, `maintenance.cancelled`, `maintenance.ended` |
| Mail | `mail.item_grant` |
| Payment | `payment.started`, `payment.requested`, `payment.verified`, `payment.failed` |
| Subscription | `subscription.verified`, `subscription.updated`, `subscription.failed` |

`mail.item_grant`는 Mailbox에 입력한 reward payload를 전달합니다. [운영](/ko/console/operations)을 참고하세요. Payment와 subscription event는 서버 측 item grant를 구동합니다. [결제](/ko/console/payments)를 참고하세요.

## Delivery history

페이지 하단의 두 section에서 delivery를 추적할 수 있습니다.

- **Delivery successes** - 최근 24시간의 성공 delivery입니다. Event type과 event ID(복사 버튼 포함), player ID, attempt number, HTTP status, game-server processing latency, total latency, completion time을 보여줍니다. **Refresh**로 다시 불러옵니다.
- **Delivery failures** - 상태가 **Failed**(아직 retry 중) 또는 **DLQ**(retry 소진 후 dead-letter queue로 이동)인 실패 delivery입니다. Event, player ID, attempt number, HTTP status, error message, occurrence time을 보여줍니다.

::: tip
Endpoint가 non-2xx status 또는 timeout을 반환해 failures에 event가 보이면 endpoint를 수정하고 attempt counter를 확인하세요. DLQ로 들어가기 전에 delivery가 retry됩니다. Event ID를 사용해 delivery와 서버 로그를 연결하세요.
:::
