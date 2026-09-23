import { test } from "node:test";
import assert from "node:assert/strict";

import type { User } from "../domain/user.js";
import { refresh } from "./refresh.js";
import { logout } from "./logout.js";
import type { RefreshTokenRepository, StoredRefreshToken, TokenService, UserRepository } from "./ports.js";

const activeUser: User = {
  id: "user-1",
  name: "Ana Supervisor",
  email: "ana@qqs.app",
  passwordHash: "hashed:x",
  role: "supervisor",
  active: true,
};

function usersWith(...users: User[]): UserRepository {
  return {
    list: async () => users,
    findByEmail: async (email) => users.find((user) => user.email === email),
    findById: async (id) => users.find((user) => user.id === id),
    save: async () => undefined,
  };
}

const fakeTokens: TokenService = {
  signAccessToken: (payload) => `access:${payload.sub}:${payload.role}`,
  verifyAccessToken: () => undefined,
};

function fakeRefreshTokens(seed?: Record<string, StoredRefreshToken>): RefreshTokenRepository {
  const store = new Map<string, StoredRefreshToken>(Object.entries(seed ?? {}));
  return {
    save: async (token, entry) => {
      store.set(token, entry);
    },
    find: async (token) => store.get(token),
    revoke: async (token) => {
      store.delete(token);
    },
  };
}

test("refresh issues a new access token and rotates the refresh token", async () => {
  const refreshTokens = fakeRefreshTokens({
    "token-1": { userId: "user-1", expiresAt: "2099-01-01T00:00:00.000Z" },
  });

  const result = await refresh(
    { users: usersWith(activeUser), tokens: fakeTokens, refreshTokens },
    { refreshToken: "token-1" },
  );

  assert.equal(result.accessToken, "access:user-1:supervisor");
  assert.notEqual(result.refreshToken, "token-1");
  assert.equal(await refreshTokens.find("token-1"), undefined);
  assert.ok(await refreshTokens.find(result.refreshToken));
});

test("refresh rejects an unknown token", async () => {
  await assert.rejects(
    () =>
      refresh(
        { users: usersWith(activeUser), tokens: fakeTokens, refreshTokens: fakeRefreshTokens() },
        { refreshToken: "does-not-exist" },
      ),
    /invalid refresh token/,
  );
});

test("refresh rejects an expired token", async () => {
  const refreshTokens = fakeRefreshTokens({
    "token-1": { userId: "user-1", expiresAt: "2000-01-01T00:00:00.000Z" },
  });

  await assert.rejects(
    () =>
      refresh(
        { users: usersWith(activeUser), tokens: fakeTokens, refreshTokens },
        { refreshToken: "token-1" },
      ),
    /invalid refresh token/,
  );
});

test("refresh rejects a token revoked by logout", async () => {
  const refreshTokens = fakeRefreshTokens({
    "token-1": { userId: "user-1", expiresAt: "2099-01-01T00:00:00.000Z" },
  });

  await logout({ refreshTokens }, { refreshToken: "token-1" });

  await assert.rejects(
    () =>
      refresh(
        { users: usersWith(activeUser), tokens: fakeTokens, refreshTokens },
        { refreshToken: "token-1" },
      ),
    /invalid refresh token/,
  );
});
