# "Zero to Hero" Manual Complete Test Guide: YouTube to Spotify Integration

This guide provides a comprehensive, step-by-step walkthrough to test the entire Automation Platform from scratch (empty databases) to a functional YouTube-to-Spotify orchestration.

---

## Phase 1: Infrastructure & Environment Setup

### 1.1 Start Core Services
Ensure you have PostgreSQL and RabbitMQ running. Use the following default configurations:

- **PostgreSQL**: Port `5432`
  - Database 1: `goat_db` (For Backend)
  - Database 2: `executor_db` (For Workflow Executor)
- **RabbitMQ**: Port `5672` (Management UI: `15672`)
  - Guest Login: `guest` / `guest`

### 1.2 Configure `.env` Files
Create or update the `.env` files for each service.

**Goat Backend (`e:\automate\goat-backend\.env`)**:
```ini
DATABASE_URL=postgresql+asyncpg://postgres:postgres@localhost:5432/goat_db
JWT_SECRET=your_jwt_secret_key
ENCRYPTION_KEY=your_fernet_encryption_key_32_chars
WORKFLOW_EXECUTOR_URL=http://localhost:8082
FRONTEND_URL=http://localhost:3000
```

**Workflow Executor (`e:\automate\workflow_executor\.env`)**:
```ini
DATABASE_URL=postgres://postgres:postgres@localhost:5432/executor_db?sslmode=disable
RABBITMQ_HOST=localhost
RABBITMQ_PORT=5672
THIS_PORT=8082
```

---

## Phase 2: Service Orchestration & Startup

Start the services in the following order to ensure proper registration.

### 2.1 Start Workflow Executor
```powershell
# Terminal 1
cd e:\automate\workflow_executor
go run main.go
# Verification: "Workflow Executor listening on port 8082"
```

### 2.2 Start Plugins (Self-Registration)
Plugins will register with the Executor on startup.

```powershell
# Terminal 2 (YouTube Trigger)
cd e:\automate\plugins\youtube_trigger
$env:PLUGIN_PORT="8085"; go run main.go
# Verification: "[Registration] Successfully registered with executor at http://localhost:8082"

# Terminal 3 (Spotify Action)
cd e:\automate\plugins\spotify_action
$env:PLUGIN_PORT="8086"; go run main.go
# Verification: "[Registration] Successfully registered with executor at http://localhost:8082"
```

**Database Impact (`executor_db`)**:
- Table: `task_containers`
- Change: 2 new rows inserted (one for YouTube, one for Spotify).
- Verification: `SELECT name, plugin_host, plugin_port FROM task_containers;`

### 2.3 Start Goat Backend
```powershell
# Terminal 4
cd e:\automate\goat-backend
.\env\Scripts\activate
uvicorn app.main:app --reload --port 8000
# Verification: "Uvicorn running on http://127.0.0.1:8000"
```

**Database Impact (`goat_db`)**:
- Table: `plugin_providers`, `plugin_capabilities`
- Change: The Executor automatically syncs the registered plugins to the Backend via `POST /internal/plugins/sync`.
- Verification: `SELECT * FROM plugin_providers;` (Should see YouTube and Spotify).

---

## Phase 2.5: HTTPS Workaround (Ngrok)

Since Spotify requires an `https` redirect URI (even for local development), we will use **ngrok** to create a secure tunnel to your local backend.

1.  **Install Ngrok**: Download from [ngrok.com](https://ngrok.com/download) and authenticate.
2.  **Start Tunnel**:
    ```powershell
    ngrok http 8000
    ```
3.  **Capture URL**: Look for the `Forwarding` line (e.g., `https://1234-abcd.ngrok-free.dev`).
    - **Note**: This is your `BASE_HTTPS_URL`.
4.  **Update Spotify/Google Redirect URIs**: Use `https://<BASE_HTTPS_URL>/api/v1/plugins/accounts/<ID>/oauth/callback` in the steps below.

---

## Phase 3: Platform Authentication Testing

### 3.1 User Registration
**Request**:
- **Method**: `POST`
- **URL**: `http://localhost:8000/api/v1/auth/register`
- **Body**:
```json
{
  "email": "test_user@example.com",
  "password": "securePassword123",
  "full_name": "Test Tester"
}
```
**Database Impact (`goat_db`)**:
- Table: `users`
- Change: 1 new row inserted.
- Verification: `SELECT email FROM users WHERE email='test_user@example.com';`

### 3.2 User Login & Token Acquisition
**Request**:
- **Method**: `POST`
- **URL**: `http://localhost:8000/api/v1/auth/login`
- **Body**:
```json
{
  "email": "test_user@example.com",
  "password": "securePassword123"
}
```
**Action**: Copy the `access_token` from the response. Add it to your headers for all following steps:
`Authorization: Bearer <TOKEN>`

---

## Phase 4: Credential Setup (Google & Spotify Dashboards)

### 4.1 Google Cloud Console (YouTube)
1. Navigate to [Google Cloud Console](  /).
2. Create a project "Automation Platform".
3. Enable "YouTube Data API v3".
4. Configure "OAuth Consent Screen" as **External**.
5. Add Scope: `https://www.googleapis.com/auth/youtube.readonly`.
6. Create "OAuth client ID" (Web Application).
7. **Redirect URI**: Use your Ngrok HTTPS URL: `https://<YOUR_NGROK_ID>.ngrok-free.dev/api/v1/plugins/accounts/<YOUTUBE_ID>/oauth/callback`
   *(Get `<YOUTUBE_ID>` from `GET /api/v1/plugins/providers`)*.

### 4.2 Spotify Developer Dashboard
1. Navigate to [Spotify Dashboard](https://developer.spotify.com/dashboard).
2. Create an App "Goat Actions".
3. Edit Settings > **Redirect URIs**: Use your Ngrok HTTPS URL: `https://<YOUR_NGROK_ID>.ngrok-free.dev/api/v1/plugins/accounts/<SPOTIFY_ID>/oauth/callback`
   *(Get `<SPOTIFY_ID>` from `GET /api/v1/plugins/providers`)*.

---

## Phase 5: Provider Configuration (Injecting Keys)

Update the `plugin_providers` with your specific Client IDs and Secrets.

**Database Impact (`goat_db`)**:
- Table: `plugin_providers`
- Change: `metadata_schema` and `auth_types` updated.

**SQL for YouTube**:
```sql
UPDATE plugin_providers 
SET auth_types = '["oauth2"]'::jsonb,
    metadata_schema = '{
  "oauth": {
    "client_id": "GOOGLE_CLIENT_ID",
    "client_secret": "GOOGLE_CLIENT_SECRET",
    "authorize_url": "https://accounts.google.com/o/oauth2/v2/auth",
    "token_url": "https://oauth2.googleapis.com/token",
    "scopes": "https://www.googleapis.com/auth/youtube.readonly",
    "redirect_uri": "https://YOUR_NGROK_ID.ngrok-free.dev/api/v1/plugins/accounts/<YOUTUBE_ID>/oauth/callback"
  }
}'::jsonb
WHERE name = 'YouTube';
```

**SQL for Spotify**:
> [!IMPORTANT]
> Spotify's Developer Dashboard requires `https`. Use your **Ngrok URL** as the redirect URI both in the Dashboard and in the database configuration below.

```sql
UPDATE plugin_providers 
SET auth_types = '["oauth2"]'::jsonb,
    metadata_schema = '{
  "oauth": {
    "client_id": "SPOTIFY_CLIENT_ID",
    "client_secret": "SPOTIFY_CLIENT_SECRET",
    "authorize_url": "https://accounts.spotify.com/authorize",
    "token_url": "https://accounts.spotify.com/api/token",
    "scopes": "playlist-modify-public playlist-modify-private user-library-modify playlist-read-private user-read-private",
    "redirect_uri": "https://YOUR_NGROK_ID.ngrok-free.dev/api/v1/plugins/accounts/<SPOTIFY_ID>/oauth/callback"
  }
}'::jsonb
WHERE name = 'Spotify';
```
> [!TIP]
> If you have already authorized Spotify before running this SQL, you **must** disconnect and reconnect the account in Step 6.1 to pick up the new scopes.


---

## Phase 6: Plugin Account Connection (OAuth Flow)

### 6.1 Get Authorization URL
Repeat for both `youtube` and `spotify`.

**Request**: `GET http://localhost:8000/api/v1/plugins/accounts/{provider_id}/oauth/auth-url`
**Header**: `Authorization: Bearer <TOKEN>`
**Action**: Open the returned URL in your browser and authorize the application.

**Database Impact (`goat_db` & `executor_db`)**:
- After callback, `goat_db.plugin_accounts` gets a new row with encrypted tokens.
- `executor_db.plugin_secrets` (Wait! The backend calls `/secrets` on Executor during callback).
- Verification (`goat_db`): `SELECT * FROM plugin_accounts WHERE user_id = (SELECT id FROM users WHERE email='test_user@example.com');`

---

## Phase 7: Workflow Lifecycle (Creator)

### 7.1 Create Workflow
**Description**: Define the orchestration logic between YouTube and Spotify. The creator automatically receives a `Subscription` containing their configuration.
**Request**:
- **Method**: `POST`
- **URL**: `http://localhost:8000/api/v1/workflows`
- **Headers**:
  - `Authorization: Bearer <YOUR_ACCESS_TOKEN>`
  - `Content-Type: application/json`
- **Body**:
```json
{
  "name": "YouTube Likes to Spotify Playlist",
  "description": "Automatically adds liked YouTube videos to a specific Spotify playlist.",
  "is_enabled": false,
  "trigger": {
    "name": "YouTube Trigger",
    "plugin_provider_id": "PASTE_YOUTUBE_PROVIDER_UUID_HERE",
    "capability_key": "youtube_new_liked_video",
    "config": {}
  },
  "action": {
    "name": "Spotify Action",
    "plugin_provider_id": "PASTE_SPOTIFY_PROVIDER_UUID_HERE",
    "capability_key": "spotify_add_to_playlist",
    "config": {
      "playlist_id": "PASTE_SPOTIFY_PLAYLIST_ID_HERE",
      "track_query": "{{trigger.payload.title}}"
    }
  }
}
```
**Database Impact (`goat_db`)**:
- Table: `workflows` (New row with name/description).
- Table: `workflow_versions` (New row containing the workflow JSON with masked configs).
- Table: `subscriptions` (New row containing actual configs for User 1).
- Verification: `SELECT * FROM subscriptions;`

### 7.2 Enable & Sync Subscription
**Description**: Activate the creator's subscription and sync it with the Workflow Executor.
**Request**:
- **Method**: `PATCH`
- **URL**: `http://localhost:8000/api/v1/workflows/{workflow_id}/toggle?enable=true`
- **Headers**:
  - `Authorization: Bearer <YOUR_ACCESS_TOKEN>`
- **Database Impact (`executor_db`)**:
  - Table: `task_containers`
  - Change: `workflow_id` (Mapped to Subscription ID) and `status` ('running') columns updated for the assigned containers.
  - Verification: `SELECT name, workflow_id, status FROM task_containers WHERE workflow_id IS NOT NULL;`

---

## Phase 8: Multi-Tenant & Subscription Testing

### 8.1 Register & Login User 2
**Description**: Create a second user to test the multi-tenant subscription flow.
**Request (Register)**: `POST http://localhost:8000/api/v1/auth/register`
```json
{
  "email": "user2@example.com",
  "password": "securePassword123",
  "full_name": "Second User"
}
```
**Request (Login)**: `POST http://localhost:8000/api/v1/auth/login` (Grab the `access_token` for User 2).

### 8.2 Connect User 2 Accounts
- Repeat **Phase 6** using User 2's token to connect their own YouTube and Spotify accounts.

### 8.3 Subscribe to Workflow
**Description**: Turn on the public workflow for User 2 with their own configuration.
**Request**:
- **Method**: `POST`
- **URL**: `http://localhost:8000/api/v1/workflows/{workflow_id}/subscribe`
- **Headers**:
  - `Authorization: Bearer <USER_2_ACCESS_TOKEN>`
  - `Content-Type: application/json`
- **Body**:
```json
{
  "trigger_config": {},
  "action_config": {
    "playlist_id": "PASTE_USER_2_SPOTIFY_PLAYLIST_ID_HERE",
    "track_query": "{{trigger.payload.title}}"
  }
}
```

### 8.4 Enable User 2 Subscription
**Request**: `PATCH http://localhost:8000/api/v1/workflows/{workflow_id}/toggle?enable=true` (Using User 2 Token)
**Verification**: Check `executor_db` `task_containers`. There should now be TWO distinct sets of containers running (one set for User 1's subscription ID, one set for User 2's subscription ID).

---

## Phase 9: Trigger & Verification

### 9.1 Manual Execution (User 1)
**Description**: Manually force the workflow to run using your subscription credentials.
**Request**:
- **Method**: `POST`
- **URL**: `http://localhost:8000/api/v1/workflows/{workflow_id}/execute`
- **Headers**: `Authorization: Bearer <USER_1_ACCESS_TOKEN>`

### 9.2 Background Trigger Verification
1. Go to YouTube (Logged in as User 1 or User 2).
2. Search for a music video and **Like** it.
3. Check `executor_db` logs for either user's `task_containers`.
4. Check the corresponding Spotify playlist.

### 9.3 Troubleshooting 403 Forbidden (Spotify)
If your Spotify logs show `403 Forbidden`:
1. **Verify Scopes**: Check database configuration and ensure `scopes` field includes `playlist-modify-public playlist-modify-private`.
2. **Re-authorize**: Disconnect your Spotify account and connect it again via `GET /oauth/auth-url`. 
3. **App Mode**: Ensure your app in the Spotify Dashboard is either in "Production" or you have added the tester's email address.

---

## Phase 10: Reset & Cleanup

**Action**: Delete the workflow and clear databases. When a workflow is deleted, it cascades a disable to all active subscriptions before deleting DB records.

1. **Delete Workflow (API)**:
   - **Method**: `DELETE`
   - **URL**: `http://localhost:8000/api/v1/workflows/{workflow_id}`
   - **Headers**: `Authorization: Bearer <USER_1_ACCESS_TOKEN>`
   - **Impact**: Tears down all task containers for all subscribers, cleans up the executor queues, and deletes the `workflows` record.

2. **TRUNCATE (SQL)**:
   ```sql
   -- goat_db
   TRUNCATE users, sessions, workflows, workflow_versions, plugin_accounts, subscriptions, workflow_subscriber_links CASCADE;
   
   -- executor_db
   TRUNCATE workflow_jobs, workflow_job_events, trigger_states CASCADE;
   UPDATE task_containers SET workflow_id = NULL, status = 'idle';
   ```
