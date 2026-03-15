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
