import { test } from "node:test";
import assert from "node:assert/strict";
import { inspect } from "node:util";

import { createAuthApi } from "./auth-api";

test("auth API does not write passwords or tokens to the console", async (context) => {
  const messages: string[] = [];
  for (const method of ["log", "warn", "error"] as const) {
    context.mock.method(console, method, (...values: unknown[]) => messages.push(inspect(values)));
  }
  const api = createAuthApi(async () => new Response(JSON.stringify({ accessToken: "private-access-token", refreshToken: "private-refresh-token", user: { id: "user" } }), { status: 200 }), "http://api.test");

  const session = await api.login({ email: "person@example.com", password: "private-password" });

  assert.equal(session.accessToken, "private-access-token");
  assert.doesNotMatch(messages.join("\n"), /private-password|private-access-token|private-refresh-token/);
});

test("auth API preserves the server error message", async () => {
  const api = createAuthApi(async () => new Response(JSON.stringify({ error: "invalid credentials" }), { status: 401 }), "http://api.test");
  await assert.rejects(api.login({ email: "person@example.com", password: "bad" }), /invalid credentials/);
});

test("auth API accepts logout without a response body", async () => {
  const api = createAuthApi(async () => new Response(null, { status: 204 }), "http://api.test");
  await api.logout("token");
});
