import { test } from "node:test";
import assert from "node:assert/strict";

import { createLocalId } from "./local-id";

const UUID_V4 = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/;

test("createLocalId returns distinct RFC 4122 version 4 ids", () => {
  const ids = new Set(Array.from({ length: 50 }, () => createLocalId()));
  assert.equal(ids.size, 50);
  for (const id of ids) assert.match(id, UUID_V4);
});

test("createLocalId works without crypto.randomUUID", () => {
  const original = globalThis.crypto;
  Object.defineProperty(globalThis, "crypto", { value: undefined, configurable: true });
  try {
    assert.match(createLocalId(), UUID_V4);
  } finally {
    Object.defineProperty(globalThis, "crypto", { value: original, configurable: true });
  }
});
