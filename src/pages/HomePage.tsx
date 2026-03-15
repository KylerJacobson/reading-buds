import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Alert,
  AppBar,
  Box,
  CircularProgress,
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
import { listEntries } from "../lib/db/entries";
import { ReadingEntry } from "../types/entry";

/**
 * The main landing page. Lists existing reading entries and exposes a FAB
 * to create a new entry.
 */
export function HomePage() {
  const navigate = useNavigate();
  const [entries, setEntries] = useState<ReadingEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    listEntries()
      .then(setEntries)
      .catch((err) => setError(String(err)))
      .finally(() => setLoading(false));
  }, []);

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
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            Failed to load entries: {error}
          </Alert>
        )}

        {loading ? (
          <Box sx={{ display: "flex", justifyContent: "center", pt: 8 }}>
            <CircularProgress />
          </Box>
        ) : (
          <>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              {entries.length} {entries.length === 1 ? "entry" : "entries"}
            </Typography>

            <Grid container spacing={2}>
              {entries.map((entry) => (
                <Grid key={entry.id} size={{ xs: 12 }}>
                  <BookCard
                    entry={entry}
                    onClick={(e) => navigate(`/entry/${e.id}`)}
                    onDelete={(e) =>
                      setEntries((prev) => prev.filter((x) => x.id !== e.id))
                    }
                  />
                </Grid>
              ))}
            </Grid>
          </>
        )}
      </Container>

      {/* Floating action button — fixed to the bottom-right */}
      <Fab
        color="primary"
        aria-label="Add new entry"
        onClick={() => navigate("/entry/new")}
        sx={{ position: "fixed", bottom: 24, right: 24 }}
      >
        <AddIcon />
      </Fab>
    </Box>
  );
}
