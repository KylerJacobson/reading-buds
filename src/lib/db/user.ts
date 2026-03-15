import { getDb } from "./client";
import type { User } from "../../types/user";

interface UserRow {
  first_name: string;
  last_name: string;
}

/**
 * Returns the user profile. Always returns a value — the migration seeds
 * a blank row (id = 1) on first launch.
 */
export async function getUser(): Promise<User> {
  const db = await getDb();
  const rows = await db.select<UserRow[]>(
    "SELECT first_name, last_name FROM user WHERE id = 1"
  );
  const row = rows[0];
  return { firstName: row.first_name, lastName: row.last_name };
}

/** Persists first and last name for the single user profile. */
export async function updateUser(user: User): Promise<void> {
  const db = await getDb();
  await db.execute(
    "UPDATE user SET first_name = $1, last_name = $2 WHERE id = 1",
    [user.firstName, user.lastName]
  );
}
