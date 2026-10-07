import { test } from "node:test";
import assert from "node:assert/strict";

import { authedCall, call, createTestApp, login } from "../../../test-support/http.js";

test("GET /admin/history.csv downloads the filtered history for a supervisor", async () => {
  const app = await createTestApp();
  const token = await login(app, "supervisor");

  const response = await authedCall(app, token, {
    method: "GET",
    url: "/admin/history.csv",
    query: { from: "2000-01-01", to: "2100-12-31" },
  });

  assert.equal(response.statusCode, 200);
  assert.match(String(response.getHeader("content-type")), /^text\/csv/);
  assert.match(String(response.getHeader("content-disposition")), /visitas_2000-01-01_2100-12-31\.csv/);
  const [header, firstRow] = String(response._getData()).replace("﻿", "").split("\r\n");
  assert.match(header, /^Agendada para;Empresa;Técnico;Status/);
  assert.match(firstRow, /Gases da Amazônia/);
});

test("GET /admin/history.csv is forbidden for technicians", async () => {
  const app = await createTestApp();

  const response = await authedCall(app, await login(app, "employee"), { method: "GET", url: "/admin/history.csv" });

  assert.equal(response.statusCode, 403);
});

test("GET /admin/history rejects a malformed date with field details", async () => {
  const app = await createTestApp();

  const response = await authedCall(app, await login(app, "supervisor"), {
    method: "GET",
    url: "/admin/history",
    query: { from: "05/10/2026" },
  });

  assert.equal(response.statusCode, 400);
  assert.equal(response._getJSONData().error, "invalid request query");
  assert.ok(response._getJSONData().details.fieldErrors.from);
});

test("GET /admin/history returns visits without internal fields", async () => {
  const app = await createTestApp();

  const response = await authedCall(app, await login(app, "supervisor"), {
    method: "GET",
    url: "/admin/history",
    query: { from: "2000-01-01", to: "2100-12-31" },
  });

  assert.equal(response.statusCode, 200);
  const [first] = response._getJSONData().items;
  assert.equal(first.clientName, "Gases da Amazônia");
  assert.equal("lastStartOperationId" in first, false);
});

test("unknown routes answer 404 in the API error format", async () => {
  const response = await call(await createTestApp(), { method: "GET", url: "/nope" });

  assert.equal(response.statusCode, 404);
  assert.deepEqual(response._getJSONData(), { error: "route not found: GET /nope" });
});

test("protected routes require a token before validating input", async () => {
  const response = await call(await createTestApp(), { method: "POST", url: "/clients", body: {} });

  assert.equal(response.statusCode, 401);
});
