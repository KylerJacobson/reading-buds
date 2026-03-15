import { useState } from "react";
import {
  Box,
  Card,
  CardActionArea,
  CardContent,
  Chip,
  IconButton,
  Typography,
} from "@mui/material";
import ArticleIcon from "@mui/icons-material/Article";
import DeleteIcon from "@mui/icons-material/Delete";
import MenuBookIcon from "@mui/icons-material/MenuBook";
import { ConfirmDialog } from "../ConfirmDialog";
import { deleteEntry } from "../../lib/db/entries";
import { ReadingEntry } from "../../types/entry";

interface BookCardProps {
  entry: ReadingEntry;
  onClick?: (entry: ReadingEntry) => void;
  onDelete?: (entry: ReadingEntry) => void;
}

/**
 * Displays a single reading entry (book or article) as a card.
 * The main tap area navigates to the entry; the delete icon opens a
 * confirmation dialog and calls onDelete after a successful DB delete.
 */
export function BookCard({ entry, onClick, onDelete }: BookCardProps) {
  const { title, author, type } = entry;
  const [confirmOpen, setConfirmOpen] = useState(false);

  async function handleDeleteConfirm() {
    await deleteEntry(entry.id);
    setConfirmOpen(false);
    onDelete?.(entry);
  }

  return (
    <>
      <Card sx={{ width: "100%", display: "flex", alignItems: "stretch" }}>
        {/* Tappable area — takes all available space */}
        <CardActionArea onClick={() => onClick?.(entry)} sx={{ flex: 1, p: 0.5 }}>
          <CardContent>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
              {type === "book" ? (
                <MenuBookIcon fontSize="small" color="primary" />
              ) : (
                <ArticleIcon fontSize="small" color="secondary" />
              )}
              <Chip
                label={type === "book" ? "Book" : "Article"}
                size="small"
                color={type === "book" ? "primary" : "secondary"}
                variant="outlined"
              />
            </Box>

            <Typography variant="h6" component="div" noWrap>
              {title}
            </Typography>

            <Typography variant="body2" color="text.secondary" noWrap>
              {author}
            </Typography>
          </CardContent>
        </CardActionArea>

        {/* Delete button — outside CardActionArea so it has its own tap target */}
        <Box sx={{ display: "flex", alignItems: "center", pr: 1 }}>
          <IconButton
            aria-label={`Delete ${title}`}
            size="small"
            onClick={() => setConfirmOpen(true)}
          >
            <DeleteIcon fontSize="small" />
          </IconButton>
        </Box>
      </Card>

      <ConfirmDialog
        open={confirmOpen}
        title="Delete entry?"
        message={`"${title}" will be permanently deleted.`}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setConfirmOpen(false)}
      />
    </>
  );
}
