import type { Column, TabularExporter } from "../../application/common/tabular-exporter.js";

// Planilhas executam células que começam com estes caracteres como fórmula
// (OWASP "CSV Injection"); texto vindo do usuário recebe um apóstrofo na frente.
const FORMULA_PREFIX = /^[=+\-@\t\r]/;

function escapeCell(value: string | number | boolean | undefined): string {
  if (value === undefined) return "";
  let text = String(value);
  if (typeof value === "string" && FORMULA_PREFIX.test(text)) text = `'${text}`;
  return /[";\n\r]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
}

// Separador ";" e BOM UTF-8: é o que o Excel em pt-BR abre direto, com acentos.
export function toCsv<T>(rows: T[], columns: Column<T>[]): string {
  const lines = [columns.map((column) => escapeCell(column.header))];
  for (const row of rows) lines.push(columns.map((column) => escapeCell(column.value(row))));
  return `﻿${lines.map((cells) => cells.join(";")).join("\r\n")}\r\n`;
}

export class CsvExporter implements TabularExporter {
  readonly contentType = "text/csv; charset=utf-8";
  readonly extension = "csv";

  export<T>(rows: T[], columns: Column<T>[]): string {
    return toCsv(rows, columns);
  }
}
