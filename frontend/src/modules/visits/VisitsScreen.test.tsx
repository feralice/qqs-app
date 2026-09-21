import { test } from "node:test";
import assert from "node:assert/strict";
import React from "react";
import { create } from "react-test-renderer";

import { VisitsScreen } from "./VisitsScreen.js";

test("visits screen shows client and system count", () => {
  const opened: string[] = [];
  const tree = create(
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

  assert.match(JSON.stringify(tree.toJSON()), /Gases da Amazônia/);
  assert.match(JSON.stringify(tree.toJSON()), /3 sistemas/);
});
