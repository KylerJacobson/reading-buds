import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  Alert,
  AppBar,
  Avatar,
  Box,
  Button,
  Chip,
  CircularProgress,
  Container,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  IconButton,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  TextField,
  Toolbar,
  Tooltip,
  Typography,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import PersonAddIcon from "@mui/icons-material/PersonAdd";
import SaveIcon from "@mui/icons-material/Save";
import { ConfirmDialog } from "../components/ConfirmDialog";
import {
  addMemberToClub,
  createClub,
  deleteClub,
  getClubWithMembers,
  removeMemberFromClub,
  updateClub,
} from "../lib/db/clubs";
import { listMembers } from "../lib/db/members";
import { modelLabel } from "../lib/models";
import type { ClubWithMembers, Member } from "../types/club";

type Mode = "view" | "edit";

export function ClubPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isNew = id === "new";

  const [mode, setMode] = useState<Mode>(isNew ? "edit" : "view");
  const [club, setClub] = useState<ClubWithMembers | null>(null);
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(!isNew);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);
  const [addMemberOpen, setAddMemberOpen] = useState(false);
  const [allMembers, setAllMembers] = useState<Member[]>([]);

  useEffect(() => {
    if (isNew) return;
    getClubWithMembers(id!)
      .then((c) => {
        if (!c) { setError("Club not found."); return; }
        setClub(c);
        setName(c.name);
      })
      .catch((err) => setError(String(err)))
      .finally(() => setLoading(false));
  }, [id, isNew]);

  async function handleSave() {
    if (!name.trim()) return;
    setSaving(true);
    try {
      if (isNew) {
        const created = await createClub({ name: name.trim() });
        navigate(`/clubs/${created.id}`, { replace: true });
      } else {
        await updateClub({ ...club!, name: name.trim() });
        setClub((c) => c ? { ...c, name: name.trim() } : c);
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
      await deleteClub(id!);
      navigate("/clubs", { replace: true });
    } catch (err) {
      setError(String(err));
      setConfirmDeleteOpen(false);
    }
  }

  async function handleRemoveMember(memberId: string) {
    try {
      await removeMemberFromClub(id!, memberId);
      setClub((c) => c ? { ...c, members: c.members.filter((m) => m.id !== memberId) } : c);
    } catch (err) {
      setError(String(err));
    }
  }

  async function openAddMember() {
    try {
      const all = await listMembers();
      const currentIds = new Set(club?.members.map((m) => m.id) ?? []);
      setAllMembers(all.filter((m) => !currentIds.has(m.id)));
      setAddMemberOpen(true);
    } catch (err) {
      setError(String(err));
    }
  }

  async function handleAddMember(member: Member) {
    try {
      await addMemberToClub(id!, member.id);
      setClub((c) => c ? { ...c, members: [...c.members, member] } : c);
      setAllMembers((prev) => prev.filter((m) => m.id !== member.id));
    } catch (err) {
      setError(String(err));
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

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "background.default" }}>
      <AppBar position="static" color="transparent" elevation={0}>
        <Toolbar>
          <IconButton edge="start" aria-label="Go back" onClick={() => navigate(-1)}>
            <ArrowBackIcon />
          </IconButton>
          <Box sx={{ flexGrow: 1 }} />
          {!isNew && (
            <Tooltip title="Delete club">
              <IconButton aria-label="Delete club" onClick={() => setConfirmDeleteOpen(true)}>
                <DeleteIcon />
              </IconButton>
            </Tooltip>
          )}
          {isViewMode ? (
            <Tooltip title="Edit">
              <IconButton aria-label="Edit club" onClick={() => setMode("edit")}>
                <EditIcon />
              </IconButton>
            </Tooltip>
          ) : (
            <Tooltip title={name.trim() ? "Save" : "Name is required"}>
              <span>
                <IconButton
                  aria-label="Save club"
                  color="primary"
                  onClick={handleSave}
                  disabled={!name.trim() || saving}
                >
                  <SaveIcon />
                </IconButton>
              </span>
            </Tooltip>
          )}
        </Toolbar>
      </AppBar>

      <Container maxWidth="sm" sx={{ pt: 4, pb: 8 }}>
        {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

        {/* Club name */}
        {isViewMode ? (
          <Typography variant="h4" fontWeight={700} gutterBottom>
            {club?.name}
          </Typography>
        ) : (
          <TextField
            label="Club name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            fullWidth
            autoFocus
            variant="outlined"
            sx={{ mb: 4 }}
          />
        )}

        {/* Members section — only shown for existing clubs */}
        {!isNew && (
          <>
            <Divider sx={{ my: 3 }} />
            <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
              <Typography variant="overline" color="text.secondary" sx={{ flexGrow: 1 }}>
                Members ({club?.members.length ?? 0})
              </Typography>
              <Button
                size="small"
                startIcon={<PersonAddIcon />}
                onClick={openAddMember}
              >
                Add member
              </Button>
            </Box>

            {club?.members.length === 0 ? (
              <Typography variant="body2" color="text.secondary" fontStyle="italic">
                No members yet. Add some from your global members list.
              </Typography>
            ) : (
              <List disablePadding>
                {club?.members.map((member) => (
                  <ListItem
                    key={member.id}
                    disablePadding
                    sx={{ py: 1, borderBottom: 1, borderColor: "divider" }}
                    secondaryAction={
                      <IconButton
                        size="small"
                        aria-label={`Remove ${member.name}`}
                        onClick={() => handleRemoveMember(member.id)}
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    }
                  >
                    <ListItemAvatar>
                      <Avatar sx={{ width: 36, height: 36, fontSize: 14 }}>
                        {member.name[0]?.toUpperCase()}
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText
                      primary={
                        <Box
                          component="span"
                          sx={{ cursor: "pointer", "&:hover": { textDecoration: "underline" } }}
                          onClick={() => navigate(`/members/${member.id}`)}
                        >
                          {member.name}
                        </Box>
                      }
                      secondary={
                        <Chip label={modelLabel(member.model)} size="small" variant="outlined" sx={{ mt: 0.5 }} />
                      }
                    />
                  </ListItem>
                ))}
              </List>
            )}
          </>
        )}
      </Container>

      {/* Add member dialog */}
      <Dialog open={addMemberOpen} onClose={() => setAddMemberOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle>Add member</DialogTitle>
        <DialogContent dividers sx={{ p: 0 }}>
          {allMembers.length === 0 ? (
            <Box sx={{ p: 3 }}>
              <Typography variant="body2" color="text.secondary">
                All members are already in this club, or no members exist yet.
              </Typography>
              <Button sx={{ mt: 2 }} onClick={() => { setAddMemberOpen(false); navigate("/members/new"); }}>
                Create a new member
              </Button>
            </Box>
          ) : (
            <List disablePadding>
              {allMembers.map((member) => (
                <ListItem
                  key={member.id}
                  // eslint-disable-next-line @typescript-eslint/no-explicit-any
                  {...({ button: true } as any)}
                  onClick={() => handleAddMember(member)}
                  sx={{ borderBottom: 1, borderColor: "divider" }}
                >
                  <ListItemAvatar>
                    <Avatar sx={{ width: 32, height: 32, fontSize: 13 }}>
                      {member.name[0]?.toUpperCase()}
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary={member.name}
                    secondary={modelLabel(member.model)}
                  />
                </ListItem>
              ))}
            </List>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAddMemberOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>

      <ConfirmDialog
        open={confirmDeleteOpen}
        title="Delete club?"
        message={`"${club?.name ?? name}" will be permanently deleted.`}
        onConfirm={handleDelete}
        onCancel={() => setConfirmDeleteOpen(false)}
      />
    </Box>
  );
}
