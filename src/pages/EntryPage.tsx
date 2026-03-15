import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  AppBar,
  Box,
  Chip,
  Container,
  Divider,
  IconButton,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
  Toolbar,
  Tooltip,
  Typography,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import EditIcon from "@mui/icons-material/Edit";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import SaveIcon from "@mui/icons-material/Save";
import ArticleIcon from "@mui/icons-material/Article";
import MenuBookIcon from "@mui/icons-material/MenuBook";
import { EntryType, ReadingEntry } from "../types/entry";

// ---------------------------------------------------------------------------
// Stub data — replace with DB lookup (src/lib/db/entries.ts) once wired up.
// ---------------------------------------------------------------------------
const STUB_ENTRIES: ReadingEntry[] = [
  {
    id: "1",
    type: "book",
    title: "The Pragmatic Programmer",
    author: "David Thomas & Andrew Hunt",
    analysis: "",
  },
  {
    id: "2",
    type: "article",
    title: "Why Rust is the Future of Systems Programming",
    author: "Jane Doe",
    analysis: "",
    articleContent: "",
  },
  {
    id: "3",
    type: "book",
    title: "Designing Data-Intensive Applications",
    author: "Martin Kleppmann",
    analysis: "",
  },
];

const EMPTY_ENTRY: Omit<ReadingEntry, "id"> = {
  type: "book",
  title: "",
  author: "",
  analysis: "",
};

// ---------------------------------------------------------------------------

type Mode = "view" | "edit";

/**
 * Full-screen detail page for a reading entry (book or article).
 *
 * Routes:
 *   /entry/new    — starts in edit mode with blank fields
 *   /entry/:id    — starts in view mode with the matching entry
 *
 * View mode: all fields are read-only. Articles show a collapsible content box.
 * Edit mode: all fields become inputs. AppBar shows a save icon.
 */
export function EntryPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isNew = id === "new";

  const existing = isNew ? null : (STUB_ENTRIES.find((e) => e.id === id) ?? null);
  const initial = existing ?? { ...EMPTY_ENTRY, id: "new" };

  const [mode, setMode] = useState<Mode>(isNew ? "edit" : "view");
  const [draft, setDraft] = useState<ReadingEntry>(initial);

  function handleSave() {
    // TODO: persist via src/lib/db/entries.ts (create or update)
    console.log("Save entry:", draft);
    setMode("view");
  }

  function setField<K extends keyof ReadingEntry>(key: K, value: ReadingEntry[K]) {
    setDraft((prev) => ({ ...prev, [key]: value }));
  }

  const isViewMode = mode === "view";
  const canSave = draft.title.trim() !== "" && draft.author.trim() !== "";

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "background.default" }}>
      <AppBar position="static" color="transparent" elevation={0}>
        <Toolbar>
          <IconButton edge="start" aria-label="Go back" onClick={() => navigate(-1)}>
            <ArrowBackIcon />
          </IconButton>

          <Box sx={{ flexGrow: 1 }} />

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
        {isViewMode ? (
          <ViewContent entry={draft} />
        ) : (
          <EditContent draft={draft} setField={setField} />
        )}
      </Container>
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
  draft: ReadingEntry;
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

      <Divider />

      {/* Article content — only shown for articles */}
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
