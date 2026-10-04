import { test } from "node:test";
import assert from "node:assert/strict";
import React from "react";
import { act, create } from "react-test-renderer";
import type { ClientSummary } from "@qqs/contracts";

import { sampleClients } from "./client-fixtures";
import { ClientPicker } from "./ClientPicker";

function render(onSelect: (client: ClientSummary) => void = () => {}) {
  let tree: ReturnType<typeof create>;
  act(() => {
    tree = create(React.createElement(ClientPicker, { clients: sampleClients, onSelect }));
  });
  return tree!;
}

test("ClientPicker filters by name ignoring case and accents", () => {
  const tree = render();
  act(() => tree.root.findByProps({ accessibilityLabel: "Buscar empresa" }).props.onChangeText("amazonia"));

  const output = JSON.stringify(tree.toJSON());
  assert.match(output, /Gases da Amazônia/);
  assert.doesNotMatch(output, /Ambev Manaus/);
});

test("ClientPicker filters by CNPJ typed with punctuation", () => {
  const tree = render();
  act(() => tree.root.findByProps({ accessibilityLabel: "Buscar empresa" }).props.onChangeText("00.000.000"));

  const output = JSON.stringify(tree.toJSON());
  assert.match(output, /Ambev Manaus/);
  assert.doesNotMatch(output, /Gases da Amazônia/);
});

test("ClientPicker reports the chosen company", () => {
  let chosen: ClientSummary | undefined;
  const tree = render((client) => {
    chosen = client;
  });
  act(() => tree.root.findByProps({ accessibilityLabel: "Escolher Ambev Manaus" }).props.onPress());

  assert.equal(chosen?.id, "client-002");
});
