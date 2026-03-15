import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  AppBar,
  Box,
  Container,
  Fab,
  Grid,
  IconButton,
  Toolbar,
  Typography,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import SettingsIcon from "@mui/icons-material/Settings";
import { BookCard } from "../components/BookCard";
import { ReadingEntry } from "../types/entry";

/** Stub data — replace with real data fetching once the backend is wired up. */
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

/**
 * The main landing page. Lists existing reading entries and exposes a FAB
 * to create a new entry. Selection/creation handlers are stubs for now.
 */
export function HomePage() {
  const navigate = useNavigate();
  const [entries] = useState<ReadingEntry[]>(STUB_ENTRIES);

  function handleEntryClick(entry: ReadingEntry) {
    navigate(`/entry/${entry.id}`);
  }

  function handleAddEntry() {
    navigate("/entry/new");
  }

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "background.default", pb: 10 }}>
      <AppBar position="static" color="transparent" elevation={0}>
        <Toolbar>
          <Typography variant="h6" component="h1" fontWeight={700} sx={{ flexGrow: 1 }}>
            My Library
          </Typography>
          <IconButton
            aria-label="Open settings"
            onClick={() => navigate("/settings")}
          >
            <SettingsIcon />
          </IconButton>
        </Toolbar>
      </AppBar>

      <Container maxWidth="sm" sx={{ pt: 2 }}>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          {entries.length} {entries.length === 1 ? "entry" : "entries"}
        </Typography>

        <Grid container spacing={2}>
          {entries.map((entry) => (
            <Grid key={entry.id} size={{ xs: 12 }}>
              <BookCard entry={entry} onClick={handleEntryClick} />
            </Grid>
          ))}
        </Grid>
      </Container>

      {/* Floating action button — fixed to the bottom-right */}
      <Fab
        color="primary"
        aria-label="Add new entry"
        onClick={handleAddEntry}
        sx={{ position: "fixed", bottom: 24, right: 24 }}
      >
        <AddIcon />
      </Fab>
    </Box>
  );
}
