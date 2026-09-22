import { test } from "node:test";
import assert from "node:assert/strict";
import { createRequest, createResponse } from "node-mocks-http";
import type { Express } from "express";

import { createApp } from "../../../app.js";

// bcrypt roda em várias etapas assíncronas; espera response._isEndCalled()
// em vez de um único tick, senão a leitura chega antes do hash terminar.
async function call(app: Express, options: Parameters<typeof createRequest>[0]) {
  const response = createResponse();
  app(createRequest(options), response);
  for (let tick = 0; tick < 100 && !response._isEndCalled(); tick++) {
    await new Promise((resolve) => setImmediate(resolve));
  }
  return response;
}

test("POST /auth/register creates an employee account and logs it in", async () => {
  const response = await call(createApp(), {
    method: "POST",
    url: "/auth/register",
    body: { name: "Novo Técnico", email: "novo-tecnico@qqs.app", password: "senha123" },
  });

  assert.equal(response.statusCode, 201);
  const body = response._getJSONData();
  assert.equal(body.user.role, "employee");
  assert.ok(body.accessToken);
});

test("POST /auth/register rejects a duplicate email", async () => {
  const app = createApp();
  await call(app, {
    method: "POST",
    url: "/auth/register",
    body: { name: "Primeira Conta", email: "duplicado@qqs.app", password: "senha123" },
  });

  const response = await call(app, {
    method: "POST",
    url: "/auth/register",
    body: { name: "Segunda Conta", email: "duplicado@qqs.app", password: "senha123" },
  });

  assert.equal(response.statusCode, 409);
});

test("POST /auth/login returns tokens for a valid technician login", async () => {
  const response = await call(createApp(), {
    method: "POST",
    url: "/auth/login",
    body: { email: "tecnico@qqs.app", password: "Tecnico123!" },
  });

  assert.equal(response.statusCode, 200);
  const body = response._getJSONData();
  assert.equal(body.user.role, "employee");
  assert.ok(body.accessToken);
  assert.ok(body.refreshToken);
});

test("POST /auth/login rejects a wrong password", async () => {
  const response = await call(createApp(), {
    method: "POST",
    url: "/auth/login",
    body: { email: "tecnico@qqs.app", password: "senha-errada" },
  });

  assert.equal(response.statusCode, 401);
});

test("POST /auth/refresh issues a new access token from a valid refresh token", async () => {
  const app = createApp();
  const login = await call(app, {
    method: "POST",
    url: "/auth/login",
    body: { email: "admin1@qqs.app", password: "Admin123!" },
  });

  const refreshResponse = await call(app, {
    method: "POST",
    url: "/auth/refresh",
    body: { refreshToken: login._getJSONData().refreshToken },
  });

  assert.equal(refreshResponse.statusCode, 200);
  assert.ok(refreshResponse._getJSONData().accessToken);
});

test("POST /auth/logout revokes the refresh token", async () => {
  const app = createApp();
  const login = await call(app, {
    method: "POST",
    url: "/auth/login",
    body: { email: "admin1@qqs.app", password: "Admin123!" },
  });
  const refreshToken = login._getJSONData().refreshToken;

  const logoutResponse = await call(app, {
    method: "POST",
    url: "/auth/logout",
    body: { refreshToken },
  });
  assert.equal(logoutResponse.statusCode, 204);

  const refreshAfterLogout = await call(app, {
    method: "POST",
    url: "/auth/refresh",
    body: { refreshToken },
  });
  assert.equal(refreshAfterLogout.statusCode, 401);
});

test("GET /visits without a token is rejected", async () => {
  const response = await call(createApp(), { method: "GET", url: "/visits" });
  assert.equal(response.statusCode, 401);
});

test("POST /visits requires the supervisor role", async () => {
  const app = createApp();
  const login = await call(app, {
    method: "POST",
    url: "/auth/login",
    body: { email: "tecnico@qqs.app", password: "Tecnico123!" },
  });

  const response = await call(app, {
    method: "POST",
    url: "/visits",
    headers: { authorization: `Bearer ${login._getJSONData().accessToken}` },
    body: { id: "visit-new", clientId: "client-1" },
  });

  assert.equal(response.statusCode, 403);
});
