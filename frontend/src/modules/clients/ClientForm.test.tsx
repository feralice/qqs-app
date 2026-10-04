import { test } from "node:test";
import assert from "node:assert/strict";
import React from "react";
import { act, create } from "react-test-renderer";
import type { CreateClientRequest } from "@qqs/contracts";

import { ClientForm, parseDecimal } from "./ClientForm";

async function render() {
  const submitted: CreateClientRequest[] = [];
  let tree: ReturnType<typeof create>;
  await act(async () => {
    tree = create(React.createElement(ClientForm, { onSubmit: (request) => { submitted.push(request); } }));
  });
  const type = async (label: string, value: string) =>
    act(async () => tree!.root.findByProps({ accessibilityLabel: label }).props.onChangeText(value));
  const press = async (label: string) => act(async () => tree!.root.findByProps({ accessibilityLabel: label }).props.onPress());
  return { tree: tree!, submitted, type, press };
}

async function fillValid(type: (label: string, value: string) => Promise<void>) {
  await type("Razão social", "Gases da Amazônia");
  await type("CNPJ", "11.222.333/0001-81");
  await type("Endereço", "Distrito Industrial, Manaus");
  await type("Latitude", "-3,1019");
  await type("Longitude", "-60.025");
}

test("parseDecimal accepts comma or dot and rejects garbage", () => {
  assert.equal(parseDecimal("-3,1019"), -3.1019);
  assert.equal(parseDecimal(" -60.025 "), -60.025);
  assert.equal(parseDecimal(""), undefined);
  assert.equal(parseDecimal("abc"), undefined);
  assert.equal(parseDecimal("1,2,3"), undefined);
});

test("ClientForm submits a company with two towers and a boiler", async () => {
  const { submitted, type, press } = await render();
  await fillValid(type);
  for (const name of ["Torre 1", "Torre 2", "Caldeira 1"]) {
    await type("Nome do sistema", name);
    await type("Tipo do sistema", name.startsWith("Torre") ? "tower" : "boiler");
    await press("Adicionar sistema");
  }
  await press("Salvar empresa");

  assert.deepEqual(submitted, [
    {
      name: "Gases da Amazônia",
      cnpj: "11.222.333/0001-81",
      address: "Distrito Industrial, Manaus",
      latitude: -3.1019,
      longitude: -60.025,
      radiusMeters: 200,
      systems: [
        { name: "Torre 1", type: "tower" },
        { name: "Torre 2", type: "tower" },
        { name: "Caldeira 1", type: "boiler" },
      ],
    },
  ]);
});

test("ClientForm blocks an invalid CNPJ and says why", async () => {
  const { tree, submitted, type, press } = await render();
  await fillValid(type);
  await type("CNPJ", "11.222.333/0001-82");
  await press("Salvar empresa");

  assert.equal(submitted.length, 0);
  assert.match(JSON.stringify(tree.toJSON()), /CNPJ inválido/);
});

test("ClientForm blocks coordinates out of range and a zero radius", async () => {
  const { tree, submitted, type, press } = await render();
  await fillValid(type);
  await type("Latitude", "-95");
  await type("Raio permitido em metros", "0");
  await press("Salvar empresa");

  assert.equal(submitted.length, 0);
  const output = JSON.stringify(tree.toJSON());
  assert.match(output, /Latitude deve estar entre -90 e 90/);
  assert.match(output, /Raio deve ser um número inteiro maior que zero/);
});

test("ClientForm does not add the same system twice", async () => {
  const { tree, type, press } = await render();
  for (let i = 0; i < 2; i++) {
    await type("Nome do sistema", "Torre 1");
    await type("Tipo do sistema", "tower");
    await press("Adicionar sistema");
  }
  assert.equal(JSON.stringify(tree.toJSON()).match(/Remover Torre 1/g)?.length, 1);
});
