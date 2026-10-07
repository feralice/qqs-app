import { test } from "node:test";
import assert from "node:assert/strict";
import express from "express";

import { ApiRouter } from "../../http/api-router.js";
import { registerAdminRoutes } from "./admin-routes.js";
import { call } from "../../../test-support/http.js";
import { InMemoryVisitRepository } from "../../../test-support/in-memory-visit-repository.js";
import { InMemoryIdempotencyStore } from "../../../test-support/in-memory-idempotency-store.js";
import { CsvExporter } from "../../../infrastructure/csv/csv.js";

for (const path of ["/admin/history", "/admin/history.csv"]) {
  for (const query of [{}, { from: "2040-02-03" }, { to: "2040-02-04" }]) {
    test(`${path} defaults the period using the injected clock: ${JSON.stringify(query)}`, async () => {
      const visits = new InMemoryVisitRepository();
      await visits.save({ id: "fixed-day", clientId: "client", employeeId: "employee", status: "assigned", scheduledFor: "2040-02-03T12:00:00.000Z" });
      await visits.save({ id: "next-day", clientId: "client", employeeId: "employee", status: "assigned", scheduledFor: "2040-02-04T12:00:00.000Z" });
      const api = new ApiRouter({ authenticated: [], supervisor: [] });
      registerAdminRoutes(api, {
        visits, employees: { list: async () => [] }, idempotency: new InMemoryIdempotencyStore(),
        exporter: new CsvExporter(), clock: { now: () => new Date("2040-02-03T23:59:00.000Z") },
      });
      const app = express();
      app.use(api.router);

      const response = await call(app, { method: "GET", url: path, query });

      assert.equal(response.statusCode, 200);
      if (path.endsWith(".csv")) {
        assert.match(String(response.getHeader("content-disposition")), /visitas_2040-02-03_2040-02-0[34]\.csv/);
        assert.match(String(response._getData()), /2040-02-03T12:00:00.000Z/);
      } else {
        const ids = response._getJSONData().items.map((item: { id: string }) => item.id);
        assert.deepEqual(ids, "to" in query ? ["next-day", "fixed-day"] : ["fixed-day"]);
      }
    });
  }
}
