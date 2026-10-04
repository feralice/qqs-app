import { test } from "node:test";
import assert from "node:assert/strict";
import React from "react";
import { create, act } from "react-test-renderer";

import type { EmployeeSummary, VisitDetails } from "@qqs/contracts";

import { AdminHomeScreen } from "./AdminHomeScreen";
import { AdminScheduleModal, type AdminScheduleDraft } from "./AdminScheduleModal";
import { sampleClients } from "../clients/client-fixtures";

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
  assert.match(output, /Resumo do dia/);
  assert.match(output, /Supervisor/);
  assert.match(output, /\+ Agendar Nova Visita/);
  assert.match(output, /Agenda Semanal/);
  assert.match(output, /Gases da Amazônia/);
  assert.match(output, /Métricas da Operação/);
  assert.match(output, /Visitas Hoje/);
  assert.match(output, /Técnicos Ativos/);
  assert.match(output, /Módulos do Sistema/);
});

test("AdminScheduleModal schedules a registered company for the chosen technician", async () => {
  let savedData: AdminScheduleDraft | undefined;
  let closed = false;

  let tree: ReturnType<typeof create>;
  await act(async () => {
    tree = create(
      React.createElement(AdminScheduleModal, {
        visible: true,
        employees: testEmployees,
        clients: sampleClients,
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

  const confirmButton = () => tree!.root.findByProps({ accessibilityLabel: "Salvar agendamento" });
  assert.equal(confirmButton().props.disabled, true);

  await act(async () => tree!.root.findByProps({ accessibilityLabel: "Escolher Ambev Manaus" }).props.onPress());
  await act(async () => tree!.root.findByProps({ accessibilityLabel: "Selecionar técnico Marcos Lima" }).props.onPress());
  await act(async () => tree!.root.findByProps({ accessibilityLabel: "Data do agendamento" }).props.onChangeText("2026-10-05"));
  await act(async () => tree!.root.findByProps({ accessibilityLabel: "Horário do agendamento" }).props.onChangeText("14:30"));
  await act(async () => confirmButton().props.onPress());

  assert.equal(savedData?.client.id, "client-002");
  assert.equal(savedData?.employeeId, "emp-2");
  assert.equal(savedData?.scheduledFor, new Date(2026, 9, 5, 14, 30).toISOString());
  assert.equal(closed, true);
});

test("AdminScheduleModal rejects an invalid date", async () => {
  let saved = false;
  let tree: ReturnType<typeof create>;
  await act(async () => {
    tree = create(
      React.createElement(AdminScheduleModal, {
        visible: true,
        employees: testEmployees,
        clients: sampleClients,
        onClose: () => undefined,
        onSave: () => {
          saved = true;
        },
      }),
    );
  });
  await act(async () => tree!.root.findByProps({ accessibilityLabel: "Escolher Ambev Manaus" }).props.onPress());
  await act(async () => tree!.root.findByProps({ accessibilityLabel: "Data do agendamento" }).props.onChangeText("31/02"));
  await act(async () => tree!.root.findByProps({ accessibilityLabel: "Salvar agendamento" }).props.onPress());

  assert.equal(saved, false);
  assert.match(JSON.stringify(tree!.toJSON()), /Data ou horário inválidos/);
});

test("AdminHomeScreen opens the companies screen", () => {
  let opened = 0;
  let tree: ReturnType<typeof create>;
  act(() => {
    tree = create(
      React.createElement(AdminHomeScreen, {
        initialDate: "2026-09-22",
        visits: testVisits,
        employees: testEmployees,
        onOpenClients: () => {
          opened++;
        },
      }),
    );
  });

  act(() => tree!.root.findByProps({ accessibilityLabel: "Gerenciar empresas" }).props.onPress());
  assert.equal(opened, 1);
});

test("AdminHomeScreen shows visits loaded after the first render", () => {
  let tree: ReturnType<typeof create>;
  act(() => {
    tree = create(React.createElement(AdminHomeScreen, { initialDate: "2026-09-22", visits: [], employees: testEmployees }));
  });
  act(() => {
    tree!.update(React.createElement(AdminHomeScreen, { initialDate: "2026-09-22", visits: testVisits, employees: testEmployees }));
  });

  assert.match(JSON.stringify(tree!.toJSON()), /Abrir visita de Gases da Amazônia/);
});

test("AdminScheduleModal picks a real technician once the team list loads", async () => {
  let savedData: AdminScheduleDraft | undefined;
  const props = {
    visible: true,
    clients: sampleClients,
    onClose: () => undefined,
    onSave: (data: AdminScheduleDraft) => {
      savedData = data;
    },
  };
  let tree: ReturnType<typeof create>;
  await act(async () => {
    tree = create(React.createElement(AdminScheduleModal, { ...props, employees: [] }));
  });
  await act(async () => {
    tree!.update(React.createElement(AdminScheduleModal, { ...props, employees: testEmployees }));
  });

  await act(async () => tree!.root.findByProps({ accessibilityLabel: "Escolher Ambev Manaus" }).props.onPress());
  await act(async () => tree!.root.findByProps({ accessibilityLabel: "Salvar agendamento" }).props.onPress());

  assert.equal(savedData?.employeeId, "emp-1");
});
