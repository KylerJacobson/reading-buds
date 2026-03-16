# Pages

## Routing

The app uses `HashRouter` from React Router. `HashRouter` is required because Tauri serves the frontend via a custom protocol with no server-side routing — hash-based URLs (`/#/settings`) work without a server.

| Route | Page |
|---|---|
| `/` | `HomePage` |
| `/entry/new` | `EntryPage` (create mode) |
| `/entry/:id` | `EntryPage` (view/edit mode) |
| `/settings` | `SettingsPage` |
| `/clubs` | `ClubsPage` |
| `/clubs/new` | `ClubPage` (create mode) |
| `/clubs/:id` | `ClubPage` (view/edit mode) |
| `/members` | `MembersPage` |
| `/members/new` | `MemberPage` (create mode) |
| `/members/:id` | `MemberPage` (view/edit mode) |

---

## HomePage

**Path:** `src/pages/HomePage.tsx`

The main landing screen. Shows the user's library of reading entries and provides a way to add new ones.

### Responsibilities

- Renders a scrollable grid of `BookCard` components
- Shows a total entry count beneath the page heading
- Provides a fixed Floating Action Button (FAB) in the bottom-right corner to initiate entry creation

### State

| State | Type | Description |
|---|---|---|
| `entries` | `ReadingEntry[]` | List of reading entries to display |

### Navigation

| Action | Destination |
|---|---|
| Tap a `BookCard` | `/entry/:id` |
| Tap the FAB (`+`) | `/entry/new` |
| Tap the clubs icon | `/clubs` |
| Tap the settings icon | `/settings` |

### Layout notes

- An `AppBar` across the top holds the page title (left), clubs icon, and settings icon (right).
- `Container maxWidth="sm"` keeps content readable on both desktop and mobile.
- The FAB uses `position: fixed` so it stays anchored to the viewport regardless of scroll position.
- Bottom padding (`pb: 10`) prevents the last card from being hidden behind the FAB on mobile.

---

## SettingsPage

**Path:** `src/pages/SettingsPage.tsx`

Lets the user manage their profile and API keys for each supported AI provider.

### Sections

**Profile** — First name and last name text fields. Saves on `blur` (stub: logs to console).

**API Keys** — One `ApiKeyField` per provider (Anthropic, Google, OpenAI). Keys are never displayed after saving — only a "Key saved" status chip is shown. See `ApiKeyField` in the component reference.

### State

| State | Type | Description |
|---|---|---|
| `user` | `User` | First and last name |
| `keyStatus` | `ApiKeyStatus` | Whether a key is saved per provider (boolean, not the key value) |

### Data

- Profile is loaded from SQLite on mount via `getUser()`.
- `handleProfileSave()` calls `updateUser()` on every field blur.
- API key handlers remain stubbed pending the Keychain implementation.

---

## EntryPage

**Path:** `src/pages/EntryPage.tsx`

Full-screen detail view for a single reading entry (book or article). Handles both creating new entries and viewing/editing existing ones.

### Routes

| URL | Behaviour |
|---|---|
| `/entry/new` | Starts in **edit mode** with blank fields |
| `/entry/:id` | Starts in **view mode** with the matched entry |

### Modes

**View mode** — read-only display of the entry. Layout top-to-bottom:
1. Type chip, title, author
2. Reading club chip (if an associated club is set)
3. *(Articles only)* Collapsible accordion showing the raw article text
4. "My Analysis" section showing the user's written analysis

**Edit mode** — all fields become inputs. Layout top-to-bottom:
1. Type toggle (Book / Article), title field, author field
2. *(Articles only)* URL field
3. Reading Club selector (dropdown — "None" or any club name)
4. *(Articles only)* Collapsible accordion containing a multiline textarea for the article text
5. Multiline textarea for the analysis

The AppBar save icon is disabled until both title and author are non-empty. Saving returns to view mode.

### State

| State | Type | Description |
|---|---|---|
| `mode` | `"view" \| "edit"` | Current display mode |
| `draft` | `ReadingEntry \| CreateEntryInput` | Working copy of the entry being viewed or edited |
| `clubs` | `Club[]` | All clubs, loaded unconditionally for the club selector |

### Data

- Existing entries are loaded from SQLite on mount via `getEntry(id)`.
- Clubs are loaded in a separate `useEffect` (always runs, for both new and existing entries).
- `handleSave()` calls `createEntry()` for new entries (then navigates to the new `/entry/:id`) or `updateEntry()` for edits.

---

## ClubsPage

**Path:** `src/pages/ClubsPage.tsx`

Lists all reading clubs. Provides navigation to the `ClubPage` for each club and a FAB to create a new one. Also exposes a toolbar button to navigate to `MembersPage`.

### State

| State | Type | Description |
|---|---|---|
| `clubs` | `Club[]` | All clubs loaded from the database |
| `loading` | `boolean` | Loading indicator while fetching |
| `error` | `string \| null` | Error message if fetch fails |

### Navigation

| Action | Destination |
|---|---|
| Tap a club card | `/clubs/:id` |
| Tap the FAB (`+`) | `/clubs/new` |
| Tap the members icon | `/members` |
| Tap back | previous route |

---

## ClubPage

**Path:** `src/pages/ClubPage.tsx`

Detail view for a single reading club. Handles create (`/clubs/new`) and view/edit (`/clubs/:id`) modes.

### Modes

**View mode** — shows club name and member list. Each member shows their name (linked to `MemberPage`) and model chip.

**Edit mode** — club name becomes a text input. The save icon is disabled when the name is empty.

Members can be added (from the global members list) or removed via icon buttons. The "Add member" dialog filters out members already in the club.

### State

| State | Type | Description |
|---|---|---|
| `mode` | `"view" \| "edit"` | Current display mode |
| `club` | `ClubWithMembers \| null` | Loaded club with its member list |
| `name` | `string` | Editable club name field |
| `allMembers` | `Member[]` | Available members shown in the add-member dialog |
| `confirmDeleteOpen` | `boolean` | Controls the delete confirmation dialog |
| `addMemberOpen` | `boolean` | Controls the add-member dialog |

### Navigation

| Action | Destination |
|---|---|
| Tap a member name | `/members/:id` |
| Tap back | previous route |
| After delete | `/clubs` |
| After create save | `/clubs/:newId` (replaces history) |

---

## MembersPage

**Path:** `src/pages/MembersPage.tsx`

Lists all global members (LLM personas). Each card shows the member's name and assigned model. Provides a FAB to create a new member.

### State

| State | Type | Description |
|---|---|---|
| `members` | `Member[]` | All members loaded from the database |
| `loading` | `boolean` | Loading indicator while fetching |
| `error` | `string \| null` | Error message if fetch fails |

### Navigation

| Action | Destination |
|---|---|
| Tap a member card | `/members/:id` |
| Tap the FAB (`+`) | `/members/new` |
| Tap back | previous route |

---

## MemberPage

**Path:** `src/pages/MemberPage.tsx`

Detail view for a single club member (LLM persona). Handles create (`/members/new`) and view/edit (`/members/:id`) modes.

### Modes

**View mode** — shows name, assigned model label (via `modelLabel()` with raw ID fallback), and bio (system prompt).

**Edit mode** — name text field, live model `Select` grouped by provider, and multiline bio field.

### Model selector

On mount the page calls `listAnthropicModels()` (and future provider functions) in parallel with the member fetch. Models are grouped into `ProviderModels[]` — only providers that returned at least one model are included. If all providers return empty arrays (no valid API keys), the `Select` shows a single disabled item: _"Input API keys to view available models"_.

### State

| State | Type | Description |
|---|---|---|
| `mode` | `"view" \| "edit"` | Current display mode |
| `member` | `Member \| null` | Loaded member data |
| `draft` | `{ name, bio, model }` | Editable copy of member fields |
| `availableModels` | `ProviderModels[]` | Live model groups from provider APIs |
| `loading` | `boolean` | True until both member and models are fetched |
| `confirmDeleteOpen` | `boolean` | Controls the delete confirmation dialog |

### Data

- All data (member + models) is fetched in a single `Promise.all` on mount so there is only one loading state.
- `loading` starts as `true` for both new and existing members since models always need to be fetched.

### Navigation

| Action | Destination |
|---|---|
| Tap back | previous route |
| After delete | `/members` (replaces history) |
| After create save | `/members/:newId` (replaces history) |
