import { test } from "node:test";
import assert from "node:assert/strict";

import { colors } from "./theme.js";

test("theme exposes the approved QQS blue palette", () => {
  assert.deepEqual(colors, {
    corporateBlue: "#0876C9",
    lightBlue: "#B9DDF8",
    aqua: "#72BAB8",
    white: "#FFFFFF",
    nearBlack: "#242424",
    darkGray: "#383838",
  });
});
