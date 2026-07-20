# Projects & API Keys

A project represents one game. All configuration in the console — credentials, login providers, payments, webhooks, sanctions — is scoped to a project. API keys authenticate your client SDK against that project.

## Create a project

1. Go to **Projects** and click **Create Project**.
2. Enter a project **Name** (required).
3. Optionally fill in the app identifier for each market you ship on (you can also add these later).
4. Click **Create**.

The new project appears in the project list and in the header project selector.

To see project details — including the project ID you will need for SDK configuration — click the project name in the list. The detail dialog shows the name, **ID** (with a copy button), created/updated times, app identifiers, and members.

## App identifiers per market

Each project can register one app identifier per market:

| Market | Identifier | Example format |
| --- | --- | --- |
| Google Play | Application (package) name | `com.example.game` |
| App Store | Bundle ID | `com.example.game` |
| Steam | App ID | `480` |
| Web | Site domain | `game.example.com` |

Identifiers must be 255 characters or fewer. They are used to match market receipts and products to your project, so enter them exactly as registered on each store.

To add or change identifiers after creation:

1. Go to **Projects**.
2. In the **App Identifiers** column, click an existing identifier (or the unregistered placeholder) to open the edit dialog.
3. Enter or update the identifier for each market and click **Save**.

Clearing a market's field disables that identifier instead of deleting it; disabled identifiers are shown as suspended in the project detail dialog.

## Manage members

1. Go to **Projects** and click your role in the **My Role** column of the project row. The member management dialog opens.
2. To invite a member, enter their **Email**, pick a **Role** (`OWNER` / `ADMIN` / `VIEWER`), and click **Invite**. The email may belong to an existing account or a person who has not signed up yet.
3. The recipient opens the one-time invitation link within seven days. They sign in with the invited email or create an account from the invitation page, then explicitly accept.
4. The requested role is granted only after acceptance. Until then, the member management dialog shows the invitation under **Pending Invitations**, where you can resend or cancel it.
5. To change an accepted member's role, pick a new role from the dropdown next to their name.
6. To remove an accepted member, click **Remove** and confirm in the dialog.

Rules enforced by the console and the server:

- Only project members with the `OWNER` or `ADMIN` role can manage members.
- Only an `OWNER` can assign the `OWNER` role or manage members who are owners.
- Invitation links are single-use. Resending replaces the previous link.
- The last `OWNER` cannot be removed or demoted.
- You cannot edit or remove your own membership.

See [Console Overview](/console/overview) for a description of each role.

## API keys

API keys authenticate client SDK calls for the selected project.

### Issue a key

1. Select your project in the header, then go to **API Keys**.
2. Click **Issue Key**.
3. Enter a **Key name** that describes where the key will be used (for example `game-client-prod`) and click **Issue**.
4. A dialog shows the full API key with a **Copy** button.

::: warning The full key is shown only once
The complete API key is displayed only in this dialog, immediately after issuing. Once you close it, the console shows only the key prefix (the first 8 characters) and the full value can never be retrieved again. Copy the key and store it in a secure secret store before closing the dialog. If you lose it, revoke the key and issue a new one.
:::

The key list shows each key's name, prefix, status (**Active** / **Revoked**), creation date, and revocation date. Use the **Hide revoked keys** checkbox to filter the list.

### Revoke a key

1. In **API Keys**, click **Revoke** on an active key.
2. Confirm in the dialog.

Revocation takes effect immediately and cannot be undone. Clients still using the revoked key will fail to authenticate, so roll out the replacement key first.

## Use the key in your SDK

Put the issued API key and your project ID into the SDK configuration (for example `projectId: "your-project-id"`, `apiKey: "your-api-key"`). See [Getting Started](/guide/getting-started) for the per-platform configuration steps.
