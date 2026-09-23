import { test } from "node:test";
import assert from "node:assert/strict";
import React from "react";
import { create, act } from "react-test-renderer";

import { VisitDetailsScreen } from "./VisitDetailsScreen.js";

test("visit details screen renders arrival action and systems", () => {
  let tree: ReturnType<typeof create>;
  act(() => {
    tree = create(
      React.createElement(VisitDetailsScreen, {
        visit: {
          id: "visit-001",
          clientId: "client-001",
          clientName: "Gases da Amazônia",
          scheduledFor: "2026-09-21T13:00:00.000Z",
          status: "assigned",
          systemsCount: 1,
          systems: [{ id: "system-001", name: "Torre 1", type: "tower" }],
          syncStatus: "pending",
        },
        api: { startVisit: async () => ({}) as never },
        locationProvider: {
          getArrivalLocation: async () => ({ status: "denied" as const }),
        },
      }),
    );
  });

  const output = JSON.stringify(tree!.toJSON());
  assert.match(output, /Gases da Amazônia/);
  assert.match(output, /Registrar chegada/);
  assert.match(output, /Torre 1/);
});
