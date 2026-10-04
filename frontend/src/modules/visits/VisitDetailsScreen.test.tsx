import { test } from "node:test";
import assert from "node:assert/strict";
import React from "react";
import { create, act } from "react-test-renderer";

import type { VisitDetails, EmployeeSummary, VisitPhoto } from "@qqs/contracts";

import { VisitDetailsScreen } from "./VisitDetailsScreen";
import { VisitStore } from "./visit-store";
import { SyncQueue } from "../sync/sync-queue";

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
          createVisit: async () => sampleVisit,
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
  await store.set(inProgressVisit);
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
          createVisit: async () => sampleVisit,
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
          createVisit: async () => sampleVisit,
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

const visitWithClientLocation: VisitDetails = {
  ...sampleVisit,
  clientLocation: { latitude: -3.1019, longitude: -60.025, radiusMeters: 200 },
};

async function renderForArrival(location: { latitude: number; longitude: number } | undefined) {
  const started: Array<{ justification?: string }> = [];
  let tree: ReturnType<typeof create>;
  await act(async () => {
    tree = create(
      React.createElement(VisitDetailsScreen, {
        visit: visitWithClientLocation,
        api: {
          createVisit: async () => sampleVisit,
          startVisit: async (_id, payload) => {
            started.push(payload);
            return { ...visitWithClientLocation, status: "in_progress" as const };
          },
          finishVisit: async () => visitWithClientLocation,
        },
        locationProvider: {
          getArrivalLocation: async () =>
            location ? { status: "granted" as const, location } : { status: "denied" as const },
        },
        availableEmployees: dummyEmployees,
        store: new VisitStore(),
        queue: new SyncQueue(),
      }),
    );
  });
  const pressArrival = async () => {
    const button = tree!.root.findAll((node) => node.props.label === "Registrar chegada")[0];
    await act(async () => button.props.onPress());
  };
  return { tree: tree!, started, pressArrival };
}

test("arrival inside the radius is sent without asking for a justification", async () => {
  const { tree, started, pressArrival } = await renderForArrival({ latitude: -3.102, longitude: -60.0251 });
  await pressArrival();

  assert.equal(started.length, 1);
  assert.equal(started[0].justification, undefined);
  assert.doesNotMatch(JSON.stringify(tree.toJSON()), /Justificativa/);
});

test("arrival outside the radius asks for a justification before sending", async () => {
  const { tree, started, pressArrival } = await renderForArrival({ latitude: -3.119, longitude: -60.021 });
  await pressArrival();

  assert.equal(started.length, 0);
  assert.match(JSON.stringify(tree.toJSON()), /Você está a 1953 m da empresa \(raio de 200 m\)/);

  const confirm = tree.root.findByProps({ accessibilityLabel: "Confirmar chegada com justificativa" });
  assert.equal(confirm.props.disabled, true);

  await act(async () =>
    tree.root.findByProps({ accessibilityLabel: "Justificativa da chegada" }).props.onChangeText("Portaria afastada"),
  );
  await act(async () =>
    tree.root.findByProps({ accessibilityLabel: "Confirmar chegada com justificativa" }).props.onPress(),
  );

  assert.equal(started.length, 1);
  assert.equal(started[0].justification, "Portaria afastada");
});

test("arrival without GPS explains that the location is unavailable", async () => {
  const { tree, started, pressArrival } = await renderForArrival(undefined);
  await pressArrival();

  assert.equal(started.length, 0);
  assert.match(JSON.stringify(tree.toJSON()), /Localização indisponível/);
});

test("cancelling the justification keeps the visit waiting for arrival", async () => {
  const { tree, started, pressArrival } = await renderForArrival({ latitude: -3.119, longitude: -60.021 });
  await pressArrival();
  await act(async () => tree.root.findByProps({ accessibilityLabel: "Cancelar justificativa" }).props.onPress());

  assert.equal(started.length, 0);
  assert.doesNotMatch(JSON.stringify(tree.toJSON()), /Justificativa da chegada/);
  assert.match(JSON.stringify(tree.toJSON()), /Aguardando chegada/);
});

test("offline staff list never shows made-up employees", async () => {
  let tree: ReturnType<typeof create>;
  await act(async () => {
    tree = create(
      React.createElement(VisitDetailsScreen, {
        visit: { ...sampleVisit, status: "in_progress" as const, arrival: { arrivedAt: "2026-09-22T13:05:00.000Z" } },
        api: {
          createVisit: async () => sampleVisit,
          startVisit: async () => sampleVisit,
          finishVisit: async () => sampleVisit,
          listEmployees: async () => {
            throw new Error("offline");
          },
        },
        locationProvider: { getArrivalLocation: async () => ({ status: "denied" as const }) },
        store: new VisitStore(),
        queue: new SyncQueue(),
      }),
    );
  });

  const output = JSON.stringify(tree!.toJSON());
  assert.doesNotMatch(output, /Carlos Silva|Marcos Lima|Técnico Responsável/);
});

test("tapping arrival twice records a single check-in", async () => {
  const started: unknown[] = [];
  let calls = 0;
  let tree: ReturnType<typeof create>;
  await act(async () => {
    tree = create(
      React.createElement(VisitDetailsScreen, {
        visit: visitWithClientLocation,
        api: {
          createVisit: async () => visitWithClientLocation,
          startVisit: async (_id, payload) => {
            started.push(payload);
            return visitWithClientLocation;
          },
          finishVisit: async () => visitWithClientLocation,
        },
        locationProvider: {
          getArrivalLocation: async () => {
            calls++;
            await new Promise((resolve) => setTimeout(resolve, calls * 15));
            return { status: "granted" as const, location: { latitude: -3.102, longitude: -60.0251 } };
          },
        },
        availableEmployees: dummyEmployees,
        store: new VisitStore(),
        queue: new SyncQueue(),
      }),
    );
  });
  const button = tree!.root.findAll((node) => node.props.label === "Registrar chegada")[0];
  await act(async () => {
    await Promise.all([button.props.onPress(), button.props.onPress()]);
  });

  assert.equal(started.length, 1);
});
