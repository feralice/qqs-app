import { test } from "node:test";
import assert from "node:assert/strict";
import { Validator } from "@seriousme/openapi-schema-validator";

import { call, createTestApp } from "../../test-support/http.js";

type Operation = { security?: unknown[]; responses: Record<string, unknown>; "x-required-role"?: string };
type Document = { paths: Record<string, Record<string, Operation>>; components: { schemas: Record<string, unknown> } };

async function openApi(): Promise<Document> {
  const response = await call(await createTestApp(), { method: "GET", url: "/openapi.json" });
  assert.equal(response.statusCode, 200);
  return response._getJSONData() as Document;
}

test("the generated document is valid OpenAPI 3.1", async () => {
  const result = await new Validator().validate(await openApi());

  assert.deepEqual(result.errors, undefined);
  assert.equal(result.valid, true);
});

test("documents every route with its access rule", async () => {
  const { paths } = await openApi();

  assert.ok(paths["/visits/{id}/start"].post.responses["422"], "out-of-radius check-in is documented");
  assert.deepEqual(paths["/auth/login"].post.security, []);
  assert.equal(paths["/clients"].get.security, undefined, "protected routes inherit the bearer requirement");
  assert.equal(paths["/clients"].post["x-required-role"], "supervisor");
  assert.ok(paths["/admin/history.csv"].get.responses["200"]);
});

test("every $ref points to a declared component", async () => {
  const document = await openApi();
  const refs = [...JSON.stringify(document).matchAll(/"#\/components\/schemas\/([^"]+)"/g)].map((match) => match[1]);

  assert.ok(refs.length > 0);
  for (const name of refs) assert.ok(document.components.schemas[name], `missing component ${name}`);
});

test("serves the Swagger UI", async () => {
  const response = await call(await createTestApp(), { method: "GET", url: "/docs/" });

  assert.equal(response.statusCode, 200);
  assert.match(response._getData(), /swagger-ui/);
});
