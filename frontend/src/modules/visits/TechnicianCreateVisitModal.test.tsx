import { test } from "node:test";
import assert from "node:assert/strict";
import React from "react";
import { create, act } from "react-test-renderer";

import { sampleClients } from "../clients/client-fixtures";
import { TechnicianCreateVisitModal, type TechnicianVisitDraft } from "./TechnicianCreateVisitModal";

async function render(onSave: (draft: TechnicianVisitDraft) => void) {
  let tree: ReturnType<typeof create>;
  await act(async () => {
    tree = create(
      React.createElement(TechnicianCreateVisitModal, {
        visible: true,
        clients: sampleClients,
        onClose: () => undefined,
        onSave,
      }),
    );
  });
  return tree!;
}

test("technician create visit modal does not save without a company", async () => {
  let saved: TechnicianVisitDraft | undefined;
  const tree = await render((draft) => {
    saved = draft;
  });

  const save = tree.root.findByProps({ accessibilityLabel: "Salvar visita do técnico" });
  await act(async () => save.props.onPress());

  assert.equal(saved, undefined);
  assert.equal(save.props.disabled, true);
});

test("technician create visit modal saves the chosen company and schedule", async () => {
  let saved: TechnicianVisitDraft | undefined;
  const tree = await render((draft) => {
    saved = draft;
  });

  await act(async () => tree.root.findByProps({ accessibilityLabel: "Escolher Gases da Amazônia" }).props.onPress());
  await act(async () => tree.root.findByProps({ accessibilityLabel: "Salvar visita do técnico" }).props.onPress());

  assert.equal(saved?.client.id, "client-001");
  assert.ok(!Number.isNaN(Date.parse(saved!.scheduledFor)));
});

test("technician create visit modal explains when no company is cached", async () => {
  let tree: ReturnType<typeof create>;
  await act(async () => {
    tree = create(
      React.createElement(TechnicianCreateVisitModal, {
        visible: true,
        clients: [],
        onClose: () => undefined,
        onSave: () => undefined,
      }),
    );
  });

  assert.match(JSON.stringify(tree!.toJSON()), /Nenhuma empresa disponível/);
});
