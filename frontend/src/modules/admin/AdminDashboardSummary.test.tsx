import { test } from "node:test";
import assert from "node:assert/strict";
import React from "react";
import { create, act } from "react-test-renderer";

import type { AdminDashboardSummary as DashboardSummary } from "@qqs/contracts";
import { AdminDashboardSummary } from "./AdminDashboardSummary";

const summary: DashboardSummary = {
  date: "2026-09-27",
  counts: { scheduled: 2, inProgress: 1, completed: 3, overdue: 1 },
  alerts: [
    { id: "a-1", visitId: "v-1", type: "overdue", message: "Visita atrasada: Cliente 1", createdAt: "2026-09-27T11:00:00.000Z" },
  ],
  employees: [],
  lastUpdatedAt: "2026-09-27T11:00:00.000Z",
  isLoaded: true,
};

test("AdminDashboardSummary renders counts and critical alerts", () => {
  let tree: ReturnType<typeof create>;
  act(() => {
    tree = create(React.createElement(AdminDashboardSummary, { summary }));
  });

  const output = JSON.stringify(tree!.toJSON());
  assert.match(output, /Resumo do dia/);
  assert.match(output, /2/);
  assert.match(output, /Visita atrasada: Cliente 1/);
  assert.match(output, /Atualizado em/);
});

test("AdminDashboardSummary distinguishes loading from an empty loaded summary", () => {
  let tree: ReturnType<typeof create>;
  act(() => {
    tree = create(React.createElement(AdminDashboardSummary, { isLoading: true }));
  });
  assert.match(JSON.stringify(tree!.toJSON()), /Carregando resumo/);

  act(() => {
    tree = create(
      React.createElement(AdminDashboardSummary, {
        summary: { ...summary, counts: { scheduled: 0, inProgress: 0, completed: 0, overdue: 0 }, alerts: [] },
      }),
    );
  });
  assert.match(JSON.stringify(tree!.toJSON()), /Nenhuma visita para este dia/);
});
