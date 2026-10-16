import { test } from "node:test";
import assert from "node:assert/strict";
import React from "react";
import { create, act } from "react-test-renderer";

import { Badge } from "./Badge";
import { styles } from "./Badge.styles";
import { theme } from "../theme";

test("Badge renders label and uses pill radius token", () => {
  let tree: ReturnType<typeof create>;
  act(() => {
    tree = create(<Badge label="Concluída" variant="success" showDot />);
  });
  const output = JSON.stringify(tree!.toJSON());
  assert.match(output, /Conclu\u00edda/);
  assert.equal((styles.base as any).borderRadius, theme.radius.pill);
});
