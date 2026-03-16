# Persistence Architecture

## Strategy: SQLite + OS Keychain

Data is split by sensitivity into two storage layers.

| Data | Storage | Plugin / Crate |
|---|---|---|
| User profile, reading entries, articles, book reviews, members, clubs | SQLite | `@tauri-apps/plugin-sql` |
| API keys (Anthropic, Google, OpenAI) | OS Keychain | Rust `keyring` crate |

### Why not SQLCipher?

SQLCipher encrypts the whole SQLite database with a key that must itself be stored somewhere. For this app the content (articles, reviews) is not sensitive enough to justify the key-management overhead. API keys — the only truly sensitive data — belong in the OS Keychain regardless, making SQLCipher redundant.

---

## SQLite Layer

**Plugin:** [`@tauri-apps/plugin-sql`](https://github.com/tauri-apps/tauri-plugin-sql)

Callable from React via async functions. Supports migrations via numbered SQL files.

### Schema

```sql
-- User profile (single row, id always 1)
CREATE TABLE IF NOT EXISTS user (
  id        INTEGER PRIMARY KEY,
  first_name TEXT NOT NULL DEFAULT '',
  last_name  TEXT NOT NULL DEFAULT ''
);

-- Reading entries
CREATE TABLE IF NOT EXISTS entries (
  id         TEXT PRIMARY KEY,       -- UUID
  type       TEXT NOT NULL,          -- 'book' | 'article'
  title      TEXT NOT NULL,
  author     TEXT NOT NULL,
  created_at TEXT NOT NULL,          -- ISO-8601 timestamp
  club_id    TEXT                    -- nullable FK to clubs.id
);

-- Long-form content attached to an entry.
-- article_content is only populated for article entries.
CREATE TABLE IF NOT EXISTS entry_content (
  id               TEXT PRIMARY KEY,  -- UUID, same as entry id (1:1)
  entry_id         TEXT NOT NULL REFERENCES entries(id) ON DELETE CASCADE,
  analysis         TEXT NOT NULL DEFAULT '',
  article_content  TEXT,              -- NULL for books
  url              TEXT,              -- source URL; NULL for books
  updated_at       TEXT NOT NULL      -- ISO-8601 timestamp
);

-- Global reusable LLM personas for reading club discussions
CREATE TABLE IF NOT EXISTS members (
  id         TEXT PRIMARY KEY,
  name       TEXT NOT NULL,
  bio        TEXT NOT NULL DEFAULT '',  -- system prompt / reading persona
  model      TEXT NOT NULL,             -- LLM model ID
  created_at TEXT NOT NULL
);

-- Reusable named groups of members
CREATE TABLE IF NOT EXISTS clubs (
  id         TEXT PRIMARY KEY,
  name       TEXT NOT NULL,
  created_at TEXT NOT NULL
);

-- Many-to-many join: clubs ↔ members
CREATE TABLE IF NOT EXISTS club_members (
  club_id   TEXT NOT NULL REFERENCES clubs(id) ON DELETE CASCADE,
  member_id TEXT NOT NULL REFERENCES members(id) ON DELETE CASCADE,
  PRIMARY KEY (club_id, member_id)
);
```

### Migrations

Migrations live in `src-tauri/migrations/` as numbered SQL files (`0001_init.sql`, `0002_reading_clubs.sql`, …). The plugin applies them in order on startup. Never edit a migration that has already been committed — add a new one instead.

### Data Access Pattern

All database access goes through dedicated TypeScript modules in `src/lib/db/`. Page components and hooks call these modules; they never call the plugin directly. This keeps SQL out of UI code and makes the data layer testable.

```
src/lib/db/
  client.ts       # initialises the DB connection
  user.ts         # getUser(), updateUser()
  entries.ts      # listEntries(), createEntry(), updateEntry(), deleteEntry(), setEntryClub()
  members.ts      # listMembers(), getMember(), createMember(), updateMember(), deleteMember()
  clubs.ts        # listClubs(), getClubWithMembers(), createClub(), updateClub(), deleteClub(),
                  #   addMemberToClub(), removeMemberFromClub()
```

---

## OS Keychain Layer

**Crate:** [`keyring`](https://crates.io/crates/keyring)

Writes to the macOS Keychain / iOS Secure Enclave. API keys never cross into the frontend — they are read, written, and deleted exclusively through Tauri commands in Rust.

### Tauri Commands

**File:** `src-tauri/src/keychain.rs`

| Command | Signature | Description |
|---|---|---|
| `set_api_key` | `(provider, key) → Result<()>` | Writes key to OS Keychain |
| `get_api_key` | `(provider) → Result<Option<String>>` | Returns the key value, or null if not set |
| `delete_api_key` | `(provider) → Result<()>` | Removes key; no-op if not found |

`provider` is one of: `"anthropic"`, `"google"`, `"openai"`. Keys are stored under service name `"reading-buddy"`.

> **Note:** `get_api_key` returns the full key value to the frontend so the Settings page can display it. Keys are sourced from the OS Keychain and are never written to SQLite or disk by this app.

### Frontend Module

**File:** `src/lib/keychain.ts`

Thin wrappers around `invoke()` — mirrors the `src/lib/db/` pattern. UI code imports from here, never calls `invoke` directly.

| Function | Description |
|---|---|
| `setApiKey(provider, key)` | Saves key to Keychain |
| `getApiKey(provider)` | Returns the key value or `null` |
| `deleteApiKey(provider)` | Removes key from Keychain |

---

## Implementation Order

1. ✅ Scaffold all UI screens and components
2. ✅ Add `@tauri-apps/plugin-sql`, write migrations, implement `src/lib/db/`
3. ✅ Add `keyring` crate, implement Tauri commands, wire settings page
4. ✅ Replace all stub data with live DB reads/writes
5. ✅ Add Reading Club data model (members, clubs, club_members, entries.club_id)

## Implemented Modules

### `src/lib/db/client.ts`

Opens and caches the SQLite connection. All other db modules go through `getDb()` — nothing calls the plugin directly.

### `src/lib/db/user.ts`

| Function | Description |
|---|---|
| `getUser()` | Returns the single user profile row (always present — seeded by migration) |
| `updateUser(user)` | Updates first and last name |

### `src/lib/db/entries.ts`

| Function | Description |
|---|---|
| `listEntries()` | All entries, newest-first, with content joined |
| `getEntry(id)` | Single entry by id, or `null` |
| `createEntry(input)` | Inserts into `entries` + `entry_content`; accepts optional `clubId` |
| `updateEntry(entry)` | Updates all mutable fields including `clubId` |
| `deleteEntry(id)` | Deletes the entry row; `entry_content` is removed via `ON DELETE CASCADE` |
| `setEntryClub(entryId, clubId)` | Associates or clears a reading club on an existing entry |

IDs are generated with `uuid` (v4) on the frontend.

### `src/lib/db/members.ts`

| Function | Description |
|---|---|
| `listMembers()` | All members ordered by name |
| `getMember(id)` | Single member by id, or `null` |
| `createMember(input)` | Inserts a new member row |
| `updateMember(member)` | Updates name, bio, and model |
| `deleteMember(id)` | Removes member from all clubs then deletes the row |

### `src/lib/db/clubs.ts`

| Function | Description |
|---|---|
| `listClubs()` | All clubs ordered by name |
| `getClubWithMembers(id)` | Single club with its member list, or `null` |
| `createClub(input)` | Inserts a new club row |
| `updateClub(club)` | Updates the club name |
| `deleteClub(id)` | Nullifies `entries.club_id`, removes join rows, deletes club |
| `addMemberToClub(clubId, memberId)` | Inserts a `club_members` row (idempotent via `INSERT OR IGNORE`) |
| `removeMemberFromClub(clubId, memberId)` | Deletes the `club_members` join row |
