# Troubleshooting

## Build Failures

### Stale Cargo build cache after moving/renaming the project directory

**Symptom:**

`pnpm tauri dev` fails with an error like:

```
failed to read plugin permissions: failed to read file '/old/path/to/reading-buddy/src-tauri/target/debug/build/...': No such file or directory (os error 2)
```

The path in the error points to the old location of the project, not the current one.

**Cause:**

Cargo caches build artifacts in `src-tauri/target/` that contain absolute paths baked in at compile time. When the project directory is moved or its parent folder is renamed/deleted, those cached paths become invalid and the build fails.

**Fix:**

Clean the Cargo build cache and let it rebuild from scratch:

```bash
cargo clean --manifest-path src-tauri/Cargo.toml
```

Then re-run `pnpm tauri dev`. The full recompile will take longer than usual but will succeed.

---

## Database

### `cannot commit - no transaction is active`

**Symptom:**

A database write throws: `error returned from database: (code: 1) cannot commit - no transaction is active`

**Cause:**

`tauri-plugin-sql` uses a connection pool. Each call to `db.execute()` may acquire a different connection, so `BEGIN`, the statements, and `COMMIT` do not share the same connection context — the transaction is immediately lost after the `BEGIN` call.

**Fix:**

Do not use manual `BEGIN` / `COMMIT` / `ROLLBACK` statements via separate `execute` calls. Issue each SQL statement directly and let SQLite auto-commit per statement. For multi-statement operations, accept that they are not atomic at the JS layer.
