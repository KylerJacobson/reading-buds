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

### Planned Tauri Commands

```rust
// src-tauri/src/keychain.rs (planned)

#[tauri::command]
async fn set_api_key(provider: String, key: String) -> Result<(), String>

#[tauri::command]
async fn get_api_key(provider: String) -> Result<Option<String>, String>

#[tauri::command]
async fn delete_api_key(provider: String) -> Result<(), String>
```

`provider` will be one of: `"anthropic"`, `"google"`, `"openai"`.

### Frontend Usage (planned)

The settings page will call `invoke("set_api_key", { provider, key })` on save and `invoke("delete_api_key", { provider })` on clear. It will **never** call `get_api_key` to display a stored key — the UI will only indicate whether a key is set (boolean), not reveal its value.

---

## Implementation Order

1. Scaffold all UI screens and components (current focus)
2. Add `@tauri-apps/plugin-sql`, write migrations, implement `src/lib/db/`
3. Add `keyring` crate, implement Tauri commands, wire settings page
4. Replace all stub data with live DB reads/writes
</thinking>
