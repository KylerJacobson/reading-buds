import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  AppBar,
  Box,
  Container,
  Divider,
  IconButton,
  Stack,
  TextField,
  Toolbar,
  Typography,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { ApiKeyField } from "../components/ApiKeyField";
import { ApiKeyProvider, ApiKeyStatus, User } from "../types/user";

/** Stub user — replace with DB read once persistence is wired up. */
const STUB_USER: User = { firstName: "", lastName: "" };

/** Stub key status — replace with Keychain presence check once wired up. */
const STUB_KEY_STATUS: ApiKeyStatus = {
  anthropic: false,
  google: false,
  openai: false,
};

const API_KEY_PROVIDERS: { provider: ApiKeyProvider; label: string }[] = [
  { provider: "anthropic", label: "Anthropic" },
  { provider: "google", label: "Google" },
  { provider: "openai", label: "OpenAI" },
];

/**
 * Settings page. Lets the user manage their profile (first/last name)
 * and API keys for each supported AI provider.
 *
 * All save/clear handlers are stubs — they log to the console until
 * the persistence layer is wired up (see docs/persistence.md).
 */
export function SettingsPage() {
  const navigate = useNavigate();
  const [user, setUser] = useState<User>(STUB_USER);
  const [keyStatus, setKeyStatus] = useState<ApiKeyStatus>(STUB_KEY_STATUS);

  function handleProfileSave() {
    // TODO: persist via SQLite (src/lib/db/user.ts)
    console.log("Save profile:", user);
  }

  function handleApiKeySave(provider: ApiKeyProvider, _key: string) {
    // TODO: invoke("set_api_key", { provider, key: _key }) — Tauri Keychain command
    console.log("Save API key for:", provider);
    setKeyStatus((prev) => ({ ...prev, [provider]: true }));
  }

  function handleApiKeyClear(provider: ApiKeyProvider) {
    // TODO: invoke("delete_api_key", { provider }) — Tauri Keychain command
    console.log("Clear API key for:", provider);
    setKeyStatus((prev) => ({ ...prev, [provider]: false }));
  }

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "background.default" }}>
      <AppBar position="static" color="transparent" elevation={0}>
        <Toolbar>
          <IconButton
            edge="start"
            aria-label="Go back"
            onClick={() => navigate(-1)}
          >
            <ArrowBackIcon />
          </IconButton>
          <Typography variant="h6" sx={{ ml: 1 }}>
            Settings
          </Typography>
        </Toolbar>
      </AppBar>

      <Container maxWidth="sm" sx={{ py: 3 }}>
        {/* ── Profile ─────────────────────────────────────────────── */}
        <Typography variant="overline" color="text.secondary">
          Profile
        </Typography>

        <Stack spacing={2} sx={{ mt: 1, mb: 4 }}>
          <TextField
            label="First name"
            value={user.firstName}
            onChange={(e) => setUser((u) => ({ ...u, firstName: e.target.value }))}
            onBlur={handleProfileSave}
            fullWidth
            size="small"
          />
          <TextField
            label="Last name"
            value={user.lastName}
            onChange={(e) => setUser((u) => ({ ...u, lastName: e.target.value }))}
            onBlur={handleProfileSave}
            fullWidth
            size="small"
          />
        </Stack>

        <Divider sx={{ mb: 4 }} />

        {/* ── API Keys ─────────────────────────────────────────────── */}
        <Typography variant="overline" color="text.secondary">
          API Keys
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5, mb: 2 }}>
          Keys are stored securely in your system keychain and never leave this device.
        </Typography>

        <Stack spacing={3}>
          {API_KEY_PROVIDERS.map(({ provider, label }) => (
            <ApiKeyField
              key={provider}
              provider={provider}
              label={label}
              isSaved={keyStatus[provider]}
              onSave={handleApiKeySave}
              onClear={handleApiKeyClear}
            />
          ))}
        </Stack>
      </Container>
    </Box>
  );
}
