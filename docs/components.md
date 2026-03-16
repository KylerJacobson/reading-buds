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

### Static fallback list

**Path:** `src/lib/models.ts`

`KNOWN_MODELS` is a static list used as a fallback for display purposes. It exports:

- `KNOWN_MODELS: KnownModel[]` — static list of models with `id`, `label`, and `provider`
- `modelLabel(modelId: string): string` — returns the human-readable label for a model ID, falling back to the raw ID for unknown models

Use `modelLabel()` in **read-only** views so that saved model IDs render gracefully even if they are no longer in the live API response.

**Maintenance:** When a model is retired, add a deprecation comment rather than removing it from the array so that existing member records still display correctly.

### Live model loading

**Path:** `src/lib/anthropic.ts`, `src-tauri/src/anthropic.rs`

`listAnthropicModels()` calls the Tauri `list_anthropic_models` command, which hits `GET /v1/models` on the Anthropic API using the key stored in the OS Keychain. It returns an empty array when no key is configured or the key is invalid — the frontend treats an empty result as "no models from this provider" without distinguishing the two cases.

The pattern for the model `Select` in edit mode:

```tsx
import { listAnthropicModels, type AnthropicModel } from "../lib/anthropic";

// In the component, load on mount alongside other data:
const [anthropicModels] = await Promise.all([listAnthropicModels(), ...]);

// Build groups — only include providers that returned models:
const groups: ProviderModels[] = [];
if (anthropicModels.length > 0) {
  groups.push({ provider: "anthropic", label: "Anthropic", models: anthropicModels });
}

// Render:
<Select value={draft.model} label="Model" onChange={...}>
  {groups.length === 0 ? (
    <MenuItem value="" disabled>Input API keys to view available models</MenuItem>
  ) : (
    groups.map((group) => [
      <ListSubheader key={group.provider}>{group.label}</ListSubheader>,
      ...group.models.map((m) => (
        <MenuItem key={m.id} value={m.id}>{m.displayName}</MenuItem>
      )),
    ])
  )}
</Select>
```

**Extending to new providers:** Add a `listXxxModels()` function in `src/lib/xxx.ts`, a corresponding Tauri command in `src-tauri/src/xxx.rs`, register it in `lib.rs`, then push the results into `groups` in `MemberPage` following the same pattern as Anthropic.
