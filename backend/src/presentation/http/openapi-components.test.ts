import { test } from "node:test";
import assert from "node:assert/strict";
import { z } from "zod";

import { buildOpenApiDocument } from "./openapi.js";
import type { RouteSpec } from "./api-router.js";

const child = z.object({ label: z.string().default("Padrão") }).meta({ id: "DefaultChild" });
const shared = z.object({ child }).meta({ id: "DefaultParent" });
const input: RouteSpec<z.ZodType, z.ZodType> = {
  method: "post", path: "/input", tag: "Teste", access: "public", summary: "Entrada",
  body: z.object({ value: shared }), responses: { 204: { description: "OK" } },
};
const output: RouteSpec<z.ZodType, z.ZodType> = {
  method: "get", path: "/output", tag: "Teste", access: "public", summary: "Saída",
  responses: { 200: { description: "OK", schema: z.object({ value: shared }) } },
};

type Schema = { $ref?: string; properties?: Record<string, Schema>; required?: string[] };

for (const routes of [[input, output], [output, input]]) {
  test(`OpenAPI preserves input and output defaults when ${routes[0].path} comes first`, () => {
    const document = buildOpenApiDocument(routes, { title: "Teste", version: "1" });
    const resolve = (schema: Schema): Schema => schema.$ref
      ? document.components.schemas[schema.$ref.split("/").at(-1)!] as Schema
      : schema;
    const inputOperation = document.paths["/input"].post as { requestBody: { content: { "application/json": { schema: Schema } } } };
    const outputOperation = document.paths["/output"].get as { responses: { 200: { content: { "application/json": { schema: Schema } } } } };
    const inputParent = resolve(inputOperation.requestBody.content["application/json"].schema.properties!.value);
    const outputParent = resolve(outputOperation.responses[200].content["application/json"].schema.properties!.value);

    assert.equal(resolve(inputParent.properties!.child).required?.includes("label") ?? false, false);
    assert.equal(resolve(outputParent.properties!.child).required?.includes("label"), true);
  });
}
