import { randomUUID } from "node:crypto";

import { InvalidRefreshTokenError } from "../domain/user.js";
import type { RefreshTokenRepository, TokenService, UserRepository } from "./ports.js";
import { REFRESH_TOKEN_TTL_MS } from "./login.js";

export type RefreshInput = {
  refreshToken: string;
};

export type RefreshResult = {
  accessToken: string;
  refreshToken: string;
};

export async function refresh(
  deps: {
    users: UserRepository;
    tokens: TokenService;
    refreshTokens: RefreshTokenRepository;
    now?: Date;
  },
  input: RefreshInput,
): Promise<RefreshResult> {
  const stored = await deps.refreshTokens.find(input.refreshToken);
  const now = deps.now ?? new Date();
  if (!stored || new Date(stored.expiresAt).getTime() <= now.getTime()) {
    throw new InvalidRefreshTokenError();
  }

  const user = await deps.users.findById(stored.userId);
  if (!user || !user.active) {
    throw new InvalidRefreshTokenError();
  }

  await deps.refreshTokens.revoke(input.refreshToken);

  const accessToken = deps.tokens.signAccessToken({ sub: user.id, role: user.role });
  const newRefreshToken = randomUUID() + randomUUID();
  await deps.refreshTokens.save(newRefreshToken, {
    userId: user.id,
    expiresAt: new Date(now.getTime() + REFRESH_TOKEN_TTL_MS).toISOString(),
  });

  return { accessToken, refreshToken: newRefreshToken };
}
