import { useState } from "react";
import {
  Box,
  Button,
  Chip,
  IconButton,
  InputAdornment,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import VisibilityIcon from "@mui/icons-material/Visibility";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";
import { ApiKeyProvider } from "../../types/user";

interface ApiKeyFieldProps {
  provider: ApiKeyProvider;
  label: string;
  isSaved: boolean;
  onSave: (provider: ApiKeyProvider, key: string) => void;
  onClear: (provider: ApiKeyProvider) => void;
}

/**
 * A single API key row. Shows a password input with visibility toggle.
 * When a key is already saved, it shows a status chip instead of the value —
 * the actual key is never retrieved from the Keychain for display.
 */
export function ApiKeyField({ provider, label, isSaved, onSave, onClear }: ApiKeyFieldProps) {
  const [value, setValue] = useState("");
  const [visible, setVisible] = useState(false);
  const [editing, setEditing] = useState(!isSaved);

  function handleSave() {
    if (!value.trim()) return;
    onSave(provider, value.trim());
    setValue("");
    setEditing(false);
  }

  function handleClear() {
    onClear(provider);
    setValue("");
    setEditing(true);
  }

  return (
    <Box>
      <Typography variant="subtitle2" gutterBottom>
        {label}
      </Typography>

      {isSaved && !editing ? (
        // Key is saved — show status chip and action buttons, never the key value
        <Stack direction="row" alignItems="center" spacing={1}>
          <Chip
            icon={<CheckCircleIcon />}
            label="Key saved"
            color="success"
            variant="outlined"
            size="small"
          />
          <Button size="small" onClick={() => setEditing(true)}>
            Replace
          </Button>
          <Button size="small" color="error" onClick={handleClear}>
            Clear
          </Button>
        </Stack>
      ) : (
        // Input for entering / replacing a key
        <Stack direction="row" spacing={1} alignItems="flex-start">
          <TextField
            fullWidth
            size="small"
            type={visible ? "text" : "password"}
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder={`Paste your ${label} API key`}
            slotProps={{
              input: {
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() => setVisible((v) => !v)}
                      edge="end"
                      aria-label={visible ? "Hide key" : "Show key"}
                      size="small"
                    >
                      {visible ? <VisibilityOffIcon /> : <VisibilityIcon />}
                    </IconButton>
                  </InputAdornment>
                ),
              },
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleSave();
            }}
          />
          <Button variant="contained" size="small" onClick={handleSave} disabled={!value.trim()}>
            Save
          </Button>
          {isSaved && (
            <Button size="small" onClick={() => { setValue(""); setEditing(false); }}>
              Cancel
            </Button>
          )}
        </Stack>
      )}
    </Box>
  );
}
