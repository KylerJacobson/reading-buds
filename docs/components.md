# Component Reference

## BookCard

**Path:** `src/components/BookCard/BookCard.tsx`

Displays a single reading entry (book or article) as a Material UI `Card`.

### Props

| Prop | Type | Required | Description |
|---|---|---|---|
| `entry` | `ReadingEntry` | Yes | The reading entry to display |
| `onClick` | `(entry: ReadingEntry) => void` | No | Called when the card body is tapped/clicked |
| `onDelete` | `(entry: ReadingEntry) => void` | No | Called after the entry has been deleted from the DB |

### Displays

- Entry type icon (book or article) + colour-coded chip
- Title and author (both truncate with ellipsis on overflow)
- Delete icon button (separate tap target from the card body); opens a `ConfirmDialog` before deleting

### Usage

```tsx
import { BookCard } from "../components/BookCard";

<BookCard
  entry={myEntry}
  onClick={(e) => navigate(`/entry/${e.id}`)}
  onDelete={(e) => setEntries((prev) => prev.filter((x) => x.id !== e.id))}
/>
```

---

## ConfirmDialog

**Path:** `src/components/ConfirmDialog/ConfirmDialog.tsx`

Generic confirmation dialog for destructive or irreversible actions.

### Props

| Prop | Type | Required | Description |
|---|---|---|---|
| `open` | `boolean` | Yes | Controls dialog visibility |
| `title` | `string` | Yes | Dialog heading |
| `message` | `string` | Yes | Body text describing the action |
| `confirmLabel` | `string` | No | Label for the confirm button (default: `"Delete"`) |
| `onConfirm` | `() => void` | Yes | Called when the user confirms |
| `onCancel` | `() => void` | Yes | Called when the user cancels or closes |

---

## ApiKeyField

**Path:** `src/components/ApiKeyField/ApiKeyField.tsx`

A single API key row used in `SettingsPage`. Handles the show/hide toggle and save/clear flow.

### Props

| Prop | Type | Required | Description |
|---|---|---|---|
| `provider` | `ApiKeyProvider` | Yes | Which provider this field manages |
| `label` | `string` | Yes | Display name shown above the field |
| `savedValue` | `string \| null` | Yes | The currently stored key value, or `null` if none |
| `onSave` | `(provider, key) => void` | Yes | Called with the raw key when the user clicks Save |
| `onClear` | `(provider) => void` | Yes | Called when the user clicks Clear |

### Behaviour

- When `savedValue` is `null`: renders a password input with a visibility toggle and a Save button.
- When `savedValue` is set: renders the key in a read-only masked field with a visibility toggle, plus Replace and Clear buttons.
- Replace enters input mode without clearing the stored key until Save is confirmed.

---

## Data Types

**Path:** `src/types/entry.ts`

### `ReadingEntry`

Entries represent works the user has **already finished reading**.

| Field | Type | Required | Description |
|---|---|---|---|
| `id` | `string` | Yes | UUID, generated on create |
| `type` | `"book" \| "article"` | Yes | Entry category |
| `title` | `string` | Yes | Title of the work |
| `author` | `string` | Yes | Author name(s) |
| `createdAt` | `string` | Yes | ISO-8601 timestamp set on create |
| `analysis` | `string` | Yes | The user's written analysis or review |
| `articleContent` | `string` | No | Raw article text — only used when `type === "article"` |
| `url` | `string` | No | Source URL — only used when `type === "article"` |

### `User`

| Field | Type | Description |
|---|---|---|
| `firstName` | `string` | User's first name |
| `lastName` | `string` | User's last name |

### `ApiKeyProvider`

Union type: `"anthropic" | "google" | "openai"`

### `ApiKeyStatus`

`Record<ApiKeyProvider, boolean>` — tracks whether a key is saved per provider. Never holds the key value itself.
