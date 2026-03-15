# Component Reference

## BookCard

**Path:** `src/components/BookCard/BookCard.tsx`

Displays a single reading entry (book or article) as a Material UI `Card`.

### Props

| Prop | Type | Required | Description |
|---|---|---|---|
| `entry` | `ReadingEntry` | Yes | The reading entry to display |
| `onClick` | `(entry: ReadingEntry) => void` | No | Called when the card is tapped/clicked |

### Displays

- Entry type icon (book or article) + colour-coded chip
- Title and author (both truncate with ellipsis on overflow)

### Usage

```tsx
import { BookCard } from "../components/BookCard";

<BookCard entry={myEntry} onClick={(e) => console.log(e.id)} />
```

---

## ApiKeyField

**Path:** `src/components/ApiKeyField/ApiKeyField.tsx`

A single API key row used in `SettingsPage`. Handles the show/hide toggle and save/clear flow.

### Props

| Prop | Type | Required | Description |
|---|---|---|---|
| `provider` | `ApiKeyProvider` | Yes | Which provider this field manages |
| `label` | `string` | Yes | Display name shown above the field |
| `isSaved` | `boolean` | Yes | Whether a key is currently stored in the Keychain |
| `onSave` | `(provider, key) => void` | Yes | Called with the raw key when the user clicks Save |
| `onClear` | `(provider) => void` | Yes | Called when the user clicks Clear |

### Behaviour

- When `isSaved` is `false`: renders a password input with a visibility toggle and a Save button.
- When `isSaved` is `true`: renders a "Key saved" chip with Replace and Clear buttons. The key value is **never fetched or displayed**.
- Replace puts the field back into input mode without clearing the saved key until Save is confirmed.

---

## Data Types

**Path:** `src/types/entry.ts`

### `ReadingEntry`

Entries represent works the user has **already finished reading**.

| Field | Type | Description |
|---|---|---|
| `id` | `string` | Unique identifier |
| `type` | `"book" \| "article"` | Entry category |
| `title` | `string` | Title of the work |
| `author` | `string` | Author name(s) |

### `User`

| Field | Type | Description |
|---|---|---|
| `firstName` | `string` | User's first name |
| `lastName` | `string` | User's last name |

### `ApiKeyProvider`

Union type: `"anthropic" | "google" | "openai"`

### `ApiKeyStatus`

`Record<ApiKeyProvider, boolean>` — tracks whether a key is saved per provider. Never holds the key value itself.
