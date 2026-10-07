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

for (const optional of [
  { employeeId: undefined, status: undefined, clientId: undefined },
  { employeeId: "", status: "", clientId: "   " },
]) {
  test(`admin history omits absent or blank filters: ${JSON.stringify(optional)}`, async () => {
    let requestedUrl = "";
    const api = createAdminApi("token", async (input) => {
      requestedUrl = String(input);
      return new Response(JSON.stringify({ items: [], total: 0 }), { status: 200 });
    }, "http://api.test");

    await api.getHistory({ from: "2026-10-01", to: "2026-10-05", ...optional });

    assert.equal(requestedUrl, "http://api.test/admin/history?from=2026-10-01&to=2026-10-05");
  });
}

test("admin history preserves and encodes selected filters", async () => {
  let requestedUrl = "";
  const api = createAdminApi("token", async (input) => {
    requestedUrl = String(input);
    return new Response(JSON.stringify({ items: [], total: 0 }), { status: 200 });
  }, "http://api.test");

  await api.getHistory({ from: "2026-10-01", to: "2026-10-05", employeeId: "emp 1", status: "completed", clientId: "client&2" });

  assert.equal(requestedUrl, "http://api.test/admin/history?from=2026-10-01&to=2026-10-05&employeeId=emp+1&status=completed&clientId=client%262");
});
