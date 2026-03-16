import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  Alert,
  AppBar,
  Box,
  CircularProgress,
  Container,
  FormControl,
  IconButton,
  InputLabel,
  ListSubheader,
  MenuItem,
  Select,
  TextField,
  Toolbar,
  Tooltip,
  Typography,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import SaveIcon from "@mui/icons-material/Save";
import { ConfirmDialog } from "../components/ConfirmDialog";
import { createMember, deleteMember, getMember, updateMember } from "../lib/db/members";
import { listAnthropicModels, type AnthropicModel } from "../lib/anthropic";
import { KNOWN_MODELS, modelLabel } from "../lib/models";
import type { Member } from "../types/club";

type Mode = "view" | "edit";

/** Models grouped by provider, built from live API responses. */
interface ProviderModels {
  provider: string;
  label: string;
  models: AnthropicModel[];
}

const DEFAULT_MODEL = KNOWN_MODELS[0].id;

export function MemberPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isNew = id === "new";

  const [mode, setMode] = useState<Mode>(isNew ? "edit" : "view");
  const [member, setMember] = useState<Member | null>(null);
  const [draft, setDraft] = useState({ name: "", bio: "", model: DEFAULT_MODEL });
  // Always start loading — we always need to fetch available models.
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);
  // Non-empty provider groups from live API responses.
  const [availableModels, setAvailableModels] = useState<ProviderModels[]>([]);

  useEffect(() => {
    async function load() {
      try {
        // Fetch member data and all provider model lists in parallel.
        const [anthropicModels, fetchedMember] = await Promise.all([
          listAnthropicModels(),
          isNew ? Promise.resolve(null) : getMember(id!),
        ]);

        if (!isNew) {
          if (!fetchedMember) { setError("Member not found."); return; }
          setMember(fetchedMember);
          setDraft({ name: fetchedMember.name, bio: fetchedMember.bio, model: fetchedMember.model });
        }

        // Build grouped model list — only include providers that returned models.
        // As OpenAI / Google endpoints are added, push their results here too.
        const groups: ProviderModels[] = [];
        if (anthropicModels.length > 0) {
          groups.push({ provider: "anthropic", label: "Anthropic", models: anthropicModels });
        }
        setAvailableModels(groups);
      } catch (err) {
        setError(String(err));
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [id, isNew]);

  async function handleSave() {
    if (!draft.name.trim()) return;
    setSaving(true);
    try {
      if (isNew) {
        const created = await createMember(draft);
        navigate(`/members/${created.id}`, { replace: true });
      } else {
        const updated = { ...member!, ...draft };
        await updateMember(updated);
        setMember(updated);
        setMode("view");
      }
    } catch (err) {
      setError(String(err));
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    try {
      await deleteMember(id!);
      navigate("/members", { replace: true });
    } catch (err) {
      setError(String(err));
      setConfirmDeleteOpen(false);
    }
  }

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "100vh" }}>
        <CircularProgress />
      </Box>
    );
  }

  const isViewMode = mode === "view";
  const canSave = draft.name.trim() !== "" && !saving;

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "background.default" }}>
      <AppBar position="static" color="transparent" elevation={0}>
        <Toolbar>
          <IconButton edge="start" aria-label="Go back" onClick={() => navigate(-1)}>
            <ArrowBackIcon />
          </IconButton>
          <Box sx={{ flexGrow: 1 }} />
          {!isNew && (
            <Tooltip title="Delete member">
              <IconButton aria-label="Delete member" onClick={() => setConfirmDeleteOpen(true)}>
                <DeleteIcon />
              </IconButton>
            </Tooltip>
          )}
          {isViewMode ? (
            <Tooltip title="Edit">
              <IconButton
                aria-label="Edit member"
                onClick={() => {
                  setDraft({ name: member!.name, bio: member!.bio, model: member!.model });
                  setMode("edit");
                }}
              >
                <EditIcon />
              </IconButton>
            </Tooltip>
          ) : (
            <Tooltip title={canSave ? "Save" : "Name is required"}>
              <span>
                <IconButton aria-label="Save member" color="primary" onClick={handleSave} disabled={!canSave}>
                  <SaveIcon />
                </IconButton>
              </span>
            </Tooltip>
          )}
        </Toolbar>
      </AppBar>

      <Container maxWidth="sm" sx={{ pt: 4, pb: 8 }}>
        {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

        {isViewMode ? (
          <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
            <Box>
              <Typography variant="h4" fontWeight={700}>{member?.name}</Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                {/* modelLabel falls back to the raw ID for models not in the static list */}
                {member?.model ? modelLabel(member.model) : ""}
              </Typography>
            </Box>
            <Box>
              <Typography variant="overline" color="text.secondary" display="block" gutterBottom>
                Bio / System Prompt
              </Typography>
              {member?.bio?.trim() ? (
                <Typography variant="body1" sx={{ whiteSpace: "pre-wrap", lineHeight: 1.8 }}>
                  {member.bio}
                </Typography>
              ) : (
                <Typography variant="body2" color="text.disabled" fontStyle="italic">
                  No bio written yet.
                </Typography>
              )}
            </Box>
          </Box>
        ) : (
          <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
            <TextField
              label="Name"
              value={draft.name}
              onChange={(e) => setDraft((d) => ({ ...d, name: e.target.value }))}
              fullWidth
              autoFocus
              variant="outlined"
            />

            <FormControl fullWidth>
              <InputLabel>Model</InputLabel>
              <Select
                value={draft.model}
                label="Model"
                onChange={(e) => setDraft((d) => ({ ...d, model: e.target.value }))}
              >
                {availableModels.length === 0 ? (
                  // No provider returned models — prompt the user to add API keys.
                  <MenuItem value="" disabled>
                    Input API keys to view available models
                  </MenuItem>
                ) : (
                  availableModels.map((group) => [
                    <ListSubheader key={group.provider}>{group.label}</ListSubheader>,
                    ...group.models.map((m) => (
                      <MenuItem key={m.id} value={m.id}>{m.displayName}</MenuItem>
                    )),
                  ])
                )}
              </Select>
            </FormControl>

            <Box>
              <Typography variant="caption" color="text.secondary" display="block" gutterBottom>
                Bio / System Prompt
              </Typography>
              <TextField
                multiline
                minRows={6}
                fullWidth
                variant="outlined"
                placeholder="Describe this member's reading persona and perspective…"
                value={draft.bio}
                onChange={(e) => setDraft((d) => ({ ...d, bio: e.target.value }))}
                slotProps={{ input: { sx: { lineHeight: 1.8 } } }}
              />
            </Box>
          </Box>
        )}
      </Container>

      <ConfirmDialog
        open={confirmDeleteOpen}
        title="Delete member?"
        message={`"${member?.name ?? draft.name}" will be removed from all clubs and permanently deleted.`}
        onConfirm={handleDelete}
        onCancel={() => setConfirmDeleteOpen(false)}
      />
    </Box>
  );
}
