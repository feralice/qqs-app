import { test } from "node:test";
import assert from "node:assert/strict";
import { createRequest, createResponse } from "node-mocks-http";

import { createApp } from "../../app.js";

test("GET /health reports that the backend is available", async () => {
  const request = createRequest({ method: "GET", url: "/health" });
  const response = createResponse();

  createApp()(request, response);

  assert.equal(response.statusCode, 200);
  assert.deepEqual(response._getJSONData(), { status: "ok" });
});
