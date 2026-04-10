# Sequels.diy — Frontend Blueprint

> Based on `backend_apis.json` (Goat Backend v0.1.0 updated) and analysis of the live site at sequels.diy.
> This document is the source of truth for what every page renders, what every button does, and which API it calls.

---

## Current State of the Live Site

Before the plan, here's what exists at sequels.diy right now:

| Page | Status | Notes |
|---|---|---|
| `/` Home | ✅ Exists | Hero, plugin logo grid, "Start Creating" CTA |
| `/create` | ✅ Exists | Builder shell — "Choose Trigger", "Choose Action", "Create Workflow" buttons are present but appear non-functional (no plugin picker opens) |
| `/explore` | ❌ Missing | No browse/public workflows page exists |
| `/login` | ❌ Missing | No login page |
| `/signup` | ❌ Missing | No signup/register page |
| `/dashboard` | ❌ Missing | No authenticated dashboard |
| `/workflows/:id` | ❌ Missing | No workflow detail page |

The site is a Next.js app. The navbar currently shows no Login/Signup links. The `/create` page has the correct layout shell but is not wired to any API.

---

## Auth Architecture

**Token storage:** Store `access_token` in memory (React context / Zustand) and `refresh_token` in `localStorage`. Never store `access_token` in localStorage — it's short-lived and should live only in memory.

**On app load:** Check `localStorage` for a refresh token → call `POST /api/v1/auth/token/refresh` → if valid, set access token in memory and mark user as authenticated. If invalid/missing, user is anonymous.

**Auth header:** Every protected API call sends `Authorization: Bearer {access_token}`.

**Token refresh:** Wrap the API client (axios/fetch) with an interceptor. On 401 response, try to refresh once. If refresh also fails, clear state and redirect to `/login`.

**Pending workflow (anon → signup flow):** Before redirecting an anon user to `/signup`, save their builder state to `sessionStorage` under the key `pendingWorkflow`. After successful registration/login, check for this key, auto-fire `POST /api/v1/workflows/`, clear the key, then redirect to `/dashboard`.

---

## All Pages — Quick Reference

| Route | Access | Purpose |
|---|---|---|
| `/` | Public | Landing page |
| `/explore` | Public | Browse all public workflows |
| `/workflows/:id` | Public | Single workflow detail |
| `/workflows/:id/setup` | Auth only | Configure and subscribe to a workflow |
| `/create` | Public | Workflow builder |
| `/login` | Anon only | Login form |
| `/signup` | Anon only | Register form |
| `/dashboard` | Auth only | User's subscriptions + toggle |
| `/connections` | Auth only | Manage connected plugin accounts |

---

## Page Specs

---

### `/` — Home

**Access:** Public. No redirect logic needed.

**On page load:**
```
GET /api/v1/plugins/providers
```
Used to render the "Available Plugins" logo grid. Response is an array of `PluginProviderRead`. Cache aggressively (this data rarely changes).

**Navbar (anon):** Logo · `Explore` link · `Login` button · `Sign Up` button

**Navbar (logged-in):** Logo · `Explore` link · `Dashboard` link · `Create` button · User avatar/email + logout

**Page elements:**
- Hero: headline, subheadline, `Start Creating` → links to `/create`
- Plugin logo grid: rendered from `GET /api/v1/plugins/providers` response
- Secondary CTA: `Browse Workflows` → links to `/explore`

---

### `/explore` — Browse Public Workflows

**Access:** Public.

**On page load:**
```
GET /api/v1/workflows/explore?page=1&limit=20
```

**Filter interactions (each triggers a new fetch):**
```
GET /api/v1/workflows/explore?page=1&trigger_provider={id}
GET /api/v1/workflows/explore?page=1&action_provider={id}
GET /api/v1/workflows/explore?page=1&q={search_term}
GET /api/v1/workflows/explore?page=1&sort=popular   (default)
GET /api/v1/workflows/explore?page=1&sort=newest
```

Also needed for the filter dropdowns (to populate provider options):
```
GET /api/v1/plugins/providers
```
(can reuse cached result from Home)

**Page elements:**
- Search bar: text input, `onChange` debounced → refetch with `?q=`
- Provider filter dropdowns: "Filter by Trigger", "Filter by Action" → populated from providers list
- Sort toggle: Popular / Newest
- Workflow cards grid: each card shows workflow name, trigger provider icon, action provider icon, subscriber count
- Each card → links to `/workflows/:id`
- Pagination or "Load more" button → fetches next page

**Buttons:**

| Button | Action |
|---|---|
| Workflow card (click anywhere) | Navigate to `/workflows/:id` |
| `Use this workflow` (on card, optional) | If anon → redirect to `/login?next=/workflows/:id`. If auth → `POST /api/v1/me/subscriptions` with `{ workflow_id }` |
| `Load more` / pagination | `GET /api/v1/workflows/explore?page=N` |

---

### `/workflows/:id` — Workflow Detail

**Access:** Public.

**On page load:**
```
GET /api/v1/workflows/{workflow_id}
```
Returns `WorkflowDetailedRead` — includes trigger, action, subscriber count, creator user_id.

Also fetch providers to resolve provider names/icons from the trigger/action provider IDs:
```
GET /api/v1/plugins/providers  (cached)
```

**Page elements:**
- Workflow name + description
- Trigger block: provider icon, trigger name, config summary (read-only)
- Action block: provider icon, action name, config summary (read-only)
- Subscriber count
- `Use this workflow` button (primary CTA)
- `Back to Explore` link

**Buttons:**

| Button | Condition | Action |
|---|---|---|
| `Use this workflow` | Anon | Redirect to `/login?next=/workflows/:id/setup` — after login, redirect to setup page |
| `Use this workflow` | Auth, not yet subscribed | Redirect to `/workflows/:id/setup` to gather config and auth |
| `Use this workflow` | Auth, already subscribed | Show "Already in your dashboard" — link to `/dashboard` |

> To check if already subscribed: compare `workflow.subscribers` (array of user UUIDs in `WorkflowDetailedRead`) against the current user's ID stored in auth state.

---

### `/workflows/:id/setup` — Configure Subscription

**Access:** Auth only. Redirects to `/login?next=/workflows/:id/setup` if not authenticated.

**Purpose:** Collect auth connections and user-specific plugin configurations before subscribing to a workflow created by someone else.

**On page load:**
```
GET /api/v1/workflows/{workflow_id}
GET /api/v1/plugins/accounts
```

Also fetch the required capabilities to get their `config_fields` for rendering forms:
```
GET /api/v1/triggers?provider_id={trigger_provider_id}
GET /api/v1/actions?provider_id={action_provider_id}
```

**Step 1: Check Connections**
- Compare the `workflow` trigger and action providers against the user's connected `accounts`.
- If an account is missing, prompt user to `Connect {Provider}` (OAuth flow → returns to this page).

**Step 2: Collect Config Fields**
- Display the config form for the Trigger and the Action (using `config_fields` from their respective capabilities).
- Pre-fill values from the creator's default workflow if desired, but allow the subscriber to provide their own required data (e.g. Playlist ID, Spreadsheet ID).

**Submit:**
```
POST /api/v1/workflows/{workflow_id}/subscribe
Body: { "trigger_config": {...}, "action_config": {...} }
```
On success → redirect to `/dashboard`.

---

### `/create` — Workflow Builder

**Access:** Public. Anon users can build freely; save is gated.

**On page load:**
```
GET /api/v1/plugins/providers
```
Fetch providers upfront. For triggers and actions, they can be fetched dynamically via:
```
GET /api/v1/triggers?provider_id={id}
GET /api/v1/actions?provider_id={id}
```
when a user selects a provider, OR fetched fully without query parameters and filtered client-side (since they include a `provider` field).

If user is authenticated, also fetch:
```
GET /api/v1/plugins/accounts
```
To show which providers are already connected (show a green "Connected" badge in the picker).

**Builder state (local only until Save):**
```js
{
  trigger: {
    name: "",                 // name from PluginCapabilityRead
    plugin_provider_id: null, // UUID from PluginProviderRead
    capability_key: null,     // unique_key from PluginCapabilityRead
    config: {}                // filled from config_fields form
  },
  action: {
    name: "",
    plugin_provider_id: null,
    capability_key: null,
    config: {}
  },
  name: "",                   // auto-generated or user-typed
  description: ""             // optional user description
}
```
This lives in React state / Zustand. Nothing hits the backend until the Save button.

**Step 1 — Choose Trigger:**
- Click "Choose Trigger" → open provider picker modal/panel
- Providers list filtered to `supports_trigger: true`
- User selects a provider → show triggers for that provider (using `GET /api/v1/triggers?provider_id={id}`)
- User selects a trigger → show config form rendered from `config_fields` array on the `PluginCapabilityRead` object
- User fills config → state updated locally
- **Ingredients (Outputs):** Note the `outputs` array returned in `PluginCapabilityRead`. These are dynamic variables (e.g., video title, description) the user can map to the action next.

**Step 2 — Choose Action:**
- Same flow as trigger, but filtered to `supports_action: true` providers
- Uses `GET /api/v1/actions?provider_id={id}` results
- When filling the action's config form, allow the user to insert **Ingredients** (dynamic variables) from the trigger's `outputs` into the fields. They should be formatted using the `{{trigger.payload.FIELD_NAME}}` format (e.g., `{{trigger.payload.title}}` or `{{trigger.payload.TrackName}}` depending on the available output keys).

**Step 3 — Name (optional):**
- Auto-generate: `"{trigger.name} → {action.name}"`
- Allow user to edit inline

**Save — `Create Workflow` button:**

| Condition | Behaviour |
|---|---|
| Trigger or Action not yet chosen | Button disabled / show inline validation |
| Anon user | Save state to `sessionStorage.pendingWorkflow` → redirect to `/signup` |
| Auth user, provider NOT connected | Show "Connect {ProviderName} first" modal → trigger OAuth flow (see Connections) → on return, resume save |
| Auth user, providers connected | `POST /api/v1/workflows/` → on success → redirect to `/dashboard` |

**POST /api/v1/workflows/ body:**
```json
{
  "name": "YouTube Likes to Spotify Playlist",
  "description": "Automatically adds liked YouTube videos to a specific Spotify playlist.",
  "is_enabled": false,
  "is_public": true,
  "trigger": {
    "name": "YouTube Trigger",
    "plugin_provider_id": "YOUTUBE_PROVIDER_UUID",
    "capability_key": "youtube_new_liked_video",
    "config": {}
  },
  "action": {
    "name": "Spotify Action",
    "plugin_provider_id": "SPOTIFY_PROVIDER_UUID",
    "capability_key": "spotify_add_to_playlist",
    "config": {
      "playlist_id": "SPOTIFY_PLAYLIST_ID",
      "track_query": "{{trigger.payload.title}}"
    }
  }
}
```

**Buttons:**

| Button | Action |
|---|---|
| `Choose Trigger` | Open trigger picker panel |
| `Choose Action` | Open action picker panel |
| Provider card (in picker) | Select provider, show its triggers/actions |
| Trigger/Action item (in picker) | Select it, show config form |
| `Back` (in picker) | Return to provider list |
| `Confirm` / `Done` (in picker) | Close picker, update builder state |
| `Create Workflow` | See table above |
| `Connect {Provider}` (in auth modal) | Start OAuth flow → `GET /api/v1/plugins/accounts/{provider_id}/oauth/auth-url` |

---

### `/login` — Login

**Access:** Anon only. Redirect to `/dashboard` if already authenticated.

**Form fields:** Email, Password

**On submit:**
```
POST /api/v1/auth/login
Body: { "email": "...", "password": "..." }
```
On success: store tokens, check `sessionStorage.pendingWorkflow`, auto-save if present, redirect to `?next=` param or `/dashboard`.

**Also render:** `Continue with Google` button → links to `GET /api/v1/auth/google/login` (browser redirect, not fetch)

**Links:** "Don't have an account? Sign up" → `/signup`

---

### `/signup` — Register

**Access:** Anon only. Redirect to `/dashboard` if already authenticated.

**Form fields:** Email, Password (no name field — `UserCreate` schema only has email + password)

**On submit:**
```
POST /api/v1/auth/register
Body: { "email": "...", "password": "..." }
```
On success: store tokens, check `sessionStorage.pendingWorkflow`, auto-save if present, redirect to `/dashboard`.

**Also render:** `Continue with Google` button → links to `GET /api/v1/auth/google/login`

**Links:** "Already have an account? Log in" → `/login`

---

### `/dashboard` — User Dashboard

**Access:** Auth only. Redirect to `/login?next=/dashboard` if not authenticated.

**On page load:**
```
GET /api/v1/me/subscriptions
```
Returns array of `SubscriptionRead`, each with a nested `workflow: WorkflowRead`.

**Page elements:**
- "My Workflows" heading
- Empty state: "You haven't added any workflows yet. Browse workflows →" (link to `/explore`)
- Subscription cards: each shows workflow name, trigger/action provider icons, enabled/disabled toggle, actions menu
- `+ Create a workflow` button → `/create`

**Manual Execution (Test run):**
```
POST /api/v1/workflows/{workflow_id}/execute
```
Allow the user to manually trigger a test run of their active workflows from the actions menu.

**Toggle (enable/disable):**
```
PATCH /api/v1/me/subscriptions/{subscription_id}
Body: { "is_enabled": true | false }
```
Optimistic update: flip the toggle immediately in UI, revert if API returns error.

**Delete / Remove from dashboard:**
```
DELETE /api/v1/me/subscriptions/{subscription_id}
```
Show confirmation prompt first. On confirm, remove card from UI.

**For subscriptions the user CREATED (workflow.user_id === current user id):**
Show an additional `Edit` button → navigate to `/create?edit={workflow_id}` (edit mode, prefills builder state from `WorkflowDetailedRead`)

**Buttons:**

| Button | Action |
|---|---|
| `+ Create a workflow` | Navigate to `/create` |
| `Browse workflows` (empty state) | Navigate to `/explore` |
| Enable/disable toggle | `PATCH /api/v1/me/subscriptions/{id}` |
| `Execute / Test Run` | `POST /api/v1/workflows/{workflow_id}/execute` |
| `Edit` (own workflows only) | Navigate to `/create?edit={workflow_id}` → prefill builder |
| `Remove` / `Unsubscribe` | Confirm dialog → `DELETE /api/v1/me/subscriptions/{id}` or `POST /api/v1/workflows/{workflow_id}/unsubscribe` |
| `Manage connections` | Navigate to `/connections` |

---

### `/connections` — Plugin Connections

**Access:** Auth only.

**On page load:**
```
GET /api/v1/plugins/providers
GET /api/v1/plugins/accounts
```
Cross-reference providers list with connected accounts to show connected/disconnected state per provider.

**Page elements:**
- List of all providers that `requires_oauth: true` (auth_types includes "oauth")
- Each row: provider icon, provider name, status badge (Connected / Not connected), action button

**Buttons:**

| Button | Condition | Action |
|---|---|---|
| `Connect` | Not connected | `GET /api/v1/plugins/accounts/{provider_id}/oauth/auth-url` → open returned URL in browser (redirect or popup). Backend callback stores tokens. User lands back at `/connections?connected={provider_name}` |
| `Disconnect` | Connected | `DELETE /api/v1/plugins/accounts/{provider_id}` → update UI |
| `Add via API key` | Provider supports api-key auth | Open modal with text input → `POST /api/v1/plugins/accounts/api-key` `{ provider_id, api_key }` |

> Note: The OAuth callback URL is handled entirely by the backend (`GET /api/v1/plugins/accounts/{provider_id}/oauth/callback`). The frontend only needs to redirect to the `auth_url` returned by the auth-url endpoint and handle the landing URL after the redirect back.

---

## User Journey Maps

### Anonymous User

```
/ (Home)
├── Sees plugin grid (GET /api/v1/plugins/providers)
├── Clicks "Start Creating" ──────────────────────────────────┐
│                                                             │
└── /explore                                                  ▼
    ├── Sees public workflows (GET /api/v1/workflows/explore) /create
    ├── Clicks workflow card                                   ├── Picks trigger (local filter of GET /api/v1/triggers)
    │                                                         ├── Picks action (local filter of GET /api/v1/actions)
    └── /workflows/:id                                        ├── Fills config fields (local state only)
        ├── Reads detail (GET /api/v1/workflows/{id})         │
        └── Clicks "Use this workflow"                        └── Clicks "Create Workflow"
                │                                                          │
                └─────────────────────────────────────────────────────────┘
                                        │
                              sessionStorage.pendingWorkflow = {...}
                                        │
                                        ▼
                                   /signup
                              POST /api/v1/auth/register
                                        │
                              pendingWorkflow found?
                              ├── YES → POST /api/v1/workflows/ → /dashboard
                              └── NO  → /dashboard
```

### Logged-in User

```
/dashboard
├── On load: GET /api/v1/me/subscriptions
├── Toggle: PATCH /api/v1/me/subscriptions/{id}
├── Remove: DELETE /api/v1/me/subscriptions/{id}
├── Edit (own): /create?edit={id} → GET /api/v1/workflows/{id} to prefill
│
├── → /explore
│   ├── GET /api/v1/workflows/explore
│   └── "Use this workflow" → POST /api/v1/me/subscriptions { workflow_id }
│
└── → /create
    ├── GET /api/v1/plugins/providers
    ├── GET /api/v1/triggers
    ├── GET /api/v1/actions
    ├── GET /api/v1/plugins/accounts  (check connected providers)
    │
    ├── Provider not connected?
    │   └── GET /api/v1/plugins/accounts/{provider_id}/oauth/auth-url
    │       └── Redirect to OAuth → callback → return to /create
    │
    └── "Create Workflow" → POST /api/v1/workflows/ → /dashboard
```

---

## Global Components

### Navbar

Rendered on every page. Reads from auth state (no API call needed — derived from token presence).

| Element | Anon | Logged-in |
|---|---|---|
| Logo | `/` link | `/` link |
| `Explore` | Visible | Visible |
| `Dashboard` | Hidden | Visible |
| `Create` | Visible (links to `/create`) | Visible (links to `/create`) |
| `Login` | Visible | Hidden |
| `Sign Up` | Visible | Hidden |
| User menu (avatar/email) | Hidden | Visible |
| User menu → `Manage Connections` | — | Links to `/connections` |
| User menu → `Logout` | — | `POST /api/v1/auth/logout { refresh_token }` → clear all tokens → redirect to `/` |

### Auth Guard (HOC / middleware)

Pages that require auth (`/dashboard`, `/connections`) should redirect to `/login?next={current_path}` if no valid token exists. Apply at the route level using Next.js middleware or a client-side wrapper component.

Pages that are anon-only (`/login`, `/signup`) should redirect to `/dashboard` if already authenticated.

### API Error Handling

| HTTP Status | Behaviour |
|---|---|
| `401 Unauthorized` | Try token refresh once → if still 401, clear auth state → redirect to `/login` |
| `403 Forbidden` | Show "You don't have permission" toast |
| `404 Not Found` | Show inline empty state or redirect to 404 page |
| `422 Validation Error` | Show field-level error messages from response body |
| `500` | Show generic error toast "Something went wrong, try again" |

---

## API Call Reference by Page

| Page | API Calls |
|---|---|
| `/` | `GET /api/v1/plugins/providers` |
| `/explore` | `GET /api/v1/workflows/explore` · `GET /api/v1/plugins/providers` (filter UI) |
| `/workflows/:id` | `GET /api/v1/workflows/{id}` · `GET /api/v1/plugins/providers` (icons) |
| `/create` (anon) | `GET /api/v1/plugins/providers` · `GET /api/v1/triggers?provider_id={id}` · `GET /api/v1/actions?provider_id={id}` |
| `/create` (auth) | above + `GET /api/v1/plugins/accounts` + `POST /api/v1/workflows/` |
| `/create` (edit mode) | above + `GET /api/v1/workflows/{id}` (prefill) + `PUT /api/v1/workflows/{id}` (save) |
| `/login` | `POST /api/v1/auth/login` |
| `/signup` | `POST /api/v1/auth/register` |
| `/dashboard` | `GET /api/v1/me/subscriptions` · `PATCH /api/v1/me/subscriptions/{id}` · `DELETE /api/v1/me/subscriptions/{id}` · `POST /api/v1/workflows/{id}/execute` |
| `/connections` | `GET /api/v1/plugins/providers` · `GET /api/v1/plugins/accounts` · `GET /api/v1/plugins/accounts/{id}/oauth/auth-url` · `DELETE /api/v1/plugins/accounts/{id}` · `POST /api/v1/plugins/accounts/api-key` |
| App init (any page) | `POST /api/v1/auth/token/refresh` (if refresh token in localStorage) followed by `GET /api/v1/me` to load user profile |
| Logout (navbar) | `POST /api/v1/auth/logout` |
| *(Additional)* | `POST /api/v1/workflows/{id}/subscribe` / `unsubscribe` can be used for workflows requiring customized event-level configs (IFTTT-style). |

---

## Key Data Mappings

### Resolving provider icons in workflow cards

The `WorkflowRead` object has `trigger` and `action` as opaque JSON objects. They will contain a `provider_id` (UUID). To show the provider icon/name, cross-reference against the cached `GET /api/v1/plugins/providers` list by `id`. Keep this list in a global store (Zustand / React context) so every component can resolve it without re-fetching.

### WorkflowStatus vs is_enabled

`WorkflowStatus` has three values: `draft`, `active`, `paused`. This is the system-level execution state. `is_enabled` on a **subscription** is the user's personal on/off toggle. These are separate. The dashboard toggle maps to `PATCH /api/v1/me/subscriptions/{id}` — it does not call the workflow toggle endpoint.

The workflow-level toggle (`PATCH /api/v1/workflows/{id}/toggle?enable=true|false`) is only used when a user edits/disables their own created workflow entirely, which is a different action from the subscription toggle.

### Identifying "own" workflows in dashboard

`SubscriptionRead` contains `workflow: WorkflowRead`, and `WorkflowRead` contains `user_id`. Compare `workflow.user_id === currentUser.id` to know whether to show the `Edit` button. The current user's ID is obtained from decoding the JWT or storing it in auth state on login (returned in `UserRead` from register/login).

---

## Not in scope (v1)

- Workflow run history / logs
- Notifications / email alerts
- Workflow versioning UI (backend has `active_version_id` but no frontend flow needed yet)
- Public user profiles
- Admin panel for managing providers
