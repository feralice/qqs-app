import { randomUUID } from "node:crypto";

import type { AuthUser } from "@qqs/contracts";

import { InvalidCredentialsError } from "../domain/user.js";
import type {
  PasswordHasher,
  RefreshTokenRepository,
  TokenService,
  UserRepository,
} from "./ports.js";

export const REFRESH_TOKEN_TTL_MS = 30 * 24 * 60 * 60 * 1000;

export type LoginInput = {
  email: string;
  password: string;
};

export type LoginResult = {
  accessToken: string;
  refreshToken: string;
  user: AuthUser;
};

export async function login(
  deps: {
    users: UserRepository;
    hasher: PasswordHasher;
    tokens: TokenService;
    refreshTokens: RefreshTokenRepository;
    now?: Date;
  },
  input: LoginInput,
): Promise<LoginResult> {
  const user = await deps.users.findByEmail(input.email.trim().toLowerCase());
  if (!user || !user.active) {
    throw new InvalidCredentialsError();
  }

  const passwordMatches = await deps.hasher.compare(input.password, user.passwordHash);
  if (!passwordMatches) {
    throw new InvalidCredentialsError();
  }

  const accessToken = deps.tokens.signAccessToken({ sub: user.id, role: user.role });
  const refreshToken = randomUUID() + randomUUID();
  const now = deps.now ?? new Date();
  await deps.refreshTokens.save(refreshToken, {
    userId: user.id,
    expiresAt: new Date(now.getTime() + REFRESH_TOKEN_TTL_MS).toISOString(),
  });

  return {
    accessToken,
    refreshToken,
    user: { id: user.id, name: user.name, email: user.email, role: user.role },
  };
}
