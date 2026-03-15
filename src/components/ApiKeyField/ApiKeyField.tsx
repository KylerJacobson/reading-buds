import { useState } from "react";
import {
  Box,
  Button,
  IconButton,
  InputAdornment,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import VisibilityIcon from "@mui/icons-material/Visibility";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";
import { ApiKeyProvider } from "../../types/user";

interface ApiKeyFieldProps {
  provider: ApiKeyProvider;
  label: string;
  /** The currently saved key value, or null if no key is stored. */
  savedValue: string | null;
  onSave: (provider: ApiKeyProvider, key: string) => void;
  onClear: (provider: ApiKeyProvider) => void;
}

/**
 * A single API key row. When a key is saved it is displayed in a read-only
 * masked field with a visibility toggle. The user can replace or clear it.
 * When no key is saved, an input field is shown for entering a new one.
 */
export function ApiKeyField({
  provider,
  label,
  savedValue,
  onSave,
  onClear,
}: ApiKeyFieldProps) {
  const isSaved = savedValue !== null;
  const [editing, setEditing] = useState(!isSaved);
  const [draft, setDraft] = useState("");
  const [draftVisible, setDraftVisible] = useState(false);
  const [savedVisible, setSavedVisible] = useState(false);

  function handleSave() {
    if (!draft.trim()) return;
    onSave(provider, draft.trim());
    setDraft("");
    setEditing(false);
  }

  function handleClear() {
    onClear(provider);
    setDraft("");
    setEditing(true);
  }

  function handleReplace() {
    setDraft("");
    setEditing(true);
  }

  function handleCancelReplace() {
    setDraft("");
    setEditing(false);
  }

  return (
    <Box>
      <Typography variant="subtitle2" gutterBottom>
        {label}
      </Typography>

      {isSaved && !editing ? (
        // Saved state — show the key value in a read-only masked field
        <Stack spacing={1}>
          <TextField
            fullWidth
            size="small"
            type={savedVisible ? "text" : "password"}
            value={savedValue}
            slotProps={{
              input: {
                readOnly: true,
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() => setSavedVisible((v) => !v)}
                      edge="end"
                      aria-label={savedVisible ? "Hide key" : "Show key"}
                      size="small"
                    >
                      {savedVisible ? <VisibilityOffIcon /> : <VisibilityIcon />}
                    </IconButton>
                  </InputAdornment>
                ),
              },
            }}
          />
          <Stack direction="row" spacing={1}>
            <Button size="small" onClick={handleReplace}>
              Replace
            </Button>
            <Button size="small" color="error" onClick={handleClear}>
              Clear
            </Button>
          </Stack>
        </Stack>
      ) : (
        // Input state — enter or replace a key
        <Stack direction="row" spacing={1} alignItems="flex-start">
          <TextField
            fullWidth
            size="small"
            type={draftVisible ? "text" : "password"}
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            placeholder={`Paste your ${label} API key`}
            slotProps={{
              input: {
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() => setDraftVisible((v) => !v)}
                      edge="end"
                      aria-label={draftVisible ? "Hide key" : "Show key"}
                      size="small"
                    >
                      {draftVisible ? <VisibilityOffIcon /> : <VisibilityIcon />}
                    </IconButton>
                  </InputAdornment>
                ),
              },
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleSave();
            }}
          />
          <Button
            variant="contained"
            size="small"
            onClick={handleSave}
            disabled={!draft.trim()}
          >
            Save
          </Button>
          {isSaved && (
            <Button size="small" onClick={handleCancelReplace}>
              Cancel
            </Button>
          )}
        </Stack>
      )}
    </Box>
  );
}
