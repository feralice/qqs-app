import { test } from "node:test";
import assert from "node:assert/strict";

import type { User } from "../domain/user.js";
import { register } from "./register.js";
import type { PasswordHasher, RefreshTokenRepository, StoredRefreshToken, TokenService, UserRepository } from "./ports.js";

function fakeUsers(...seed: User[]): UserRepository {
  const users = new Map(seed.map((user) => [user.email, user]));
  return {
    findByEmail: async (email) => users.get(email),
    findById: async (id) => [...users.values()].find((user) => user.id === id),
    save: async (user) => {
      users.set(user.email, user);
    },
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

test("register creates an employee account and logs it in", async () => {
  const users = fakeUsers();
  const result = await register(
    { users, hasher: fakeHasher, tokens: fakeTokens, refreshTokens: fakeRefreshTokens() },
    { name: "Novo Técnico", email: "Novo@QQS.app", password: "senha123" },
  );

  assert.equal(result.user.role, "employee");
  assert.equal(result.user.email, "novo@qqs.app");
  assert.ok(result.accessToken);
  assert.ok(await users.findByEmail("novo@qqs.app"));
});

test("register rejects an email already in use", async () => {
  const existing: User = {
    id: "user-1",
    name: "Já existe",
    email: "existe@qqs.app",
    passwordHash: "hashed:x",
    role: "employee",
    active: true,
  };

  await assert.rejects(
    () =>
      register(
        { users: fakeUsers(existing), hasher: fakeHasher, tokens: fakeTokens, refreshTokens: fakeRefreshTokens() },
        { name: "Outro", email: "existe@qqs.app", password: "senha123" },
      ),
    /email already registered/,
  );
});

test("register rejects a short password", async () => {
  await assert.rejects(
    () =>
      register(
        { users: fakeUsers(), hasher: fakeHasher, tokens: fakeTokens, refreshTokens: fakeRefreshTokens() },
        { name: "Alguém", email: "alguem@qqs.app", password: "123" },
      ),
    /password must have at least 6 characters/,
  );
});

test("register rejects an invalid email", async () => {
  await assert.rejects(
    () =>
      register(
        { users: fakeUsers(), hasher: fakeHasher, tokens: fakeTokens, refreshTokens: fakeRefreshTokens() },
        { name: "Alguém", email: "não-é-email", password: "senha123" },
      ),
    /valid email/,
  );
});
