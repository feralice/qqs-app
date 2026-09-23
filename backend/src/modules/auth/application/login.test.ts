import { test } from "node:test";
import assert from "node:assert/strict";

import type { User } from "../domain/user.js";
import { login } from "./login.js";
import type {
  PasswordHasher,
  RefreshTokenRepository,
  StoredRefreshToken,
  TokenService,
  UserRepository,
} from "./ports.js";

const activeUser: User = {
  id: "user-1",
  name: "Ana Supervisor",
  email: "ana@qqs.app",
  passwordHash: "hashed:correct-password",
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

const fakeHasher: PasswordHasher = {
  hash: async (plainText) => `hashed:${plainText}`,
  compare: async (plainText, hash) => hash === `hashed:${plainText}`,
};

const fakeTokens: TokenService = {
  signAccessToken: (payload) => `access:${payload.sub}:${payload.role}`,
  verifyAccessToken: () => undefined,
};

function fakeRefreshTokens(): RefreshTokenRepository {
  const store = new Map<string, StoredRefreshToken>();
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

test("login issues an access token and a stored refresh token for valid credentials", async () => {
  const refreshTokens = fakeRefreshTokens();
  const result = await login(
    { users: usersWith(activeUser), hasher: fakeHasher, tokens: fakeTokens, refreshTokens },
    { email: "ana@qqs.app", password: "correct-password" },
  );

  assert.equal(result.accessToken, "access:user-1:supervisor");
  assert.equal(result.user.email, "ana@qqs.app");
  assert.ok(await refreshTokens.find(result.refreshToken));
});

test("login rejects an unknown email", async () => {
  await assert.rejects(
    () =>
      login(
        { users: usersWith(activeUser), hasher: fakeHasher, tokens: fakeTokens, refreshTokens: fakeRefreshTokens() },
        { email: "missing@qqs.app", password: "correct-password" },
      ),
    /invalid credentials/,
  );
});

test("login rejects the wrong password", async () => {
  await assert.rejects(
    () =>
      login(
        { users: usersWith(activeUser), hasher: fakeHasher, tokens: fakeTokens, refreshTokens: fakeRefreshTokens() },
        { email: "ana@qqs.app", password: "wrong-password" },
      ),
    /invalid credentials/,
  );
});

test("login rejects an inactive user", async () => {
  const inactiveUser: User = { ...activeUser, active: false };
  await assert.rejects(
    () =>
      login(
        { users: usersWith(inactiveUser), hasher: fakeHasher, tokens: fakeTokens, refreshTokens: fakeRefreshTokens() },
        { email: "ana@qqs.app", password: "correct-password" },
      ),
    /invalid credentials/,
  );
});
