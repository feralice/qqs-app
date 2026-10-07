import { z } from "zod";

import type { RouteSpec } from "./api-router.js";

type JsonSchema = Record<string, unknown>;
type Io = "input" | "output";

export type OpenApiInfo = { title: string; version: string; description?: string };

const LOCAL_REF = /"#\/\$defs\/([^"]+)"/g;

// Schemas com `.meta({ id })` viram components reutilizáveis; o resto fica inline.
class ComponentRegistry {
  readonly schemas: Record<string, JsonSchema> = {};
  private readonly rawByName = new Map<string, string>();

  convert(schema: z.ZodType, io: Io): JsonSchema {
    const { $schema: _, $defs = {}, ...root } = z.toJSONSchema(schema, { io, unrepresentable: "any" }) as JsonSchema & {
      $defs?: Record<string, JsonSchema>;
    };
    const names = new Map(Object.entries($defs).map(([id, definition]) => [id, this.nameFor(id, definition, io)]));
    const rewrite = (value: JsonSchema): JsonSchema =>
      JSON.parse(
        JSON.stringify(value).replace(LOCAL_REF, (_, id: string) => JSON.stringify(`#/components/schemas/${names.get(id) ?? id}`)),
      ) as JsonSchema;

    for (const [id, definition] of Object.entries($defs)) {
      this.schemas[names.get(id)!] ??= rewrite(definition);
    }
    return rewrite(root);
  }

  // Entrada e saída do mesmo schema podem diferir (ex.: campo com default é
  // opcional na entrada e obrigatório na saída).
  private nameFor(id: string, definition: JsonSchema, io: Io): string {
    const raw = JSON.stringify(definition);
    const name = io === "input" ? `${id}Input` : id;
    const existing = this.rawByName.get(name);
    if (existing !== undefined && existing !== raw) {
      throw new Error(`conflicting OpenAPI component: ${name}`);
    }
    this.rawByName.set(name, raw);
    return name;
  }
}

const toOpenApiPath = (path: string) => path.replace(/:(\w+)/g, "{$1}");
const pathParams = (path: string) => [...path.matchAll(/:(\w+)/g)].map((match) => match[1]);

function operationId(spec: RouteSpec<z.ZodType, z.ZodType>): string {
  const words = spec.path
    .split(/[/.]/)
    .filter(Boolean)
    .map((part) => (part.startsWith(":") ? `by-${part.slice(1)}` : part));
  return [spec.method, ...words].join("-").replace(/-(\w)/g, (_, letter: string) => letter.toUpperCase());
}

function queryParameters(schema: z.ZodType, registry: ComponentRegistry) {
  const json = registry.convert(schema, "input") as { properties?: Record<string, JsonSchema>; required?: string[] };
  return Object.entries(json.properties ?? {}).map(([name, property]) => {
    const { description, ...propertySchema } = property;
    return {
      name,
      in: "query",
      required: json.required?.includes(name) ?? false,
      ...(description ? { description } : {}),
      schema: propertySchema,
    };
  });
}

export function buildOpenApiDocument(routes: Array<RouteSpec<z.ZodType, z.ZodType>>, info: OpenApiInfo) {
  const registry = new ComponentRegistry();
  const paths: Record<string, Record<string, unknown>> = {};

  for (const spec of routes) {
    const responses: Record<string, unknown> = {};
    for (const [status, response] of Object.entries(spec.responses)) {
      responses[status] = {
        description: response.description,
        ...(response.schema
          ? { content: { [response.contentType ?? "application/json"]: { schema: registry.convert(response.schema, "output") } } }
          : response.contentType
            ? { content: { [response.contentType]: { schema: { type: "string" } } } }
            : {}),
      };
    }
    if (spec.access !== "public") {
      responses["401"] ??= { description: "Token ausente, inválido ou expirado.", content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } } };
    }
    if (spec.access === "supervisor") {
      responses["403"] ??= { description: "Apenas supervisor.", content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } } };
    }

    const parameters = [
      ...pathParams(spec.path).map((name) => ({ name, in: "path", required: true, schema: { type: "string" } })),
      ...(spec.query ? queryParameters(spec.query, registry) : []),
    ];

    const path = toOpenApiPath(spec.path);
    paths[path] ??= {};
    paths[path][spec.method] = {
      operationId: operationId(spec),
      tags: [spec.tag],
      summary: spec.summary,
      ...(spec.description ? { description: spec.description } : {}),
      ...(spec.access === "public" ? { security: [] } : {}),
      ...(spec.access === "supervisor" ? { "x-required-role": "supervisor" } : {}),
      ...(parameters.length ? { parameters } : {}),
      ...(spec.body
        ? { requestBody: { required: true, content: { "application/json": { schema: registry.convert(spec.body, "input") } } } }
        : {}),
      responses,
    };
  }

  registry.schemas.Error ??= { type: "object", properties: { error: { type: "string" } }, required: ["error"] };

  return {
    openapi: "3.1.0",
    info,
    servers: [{ url: "/" }],
    security: [{ bearerAuth: [] }],
    tags: [...new Set(routes.map((route) => route.tag))].map((name) => ({ name })),
    paths,
    components: {
      securitySchemes: { bearerAuth: { type: "http", scheme: "bearer", bearerFormat: "JWT" } },
      schemas: registry.schemas,
    },
  };
}
