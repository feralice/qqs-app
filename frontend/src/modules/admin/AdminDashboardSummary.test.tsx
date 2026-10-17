import { test } from "node:test";
import assert from "node:assert/strict";
import React from "react";
import { create, act } from "react-test-renderer";

import type { AdminDashboardSummary as DashboardSummary, EmployeeOperationalStatus } from "@qqs/contracts";
import { AdminDashboardSummary } from "./AdminDashboardSummary";

const sampleEmployees: EmployeeOperationalStatus[] = [
  { id: "e-1", name: "Carlos Offline", email: "carlos@qqs.com", role: "employee", status: "offline", activeVisits: 0 },
  { id: "e-2", name: "Ana Ocupada", email: "ana@qqs.com", role: "employee", status: "busy", activeVisits: 2 },
  { id: "e-3", name: "Bruno Disponível", email: "bruno@qqs.com", role: "employee", status: "available", activeVisits: 0 },
  { id: "e-4", name: "Daniel Disponível", email: "daniel@qqs.com", role: "employee", status: "available", activeVisits: 0 },
  { id: "e-5", name: "Eduarda Offline", email: "eduarda@qqs.com", role: "employee", status: "offline", activeVisits: 0 },
  { id: "e-6", name: "Fábio Ocupado", email: "fabio@qqs.com", role: "employee", status: "busy", activeVisits: 1 },
];

const summary: DashboardSummary = {
  date: "2026-09-27",
  counts: { scheduled: 2, inProgress: 1, completed: 3, overdue: 1 },
  alerts: [
    { id: "a-1", visitId: "v-1", type: "overdue", message: "Visita atrasada: Cliente 1", createdAt: "2026-09-27T11:00:00.000Z" },
    { id: "a-2", visitId: "v-2", type: "problem", message: "Problema no equipamento", createdAt: "2026-09-27T11:05:00.000Z" },
    { id: "a-3", visitId: "v-3", type: "outside_radius", message: "Chegada fora do raio", createdAt: "2026-09-27T11:10:00.000Z" },
  ],
  employees: sampleEmployees,
  lastUpdatedAt: "2026-09-27T11:00:00.000Z",
  isLoaded: true,
};

test("AdminDashboardSummary renders counts, stale offline badge and critical alerts with icons", () => {
  let tree: ReturnType<typeof create>;
  act(() => {
    tree = create(<AdminDashboardSummary summary={summary} isStale />);
  });

  const output = JSON.stringify(tree!.toJSON());
  assert.match(output, /Resumo do dia/);
  assert.match(output, /Agendadas/);
  assert.match(output, /Em andamento/);
  assert.match(output, /Conclu\u00eddas/);
  assert.match(output, /Atrasadas/);
  assert.match(output, /cloud-offline/);
  assert.match(output, /Visita atrasada: Cliente 1/);
  assert.match(output, /Problema no equipamento/);
  assert.match(output, /Chegada fora do raio/);
});

test("AdminDashboardSummary orders field staff and supports expanding with Ver todos", () => {
  let tree: ReturnType<typeof create>;
  act(() => {
    tree = create(<AdminDashboardSummary summary={summary} />);
  });

  const output = JSON.stringify(tree!.toJSON());
  assert.match(output, /Equipe em campo/);
  assert.match(output, /6 t\u00e9cnicos/);
  assert.match(output, /Ver todos \(6\)/);

  const verTodosBtn = tree!.root.findByProps({ accessibilityLabel: "Ver todos os 6 técnicos" });
  act(() => {
    verTodosBtn.props.onPress();
  });

  const expandedOutput = JSON.stringify(tree!.toJSON());
  assert.match(expandedOutput, /Eduarda Offline/);
});

test("AdminDashboardSummary distinguishes loading from an empty loaded summary", () => {
  let tree: ReturnType<typeof create>;
  act(() => {
    tree = create(<AdminDashboardSummary isLoading />);
  });
  assert.match(JSON.stringify(tree!.toJSON()), /Carregando resumo/);

  act(() => {
    tree = create(
      <AdminDashboardSummary
        summary={{ ...summary, counts: { scheduled: 0, inProgress: 0, completed: 0, overdue: 0 }, alerts: [], employees: [] }}
      />
    );
  });
  assert.match(JSON.stringify(tree!.toJSON()), /Nenhuma visita para este dia/);
});

test("AdminDashboardSummary uses singular for a single field technician", () => {
  let tree: ReturnType<typeof create>;
  act(() => {
    tree = create(<AdminDashboardSummary summary={{ ...summary, employees: [sampleEmployees[0]] }} />);
  });
  const output = JSON.stringify(tree!.toJSON());
  assert.match(output, /1 técnico\b/);
  assert.doesNotMatch(output, /1 técnicos/);
});
