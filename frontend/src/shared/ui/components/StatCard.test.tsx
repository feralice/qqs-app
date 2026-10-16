import { test } from "node:test";
import assert from "node:assert/strict";
import React from "react";
import { create, act } from "react-test-renderer";

import { StatCard } from "./StatCard";
import { styles } from "./StatCard.styles";

test("StatCard renders title, value with font multiplier limit and no fixed minWidth", () => {
  let tree: ReturnType<typeof create>;
  act(() => {
    tree = create(
      <StatCard
        title="Agendadas"
        value={5}
        iconName="calendar"
      />
    );
  });
  const output = JSON.stringify(tree!.toJSON());
  assert.match(output, /Agendadas/);
  assert.match(output, /5/);
  assert.equal((styles.card as any).minWidth, undefined);
  const valueText = tree!.root.findByProps({ children: 5 });
  assert.equal(valueText.props.maxFontSizeMultiplier, 1.3);
});
