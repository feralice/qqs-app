import { randomUUID } from "node:crypto";

import type { ApiRouter } from "../../http/api-router.js";
import { errorResponses } from "../../http/schemas.js";
import type { Clock } from "../../../application/common/clock.js";
import { listEmployees } from "../../../application/auth/queries/list-employees.js";
import type { UserRepository } from "../../../application/auth/ports.js";
import type { ClientRepository } from "../../../application/clients/ports.js";
import { createVisit } from "../../../application/visits/commands/create-visit.js";
import { finishVisit } from "../../../application/visits/commands/finish-visit.js";
import { startVisit } from "../../../application/visits/commands/start-visit.js";
import type { VisitRepository } from "../../../application/visits/ports.js";
import { getVisibleVisit, listVisibleVisits } from "../../../application/visits/queries/visit-queries.js";
import { VisitNotFoundError } from "../../../domain/visits/visit.js";
import { toVisitDetails } from "./visit-presenter.js";
import {
  CreateVisitBody,
  EmployeeListSchema,
  FinishVisitBody,
  StartVisitBody,
  VisitDetailsSchema,
  VisitListSchema,
} from "./visit-schemas.js";

const tag = "Visitas";
const visitResponse = { description: "Visita atualizada.", schema: VisitDetailsSchema };

export function registerVisitRoutes(
  api: ApiRouter,
  deps: { visits: VisitRepository; users: UserRepository; clients: ClientRepository; clock: Clock },
): void {
  api.route(
    {
      method: "get",
      path: "/employees",
      tag,
      access: "authenticated",
      summary: "Lista funcionários ativos (para acompanhantes e atribuição).",
      responses: { 200: { description: "Funcionários ativos.", schema: EmployeeListSchema } },
    },
    async (_input, response) => {
      response.json({ items: await listEmployees(deps.users) });
    },
  );

  api.route(
    {
      method: "get",
      path: "/visits",
      tag,
      access: "authenticated",
      summary: "Lista visitas: as do técnico logado, ou todas para supervisor.",
      responses: { 200: { description: "Visitas visíveis.", schema: VisitListSchema } },
    },
    async ({ auth }, response) => {
      const visits = await listVisibleVisits(deps.visits, auth);
      response.json({ items: visits.map(toVisitDetails) });
    },
  );

  api.route(
    {
      method: "get",
      path: "/visits/:id",
      tag,
      access: "authenticated",
      summary: "Detalhe de uma visita.",
      responses: { 200: { description: "Visita.", schema: VisitDetailsSchema }, 404: errorResponses.notFound },
    },
    async ({ params, auth }, response) => {
      response.json(toVisitDetails(await getVisibleVisit(deps.visits, params.id, auth)));
    },
  );

  api.route(
    {
      method: "post",
      path: "/visits",
      tag,
      access: "authenticated",
      summary: "Cria (agenda) uma visita.",
      description: "Idempotente pelo `id`: reenviar o mesmo id devolve 200 com a visita já criada.",
      body: CreateVisitBody,
      responses: {
        201: { description: "Visita criada.", schema: VisitDetailsSchema },
        200: { description: "Visita já existia com este id.", schema: VisitDetailsSchema },
        400: errorResponses.validation,
        404: errorResponses.notFound,
      },
    },
    async ({ body, auth }, response) => {
      const { visit, created } = await createVisit(
        { visits: deps.visits, clients: deps.clients, users: deps.users, clock: deps.clock },
        { actor: auth, ...body },
      );
      response.status(created ? 201 : 200).json(toVisitDetails(visit));
    },
  );

  api.route(
    {
      method: "post",
      path: "/visits/:id/start",
      tag,
      access: "authenticated",
      summary: "Check-in: registra chegada, distância e justificativa quando fora do raio.",
      body: StartVisitBody,
      responses: {
        200: visitResponse,
        400: errorResponses.validation,
        404: errorResponses.notFound,
        409: errorResponses.conflict,
        422: { description: "Fora do raio sem justificativa.", schema: errorResponses.validation.schema },
      },
    },
    async ({ params, body, auth }, response) => {
      const current = await getVisibleVisit(deps.visits, params.id, auth);
      if (!current.clientLocation) throw new VisitNotFoundError();

      const visit = await startVisit(deps.visits, {
        visitId: current.id,
        clientId: current.clientId,
        employeeId: current.employeeId,
        operationId: body.operationId,
        arrivedAt: body.arrivedAt,
        location: body.location,
        clientLocation: current.clientLocation,
        justification: body.justification,
      });
      response.json(toVisitDetails({ ...current, ...visit }));
    },
  );

  api.route(
    {
      method: "post",
      path: "/visits/:id/finish",
      tag,
      access: "authenticated",
      summary: "Check-out: registra saída, duração, descrição, acompanhantes e fotos.",
      body: FinishVisitBody,
      responses: {
        200: visitResponse,
        400: errorResponses.validation,
        404: errorResponses.notFound,
        409: errorResponses.conflict,
      },
    },
    async ({ params, body, auth }, response) => {
      const current = await getVisibleVisit(deps.visits, params.id, auth);
      const visit = await finishVisit(deps.visits, {
        visitId: current.id,
        clientId: current.clientId,
        employeeId: current.employeeId,
        operationId: body.operationId ?? randomUUID(),
        finishedAt: body.finishedAt ?? deps.clock.now().toISOString(),
        location: body.location,
        description: body.description,
        attendants: body.attendants,
        photos: body.photos,
      });
      response.json(toVisitDetails({ ...current, ...visit }));
    },
  );
}
