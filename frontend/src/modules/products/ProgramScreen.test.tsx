import { test } from "node:test";
import assert from "node:assert/strict";
import React from "react";
import { act, create } from "react-test-renderer";
import type { UpdateSystemProgramRequest } from "@qqs/contracts";

import { ApiError } from "../../shared/http/api-error";
import type { ProductApi } from "./product-api";
import { sampleProducts, sampleProgram } from "./product-fixtures";
import { ProgramScreen } from "./ProgramScreen";

function fakeApi(overrides: Partial<ProductApi> = {}) {
  const saved: Array<[string, string, UpdateSystemProgramRequest]> = [];
  const api: ProductApi = {
    listProducts: async () => sampleProducts,
    createProduct: async () => sampleProducts[0],
    updateProduct: async () => sampleProducts[0],
    getClientProgram: async () => sampleProgram,
    saveSystemProgram: async (clientId, systemId, request) => {
      saved.push([clientId, systemId, request]);
      return sampleProgram.systems[0];
    },
    ...overrides,
  };
  return { api, saved };
}

async function render(api: ProductApi) {
  let tree: ReturnType<typeof create>;
  await act(async () => {
    tree = create(React.createElement(ProgramScreen, { api, clientId: "client-001", clientName: "Gases da Amazônia" }));
  });
  return tree!;
}

const byLabel = (tree: ReturnType<typeof create>, label: string) => tree.root.findByProps({ accessibilityLabel: label });

test("ProgramScreen shows every system with its parameters and products", async () => {
  const tree = await render(fakeApi().api);
  const output = JSON.stringify(tree.toJSON());
  assert.match(output, /Gases da Amazônia/);
  assert.match(output, /Torre 1/);
  assert.match(output, /Caldeira 1/);
  assert.equal(byLabel(tree, "Mínimo do parâmetro 1 em Torre 1").props.value, "6,8");
  assert.equal(byLabel(tree, "Dosagem diária de QQS INP em Torre 1").props.value, "2");
});

test("ProgramScreen saves a new program for the boiler with decimal commas", async () => {
  const { api, saved } = fakeApi();
  const tree = await render(api);
  await act(async () => byLabel(tree, "Adicionar parâmetro em Caldeira 1").props.onPress());
  await act(async () => byLabel(tree, "Nome do parâmetro 1 em Caldeira 1").props.onChangeText("Sulfito"));
  await act(async () => byLabel(tree, "Unidade do parâmetro 1 em Caldeira 1").props.onChangeText("ppm"));
  await act(async () => byLabel(tree, "Mínimo do parâmetro 1 em Caldeira 1").props.onChangeText("20,5"));
  await act(async () => byLabel(tree, "Adicionar QQS BIO em Caldeira 1").props.onPress());
  await act(async () => byLabel(tree, "Dosagem diária de QQS BIO em Caldeira 1").props.onChangeText("0,4"));
  await act(async () => byLabel(tree, "Salvar programa de Caldeira 1").props.onPress());

  assert.deepEqual(saved, [
    [
      "client-001",
      "system-003",
      {
        parameters: [{ name: "Sulfito", unit: "ppm", min: 20.5 }],
        products: [{ productId: "product-bio", dailyDose: 0.4 }],
      },
    ],
  ]);
  assert.match(JSON.stringify(tree.toJSON()), /Programa salvo/);
});

test("ProgramScreen only offers active products that are not in the system yet", async () => {
  const tree = await render(fakeApi().api);
  assert.ok(byLabel(tree, "Adicionar QQS BIO em Torre 1"));
  assert.equal(tree.root.findAllByProps({ accessibilityLabel: "Adicionar QQS INP em Torre 1" }).length, 0);
  assert.equal(tree.root.findAllByProps({ accessibilityLabel: "Adicionar QQS NSS em Torre 1" }).length, 0);
});

test("ProgramScreen blocks an inverted range and a missing dose before calling the server", async () => {
  const { api, saved } = fakeApi();
  const tree = await render(api);
  await act(async () => byLabel(tree, "Mínimo do parâmetro 1 em Torre 1").props.onChangeText("9"));
  await act(async () => byLabel(tree, "Dosagem diária de QQS INP em Torre 1").props.onChangeText(""));
  await act(async () => byLabel(tree, "Salvar programa de Torre 1").props.onPress());

  const output = JSON.stringify(tree.toJSON());
  assert.match(output, /pH: mínimo maior que o máximo/);
  assert.match(output, /QQS INP: informe a dosagem diária/);
  assert.equal(saved.length, 0);
});

test("ProgramScreen removes a product and reports a server refusal", async () => {
  const { api, saved } = fakeApi({
    saveSystemProgram: async () => {
      throw new ApiError(422);
    },
  });
  const tree = await render(api);
  await act(async () => byLabel(tree, "Remover QQS INP de Torre 1").props.onPress());
  await act(async () => byLabel(tree, "Salvar programa de Torre 1").props.onPress());
  assert.equal(saved.length, 0);
  assert.match(JSON.stringify(tree.toJSON()), /Produto inativo ou inexistente/);
});
