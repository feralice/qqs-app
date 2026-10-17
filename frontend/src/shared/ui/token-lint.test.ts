import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

function findStylesFiles(dir: string): string[] {
  let results: string[] = [];
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      results = results.concat(findStylesFiles(fullPath));
    } else if (entry.isFile() && entry.name.endsWith(".styles.ts")) {
      results.push(fullPath);
    }
  }
  return results;
}

// Espaçamentos (padding, margin, gap) ainda não são cobertos: há ~110 valores fora da escala de theme.spacing.
test("no styles file contains hardcoded hex colors, font sizes or border radii", () => {
  const srcDir = path.resolve(__dirname, "../..");
  const stylesFiles = findStylesFiles(srcDir);
  assert.ok(stylesFiles.length > 0, "Deve encontrar arquivos .styles.ts");

  const violations: string[] = [];

  const hexColorRegex = /#([0-9a-fA-F]{3,8})\b/;
  const fontSizeRegex = /fontSize:\s*\d+/;
  const borderRadiusRegex = /borderRadius:\s*\d+/;

  for (const file of stylesFiles) {
    const relativePath = path.relative(srcDir, file);
    const content = fs.readFileSync(file, "utf8");
    const lines = content.split("\n");

    lines.forEach((line, index) => {
      const trimmed = line.trim();
      if (trimmed.startsWith("//") || trimmed.startsWith("/*")) return;

      if (hexColorRegex.test(line)) {
        violations.push(`${relativePath}:${index + 1} - Cor hexadecimal solta: "${trimmed}"`);
      }
      if (fontSizeRegex.test(line)) {
        violations.push(`${relativePath}:${index + 1} - fontSize numérico solto: "${trimmed}"`);
      }
      if (borderRadiusRegex.test(line)) {
        violations.push(`${relativePath}:${index + 1} - borderRadius numérico solto: "${trimmed}"`);
      }
    });
  }

  if (violations.length > 0) {
    assert.fail(`Foram encontrados literais soltos nos arquivos de estilo:\n${violations.join("\n")}`);
  }
});
