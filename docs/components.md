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
| `clubId` | `string` | No | ID of the associated reading club, if any |

**Path:** `src/types/club.ts`

### `Member`

A global, reusable LLM persona used in reading club discussions.

| Field | Type | Description |
|---|---|---|
| `id` | `string` | UUID, generated on create |
| `name` | `string` | Display name of the persona |
| `bio` | `string` | System prompt / reading persona description |
| `model` | `string` | LLM model ID (see `KNOWN_MODELS` in `src/lib/models.ts`) |
| `createdAt` | `string` | ISO-8601 timestamp |

### `Club`

A named, reusable collection of members.

| Field | Type | Description |
|---|---|---|
| `id` | `string` | UUID, generated on create |
| `name` | `string` | Display name of the club |
| `createdAt` | `string` | ISO-8601 timestamp |

### `ClubWithMembers`

Extends `Club` with a populated `members: Member[]` array.

**Path:** `src/types/user.ts`

### `User`

| Field | Type | Description |
|---|---|---|
| `firstName` | `string` | User's first name |
| `lastName` | `string` | User's last name |

### `ApiKeyProvider`

Union type: `"anthropic" | "google" | "openai"`

### `ApiKeyStatus`

`Record<ApiKeyProvider, boolean>` — tracks whether a key is saved per provider. Never holds the key value itself.

---

## Model Selector Pattern

**Path:** `src/lib/models.ts`

The `KNOWN_MODELS` array is the single source of truth for available LLM models. It exports:

- `KNOWN_MODELS: KnownModel[]` — full list of models with `id`, `label`, and `provider`
- `modelLabel(modelId: string): string` — returns the human-readable label for a model ID, falling back to the raw ID for unknown models

When building a model `Select` dropdown, group items by provider using MUI `ListSubheader`:

```tsx
import { KNOWN_MODELS } from "../lib/models";

<Select value={model} label="Model" onChange={...}>
  {PROVIDERS.map((provider) => [
    <ListSubheader key={provider.key}>{provider.label}</ListSubheader>,
    ...KNOWN_MODELS.filter((m) => m.provider === provider.key).map((m) => (
      <MenuItem key={m.id} value={m.id}>{m.label}</MenuItem>
    )),
  ])}
</Select>
```

When displaying a model name in read-only contexts, use `modelLabel(member.model)` — this gracefully handles retired model IDs that no longer appear in `KNOWN_MODELS`.

**Maintenance:** When a model is retired, mark it deprecated in a code comment rather than removing it from the array. Filter deprecated models out of the creation `Select` but keep them visible in read-only views so existing member records display correctly.
