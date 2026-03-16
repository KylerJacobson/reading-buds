import { v4 as uuidv4 } from "uuid";
import { getDb } from "./client";
import type { Club, ClubWithMembers, CreateClubInput, Member } from "../../types/club";

interface ClubRow {
  id: string;
  name: string;
  created_at: string;
}

interface ClubMemberRow {
  id: string;
  name: string;
  bio: string;
  model: string;
  created_at: string;
}

function rowToClub(row: ClubRow): Club {
  return { id: row.id, name: row.name, createdAt: row.created_at };
}

function rowToMember(row: ClubMemberRow): Member {
  return { id: row.id, name: row.name, bio: row.bio, model: row.model, createdAt: row.created_at };
}

export async function listClubs(): Promise<Club[]> {
  const db = await getDb();
  const rows = await db.select<ClubRow[]>(
    "SELECT id, name, created_at FROM clubs ORDER BY name ASC"
  );
  return rows.map(rowToClub);
}

export async function getClubWithMembers(id: string): Promise<ClubWithMembers | null> {
  const db = await getDb();
  const clubRows = await db.select<ClubRow[]>(
    "SELECT id, name, created_at FROM clubs WHERE id = $1",
    [id]
  );
  if (clubRows.length === 0) return null;

  const memberRows = await db.select<ClubMemberRow[]>(
    `SELECT m.id, m.name, m.bio, m.model, m.created_at
     FROM members m
     JOIN club_members cm ON cm.member_id = m.id
     WHERE cm.club_id = $1
     ORDER BY m.name ASC`,
    [id]
  );

  return {
    ...rowToClub(clubRows[0]),
    members: memberRows.map(rowToMember),
  };
}

export async function createClub(input: CreateClubInput): Promise<Club> {
  const db = await getDb();
  const id = uuidv4();
  const now = new Date().toISOString();
  await db.execute(
    "INSERT INTO clubs (id, name, created_at) VALUES ($1, $2, $3)",
    [id, input.name, now]
  );
  return { id, name: input.name, createdAt: now };
}

export async function updateClub(club: Club): Promise<void> {
  const db = await getDb();
  await db.execute("UPDATE clubs SET name = $1 WHERE id = $2", [club.name, club.id]);
}

export async function deleteClub(id: string): Promise<void> {
  const db = await getDb();
  // Nullify club_id on any entries that reference this club
  await db.execute("UPDATE entries SET club_id = NULL WHERE club_id = $1", [id]);
  // club_members rows cascade if FK enforcement is on; delete explicitly to be safe
  await db.execute("DELETE FROM club_members WHERE club_id = $1", [id]);
  await db.execute("DELETE FROM clubs WHERE id = $1", [id]);
}

export async function addMemberToClub(clubId: string, memberId: string): Promise<void> {
  const db = await getDb();
  await db.execute(
    "INSERT OR IGNORE INTO club_members (club_id, member_id) VALUES ($1, $2)",
    [clubId, memberId]
  );
}

export async function removeMemberFromClub(clubId: string, memberId: string): Promise<void> {
  const db = await getDb();
  await db.execute(
    "DELETE FROM club_members WHERE club_id = $1 AND member_id = $2",
    [clubId, memberId]
  );
}
