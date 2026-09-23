import { test } from "node:test";
import assert from "node:assert/strict";

import type {
  ArrivalLocation,
  CreateVisitRequest,
  EmployeeSummary,
  FinishVisitRequest,
  StartVisitRequest,
  VisitDeparture,
  VisitDetails,
  VisitPhoto,
  VisitSummary,
} from "./index.js";

test("visit contracts describe summaries, details, arrival, departure, photos and attendants", () => {
  const photo: VisitPhoto = {
    id: "photo-1",
    uri: "data:image/jpeg;base64,...",
    caption: "Torre 1 tratada",
    takenAt: "2026-09-22T14:30:00.000Z",
  };

  const attendant: EmployeeSummary = {
    id: "emp-2",
    name: "Carlos Silva",
    email: "carlos@qqs.com",
    role: "employee",
  };

  const departure: VisitDeparture = {
    leftAt: "2026-09-22T15:00:00.000Z",
    location: {
      latitude: -3.10194,
      longitude: -60.025,
      accuracy: 5,
    },
  };

  const details: VisitDetails = {
    id: "visit-001",
    clientId: "client-001",
    clientName: "Gases da Amazônia",
    scheduledFor: "2026-09-22T13:00:00.000Z",
    status: "completed",
    systemsCount: 1,
    systems: [{ id: "sys-1", name: "Torre 1", type: "tower" }],
    arrival: {
      arrivedAt: "2026-09-22T13:10:00.000Z",
      location: { latitude: -3.1019, longitude: -60.025 },
    },
    departure,
    durationMinutes: 110,
    description: "Inspeção completa e dosagem química realizada.",
    attendants: [attendant],
    photos: [photo],
    syncStatus: "synced",
    finishedAt: "2026-09-22T15:00:00.000Z",
  };

  const finishRequest: FinishVisitRequest = {
    operationId: "op-finish-1",
    finishedAt: "2026-09-22T15:00:00.000Z",
    location: departure.location,
    description: "Serviço finalizado com sucesso.",
    attendantIds: ["emp-2"],
    photos: [photo],
  };

  const createRequest: CreateVisitRequest = {
    clientId: "client-001",
    employeeId: "emp-1",
    scheduledFor: "2026-09-23T09:00:00.000Z",
    systems: [{ id: "sys-1", name: "Torre 1", type: "tower" }],
  };

  assert.equal(details.id, "visit-001");
  assert.equal(details.photos?.[0].caption, "Torre 1 tratada");
  assert.equal(finishRequest.operationId, "op-finish-1");
  assert.equal(createRequest.systems[0].name, "Torre 1");
});
