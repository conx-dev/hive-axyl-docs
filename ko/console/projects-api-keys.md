# 프로젝트와 API 키

프로젝트는 하나의 게임을 나타냅니다. 콘솔의 모든 설정(자격 증명, 로그인 제공자, 결제, 웹훅, 제재)은 프로젝트 범위로 적용됩니다. API 키는 클라이언트 SDK가 해당 프로젝트에 인증하는 데 사용됩니다.

## 프로젝트 생성

1. **Projects**로 이동해 **Create Project**를 클릭합니다.
2. 프로젝트 **Name**을 입력합니다(필수).
3. 필요하면 출시할 각 market의 앱 식별자를 입력합니다. 나중에 추가할 수도 있습니다.
4. **Create**를 클릭합니다.

새 프로젝트가 프로젝트 목록과 헤더의 프로젝트 선택기에 표시됩니다.

SDK 설정에 필요한 project ID를 포함한 프로젝트 상세 정보를 보려면 목록에서 프로젝트 이름을 클릭하세요. 상세 dialog는 이름, **ID**(복사 버튼 포함), 생성/수정 시간, 앱 식별자, 멤버를 보여줍니다.

## Market별 앱 식별자

각 프로젝트는 market별로 앱 식별자를 하나씩 등록할 수 있습니다.

| Market | 식별자 | 예시 형식 |
| --- | --- | --- |
| Google Play | Application(package) name | `com.example.game` |
| App Store | Bundle ID | `com.example.game` |
| Steam | App ID | `480` |
| Web | Site domain | `game.example.com` |

식별자는 255자 이하여야 합니다. Market receipt와 product를 프로젝트에 매칭하는 데 사용되므로 각 store에 등록된 값과 정확히 같게 입력하세요.

생성 후 식별자를 추가하거나 변경하려면:

1. **Projects**로 이동합니다.
2. **App Identifiers** 열에서 기존 식별자 또는 미등록 placeholder를 클릭해 edit dialog를 엽니다.
3. 각 market의 식별자를 입력하거나 수정하고 **Save**를 클릭합니다.

Market 필드를 비우면 식별자가 삭제되는 대신 비활성화됩니다. 비활성화된 식별자는 프로젝트 상세 dialog에서 suspended로 표시됩니다.

## 멤버 관리

1. **Projects**로 이동해 프로젝트 행의 **My Role** 열에서 자신의 역할을 클릭합니다. 멤버 관리 dialog가 열립니다.
2. 멤버를 초대하려면 **Email**을 입력하고 **Role**(`OWNER` / `ADMIN` / `VIEWER`)을 선택한 뒤 **Invite**를 클릭합니다. 기존 계정이 없더라도 초대할 수 있습니다.
3. 수신자는 7일 안에 일회용 초대 링크를 엽니다. 초대받은 이메일의 계정으로 로그인하거나 초대 페이지에서 계정을 만든 뒤 명시적으로 수락합니다.
4. 수락이 끝난 뒤에만 역할이 부여됩니다. 수락 전에는 **Pending Invitations**에서 초대를 다시 보내거나 취소할 수 있습니다.
5. 수락한 멤버의 역할을 변경하려면 이름 옆 dropdown에서 새 역할을 선택합니다.
6. 수락한 멤버를 제거하려면 **Remove**를 클릭하고 dialog에서 확인합니다.

콘솔과 서버가 강제하는 규칙:

- `OWNER` 또는 `ADMIN` 역할의 프로젝트 멤버만 멤버를 관리할 수 있습니다.
- `OWNER` 역할 부여 또는 owner 멤버 관리는 `OWNER`만 할 수 있습니다.
- 초대 링크는 한 번만 사용할 수 있습니다. 초대를 다시 보내면 이전 링크는 무효화됩니다.
- 마지막 `OWNER`는 제거하거나 강등할 수 없습니다.
- 자신의 멤버십은 수정하거나 제거할 수 없습니다.

각 역할 설명은 [콘솔 개요](/ko/console/overview)를 참고하세요.

## API 키

API 키는 선택한 프로젝트의 클라이언트 SDK 호출을 인증합니다.

### 키 발급

1. 헤더에서 프로젝트를 선택한 뒤 **API Keys**로 이동합니다.
2. **Issue Key**를 클릭합니다.
3. 키가 사용될 위치를 설명하는 **Key name**을 입력하고(예: `game-client-prod`) **Issue**를 클릭합니다.
4. dialog가 전체 API 키와 **Copy** 버튼을 표시합니다.

::: warning 전체 키는 한 번만 표시됩니다
완전한 API 키는 발급 직후 이 dialog에서만 표시됩니다. 닫은 뒤 콘솔은 key prefix(처음 8자)만 표시하며 전체 값을 다시 조회할 수 없습니다. dialog를 닫기 전에 키를 복사해 안전한 secret store에 저장하세요. 잃어버리면 해당 키를 폐기하고 새 키를 발급해야 합니다.
:::

키 목록은 각 키의 이름, prefix, 상태(**Active** / **Revoked**), 생성일, 폐기일을 보여줍니다. **Hide revoked keys** checkbox로 목록을 필터링할 수 있습니다.

### 키 폐기

1. **API Keys**에서 active key의 **Revoke**를 클릭합니다.
2. dialog에서 확인합니다.

폐기는 즉시 적용되며 되돌릴 수 없습니다. 폐기된 키를 계속 사용하는 클라이언트는 인증에 실패하므로, 먼저 대체 키를 배포하세요.

## SDK에서 키 사용

발급한 API 키와 project ID를 SDK 설정에 넣습니다(예: `projectId: "your-project-id"`, `apiKey: "your-api-key"`). 플랫폼별 설정 단계는 [시작하기](/ko/guide/getting-started)를 참고하세요.
