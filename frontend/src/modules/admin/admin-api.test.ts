import { test } from "node:test";
import assert from "node:assert/strict";

import { createAdminApi } from "./admin-api";

test("admin api fetches dashboard with the selected date", async () => {
  let requestedUrl = "";
  const api = createAdminApi("token", async (input) => {
    requestedUrl = String(input);
    return new Response(JSON.stringify({ date: "2026-09-27" }), { status: 200 });
  }, "http://api.test");

  const result = await api.getDashboard("2026-09-27");

  assert.equal(result.date, "2026-09-27");
  assert.equal(requestedUrl, "http://api.test/admin/dashboard?date=2026-09-27");
});
