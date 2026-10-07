import { test } from "node:test";
import assert from "node:assert/strict";

import type { Visit } from "../../../domain/visits/visit.js";
import { CsvExporter } from "../../../infrastructure/csv/csv.js";
import { exportVisitHistory } from "./export-visit-history.js";

const visits: Visit[] = [
  {
    id: "v-1",
    clientId: "c-1",
    clientName: "Gases da Amazônia",
    employeeId: "e-1",
    status: "completed",
    scheduledFor: "2026-10-01T12:00:00.000Z",
    arrivedAt: "2026-10-01T12:05:00.000Z",
    arrivalDistanceMeters: 1916,
    outsideRadius: true,
    arrivalJustification: "Portão lateral",
    leftAt: "2026-10-01T13:05:00.000Z",
    durationMinutes: 60,
  },
  { id: "v-2", clientId: "c-1", employeeId: "e-2", status: "assigned", scheduledFor: "2026-09-01T12:00:00.000Z" },
];

test("exports only the filtered visits with readable labels", async () => {
  const csv = await exportVisitHistory(
    {
      visits: { list: async () => visits },
      employees: { list: async () => [{ id: "e-1", name: "Ana Souza", email: "ana@qqs.app", role: "employee" }] },
      exporter: new CsvExporter(),
    },
    { from: "2026-10-01", to: "2026-10-31" },
  );
  const [header, row, ...rest] = csv.replace("﻿", "").trimEnd().split("\r\n");

  assert.equal(rest.length, 0);
  assert.match(header, /^Agendada para;Empresa;Técnico;Status/);
  assert.equal(
    row,
    "2026-10-01T12:00:00.000Z;Gases da Amazônia;Ana Souza;Concluída;2026-10-01T12:05:00.000Z;1916;Sim;Portão lateral;2026-10-01T13:05:00.000Z;60;",
  );
});
