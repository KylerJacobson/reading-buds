# Persistence Architecture

## Strategy: SQLite + OS Keychain

Data is split by sensitivity into two storage layers.

| Data | Storage | Plugin / Crate |
|---|---|---|
| User profile, reading entries, articles, book reviews | SQLite | `@tauri-apps/plugin-sql` |
| API keys (Anthropic, Google, OpenAI) | OS Keychain | Rust `keyring` crate |

### Why not SQLCipher?

SQLCipher encrypts the whole SQLite database with a key that must itself be stored somewhere. For this app the content (articles, reviews) is not sensitive enough to justify the key-management overhead. API keys — the only truly sensitive data — belong in the OS Keychain regardless, making SQLCipher redundant.

---

## SQLite Layer

**Plugin:** [`@tauri-apps/plugin-sql`](https://github.com/tauri-apps/tauri-plugin-sql)

Callable from React via async functions. Supports migrations via numbered SQL files.

### Planned Schema

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
  created_at TEXT NOT NULL           -- ISO-8601 timestamp
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
```

### Migrations

Migrations live in `src-tauri/migrations/` as numbered SQL files (`0001_init.sql`, `0002_add_x.sql`, …). The plugin applies them in order on startup. Never edit a migration that has already been committed — add a new one instead.

### Data Access Pattern

All database access will go through dedicated TypeScript modules in `src/lib/db/`. Page components and hooks call these modules; they never call the plugin directly. This keeps SQL out of UI code and makes the data layer testable.

```
src/lib/db/
  client.ts       # initialises the DB connection and runs migrations
  user.ts         # getUser(), updateUser()
  entries.ts      # listEntries(), createEntry(), deleteEntry()
  reviews.ts      # getReview(), upsertReview()
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
| `createEntry(input)` | Inserts into `entries` + `entry_content` in a transaction |
| `updateEntry(entry)` | Updates all mutable fields in a transaction (`id` and `createdAt` are immutable) |
| `deleteEntry(id)` | Deletes the entry row; `entry_content` is removed via `ON DELETE CASCADE` |

IDs are generated with `uuid` (v4) on the frontend. Both tables are always written atomically — if either statement fails the transaction rolls back.
</thinking>
