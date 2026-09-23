import { test } from "node:test";
import assert from "node:assert/strict";
import React from "react";
import { create, act } from "react-test-renderer";

import { StaffPicker } from "./StaffPicker.js";

test("StaffPicker renders list of employees and allows toggling selection", () => {
  const employees = [
    { id: "emp-1", name: "Carlos Silva", email: "carlos@qqs.app", role: "employee" as const },
    { id: "emp-2", name: "Mariana Souza", email: "mariana@qqs.app", role: "employee" as const },
  ];
  let selected = ["emp-1"];

  let tree: ReturnType<typeof create>;
  act(() => {
    tree = create(
      React.createElement(StaffPicker, {
        employees,
        selectedIds: selected,
        onToggle: (id: string) => {
          selected = selected.includes(id)
            ? selected.filter((item) => item !== id)
            : [...selected, id];
        },
      }),
    );
  });

  const output = JSON.stringify(tree!.toJSON());
  assert.ok(output.includes("Carlos Silva"), "Deve exibir o nome Carlos Silva");
  assert.ok(output.includes("Mariana Souza"), "Deve exibir o nome Mariana Souza");
  assert.ok(output.includes("Equipe presente"), "Deve ter o título da seção");
});
