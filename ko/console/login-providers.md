# 로그인 제공자

플레이어 로그인은 다음 순서로 두 단계에서 설정합니다.

1. **Credentials** - 프로젝트에 provider key(OAuth client ID, secret, market key, push key)를 등록합니다.
2. **Login Providers** - 국가별로 플레이어에게 표시할 로그인 방식을 선택하고 순서를 정합니다.

::: warning 자격 증명을 먼저 등록하세요
OAuth 로그인 제공자는 자격 증명을 등록한 뒤에만 활성화할 수 있습니다. **Login Providers** 페이지에서 등록된 자격 증명이 없는 제공자는 credential missing으로 표시되며 매핑에 저장할 수 없습니다. Guest 로그인만 예외이며 자격 증명이 필요 없습니다.
:::

## Credentials

**Credentials**로 이동합니다. 먼저 프로젝트를 선택해야 합니다. 페이지에는 세 탭이 있습니다.

- **OAuth** - 로그인 제공자 연동
- **Market receipt verification** - 구매 검증에 사용하는 store key
- **Push** - push delivery key

각 제공자는 등록 상태를 보여주는 card입니다. 필드를 채우고 **Register**를 클릭합니다. 나중에 값을 바꾸려면 **Edit**을 클릭해 새 값을 입력합니다. 자격 증명을 완전히 제거하려면 **Delete**를 클릭하고 확인합니다.

### Secret은 write-only입니다

Secret 값은 저장 후 다시 표시되지 않습니다. 등록된 card는 마지막 수정 시간과 저장된 각 필드의 masked preview만 표시합니다. 수정은 항상 새 값으로 덮어쓰는 방식이며 기존 값을 읽어오는 방법은 없습니다. 등록하는 모든 secret은 별도로 안전하게 보관하세요.

### OAuth tab

| Provider | Fields |
| --- | --- |
| Google | **Client IDs (Android/iOS/Web)** - 각 플랫폼의 OAuth client ID를 comma-separated로 입력 |
| Facebook | **App ID**와 **App Secret** - App Secret은 서버에서 `appsecret_proof` (HMAC) signing에 사용 |
| Apple | **Client IDs** - **iOS Bundle ID**와 **Web Services ID**를 comma-separated로 입력 |

::: tip Apple에는 두 client ID가 필요합니다
Apple sign-in은 플랫폼별로 다른 client ID를 사용합니다. Native iOS sign-in은 앱의 Bundle ID를, web-based sign-in은 Services ID를 사용합니다. 두 값을 **Client IDs** 필드에 comma-separated로 입력하세요. Apple card는 복사 버튼이 있는 **Redirect URI**도 표시합니다. 이 URI를 Apple Services ID 설정에 등록하세요.
:::

### Market receipt verification tab

| Target | Fields |
| --- | --- |
| Google Play | **Service Account JSON** - service account key 파일 전체 내용 |
| App Store | **Issuer ID**, **Key ID**, **Private Key (.p8)**(파일 전체 내용), **Bundle ID**; product import가 필요하면 선택적으로 **Connect Issuer ID**, **Connect Key ID**, **Connect Private Key (.p8)** |
| PortOne | **V2 API Secret** - web payment verification에 사용 |

선택 App Store Connect 필드는 [결제](/ko/console/payments) 페이지에서 product catalog를 가져오려는 경우에만 필요합니다.

### Push tab

| Target | Fields |
| --- | --- |
| Firebase FCM | **Service Account JSON** - Firebase service account key 파일 전체 내용 |

**Remote Push**에서 campaign을 보내려면 이 자격 증명이 먼저 필요합니다. [운영](/ko/console/operations)을 참고하세요.

## 로그인 제공자 매핑

**Login Providers**로 이동합니다. 먼저 프로젝트를 선택해야 합니다. 페이지는 국가별로 한 행씩 표시하며, 각 행에는 해당 국가 플레이어에게 표시할 로그인 방식의 순서 있는 목록이 있습니다.

### 플레이어에게 보이는 방식

게임이 시작되면 SDK는 플랫폼에 플레이어 국가에 표시할 로그인 제공자를 요청하고, 설정된 순서로 표시합니다. SDK 로그인 흐름 전체는 [아키텍처](/ko/guide/architecture)를 참고하세요.

### 기본 fallback

명시적 매핑이 없는 국가는 서버 기본 매핑으로 fallback됩니다. 기본값은 **Google -> Apple -> Facebook -> Guest**이며, 등록된 자격 증명이 있는 제공자와 Guest만 남도록 필터링됩니다. Fallback 목록은 참고용으로 페이지 하단에 표시됩니다. 국가 또는 `DEFAULT`에 매핑을 추가하면 fallback을 override합니다.

### 매핑 추가 또는 수정

1. **Add Mapping**을 클릭하거나 기존 행에서 **Edit**을 클릭합니다.
2. **Country**를 선택합니다. `DEFAULT`(자체 매핑이 없는 모든 국가에 적용), preset country, 또는 custom 2-letter ISO 3166-1 alpha-2 code(예: `ES`) 중 하나입니다. 생성 후 국가는 변경할 수 없습니다.
3. 활성화할 제공자를 체크합니다. 등록된 OAuth 자격 증명이 있는 제공자와 **Guest**만 선택할 수 있습니다.
4. 위/아래 버튼으로 제공자 순서를 바꿉니다. 가장 위 제공자가 플레이어에게 먼저 표시됩니다.
5. **Save**를 클릭합니다.

최소 하나의 제공자가 활성화되어야 하며, 자격 증명이 빠진 OAuth 제공자를 포함한 매핑은 저장할 수 없습니다.

### 매핑 삭제

행의 **Delete**를 클릭하고 확인합니다. 해당 국가는 즉시 위에서 설명한 기본 fallback 동작으로 돌아갑니다.
