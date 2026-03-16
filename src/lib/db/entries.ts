import { v4 as uuidv4 } from "uuid";
import { getDb } from "./client";
import type { ReadingEntry, CreateEntryInput } from "../../types/entry";

// ---------------------------------------------------------------------------
// Row shapes returned by SQLite — column names are snake_case.
// ---------------------------------------------------------------------------

interface EntryRow {
  id: string;
  type: "book" | "article";
  title: string;
  author: string;
  created_at: string;
  analysis: string;
  article_content: string | null;
  url: string | null;
  club_id: string | null;
}

// Map a raw DB row to the camelCase application type.
function rowToEntry(row: EntryRow): ReadingEntry {
  return {
    id: row.id,
    type: row.type,
    title: row.title,
    author: row.author,
    createdAt: row.created_at,
    analysis: row.analysis,
    articleContent: row.article_content ?? undefined,
    url: row.url ?? undefined,
    clubId: row.club_id ?? undefined,
  };
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Returns all entries ordered newest-first, with their content joined in.
 */
export async function listEntries(): Promise<ReadingEntry[]> {
  const db = await getDb();

  const rows = await db.select<EntryRow[]>(`
    SELECT
      e.id, e.type, e.title, e.author, e.created_at, e.club_id,
      COALESCE(ec.analysis, '')   AS analysis,
      ec.article_content,
      ec.url
    FROM entries e
    LEFT JOIN entry_content ec ON ec.entry_id = e.id
    ORDER BY e.created_at DESC
  `);

  return rows.map(rowToEntry);
}

/**
 * Returns a single entry by id, or null if not found.
 */
export async function getEntry(id: string): Promise<ReadingEntry | null> {
  const db = await getDb();

  const rows = await db.select<EntryRow[]>(
    `
    SELECT
      e.id, e.type, e.title, e.author, e.created_at, e.club_id,
      COALESCE(ec.analysis, '')   AS analysis,
      ec.article_content,
      ec.url
    FROM entries e
    LEFT JOIN entry_content ec ON ec.entry_id = e.id
    WHERE e.id = $1
    `,
    [id]
  );

  return rows.length > 0 ? rowToEntry(rows[0]) : null;
}

/**
 * Creates a new entry and its associated content row.
 * Returns the fully populated entry.
 *
 * Note: tauri-plugin-sql pools connections per execute call, so manual
 * BEGIN/COMMIT cannot span multiple calls. The parent row (entries) is
 * inserted first so the foreign-key constraint on entry_content is always
 * satisfied; a partial write is recoverable via a future cleanup migration
 * if ever needed.
 */
export async function createEntry(
  input: CreateEntryInput
): Promise<ReadingEntry> {
  const db = await getDb();
  const id = uuidv4();
  const now = new Date().toISOString();

  await db.execute(
    `INSERT INTO entries (id, type, title, author, created_at, club_id)
     VALUES ($1, $2, $3, $4, $5, $6)`,
    [id, input.type, input.title, input.author, now, input.clubId ?? null]
  );

  await db.execute(
    `INSERT INTO entry_content (id, entry_id, analysis, article_content, url, updated_at)
     VALUES ($1, $2, $3, $4, $5, $6)`,
    [id, id, input.analysis ?? "", input.articleContent ?? null, input.url ?? null, now]
  );

  return {
    id,
    type: input.type,
    title: input.title,
    author: input.author,
    createdAt: now,
    analysis: input.analysis ?? "",
    articleContent: input.articleContent,
    url: input.url,
    clubId: input.clubId,
  };
}

/** Deletes an entry and its content row (cascaded by the DB foreign key). */
export async function deleteEntry(id: string): Promise<void> {
  const db = await getDb();
  await db.execute("DELETE FROM entries WHERE id = $1", [id]);
}

/**
 * Updates an existing entry's mutable fields.
 * `id` and `createdAt` are immutable — all other fields may change.
 */
export async function updateEntry(entry: ReadingEntry): Promise<void> {
  const db = await getDb();
  const now = new Date().toISOString();

  await db.execute(
    `UPDATE entries SET type = $1, title = $2, author = $3, club_id = $4 WHERE id = $5`,
    [entry.type, entry.title, entry.author, entry.clubId ?? null, entry.id]
  );

  await db.execute(
    `UPDATE entry_content
     SET analysis = $1, article_content = $2, url = $3, updated_at = $4
     WHERE entry_id = $5`,
    [entry.analysis ?? "", entry.articleContent ?? null, entry.url ?? null, now, entry.id]
  );
}

/** Associates an entry with a reading club, or clears the association if clubId is null. */
export async function setEntryClub(entryId: string, clubId: string | null): Promise<void> {
  const db = await getDb();
  await db.execute("UPDATE entries SET club_id = $1 WHERE id = $2", [clubId, entryId]);
}
