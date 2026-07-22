# 콘솔 개요

Hive Axyl Operations Console은 게임 스튜디오가 플랫폼에서 게임 운영에 필요한 모든 것을 관리하는 웹 콘솔입니다. 프로젝트, API 키, 로그인 자격 증명, 로그인 제공자, 공지, 점검 창, 게임 내 우편함, 원격 push campaign, 결제, 웹훅, 플레이어 제재를 관리합니다.

이 문서는 계정 생성, 프로젝트 선택, 멤버 역할을 설명하고 각 메뉴의 세부 가이드로 안내합니다.

## 가입과 로그인

1. 콘솔을 열고 **Sign up**을 클릭합니다.
2. **Email**을 입력하고 **Send verification email**을 클릭합니다.
3. 30분 안에 해당 주소로 전송된 이메일 확인 링크를 엽니다.
4. 확인 페이지에서 **Name**, **Password**(최소 8자), **Confirm password**를 입력합니다.
5. 가입을 완료합니다. 확인된 링크를 제출한 뒤에만 계정이 생성됩니다.

나중에 로그인할 때는 **Login** 페이지에서 이메일과 비밀번호를 사용합니다.

이메일 재확인이 필요한 기존 계정은 로그인 페이지에서 새 확인 메일을 요청해야 합니다. 확인 페이지에서 새 비밀번호를 설정하면 이전 콘솔 세션과 MCP 세션이 폐기됩니다.

콘솔 오른쪽 위에는 계정 이름과 이메일이 표시됩니다. 클릭하면 **Account** 페이지가 열리며, 현재 비밀번호를 입력해 비밀번호를 변경할 수 있습니다. 옆의 **Logout** 버튼으로 로그아웃합니다.

## 먼저 프로젝트 선택

콘솔의 모든 화면은 하나의 프로젝트를 대상으로 동작합니다. 헤더에는 **Project Context** 선택기가 표시됩니다. 다른 작업을 하기 전에 작업할 프로젝트를 선택하세요.

::: tip
페이지에서 프로젝트 선택을 요구하는 메시지가 보이면 헤더의 프로젝트 선택기를 사용하세요. **API Keys**, **Credentials**, **Payments**, **Player Search** 같은 메뉴는 프로젝트를 선택하기 전까지 비어 있습니다.
:::

아직 프로젝트가 없다면 **Projects**로 이동해 프로젝트를 만드세요. [프로젝트와 API 키](/ko/console/projects-api-keys)를 참고하세요.

## 멤버 역할

각 프로젝트에는 자체 멤버 목록이 있습니다. 멤버는 세 역할 중 하나를 가집니다.

| 역할 | 가능한 작업 |
| --- | --- |
| `OWNER` | 프로젝트 전체 제어. `OWNER` 역할 부여/변경은 owner만 가능하며, 다른 owner를 포함한 모든 멤버를 관리할 수 있습니다. |
| `ADMIN` | 프로젝트와 멤버를 관리할 수 있습니다(멤버 초대, 역할 변경, 멤버 제거). 단, `OWNER` 역할 멤버는 제외됩니다. |
| `VIEWER` | 프로젝트 데이터를 볼 수 있지만 멤버를 관리할 수 없습니다. |

두 가지 안전 규칙이 적용됩니다.

- 프로젝트의 마지막 `OWNER`는 제거하거나 강등할 수 없습니다.
- 멤버 관리 dialog에서 자신의 멤버십을 변경하거나 제거할 수 없습니다.

멤버는 **Projects** 메뉴에서 관리합니다. 정확한 단계는 [프로젝트와 API 키](/ko/console/projects-api-keys)를 참고하세요.

## Dashboard

**Dashboard** 메뉴는 선택한 프로젝트의 게임 지표를 보여줍니다. 일별 지표는 조회 월 하나를 선택하며, 과거 월은 월 전체를, 현재 UTC 월은 오늘까지 보여줍니다. 월별 매출과 사용자 활동 요약은 기존 월 범위를 사용합니다. Retention은 종료일 하나를 선택하며, 종료일 7일 전부터 종료일까지 코호트 8개와 D0~D7을 기준·국가·market별로 보여줍니다. 게임 출시 후 일상적인 health check로 사용하세요.

## 메뉴 맵

콘솔 sidebar에는 다음 메뉴가 있습니다. 각 메뉴는 문서 페이지와 연결됩니다.

| 메뉴 | 기능 | 문서 |
| --- | --- | --- |
| **Dashboard** | 매출, 활동, retention 지표 | 이 페이지(위 설명 참고) |
| **Projects** | 프로젝트, 앱 식별자, 멤버 생성/관리 | [프로젝트와 API 키](/ko/console/projects-api-keys) |
| **API Keys** | 클라이언트 SDK 키 발급과 폐기 | [프로젝트와 API 키](/ko/console/projects-api-keys) |
| **Credentials** | OAuth, market receipt, push 자격 증명 | [로그인 제공자](/ko/console/login-providers) |
| **Webhooks** | 서버 키와 게임 서버 event webhook | [웹훅과 서버 키](/ko/console/webhooks) |
| **Mailbox** | 게임 내 메일과 reward payload | [운영](/ko/console/operations) |
| **Maintenance** | 점검 창과 bypass list | [운영](/ko/console/operations) |
| **Notices** | 표시 기간이 있는 게임 내 공지 | [운영](/ko/console/operations) |
| **Payments** | 구매/구독 기록과 상품 | [결제](/ko/console/payments) |
| **Remote Push** | push notification campaign | [운영](/ko/console/operations) |
| **Login Providers** | 국가별 로그인 제공자 매핑 | [로그인 제공자](/ko/console/login-providers) |
| **Player Search** | 플레이어 조회 | [플레이어와 제재](/ko/console/players) |
| **Player Sanctions** | 플레이어 ban/unban | [플레이어와 제재](/ko/console/players) |
| **Account** | 콘솔 비밀번호 변경 | 이 페이지(위 설명 참고) |

## 5단계 온보딩

빈 계정에서 동작하는 SDK 연동까지 진행하려면:

1. 콘솔 계정에 **가입**합니다(위 설명 참고).
2. **프로젝트를 만들고** 출시할 각 market(Google Play, App Store, Steam, Web)의 앱 식별자를 등록합니다 - [프로젝트와 API 키](/ko/console/projects-api-keys).
3. 클라이언트 SDK용 **API 키를 발급**합니다. 전체 키는 한 번만 표시되므로 안전하게 저장하세요 - [프로젝트와 API 키](/ko/console/projects-api-keys).
4. 사용할 로그인 제공자, market receipt validation, push delivery의 **자격 증명**을 등록합니다 - [로그인 제공자](/ko/console/login-providers).
5. SDK가 표시할 로그인 버튼을 알 수 있도록 **국가별 로그인 제공자**를 매핑합니다 - [로그인 제공자](/ko/console/login-providers).

완료 후 [시작하기](/ko/guide/getting-started)를 따라 플랫폼별 SDK를 설정하세요([Web](/ko/platforms/web), [Unity](/ko/platforms/unity), [Android](/ko/platforms/android), [iOS](/ko/platforms/ios), [Godot](/ko/platforms/godot)).

## 시간대

콘솔 표의 timestamp는 **UTC**로 표시됩니다(`YYYY-MM-DD HH:mm UTC` 형식). 날짜/시간 입력 필드는 로컬 시간대를 사용하고 저장 시 UTC로 변환됩니다.
