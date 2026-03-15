# Pages

## Routing

The app uses `HashRouter` from React Router. `HashRouter` is required because Tauri serves the frontend via a custom protocol with no server-side routing — hash-based URLs (`/#/settings`) work without a server.

| Route | Page |
|---|---|
| `/` | `HomePage` |
| `/settings` | `SettingsPage` |

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

### Stub Handlers (to be implemented)

| Handler | Triggered by | Next step |
|---|---|---|
| `handleEntryClick(entry)` | Tapping a `BookCard` | Navigate to entry detail page |
| `handleAddEntry()` | Tapping the FAB (`+`) | Open a create-entry dialog or navigate to a create page |

### Layout notes

- An `AppBar` across the top holds the page title (left) and settings icon (right).
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

### Stub Handlers (to be implemented)

| Handler | Next step |
|---|---|
| `handleProfileSave()` | Write to SQLite via `src/lib/db/user.ts` |
| `handleApiKeySave(provider, key)` | `invoke("set_api_key", { provider, key })` |
| `handleApiKeyClear(provider)` | `invoke("delete_api_key", { provider })` |
