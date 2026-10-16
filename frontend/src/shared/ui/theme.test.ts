import { test } from "node:test";
import assert from "node:assert/strict";

import { colors, theme } from "./theme";

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

test("theme exposes the complete semantic palette and scales", () => {
  assert.equal(theme.colors.background, "#F4F8FC");
  assert.equal(theme.colors.text, "#242424");
  assert.equal(theme.colors.textMuted, "#64748B");
  assert.equal(theme.colors.textSubtle, "#94A3B8");
  assert.equal(theme.colors.surface, "#FFFFFF");
  assert.equal(theme.colors.surfaceAlt, "#F8FAFC");
  assert.equal(theme.colors.surfaceTint, "#F0F7FD");
  assert.equal(theme.colors.border, "#E2E8F0");
  assert.equal(theme.colors.borderStrong, "#CBD5E1");
  assert.equal(theme.colors.success, "#27AE60");
  assert.equal(theme.colors.successBg, "#EAFAF1");
  assert.equal(theme.colors.warning, "#F39C12");
  assert.equal(theme.colors.warningBg, "#FEF5E7");
  assert.equal(theme.colors.danger, "#C0392B");
  assert.equal(theme.colors.dangerBg, "#FDEDEC");

  assert.deepEqual(theme.spacing, {
    xxs: 2,
    xs: 4,
    sm: 8,
    md: 12,
    lg: 16,
    xl: 24,
    xxl: 32,
  });

  assert.deepEqual(theme.radius, {
    sm: 8,
    md: 12,
    lg: 16,
    xl: 20,
    pill: 999,
  });

  assert.deepEqual(theme.typography.sizes, {
    xs: 11,
    sm: 12,
    md: 14,
    lg: 16,
    xl: 20,
    display: 26,
  });

  assert.deepEqual(theme.typography.weights, {
    regular: "400",
    semibold: "600",
    bold: "700",
  });
});

