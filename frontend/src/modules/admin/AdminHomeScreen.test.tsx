import { test } from "node:test";
import assert from "node:assert/strict";
import React from "react";
import { create, act } from "react-test-renderer";

import type { EmployeeSummary, VisitDetails } from "@qqs/contracts";

import { AdminHomeScreen } from "./AdminHomeScreen.js";
import { AdminScheduleModal } from "./AdminScheduleModal.js";

const testEmployees: EmployeeSummary[] = [
  { id: "emp-1", name: "Carlos Silva", email: "carlos@qqs.com", role: "employee" },
  { id: "emp-2", name: "Marcos Lima", email: "marcos@qqs.com", role: "employee" },
];

const testVisits: VisitDetails[] = [
  {
    id: "v-1",
    clientId: "c-1",
    clientName: "Gases da Amazônia",
    scheduledFor: "2026-09-22T09:00:00.000Z",
    status: "in_progress",
    systemsCount: 2,
    systems: [{ id: "s-1", name: "Torre 1", type: "tower" }],
    syncStatus: "synced",
  },
];

test("AdminHomeScreen renders supervisor dashboard, calendar strip, metrics and modules", () => {
  let tree: ReturnType<typeof create>;
  act(() => {
    tree = create(
      React.createElement(AdminHomeScreen, {
        initialDate: "2026-09-22",
        visits: testVisits,
        employees: testEmployees,
      }),
    );
  });

  const output = JSON.stringify(tree!.toJSON());
  assert.match(output, /Painel de Controle e Gestão Operacional/);
  assert.match(output, /Supervisor/);
  assert.match(output, /\+ Agendar Nova Visita/);
  assert.match(output, /Agenda Semanal/);
  assert.match(output, /Gases da Amazônia/);
  assert.match(output, /Métricas da Operação/);
  assert.match(output, /Visitas Hoje/);
  assert.match(output, /Técnicos Ativos/);
  assert.match(output, /Módulos do Sistema/);
});

test("AdminScheduleModal allows supervisor to fill and confirm a new visit schedule", async () => {
  let savedData: unknown;
  let closed = false;

  let tree: ReturnType<typeof create>;
  await act(async () => {
    tree = create(
      React.createElement(AdminScheduleModal, {
        visible: true,
        employees: testEmployees,
        onClose: () => {
          closed = true;
        },
        onSave: (data) => {
          savedData = data;
        },
      }),
    );
  });

  const output = JSON.stringify(tree!.toJSON());
  assert.match(output, /Agendar Nova Visita/);
  assert.match(output, /Carlos Silva/);
  assert.match(output, /Marcos Lima/);

  // Fill client name
  const nameInput = tree!.root.findByProps({ accessibilityLabel: "Nome da empresa" });
  await act(async () => {
    nameInput.props.onChangeText("Ambev Manaus");
  });

  // Confirm schedule
  const confirmButton = tree!.root.findByProps({ accessibilityLabel: "Salvar agendamento" });
  await act(async () => {
    confirmButton.props.onPress();
  });

  assert.ok(savedData);
  assert.equal((savedData as { clientName: string }).clientName, "Ambev Manaus");
  assert.equal(closed, true);
});
