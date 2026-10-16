import { test } from "node:test";
import assert from "node:assert/strict";

import { layoutFor } from "./layout";

test("layoutFor handles screen width boundaries", () => {
  assert.deepEqual(layoutFor(320), { width: 320, size: "compact", gutter: 12 });
  assert.deepEqual(layoutFor(359), { width: 359, size: "compact", gutter: 12 });
  assert.deepEqual(layoutFor(360), { width: 360, size: "regular", gutter: 16 });
  assert.deepEqual(layoutFor(412), { width: 412, size: "regular", gutter: 16 });
});
