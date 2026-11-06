import { test } from "node:test";
import assert from "node:assert/strict";
import React from "react";
import { act, create } from "react-test-renderer";
import type { CreateProductRequest, Product, UpdateProductRequest } from "@qqs/contracts";

import { ApiError } from "../../shared/http/api-error";
import type { ProductApi } from "./product-api";
import { sampleProducts, sampleProgram } from "./product-fixtures";
import { ProductsScreen } from "./ProductsScreen";

function fakeApi(overrides: Partial<ProductApi> = {}) {
  const created: CreateProductRequest[] = [];
  const updates: Array<[string, UpdateProductRequest]> = [];
  let products = [...sampleProducts];
  const api: ProductApi = {
    listProducts: async () => products,
    createProduct: async (request) => {
      created.push(request);
      const product: Product = { id: "new", name: request.name, unit: request.unit ?? "L", active: true };
      products = [...products, product];
      return product;
    },
    updateProduct: async (id, request) => {
      updates.push([id, request]);
      products = products.map((product) => (product.id === id ? { ...product, ...request } : product));
      return products.find((product) => product.id === id)!;
    },
    getClientProgram: async () => sampleProgram,
    saveSystemProgram: async () => sampleProgram.systems[0],
    ...overrides,
  };
  return { api, created, updates };
}

async function render(api: ProductApi) {
  let tree: ReturnType<typeof create>;
  await act(async () => {
    tree = create(React.createElement(ProductsScreen, { api }));
  });
  return tree!;
}

const input = (tree: ReturnType<typeof create>, label: string) => tree.root.findByProps({ accessibilityLabel: label });

test("ProductsScreen lists the catalog with unit and status", async () => {
  const tree = await render(fakeApi().api);
  const output = JSON.stringify(tree.toJSON());
  assert.match(output, /QQS INP/);
  assert.match(output, /Inibidor de corrosão/);
  assert.match(output, /Unidade: kg/);
  assert.match(output, /Inativo/);
});

test("ProductsScreen creates a product in kilograms", async () => {
  const { api, created } = fakeApi();
  const tree = await render(api);
  await act(async () => input(tree, "Nome do produto").props.onChangeText(" QQS ZN "));
  await act(async () => input(tree, "Função do produto").props.onChangeText("Zinco"));
  await act(async () => input(tree, "Unidade kg").props.onPress());
  await act(async () => input(tree, "Cadastrar produto").props.onPress());

  assert.deepEqual(created, [{ name: "QQS ZN", description: "Zinco", unit: "kg" }]);
  assert.match(JSON.stringify(tree.toJSON()), /QQS ZN/);
});

test("ProductsScreen requires a name and explains a duplicated one", async () => {
  const { api, created } = fakeApi({
    createProduct: async () => {
      throw new ApiError(409);
    },
  });
  const tree = await render(api);
  await act(async () => input(tree, "Cadastrar produto").props.onPress());
  assert.match(JSON.stringify(tree.toJSON()), /Informe o nome do produto/);
  assert.equal(created.length, 0);

  await act(async () => input(tree, "Nome do produto").props.onChangeText("QQS INP"));
  await act(async () => input(tree, "Cadastrar produto").props.onPress());
  assert.match(JSON.stringify(tree.toJSON()), /Já existe um produto com esse nome/);
});

test("ProductsScreen deactivates and reactivates products", async () => {
  const { api, updates } = fakeApi();
  const tree = await render(api);
  await act(async () => input(tree, "Inativar QQS INP").props.onPress());
  await act(async () => input(tree, "Reativar QQS NSS").props.onPress());
  assert.deepEqual(updates, [
    ["product-inp", { active: false }],
    ["product-nss", { active: true }],
  ]);
});

test("ProductsScreen explains when a product cannot be deactivated", async () => {
  const { api } = fakeApi({
    updateProduct: async () => {
      throw new Error("offline");
    },
  });
  const tree = await render(api);
  await act(async () => input(tree, "Inativar QQS INP").props.onPress());
  assert.match(JSON.stringify(tree.toJSON()), /Não foi possível alterar QQS INP/);
});
