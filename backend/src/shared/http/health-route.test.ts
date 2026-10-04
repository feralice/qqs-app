import { test } from "node:test";
import assert from "node:assert/strict";

import { call, createTestApp } from "../../test-support/http.js";

test("GET /health reports that the backend is available", async () => {
  const response = await call(await createTestApp(), { method: "GET", url: "/health" });

  assert.equal(response.statusCode, 200);
  assert.deepEqual(response._getJSONData(), { status: "ok" });
});
