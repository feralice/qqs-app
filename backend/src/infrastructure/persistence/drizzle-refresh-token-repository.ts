import { eq } from "drizzle-orm";

import type { Database } from "../db/database.js";
import { refreshTokens } from "../db/schema.js";
import type { RefreshTokenRepository, StoredRefreshToken } from "../../application/auth/ports.js";

export class DrizzleRefreshTokenRepository implements RefreshTokenRepository {
  constructor(private readonly db: Database) {}

  async save(token: string, entry: StoredRefreshToken): Promise<void> {
    await this.db.insert(refreshTokens).values({
      token,
      userId: entry.userId,
      expiresAt: new Date(entry.expiresAt),
    });
  }

  async find(token: string): Promise<StoredRefreshToken | undefined> {
    const [row] = await this.db.select().from(refreshTokens).where(eq(refreshTokens.token, token));
    return row && { userId: row.userId, expiresAt: row.expiresAt.toISOString() };
  }

  async revoke(token: string): Promise<void> {
    await this.db.delete(refreshTokens).where(eq(refreshTokens.token, token));
  }
}
