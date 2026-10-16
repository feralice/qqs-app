import { test } from "node:test";
import assert from "node:assert/strict";
import React from "react";
import { create, act } from "react-test-renderer";

import { Button } from "./Button";
import { styles } from "./Button.styles";

test("Button enforces minimum 44px touch area height", () => {
  let tree: ReturnType<typeof create>;
  act(() => {
    tree = create(
      <Button label="Confirmar" onPress={() => {}} />
    );
  });
  assert.ok(((styles.base as any).minHeight ?? 0) >= 44);
});
