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

function relativeLuminance(hex: string): number {
  const [r, g, b] = [1, 3, 5].map((i) => {
    const channel = parseInt(hex.slice(i, i + 2), 16) / 255;
    return channel <= 0.03928 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

function contrastRatio(a: string, b: string): number {
  const [light, dark] = [relativeLuminance(a), relativeLuminance(b)].sort((x, y) => y - x);
  return (light + 0.05) / (dark + 0.05);
}

test("Badge text meets WCAG AA contrast (4.5:1) against its background in every variant", () => {
  const variants = ["info", "success", "warning", "danger", "neutral"] as const;
  for (const variant of variants) {
    const background = (styles[variant] as any).backgroundColor as string;
    const text = (styles[`${variant}Text`] as any).color as string;
    const ratio = contrastRatio(text, background);
    assert.ok(ratio >= 4.5, `${variant}: ${text} sobre ${background} tem contraste ${ratio.toFixed(2)}:1`);
  }
});
