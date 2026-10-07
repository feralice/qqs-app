import { asc, eq } from "drizzle-orm";

import type { Database } from "../db/database.js";
import { users } from "../db/schema.js";
import type { UserRepository } from "../../application/auth/ports.js";
import type { User } from "../../domain/auth/user.js";

function toUser(row: typeof users.$inferSelect): User {
  return {
    id: row.id,
    name: row.name,
    email: row.email,
    passwordHash: row.passwordHash,
    role: row.role,
    active: row.active,
  };
}

export class DrizzleUserRepository implements UserRepository {
  constructor(private readonly db: Database) {}

  async findByEmail(email: string): Promise<User | undefined> {
    const [row] = await this.db.select().from(users).where(eq(users.email, email));
    return row && toUser(row);
  }

  async findById(id: string): Promise<User | undefined> {
    const [row] = await this.db.select().from(users).where(eq(users.id, id));
    return row && toUser(row);
  }

  async list(): Promise<User[]> {
    const rows = await this.db.select().from(users).orderBy(asc(users.name));
    return rows.map(toUser);
  }

  async save(user: User): Promise<void> {
    const { id, ...fields } = user;
    await this.db.insert(users).values(user).onConflictDoUpdate({ target: users.id, set: fields });
  }
}
