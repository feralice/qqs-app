import { test } from "node:test";
import assert from "node:assert/strict";
import React from "react";
import { act, create } from "react-test-renderer";
import type { ClientSummary, CreateClientRequest, UpdateClientRequest } from "@qqs/contracts";

import { sampleClients } from "./client-fixtures";
import type { ClientApi } from "./client-api";
import { ApiError } from "../../shared/http/api-error";
import { ClientForm } from "./ClientForm";
import { ClientsScreen } from "./ClientsScreen";

function fakeApi(overrides: Partial<ClientApi> = {}) {
  const updates: Array<[string, UpdateClientRequest]> = [];
  const created: CreateClientRequest[] = [];
  let clients = [...sampleClients];
  const api: ClientApi = {
    listClients: async () => clients,
    createClient: async (request) => {
      created.push(request);
      const client: ClientSummary = { ...sampleClients[1], id: "new", name: request.name, systems: [] };
      clients = [...clients, client];
      return client;
    },
    updateClient: async (id, request) => {
      updates.push([id, request]);
      clients = clients.map((client) => (client.id === id ? { ...client, ...request } : client));
      return clients.find((client) => client.id === id)!;
    },
    addSystem: async () => sampleClients[0],
    ...overrides,
  };
  return { api, updates, created };
}

async function render(api: ClientApi) {
  let tree: ReturnType<typeof create>;
  await act(async () => {
    tree = create(React.createElement(ClientsScreen, { api }));
  });
  return tree!;
}

test("ClientsScreen lists companies with radius", async () => {
  const tree = await render(fakeApi().api);
  const output = JSON.stringify(tree.toJSON());
  assert.match(output, /Gases da Amazônia/);
  assert.match(output, /Ambev Manaus/);
  assert.match(output, /Raio de 200 m/);
});

test("ClientsScreen deactivates a company", async () => {
  const { api, updates } = fakeApi();
  const tree = await render(api);
  await act(async () => tree.root.findByProps({ accessibilityLabel: "Inativar Gases da Amazônia" }).props.onPress());

  assert.deepEqual(updates, [["client-001", { active: false }]]);
  assert.ok(tree.root.findByProps({ accessibilityLabel: "Reativar Gases da Amazônia" }));
});

test("ClientsScreen explains a duplicated CNPJ returned by the server", async () => {
  const { api } = fakeApi({
    createClient: async () => {
      throw new ApiError(409);
    },
  });
  const tree = await render(api);
  await act(async () => tree.root.findByProps({ accessibilityLabel: "Nova empresa" }).props.onPress());
  await act(async () => tree.root.findByType(ClientForm).props.onSubmit({ ...sampleClients[0], systems: [] }));

  assert.match(JSON.stringify(tree.toJSON()), /CNPJ já cadastrado/);
});

test("ClientsScreen shows an error when the list cannot be loaded", async () => {
  const { api } = fakeApi({
    listClients: async () => {
      throw new Error("offline");
    },
  });
  const tree = await render(api);
  assert.match(JSON.stringify(tree.toJSON()), /Não foi possível carregar as empresas/);
});
