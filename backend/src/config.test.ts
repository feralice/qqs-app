import { test } from "node:test";
import assert from "node:assert/strict";

import { loadServerConfig } from "./config.js";

test("local development without DATABASE_URL seeds test accounts", () => {
  const config = loadServerConfig({});
  assert.equal(config.seedDevelopmentData, true);
  assert.equal(config.databaseUrl, undefined);
});

test("a real Postgres is never seeded unless SEED_DEV_DATA=true", () => {
  assert.equal(loadServerConfig({ DATABASE_URL: "postgres://x", JWT_SECRET: "s" }).seedDevelopmentData, false);
  assert.equal(
    loadServerConfig({ DATABASE_URL: "postgres://x", JWT_SECRET: "s", SEED_DEV_DATA: "true" }).seedDevelopmentData,
    true,
  );
});

test("production never seeds even with SEED_DEV_DATA", () => {
  assert.equal(
    loadServerConfig({ DATABASE_URL: "postgres://x", JWT_SECRET: "s", SEED_DEV_DATA: "true", NODE_ENV: "production" })
      .seedDevelopmentData,
    false,
  );
});

test("a real Postgres without JWT_SECRET refuses to start", () => {
  assert.throws(() => loadServerConfig({ DATABASE_URL: "postgres://x" }), /JWT_SECRET/);
});
