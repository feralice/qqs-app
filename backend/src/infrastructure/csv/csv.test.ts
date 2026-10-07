import { test } from "node:test";
import assert from "node:assert/strict";

import { toCsv } from "./csv.js";

const columns = [
  { header: "Empresa", value: (row: { name: string; meters?: number }) => row.name },
  { header: "Distância (m)", value: (row: { name: string; meters?: number }) => row.meters },
];

test("writes a BOM, a header row and CRLF line endings", () => {
  assert.equal(toCsv([{ name: "Gases da Amazônia", meters: 1916 }], columns), "﻿Empresa;Distância (m)\r\nGases da Amazônia;1916\r\n");
});

test("quotes separators, quotes and line breaks", () => {
  const csv = toCsv([{ name: 'Torre "A"; bloco\n2' }], columns);

  assert.equal(csv.split("\r\n")[1], '"Torre ""A""; bloco\n2";');
});

test("neutralises spreadsheet formulas in text but keeps negative numbers", () => {
  const csv = toCsv([{ name: "=1+1", meters: -3 }], columns);

  assert.equal(csv.split("\r\n")[1], "'=1+1;-3");
});
