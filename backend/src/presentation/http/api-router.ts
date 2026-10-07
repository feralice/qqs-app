import { Router, type Request, type RequestHandler, type Response } from "express";
import { z } from "zod";

import type { Actor } from "../../domain/common/actor.js";
import { ValidationError } from "../../domain/common/errors.js";

export type HttpMethod = "get" | "post" | "patch" | "put" | "delete";

// Obrigatório em toda rota: esquecer de proteger um endpoint vira erro de tipo.
export type Access = "public" | "authenticated" | "supervisor";

export type ResponseSpec = {
  description: string;
  schema?: z.ZodType;
  contentType?: string;
};

export type RouteSpec<Body extends z.ZodType, Query extends z.ZodType, A extends Access = Access> = {
  method: HttpMethod;
  path: string;
  summary: string;
  description?: string;
  tag: string;
  access: A;
  body?: Body;
  query?: Query;
  responses: Record<number, ResponseSpec>;
};

// Nas rotas protegidas os guards já garantiram o login, então `auth` não é opcional.
export type RouteInput<Body extends z.ZodType, Query extends z.ZodType, A extends Access> = {
  body: z.output<Body>;
  query: z.output<Query>;
  params: Record<string, string>;
  auth: A extends "public" ? undefined : Actor;
};

export type RouteHandler<Body extends z.ZodType, Query extends z.ZodType, A extends Access> = (
  input: RouteInput<Body, Query, A>,
  response: Response,
) => Promise<void> | void;

export type AccessGuards = Record<Exclude<Access, "public">, RequestHandler[]>;

export type AuthenticatedRequest = Request & { auth?: Actor };

function parse<T extends z.ZodType>(schema: T | undefined, value: unknown, part: string): z.output<T> {
  if (!schema) return (value ?? {}) as z.output<T>;
  const result = schema.safeParse(value ?? {});
  if (!result.success) {
    throw new ValidationError(`invalid request ${part}`, z.flattenError(result.error));
  }
  return result.data;
}

/**
 * Registra a rota no Express e guarda a especificação para gerar o OpenAPI.
 * A validação usa o mesmo schema da documentação, então as duas não divergem.
 */
export class ApiRouter {
  readonly router = Router();
  readonly routes: Array<RouteSpec<z.ZodType, z.ZodType>> = [];

  constructor(private readonly guards: AccessGuards) {}

  route<A extends Access, Body extends z.ZodType = z.ZodUnknown, Query extends z.ZodType = z.ZodUnknown>(
    spec: RouteSpec<Body, Query, A>,
    handler: RouteHandler<Body, Query, A>,
  ): void {
    this.routes.push(spec);
    const access: Access = spec.access;
    const guards = access === "public" ? [] : this.guards[access];
    const endpoint: RequestHandler = async (request: AuthenticatedRequest, response) => {
      const input = {
        body: parse(spec.body, request.body, "body"),
        query: parse(spec.query, request.query, "query"),
        params: request.params as Record<string, string>,
        auth: request.auth,
      } as RouteInput<Body, Query, A>;
      await handler(input, response);
    };
    this.router[spec.method](spec.path, ...guards, endpoint);
  }
}
