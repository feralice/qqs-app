import { test } from "node:test";
import assert from "node:assert/strict";
import React from "react";
import { create, act } from "react-test-renderer";

import type { VisitDetails, EmployeeSummary, VisitPhoto } from "@qqs/contracts";

import { VisitDetailsScreen } from "./VisitDetailsScreen.js";
import { VisitStore } from "./visit-store.js";
import { SyncQueue } from "../sync/sync-queue.js";

const sampleVisit: VisitDetails = {
  id: "visit-001",
  clientId: "client-001",
  clientName: "Gases da Amazônia",
  clientAddress: "Av. Danilo de Mattos Areosa, 1000 - Distrito Industrial",
  scheduledFor: "2026-09-22T13:00:00.000Z",
  status: "assigned",
  systemsCount: 2,
  systems: [
    { id: "sys-1", name: "Torre de Resfriamento 1", type: "tower" },
    { id: "sys-2", name: "Caldeira Aquatubular", type: "boiler" },
  ],
  syncStatus: "pending",
};

const dummyEmployees: EmployeeSummary[] = [
  { id: "emp-1", name: "João Silva", email: "joao@qqs.com", role: "employee" },
  { id: "emp-2", name: "Carlos Rocha", email: "carlos@qqs.com", role: "employee" },
];

test("VisitDetailsScreen renders assigned visit with live map preview and arrival action", () => {
  let tree: ReturnType<typeof create>;
  act(() => {
    tree = create(
      React.createElement(VisitDetailsScreen, {
        visit: sampleVisit,
        api: {
          startVisit: async () => sampleVisit,
          finishVisit: async () => sampleVisit,
        },
        locationProvider: {
          getArrivalLocation: async () => ({
            status: "granted" as const,
            location: { latitude: -3.1019, longitude: -60.025 },
          }),
        },
        availableEmployees: dummyEmployees,
      }),
    );
  });

  const output = JSON.stringify(tree!.toJSON());
  assert.match(output, /Gases da Amazônia/);
  assert.match(output, /Confirmar Chegada \(OK\)/);
  assert.match(output, /Torre de Resfriamento 1/);
  assert.match(output, /Caldeira Aquatubular/);
});

test("VisitDetailsScreen renders in-progress visit with timer, staff picker, report card and checkout action", async () => {
  const inProgressVisit: VisitDetails = {
    ...sampleVisit,
    status: "in_progress",
    arrival: {
      arrivedAt: "2026-09-22T13:05:00.000Z",
      location: { latitude: -3.1019, longitude: -60.025 },
    },
    syncStatus: "synced",
  };

  const store = new VisitStore();
  store.set(inProgressVisit);
  const queue = new SyncQueue();

  let finishCalled = false;

  let tree: ReturnType<typeof create>;
  await act(async () => {
    tree = create(
      React.createElement(VisitDetailsScreen, {
        visit: inProgressVisit,
        store,
        queue,
        api: {
          startVisit: async () => inProgressVisit,
          finishVisit: async (_id, req) => {
            finishCalled = true;
            return {
              ...inProgressVisit,
              status: "completed",
              finishedAt: req.finishedAt,
              description: req.description,
              attendants: req.attendants,
              photos: req.photos,
              syncStatus: "synced",
            };
          },
        },
        locationProvider: {
          getArrivalLocation: async () => ({
            status: "granted" as const,
            location: { latitude: -3.102, longitude: -60.026 },
          }),
        },
        availableEmployees: dummyEmployees,
      }),
    );
  });

  const output = JSON.stringify(tree!.toJSON());
  assert.match(output, /Em andamento/);
  assert.match(output, /Equipe presente/);
  assert.match(output, /Relatório do Serviço/);
  assert.match(output, /Fotos e Evidências/);
  assert.match(output, /Marcar Saída/);

  // Trigger finish
  const finishButton = tree!.root.findByProps({ label: "Marcar Saída" });
  await act(async () => {
    finishButton.props.onPress();
  });

  assert.equal(finishCalled, true);
  const updatedStored = store.get("visit-001");
  assert.equal(updatedStored?.status, "completed");
});

test("VisitDetailsScreen renders completed visit in read-only mode with duration and departure stats", () => {
  const completedPhoto: VisitPhoto = {
    id: "p1",
    uri: "file://p1.jpg",
    caption: "Torre limpa",
    takenAt: "2026-09-22T14:00:00.000Z",
  };

  const completedVisit: VisitDetails = {
    ...sampleVisit,
    status: "completed",
    arrival: {
      arrivedAt: "2026-09-22T13:00:00.000Z",
      location: { latitude: -3.1019, longitude: -60.025 },
    },
    departure: {
      leftAt: "2026-09-22T14:30:00.000Z",
      location: { latitude: -3.102, longitude: -60.026 },
    },
    finishedAt: "2026-09-22T14:30:00.000Z",
    durationMinutes: 90,
    description: "Serviço preventivo executado conforme norma técnica.",
    attendants: [dummyEmployees[0]],
    photos: [completedPhoto],
    syncStatus: "synced",
  };

  let tree: ReturnType<typeof create>;
  act(() => {
    tree = create(
      React.createElement(VisitDetailsScreen, {
        visit: completedVisit,
        api: {
          startVisit: async () => completedVisit,
          finishVisit: async () => completedVisit,
        },
        locationProvider: {
          getArrivalLocation: async () => ({ status: "denied" as const }),
        },
        availableEmployees: dummyEmployees,
      }),
    );
  });

  const output = JSON.stringify(tree!.toJSON());
  assert.match(output, /Atendimento Concluído/);
  assert.match(output, /Serviço preventivo executado conforme norma técnica/);
  assert.match(output, /Torre limpa/);
  assert.match(output, /João Silva/);
  assert.doesNotMatch(output, /Marcar Saída/);
  assert.doesNotMatch(output, /Confirmar Chegada \(OK\)/);
});
