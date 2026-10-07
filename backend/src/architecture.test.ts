import { test } from "node:test";
import assert from "node:assert/strict";
import { readdirSync, readFileSync } from "node:fs";
import { dirname, join, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";

// Regra de dependência da Clean Architecture: imports só apontam para dentro.
// presentation -> infrastructure -> application -> domain
const SRC = dirname(fileURLToPath(import.meta.url));
type Layer = "domain" | "application" | "infrastructure" | "presentation";

const allowedLayers: Record<Layer, Layer[]> = {
  domain: ["domain"],
  application: ["application", "domain"],
  infrastructure: ["infrastructure", "application", "domain"],
  presentation: ["presentation", "infrastructure", "application", "domain"],
};

// Núcleo sem framework: só contratos compartilhados e módulos nativos do Node.
const allowedPackages: Record<Layer, (name: string) => boolean> = {
  domain: (name) => name === "@qqs/contracts",
  application: (name) => name === "@qqs/contracts" || name.startsWith("node:"),
  infrastructure: () => true,
  presentation: () => true,
};

function sourceFiles(directory: string): string[] {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const path = join(directory, entry.name);
    if (entry.isDirectory()) return sourceFiles(path);
    return entry.name.endsWith(".ts") && !entry.name.endsWith(".test.ts") ? [path] : [];
  });
}

function layerOf(path: string): Layer | undefined {
  const top = relative(SRC, path).split(/[\\/]/)[0];
  return top in allowedLayers ? (top as Layer) : undefined;
}

function violations(): string[] {
  const found: string[] = [];
  for (const file of sourceFiles(SRC)) {
    const layer = layerOf(file);
    if (!layer) continue;
    const imports = readFileSync(file, "utf8").matchAll(/^\s*(?:import|export)[^"']*?from\s*["']([^"']+)["']/gm);
    for (const [, specifier] of imports) {
      const where = relative(SRC, file);
      if (specifier.startsWith(".")) {
        const target = layerOf(resolve(dirname(file), specifier));
        if (target && !allowedLayers[layer].includes(target)) found.push(`${where}: ${layer} -> ${target} (${specifier})`);
      } else if (!allowedPackages[layer](specifier)) {
        found.push(`${where}: ${layer} -> package ${specifier}`);
      }
    }
  }
  return found;
}

test("source dependencies point only inwards", () => {
  assert.deepEqual(violations(), []);
});
