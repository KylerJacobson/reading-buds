import {
  Card,
  CardContent,
  CardActionArea,
  Typography,
  Chip,
  Box,
} from "@mui/material";
import MenuBookIcon from "@mui/icons-material/MenuBook";
import ArticleIcon from "@mui/icons-material/Article";
import { ReadingEntry } from "../../types/entry";

interface BookCardProps {
  entry: ReadingEntry;
  onClick?: (entry: ReadingEntry) => void;
}

/**
 * Displays a single reading entry (book or article) as a card.
 * Shows title, author, and type badge.
 */
export function BookCard({ entry, onClick }: BookCardProps) {
  const { title, author, type } = entry;

  return (
    <Card sx={{ width: "100%" }}>
      <CardActionArea onClick={() => onClick?.(entry)} sx={{ p: 0.5 }}>
        <CardContent>
          {/* Entry type icon + chip */}
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
    </Card>
  );
}
