import { test } from "node:test";
import assert from "node:assert/strict";
import React from "react";
import { create, act } from "react-test-renderer";

import { AdminHistoryScreen } from "./AdminHistoryScreen";

test("AdminHistoryScreen renders filters and visit results", () => {
  let tree: ReturnType<typeof create>;
  act(() => {
    tree = create(React.createElement(AdminHistoryScreen, {
      items: [{ id: "v-1", clientName: "Cliente A", status: "completed", scheduledFor: "2026-09-27T09:00:00.000Z" }],
    }));
  });
  const output = JSON.stringify(tree!.toJSON());
  assert.match(output, /Histórico de visitas/);
  assert.match(output, /Data inicial/);
  assert.match(output, /Cliente A/);
});
