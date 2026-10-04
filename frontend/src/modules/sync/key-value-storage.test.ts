import { test } from "node:test";
import assert from "node:assert/strict";

import { createBrowserKeyValueStorage } from "./key-value-storage";

function fakeLocalStorage() {
  const values = new Map<string, string>();
  return {
    getItem: (key: string) => values.get(key) ?? null,
    setItem: (key: string, value: string) => void values.set(key, value),
    removeItem: (key: string) => void values.delete(key),
  };
}

test("browser storage reads, writes and removes through localStorage", async () => {
  const storage = createBrowserKeyValueStorage(fakeLocalStorage());
  assert.equal(await storage.getItem("k"), null);

  await storage.setItem("k", "v");
  assert.equal(await storage.getItem("k"), "v");

  await storage.removeItem("k");
  assert.equal(await storage.getItem("k"), null);
});

test("browser storage without localStorage keeps data in memory", async () => {
  const storage = createBrowserKeyValueStorage(undefined);
  await storage.setItem("k", "v");
  assert.equal(await storage.getItem("k"), "v");
});
