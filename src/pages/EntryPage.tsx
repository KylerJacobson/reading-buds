import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Alert,
  AppBar,
  Box,
  Chip,
  CircularProgress,
  Container,
  Divider,
  IconButton,
  Link,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
  Toolbar,
  Tooltip,
  Typography,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import SaveIcon from "@mui/icons-material/Save";
import ArticleIcon from "@mui/icons-material/Article";
import MenuBookIcon from "@mui/icons-material/MenuBook";
import { ConfirmDialog } from "../components/ConfirmDialog";
import { CreateEntryInput, EntryType, ReadingEntry } from "../types/entry";
import { createEntry, deleteEntry, getEntry, updateEntry } from "../lib/db/entries";

const EMPTY_DRAFT: CreateEntryInput = {
  type: "book",
  title: "",
  author: "",
  analysis: "",
};

type Mode = "view" | "edit";

/**
 * Full-screen detail page for a reading entry (book or article).
 *
 * Routes:
 *   /entry/new    — starts in edit mode with blank fields
 *   /entry/:id    — starts in view mode, loads entry from the database
 *
 * View mode: all fields are read-only.
 * Edit mode: all fields become inputs; the AppBar shows a save icon.
 */
export function EntryPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isNew = id === "new";

  const [mode, setMode] = useState<Mode>(isNew ? "edit" : "view");
  // For new entries we store a CreateEntryInput; for existing ones a ReadingEntry.
  const [draft, setDraft] = useState<ReadingEntry | CreateEntryInput>(EMPTY_DRAFT);
  const [loading, setLoading] = useState(!isNew);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);

  // Load existing entry from DB when not in create mode.
  useEffect(() => {
    if (isNew) return;
    getEntry(id!)
      .then((entry) => {
        if (!entry) {
          setError("Entry not found.");
        } else {
          setDraft(entry);
        }
      })
      .catch((err) => setError(String(err)))
      .finally(() => setLoading(false));
  }, [id, isNew]);

  async function handleSave() {
    setSaving(true);
    try {
      if (isNew) {
        const created = await createEntry(draft as CreateEntryInput);
        // Replace /entry/new with the real ID so the back button works correctly.
        navigate(`/entry/${created.id}`, { replace: true });
      } else {
        await updateEntry(draft as ReadingEntry);
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
      await deleteEntry((draft as ReadingEntry).id);
      navigate("/", { replace: true });
    } catch (err) {
      setError(String(err));
      setConfirmDeleteOpen(false);
    }
  }

  function setField<K extends keyof ReadingEntry>(key: K, value: ReadingEntry[K]) {
    setDraft((prev) => ({ ...prev, [key]: value }));
  }

  const isViewMode = mode === "view";
  const canSave =
    !saving &&
    draft.title.trim() !== "" &&
    draft.author.trim() !== "";

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "100vh" }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "background.default" }}>
      <AppBar position="static" color="transparent" elevation={0}>
        <Toolbar>
          <IconButton edge="start" aria-label="Go back" onClick={() => navigate(-1)}>
            <ArrowBackIcon />
          </IconButton>

          <Box sx={{ flexGrow: 1 }} />

          {/* Delete — only available for persisted entries */}
          {!isNew && (
            <Tooltip title="Delete">
              <IconButton
                aria-label="Delete entry"
                onClick={() => setConfirmDeleteOpen(true)}
              >
                <DeleteIcon />
              </IconButton>
            </Tooltip>
          )}

          {isViewMode ? (
            <Tooltip title="Edit">
              <IconButton aria-label="Edit entry" onClick={() => setMode("edit")}>
                <EditIcon />
              </IconButton>
            </Tooltip>
          ) : (
            <Tooltip title={canSave ? "Save" : "Title and author are required"}>
              {/* Span needed so Tooltip works on a disabled button */}
              <span>
                <IconButton
                  aria-label="Save entry"
                  onClick={handleSave}
                  color="primary"
                  disabled={!canSave}
                >
                  <SaveIcon />
                </IconButton>
              </span>
            </Tooltip>
          )}
        </Toolbar>
      </AppBar>

      <Container maxWidth="md" sx={{ pt: 4, pb: 8 }}>
        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        {isViewMode ? (
          <ViewContent entry={draft as ReadingEntry} />
        ) : (
          <EditContent draft={draft} setField={setField} />
        )}
      </Container>

      <ConfirmDialog
        open={confirmDeleteOpen}
        title="Delete entry?"
        message={`"${draft.title || "This entry"}" will be permanently deleted.`}
        onConfirm={handleDelete}
        onCancel={() => setConfirmDeleteOpen(false)}
      />
    </Box>
  );
}

// ---------------------------------------------------------------------------
// Sub-components — kept in the same file since they're only used here.
// ---------------------------------------------------------------------------

function ViewContent({ entry }: { entry: ReadingEntry }) {
  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 4 }}>
      {/* Header */}
      <Box>
        <Chip
          icon={entry.type === "book" ? <MenuBookIcon /> : <ArticleIcon />}
          label={entry.type === "book" ? "Book" : "Article"}
          color={entry.type === "book" ? "primary" : "secondary"}
          variant="outlined"
          size="small"
          sx={{ mb: 2 }}
        />
        <Typography variant="h4" component="h1" fontWeight={700} gutterBottom>
          {entry.title || "Untitled"}
        </Typography>
        <Typography variant="subtitle1" color="text.secondary">
          {entry.author || "Unknown author"}
        </Typography>

        {entry.type === "article" && entry.url && (
          <Link
            href={entry.url}
            target="_blank"
            rel="noopener noreferrer"
            variant="body2"
            sx={{ display: "inline-block", mt: 1 }}
          >
            {entry.url}
          </Link>
        )}
      </Box>

      <Divider />

      {/* Article content — only shown for articles */}
      {entry.type === "article" && (
        <Accordion disableGutters elevation={0} sx={{ border: 1, borderColor: "divider", borderRadius: 1 }}>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography variant="subtitle2">Article Content</Typography>
          </AccordionSummary>
          <AccordionDetails>
            {entry.articleContent?.trim() ? (
              <Typography
                variant="body2"
                sx={{ whiteSpace: "pre-wrap", lineHeight: 1.8 }}
              >
                {entry.articleContent}
              </Typography>
            ) : (
              <Typography variant="body2" color="text.disabled" fontStyle="italic">
                No article content saved.
              </Typography>
            )}
          </AccordionDetails>
        </Accordion>
      )}

      {/* Analysis */}
      <Box>
        <Typography variant="overline" color="text.secondary" display="block" gutterBottom>
          My Analysis
        </Typography>
        {entry.analysis?.trim() ? (
          <Typography variant="body1" sx={{ whiteSpace: "pre-wrap", lineHeight: 1.8 }}>
            {entry.analysis}
          </Typography>
        ) : (
          <Typography variant="body2" color="text.disabled" fontStyle="italic">
            No analysis written yet.
          </Typography>
        )}
      </Box>
    </Box>
  );
}

interface EditContentProps {
  draft: ReadingEntry | CreateEntryInput;
  setField: <K extends keyof ReadingEntry>(key: K, value: ReadingEntry[K]) => void;
}

function EditContent({ draft, setField }: EditContentProps) {
  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
      {/* Type toggle */}
      <Box>
        <Typography variant="caption" color="text.secondary" display="block" gutterBottom>
          Type
        </Typography>
        <ToggleButtonGroup
          exclusive
          value={draft.type}
          onChange={(_e, value: EntryType | null) => {
            // Prevent deselecting — there must always be a type selected.
            if (value) setField("type", value);
          }}
          size="small"
          aria-label="Entry type"
        >
          <ToggleButton value="book" aria-label="Book">
            <MenuBookIcon fontSize="small" sx={{ mr: 0.75 }} />
            Book
          </ToggleButton>
          <ToggleButton value="article" aria-label="Article">
            <ArticleIcon fontSize="small" sx={{ mr: 0.75 }} />
            Article
          </ToggleButton>
        </ToggleButtonGroup>
      </Box>

      <TextField
        label="Title"
        value={draft.title}
        onChange={(e) => setField("title", e.target.value)}
        fullWidth
        autoFocus
        variant="outlined"
      />

      <TextField
        label="Author"
        value={draft.author}
        onChange={(e) => setField("author", e.target.value)}
        fullWidth
        variant="outlined"
      />

      {draft.type === "article" && (
        <TextField
          label="URL"
          value={draft.url ?? ""}
          onChange={(e) => setField("url", e.target.value || undefined)}
          fullWidth
          variant="outlined"
          placeholder="https://…"
          slotProps={{ input: { inputMode: "url" } }}
        />
      )}

      <Divider />

      {/* Article-specific fields */}
      {draft.type === "article" && (
        <Accordion disableGutters elevation={0} sx={{ border: 1, borderColor: "divider", borderRadius: 1 }}>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography variant="subtitle2">Article Content</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <TextField
              multiline
              minRows={8}
              fullWidth
              variant="outlined"
              placeholder="Paste the full article text here…"
              value={draft.articleContent ?? ""}
              onChange={(e) => setField("articleContent", e.target.value)}
              slotProps={{ input: { sx: { fontFamily: "inherit", lineHeight: 1.8 } } }}
            />
          </AccordionDetails>
        </Accordion>
      )}

      {/* Analysis */}
      <Box>
        <Typography variant="caption" color="text.secondary" display="block" gutterBottom>
          My Analysis
        </Typography>
        <TextField
          multiline
          minRows={8}
          fullWidth
          variant="outlined"
          placeholder={
            draft.type === "article"
              ? "Write your analysis of the article…"
              : "Write your analysis of the book…"
          }
          value={draft.analysis}
          onChange={(e) => setField("analysis", e.target.value)}
          slotProps={{ input: { sx: { lineHeight: 1.8 } } }}
        />
      </Box>
    </Box>
  );
}
