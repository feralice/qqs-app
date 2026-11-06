import { test } from "node:test";
import assert from "node:assert/strict";

import { ApiError } from "../../shared/http/api-error";
import { createProductApi } from "./product-api";

function recordingFetch(body: unknown, status = 200) {
  const calls: Array<{ url: string; init?: RequestInit }> = [];
  const fetcher = (async (url: string, init?: RequestInit) => {
    calls.push({ url, init });
    return new Response(JSON.stringify(body), { status });
  }) as typeof fetch;
  return { calls, fetcher };
}

test("product api sends the token and the right routes", async () => {
  const { calls, fetcher } = recordingFetch({ items: [] });
  const api = createProductApi("token", fetcher, "http://api");
  await api.listProducts({ includeInactive: true });
  await api.saveSystemProgram("client 1", "system/1", { parameters: [], products: [] });

  assert.equal(calls[0].url, "http://api/products?includeInactive=true");
  assert.equal((calls[0].init?.headers as Record<string, string>).Authorization, "Bearer token");
  assert.equal(calls[1].url, "http://api/clients/client%201/systems/system%2F1/program");
  assert.equal(calls[1].init?.method, "PUT");
});

test("product api turns error statuses into ApiError", async () => {
  const { fetcher } = recordingFetch({ error: "conflict" }, 409);
  await assert.rejects(createProductApi("t", fetcher, "http://api").createProduct({ name: "QQS INP" }), (error) => {
    return error instanceof ApiError && error.status === 409;
  });
});
