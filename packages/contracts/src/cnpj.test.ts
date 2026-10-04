import { test } from "node:test";
import assert from "node:assert/strict";

import { isValidCnpj, normalizeCnpj } from "./index.js";

test("isValidCnpj accepts masked and unmasked forms of a valid CNPJ", () => {
  assert.equal(isValidCnpj("11.222.333/0001-81"), true);
  assert.equal(isValidCnpj("11222333000181"), true);
});

test("isValidCnpj accepts a CNPJ whose check digit remainder is below two", () => {
  assert.equal(isValidCnpj("00.000.000/0001-91"), true);
});

test("isValidCnpj rejects wrong check digits, wrong length and repeated digits", () => {
  assert.equal(isValidCnpj("11.222.333/0001-82"), false);
  assert.equal(isValidCnpj("1122233300018"), false);
  assert.equal(isValidCnpj("00000000000000"), false);
  assert.equal(isValidCnpj(""), false);
});

test("normalizeCnpj strips punctuation", () => {
  assert.equal(normalizeCnpj("11.222.333/0001-81"), "11222333000181");
});

test("isValidCnpj accepts the alphanumeric CNPJ format", () => {
  assert.equal(isValidCnpj("12.ABC.345/01DE-35"), true);
  assert.equal(isValidCnpj("12abc34501de35"), true);
  assert.equal(normalizeCnpj("12.abc.345/01de-35"), "12ABC34501DE35");
});

test("isValidCnpj rejects letters in the check digits and stray characters", () => {
  assert.equal(isValidCnpj("12.ABC.345/01DE-3A"), false);
  assert.equal(isValidCnpj("12.ABC.345/01DE-36"), false);
  assert.equal(isValidCnpj("ab11.222.333/0001-81xyz"), false);
});
