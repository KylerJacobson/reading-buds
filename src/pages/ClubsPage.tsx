import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Alert,
  AppBar,
  Box,
  Card,
  CardActionArea,
  CardContent,
  CircularProgress,
  Container,
  Fab,
  Grid,
  IconButton,
  Toolbar,
  Typography,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import PeopleIcon from "@mui/icons-material/People";
import { listClubs } from "../lib/db/clubs";
import type { Club } from "../types/club";

export function ClubsPage() {
  const navigate = useNavigate();
  const [clubs, setClubs] = useState<Club[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    listClubs()
      .then(setClubs)
      .catch((err) => setError(String(err)))
      .finally(() => setLoading(false));
  }, []);

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "background.default", pb: 10 }}>
      <AppBar position="static" color="transparent" elevation={0}>
        <Toolbar>
          <IconButton edge="start" aria-label="Go back" onClick={() => navigate(-1)}>
            <ArrowBackIcon />
          </IconButton>
          <Typography variant="h6" component="h1" fontWeight={700} sx={{ flexGrow: 1, ml: 1 }}>
            Reading Clubs
          </Typography>
          <IconButton aria-label="Manage members" onClick={() => navigate("/members")}>
            <PeopleIcon />
          </IconButton>
        </Toolbar>
      </AppBar>

      <Container maxWidth="sm" sx={{ pt: 2 }}>
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

        {loading ? (
          <Box sx={{ display: "flex", justifyContent: "center", pt: 8 }}>
            <CircularProgress />
          </Box>
        ) : clubs.length === 0 ? (
          <Typography variant="body2" color="text.secondary" sx={{ pt: 4, textAlign: "center" }}>
            No clubs yet. Tap + to create one.
          </Typography>
        ) : (
          <Grid container spacing={2}>
            {clubs.map((club) => (
              <Grid key={club.id} size={{ xs: 12 }}>
                <Card>
                  <CardActionArea onClick={() => navigate(`/clubs/${club.id}`)}>
                    <CardContent>
                      <Typography variant="h6">{club.name}</Typography>
                    </CardContent>
                  </CardActionArea>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}
      </Container>

      <Fab
        color="primary"
        aria-label="Create club"
        onClick={() => navigate("/clubs/new")}
        sx={{ position: "fixed", bottom: 24, right: 24 }}
      >
        <AddIcon />
      </Fab>
    </Box>
  );
}
