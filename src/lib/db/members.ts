import { v4 as uuidv4 } from "uuid";
import { getDb } from "./client";
import type { Member, CreateMemberInput } from "../../types/club";

interface MemberRow {
  id: string;
  name: string;
  bio: string;
  model: string;
  created_at: string;
}

function rowToMember(row: MemberRow): Member {
  return {
    id: row.id,
    name: row.name,
    bio: row.bio,
    model: row.model,
    createdAt: row.created_at,
  };
}

export async function listMembers(): Promise<Member[]> {
  const db = await getDb();
  const rows = await db.select<MemberRow[]>(
    "SELECT id, name, bio, model, created_at FROM members ORDER BY name ASC"
  );
  return rows.map(rowToMember);
}

export async function getMember(id: string): Promise<Member | null> {
  const db = await getDb();
  const rows = await db.select<MemberRow[]>(
    "SELECT id, name, bio, model, created_at FROM members WHERE id = $1",
    [id]
  );
  return rows.length > 0 ? rowToMember(rows[0]) : null;
}

export async function createMember(input: CreateMemberInput): Promise<Member> {
  const db = await getDb();
  const id = uuidv4();
  const now = new Date().toISOString();
  await db.execute(
    "INSERT INTO members (id, name, bio, model, created_at) VALUES ($1, $2, $3, $4, $5)",
    [id, input.name, input.bio, input.model, now]
  );
  return { id, name: input.name, bio: input.bio, model: input.model, createdAt: now };
}

export async function updateMember(member: Member): Promise<void> {
  const db = await getDb();
  await db.execute(
    "UPDATE members SET name = $1, bio = $2, model = $3 WHERE id = $4",
    [member.name, member.bio, member.model, member.id]
  );
}

export async function deleteMember(id: string): Promise<void> {
  const db = await getDb();
  // Remove from all club memberships first (club_members join rows)
  await db.execute("DELETE FROM club_members WHERE member_id = $1", [id]);
  await db.execute("DELETE FROM members WHERE id = $1", [id]);
}
