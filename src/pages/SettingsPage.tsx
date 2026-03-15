import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Alert,
  AppBar,
  Box,
  CircularProgress,
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
import { getUser, updateUser } from "../lib/db/user";
import { deleteApiKey, getApiKey, setApiKey } from "../lib/keychain";
import { ApiKeyProvider, User } from "../types/user";

const API_KEY_PROVIDERS: { provider: ApiKeyProvider; label: string }[] = [
  { provider: "anthropic", label: "Anthropic" },
  { provider: "google", label: "Google" },
  { provider: "openai", label: "OpenAI" },
];

/** Stored key values per provider. null means no key is saved. */
type KeyValues = Record<ApiKeyProvider, string | null>;

/**
 * Settings page. Lets the user manage their profile (first/last name)
 * and API keys for each supported AI provider.
 *
 * Profile changes are persisted on blur via SQLite.
 * API keys are stored in and retrieved from the OS Keychain.
 */
export function SettingsPage() {
  const navigate = useNavigate();
  const [user, setUser] = useState<User>({ firstName: "", lastName: "" });
  const [keyValues, setKeyValues] = useState<KeyValues>({
    anthropic: null,
    google: null,
    openai: null,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Load profile and all key values in parallel.
    Promise.all([
      getUser(),
      getApiKey("anthropic"),
      getApiKey("google"),
      getApiKey("openai"),
    ])
      .then(([userData, anthropic, google, openai]) => {
        setUser(userData);
        setKeyValues({ anthropic, google, openai });
      })
      .catch((err) => setError(String(err)))
      .finally(() => setLoading(false));
  }, []);

  async function handleProfileSave() {
    try {
      await updateUser(user);
    } catch (err) {
      setError(String(err));
    }
  }

  async function handleApiKeySave(provider: ApiKeyProvider, key: string) {
    try {
      await setApiKey(provider, key);
      setKeyValues((prev) => ({ ...prev, [provider]: key }));
    } catch (err) {
      setError(String(err));
    }
  }

  async function handleApiKeyClear(provider: ApiKeyProvider) {
    try {
      await deleteApiKey(provider);
      setKeyValues((prev) => ({ ...prev, [provider]: null }));
    } catch (err) {
      setError(String(err));
    }
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
        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        {loading ? (
          <Box sx={{ display: "flex", justifyContent: "center", pt: 8 }}>
            <CircularProgress />
          </Box>
        ) : (
          <>
            {/* ── Profile ───────────────────────────────────────────── */}
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

            {/* ── API Keys ──────────────────────────────────────────── */}
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
                  savedValue={keyValues[provider]}
                  onSave={handleApiKeySave}
                  onClear={handleApiKeyClear}
                />
              ))}
            </Stack>
          </>
        )}
      </Container>
    </Box>
  );
}
