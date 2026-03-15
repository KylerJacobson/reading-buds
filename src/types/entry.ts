/**
 * Represents a reading entry — either a book or an article.
 * Entries are only created after the user has finished reading.
 * This is a stub; fields will expand as the data model matures.
 */
export type EntryType = "book" | "article";

export interface ReadingEntry {
  id: string;
  type: EntryType;
  title: string;
  author: string;
}
