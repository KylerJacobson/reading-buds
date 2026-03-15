/**
 * Represents a reading entry — either a book or an article.
 * Entries are only created after the user has finished reading.
 */
export type EntryType = "book" | "article";

export interface ReadingEntry {
  id: string;
  type: EntryType;
  title: string;
  author: string;
  createdAt: string; // ISO-8601 timestamp
  /** The user's written analysis / review of the work. */
  analysis: string;
  /**
   * The raw article text pasted in by the user.
   * Only relevant when type === "article".
   */
  articleContent?: string;
  /**
   * The source URL of the article.
   * Only relevant when type === "article".
   */
  url?: string;
}

/** Input type for creating a new entry — id and createdAt are generated internally. */
export type CreateEntryInput = Omit<ReadingEntry, "id" | "createdAt">;
