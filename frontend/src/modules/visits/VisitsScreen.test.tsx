import { test } from "node:test";
import assert from "node:assert/strict";
import React from "react";
import { create, act } from "react-test-renderer";

import { VisitsScreen } from "./VisitsScreen.js";

const mockVisits = [
  {
    id: "visit-001",
    clientId: "client-001",
    clientName: "Gases da Amazônia",
    scheduledFor: "2026-09-21T13:00:00.000Z",
    status: "assigned" as const,
    systemsCount: 3,
    systems: [
      { id: "s1", name: "Torre 1", type: "tower" },
      { id: "s2", name: "Torre 2", type: "tower" },
      { id: "s3", name: "Caldeira", type: "boiler" },
    ],
    syncStatus: "pending" as const,
  },
  {
    id: "visit-002",
    clientId: "client-002",
    clientName: "Coca-Cola FEMSA",
    scheduledFor: "2026-09-22T14:00:00.000Z",
    status: "in_progress" as const,
    systemsCount: 1,
    systems: [{ id: "s4", name: "Chiller", type: "chiller" }],
    syncStatus: "synced" as const,
  },
];

test("VisitsScreen shows client and system count filtered by calendar date", () => {
  const opened: string[] = [];
  let tree: ReturnType<typeof create>;
  act(() => {
    tree = create(
      React.createElement(VisitsScreen, {
        initialDate: "2026-09-21",
        visits: mockVisits,
        onOpen: (id: string) => opened.push(id),
      }),
    );
  });

  const output = JSON.stringify(tree!.toJSON());
  assert.match(output, /Gases da Amazônia/);
  assert.match(output, /sistemas para vistoria/);
  assert.match(output, /Visitas de 21\/09\/2026/);
  // Coca-Cola FEMSA is on 2026-09-22 so it should not appear when filtered by 2026-09-21
  assert.doesNotMatch(output, /Coca-Cola FEMSA/);
});

test("VisitsScreen allows viewing all visits across dates", () => {
  let tree: ReturnType<typeof create>;
  act(() => {
    tree = create(
      React.createElement(VisitsScreen, {
        initialDate: "2026-09-21",
        visits: mockVisits,
        onOpen: () => {},
      }),
    );
  });

  // Tap "Ver todas" button
  const allVisitsButton = tree!.root.findByProps({ accessibilityLabel: "Ver todas as visitas" });
  act(() => {
    allVisitsButton.props.onPress();
  });

  const output = JSON.stringify(tree!.toJSON());
  assert.match(output, /Gases da Amazônia/);
  assert.match(output, /Coca-Cola FEMSA/);
  assert.match(output, /Exibindo todas as visitas/);
});
