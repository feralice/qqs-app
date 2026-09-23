import { test } from "node:test";
import assert from "node:assert/strict";
import React from "react";
import { create, act } from "react-test-renderer";

import { VisitsScreen } from "./VisitsScreen.js";

test("visits screen shows client and system count", () => {
  const opened: string[] = [];
  let tree: ReturnType<typeof create>;
  act(() => {
    tree = create(
      React.createElement(VisitsScreen, {
        visits: [
          {
            id: "visit-001",
            clientId: "client-001",
            clientName: "Gases da Amazônia",
            scheduledFor: "2026-09-21T13:00:00.000Z",
            status: "assigned",
            systemsCount: 3,
            systems: [],
            syncStatus: "pending",
          },
        ],
        onOpen: (id: string) => opened.push(id),
      }),
    );
  });

  const output = JSON.stringify(tree!.toJSON());
  assert.match(output, /Gases da Amazônia/);
  assert.match(output, /sistemas para vistoria/);
});
