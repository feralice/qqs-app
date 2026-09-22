import { randomUUID } from "node:crypto";

import type { AuthUser } from "@qqs/contracts";

import { EmailAlreadyRegisteredError, InvalidRegistrationError, type User } from "../domain/user.js";
import type { PasswordHasher, RefreshTokenRepository, TokenService, UserRepository } from "./ports.js";
import { REFRESH_TOKEN_TTL_MS } from "./login.js";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export type RegisterInput = {
  name: string;
  email: string;
  password: string;
};

export type RegisterResult = {
  accessToken: string;
  refreshToken: string;
  user: AuthUser;
};

// Cadastro público só cria conta de técnico. Perfil de administrador
// continua restrito a contas mantidas pela equipe, nunca por auto-cadastro.
export async function register(
  deps: {
    users: UserRepository;
    hasher: PasswordHasher;
    tokens: TokenService;
    refreshTokens: RefreshTokenRepository;
    now?: Date;
  },
  input: RegisterInput,
): Promise<RegisterResult> {
  const name = input.name.trim();
  const email = input.email.trim().toLowerCase();

  if (!name) {
    throw new InvalidRegistrationError("name is required");
  }
  if (!EMAIL_PATTERN.test(email)) {
    throw new InvalidRegistrationError("a valid email is required");
  }
  if (input.password.length < 6) {
    throw new InvalidRegistrationError("password must have at least 6 characters");
  }

  if (await deps.users.findByEmail(email)) {
    throw new EmailAlreadyRegisteredError();
  }

  const user: User = {
    id: randomUUID(),
    name,
    email,
    passwordHash: await deps.hasher.hash(input.password),
    role: "employee",
    active: true,
  };
  await deps.users.save(user);

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
