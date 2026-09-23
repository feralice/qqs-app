import { test } from "node:test";
import assert from "node:assert/strict";
import React from "react";
import { create, act } from "react-test-renderer";

import { WeekCalendarStrip } from "./WeekCalendarStrip.js";

test("WeekCalendarStrip renders 7 days of the week and highlights the selected day", () => {
  let selected = "2026-09-22";
  let tree: ReturnType<typeof create>;
  act(() => {
    tree = create(
      React.createElement(WeekCalendarStrip, {
        selectedDate: selected,
        onSelectDate: (d: string) => {
          selected = d;
        },
        visitCountsByDate: { "2026-09-22": 3, "2026-09-23": 1 },
      }),
    );
  });

  const json = JSON.stringify(tree!.toJSON());
  assert.ok(json.includes("22"), "Deve exibir o dia 22");
  assert.ok(json.includes("3"), "Deve exibir o badge com 3 visitas para o dia 22");
  assert.ok(json.includes("Hoje"), "Deve ter botão de atalho para voltar para hoje");
});
