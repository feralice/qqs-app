import { test } from "node:test";
import assert from "node:assert/strict";

import type {
  ArrivalLocation,
  StartVisitRequest,
  VisitDetails,
  VisitSummary,
} from "./index.js";

test("visit contracts describe summaries, details, and optional arrival location", () => {
  const location: ArrivalLocation = {
    latitude: -3.119,
    longitude: -60.021,
    accuracy: 12.5,
  };
  const summary: VisitSummary = {
    id: "visit-001",
    clientId: "client-001",
    clientName: "Gases da Amazônia",
    scheduledFor: "2026-09-21T13:00:00.000Z",
    status: "assigned",
    systemsCount: 3,
  };
  const details: VisitDetails = {
    ...summary,
    clientAddress: "Manaus, AM",
    systems: [{ id: "system-001", name: "Torre 1", type: "tower" }],
    arrival: undefined,
    syncStatus: "pending",
  };
  const request: StartVisitRequest = {
    operationId: "operation-001",
    arrivedAt: "2026-09-21T13:15:00.000Z",
    location,
  };

  assert.equal(details.status, "assigned");
  assert.equal(request.location?.latitude, -3.119);
});
