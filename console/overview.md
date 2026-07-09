# Console Overview

The Hive Axyl Operations Console is the web console where game studios manage everything their game needs on the platform: projects, API keys, sign-in credentials, login providers, notices, maintenance windows, in-game mail, remote push campaigns, payments, webhooks, and player sanctions.

This page walks you through creating an account, selecting a project, and understanding member roles — then points you to the detailed guides for each menu.

## Sign up and log in

1. Open the console and click **Sign up**.
2. Enter your **Name**, **Email**, **Password** (minimum 8 characters), and **Confirm password**.
3. Submit the form. You are signed in immediately and land on the console home.

To log in later, use your email and password on the **Login** page.

Your account name and email are shown in the top-right corner of the console. Click it to open the **Account** page, where you can change your password (your current password is required). Use the **Logout** button next to it to sign out.

## Select a project first

Every screen in the console operates on a single project. The header shows a **Project Context** selector — pick the project you want to work on before doing anything else.

::: tip
If a page shows a message asking you to select a project, use the project selector in the header. Menus such as **API Keys**, **Credentials**, **Payments**, and **Player Search** stay empty until a project is selected.
:::

If you have no project yet, go to **Projects** and create one — see [Projects & API Keys](/console/projects-api-keys).

## Member roles

Each project has its own member list. A member has one of three roles:

| Role | What it can do |
| --- | --- |
| `OWNER` | Full control of the project. Only owners can grant or change the `OWNER` role, and can manage every member including other owners. |
| `ADMIN` | Can manage the project and its members (add members, change roles, remove members), except members who hold the `OWNER` role. |
| `VIEWER` | Can view project data but cannot manage members. |

Two safety rules apply:

- The last remaining `OWNER` of a project cannot be removed or demoted.
- You cannot change or remove your own membership from the member management dialog.

Members are managed from the **Projects** menu — see [Projects & API Keys](/console/projects-api-keys) for the exact steps.

## Dashboard

The **Dashboard** menu shows game metrics for the selected project: daily or monthly revenue and user activity summaries broken down by market, plus a retention matrix you can filter by date range, retention basis, country, and market. Country distribution for the selected period drives the retention breakdown. Use it as your day-to-day health check after your game goes live.

## Menu map

The console sidebar contains the following menus. Each maps to a documentation page:

| Menu | What it does | Documentation |
| --- | --- | --- |
| **Dashboard** | Revenue, activity, and retention metrics | This page (see above) |
| **Projects** | Create projects, app identifiers, members | [Projects & API Keys](/console/projects-api-keys) |
| **API Keys** | Issue and revoke client SDK keys | [Projects & API Keys](/console/projects-api-keys) |
| **Credentials** | OAuth, market receipt, and push credentials | [Login Providers](/console/login-providers) |
| **Webhooks** | Server keys and game-server event webhooks | [Webhooks & Server Keys](/console/webhooks) |
| **Mailbox** | In-game mail and reward payloads | [Operations](/console/operations) |
| **Maintenance** | Maintenance windows and bypass lists | [Operations](/console/operations) |
| **Notices** | In-game notices with display periods | [Operations](/console/operations) |
| **Payments** | Purchase/subscription history and products | [Payments](/console/payments) |
| **Remote Push** | Push notification campaigns | [Operations](/console/operations) |
| **Login Providers** | Per-country login provider mappings | [Login Providers](/console/login-providers) |
| **Player Search** | Look up players | [Players & Sanctions](/console/players) |
| **Player Sanctions** | Ban and unban players | [Players & Sanctions](/console/players) |
| **Account** | Change your console password | This page (see above) |

## Onboarding in five steps

To go from an empty account to a working SDK integration:

1. **Sign up** for a console account (see above).
2. **Create a project** and register the app identifier for each market you ship on (Google Play, App Store, Steam, Web) — [Projects & API Keys](/console/projects-api-keys).
3. **Issue an API key** for your client SDK. The full key is shown only once, so store it safely — [Projects & API Keys](/console/projects-api-keys).
4. **Register credentials** for the sign-in providers, market receipt validation, and push delivery you plan to use — [Login Providers](/console/login-providers).
5. **Map login providers per country** so the SDK knows which sign-in buttons to show — [Login Providers](/console/login-providers).

Once these are done, follow [Getting Started](/guide/getting-started) to configure the SDK for your platform ([Web](/platforms/web), [Unity](/platforms/unity), [Android](/platforms/android), [iOS](/platforms/ios), [Godot](/platforms/godot)).

## Time zones

Timestamps in console tables are displayed in **UTC** (formatted as `YYYY-MM-DD HH:mm UTC`). Date/time input fields use your local time zone and are converted to UTC when saved.
