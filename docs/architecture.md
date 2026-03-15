# Architecture Overview

## Tech Stack

| Layer | Technology |
|---|---|
| UI Framework | React 19 + TypeScript |
| UI Components | Material UI (MUI) v7 |
| Desktop Shell | Tauri v2 |
| Backend (native) | Rust |
| Build Tool | Vite |
| Package Manager | pnpm |

## Project Structure

```
src/
  main.tsx          # React entry point
  App.tsx           # Root component: MUI ThemeProvider + routing
  types/            # Shared TypeScript types
  components/       # Reusable UI components
  pages/            # Page-level components (one per route/screen)

src-tauri/          # Rust/Tauri backend
  src/
    main.rs         # Tauri app entry point
    lib.rs          # Tauri commands exposed to the frontend

docs/               # Project documentation (you are here)
```

## Frontend Conventions

- **Pages** live in `src/pages/` and are composed of components. They own state and data-fetching logic.
- **Components** live in `src/components/<ComponentName>/` with a barrel `index.ts` export. Keep components presentation-focused — pass data via props.
- **Types** shared across pages and components live in `src/types/`.
- MUI `ThemeProvider` is set up once in `App.tsx`. Customise the theme there; do not use inline `sx` for anything that should be part of the theme.

## Theming

The app uses MUI's `createTheme` with `colorSchemes: { dark: true }` which automatically respects the OS-level dark/light mode preference. Extend the theme in `App.tsx` as the design evolves.

## Tauri ↔ React Communication

Rust functions are exposed to the frontend as Tauri commands via `invoke()` from `@tauri-apps/api/core`. See the [Tauri docs](https://tauri.app/develop/calling-rust/) for details.
