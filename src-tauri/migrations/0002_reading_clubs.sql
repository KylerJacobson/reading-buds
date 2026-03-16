-- Global reusable members (LLM personas)
CREATE TABLE IF NOT EXISTS members (
  id         TEXT PRIMARY KEY,
  name       TEXT NOT NULL,
  bio        TEXT NOT NULL DEFAULT '',
  model      TEXT NOT NULL,
  created_at TEXT NOT NULL
);

-- Reading clubs (reusable collections of members)
CREATE TABLE IF NOT EXISTS clubs (
  id         TEXT PRIMARY KEY,
  name       TEXT NOT NULL,
  created_at TEXT NOT NULL
);

-- Many-to-many: clubs ↔ members
CREATE TABLE IF NOT EXISTS club_members (
  club_id   TEXT NOT NULL REFERENCES clubs(id) ON DELETE CASCADE,
  member_id TEXT NOT NULL REFERENCES members(id) ON DELETE CASCADE,
  PRIMARY KEY (club_id, member_id)
);

-- Associate an entry with a club (nullable — one club at a time)
ALTER TABLE entries ADD COLUMN club_id TEXT;
