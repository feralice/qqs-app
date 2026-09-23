import type { UserId, UserRole } from "@qqs/contracts";

import type { User } from "../domain/user.js";

export type UserRepository = {
  findByEmail(email: string): Promise<User | undefined>;
  findById(id: UserId): Promise<User | undefined>;
  list(): Promise<User[]>;
  save(user: User): Promise<void>;
};

export type PasswordHasher = {
  hash(plainText: string): Promise<string>;
  compare(plainText: string, hash: string): Promise<boolean>;
};

export type AccessTokenPayload = {
  sub: UserId;
  role: UserRole;
};

export type TokenService = {
  signAccessToken(payload: AccessTokenPayload): string;
  verifyAccessToken(token: string): AccessTokenPayload | undefined;
};

export type StoredRefreshToken = {
  userId: UserId;
  expiresAt: string;
};

export type RefreshTokenRepository = {
  save(token: string, entry: StoredRefreshToken): Promise<void>;
  find(token: string): Promise<StoredRefreshToken | undefined>;
  revoke(token: string): Promise<void>;
};
