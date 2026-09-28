import { test } from "node:test";
import assert from "node:assert/strict";
import React from "react";
import { create, act } from "react-test-renderer";

import { TechnicianCreateVisitModal } from "./TechnicianCreateVisitModal";

test("technician create visit modal saves the company and schedule", async () => {
  let saved: { clientName: string } | undefined;
  let tree: ReturnType<typeof create>;
  await act(async () => {
    tree = create(React.createElement(TechnicianCreateVisitModal, {
      visible: true,
      onClose: () => undefined,
      onSave: (value) => { saved = value; },
    }));
  });

  const input = tree!.root.findByProps({ accessibilityLabel: "Nome da empresa" });
  await act(async () => input.props.onChangeText("Cliente do técnico"));
  const save = tree!.root.findByProps({ accessibilityLabel: "Salvar visita do técnico" });
  await act(async () => save.props.onPress());

  assert.equal(saved?.clientName, "Cliente do técnico");
});
