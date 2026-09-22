import type { RefreshTokenRepository, StoredRefreshToken } from "../application/ports.js";

export class InMemoryRefreshTokenRepository implements RefreshTokenRepository {
  private readonly tokens = new Map<string, StoredRefreshToken>();

  async save(token: string, entry: StoredRefreshToken): Promise<void> {
    this.tokens.set(token, entry);
  }

  async find(token: string): Promise<StoredRefreshToken | undefined> {
    return this.tokens.get(token);
  }

  async revoke(token: string): Promise<void> {
    this.tokens.delete(token);
  }
}
