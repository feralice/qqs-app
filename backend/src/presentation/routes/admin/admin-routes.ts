import type { EmployeeSummary } from "@qqs/contracts";

import type { ApiRouter } from "../../http/api-router.js";
import { errorResponses } from "../../http/schemas.js";
import type { Clock } from "../../../application/common/clock.js";
import type { TabularExporter } from "../../../application/common/tabular-exporter.js";
import type { IdempotencyStore } from "../../../application/common/idempotency.js";
import type { VisitRepository } from "../../../application/visits/ports.js";
import { toVisitDetails } from "../visits/visit-presenter.js";
import { VisitDetailsSchema } from "../visits/visit-schemas.js";
import { createAdminActions } from "../../../application/admin/commands/admin-actions.js";
import { exportVisitHistory } from "../../../application/admin/queries/export-visit-history.js";
import { getAdminDashboard } from "../../../application/admin/queries/get-admin-dashboard.js";
import { searchVisitHistory, type VisitHistoryFilters } from "../../../application/admin/queries/search-visit-history.js";
import {
  DashboardQuery,
  DashboardSchema,
  HistoryQuery,
  HistorySchema,
  ReassignBody,
  RescheduleBody,
  ResolveAlertBody,
  ResolvedAlertSchema,
} from "./admin-schemas.js";

const tag = "Administração";

export type AdminRouteDeps = {
  visits: VisitRepository;
  employees: { list(): Promise<EmployeeSummary[]> };
  idempotency: IdempotencyStore;
  exporter: TabularExporter;
  clock: Clock;
};

export function registerAdminRoutes(api: ApiRouter, deps: AdminRouteDeps): void {
  const actions = createAdminActions(deps.visits, deps.idempotency);

  function historyFilters(query: Partial<VisitHistoryFilters>): VisitHistoryFilters {
    const from = query.from ?? deps.clock.now().toISOString().slice(0, 10);
    return { ...query, from, to: query.to ?? from };
  }

  api.route(
    {
      method: "get",
      path: "/admin/dashboard",
      tag,
      access: "supervisor",
      summary: "Visão geral do dia: contadores, alertas e técnicos (RF-034).",
      query: DashboardQuery,
      responses: { 200: { description: "Resumo do dia.", schema: DashboardSchema }, 403: errorResponses.forbidden },
    },
    async ({ query }, response) => {
      const now = deps.clock.now().toISOString();
      const date = query.date ?? now.slice(0, 10);
      response.json(await getAdminDashboard(deps.visits, { date, now }, deps.employees));
    },
  );

  api.route(
    {
      method: "get",
      path: "/admin/history",
      tag,
      access: "supervisor",
      summary: "Histórico de visitas filtrado por período, técnico, empresa e status (RF-037).",
      query: HistoryQuery,
      responses: { 200: { description: "Visitas do período.", schema: HistorySchema }, 403: errorResponses.forbidden },
    },
    async ({ query }, response) => {
      const { items, total } = await searchVisitHistory(deps.visits, historyFilters(query));
      response.json({ items: items.map(toVisitDetails), total });
    },
  );

  api.route(
    {
      method: "get",
      path: "/admin/history.csv",
      tag,
      access: "supervisor",
      summary: "Exporta o histórico filtrado em CSV (RF-037).",
      description: "Separador `;` e BOM UTF-8, para abrir direto no Excel em pt-BR.",
      query: HistoryQuery,
      responses: {
        200: { description: "Planilha CSV.", contentType: "text/csv" },
        403: errorResponses.forbidden,
      },
    },
    async ({ query }, response) => {
      const filters = historyFilters(query);
      const file = await exportVisitHistory(deps, filters);
      response
        .type(deps.exporter.contentType)
        .attachment(`visitas_${filters.from}_${filters.to}.${deps.exporter.extension}`)
        .send(file);
    },
  );

  api.route(
    {
      method: "post",
      path: "/admin/visits/:id/reschedule",
      tag,
      access: "supervisor",
      summary: "Reagenda uma visita (idempotente por operationId).",
      body: RescheduleBody,
      responses: {
        200: { description: "Visita reagendada.", schema: VisitDetailsSchema },
        400: errorResponses.validation,
        404: errorResponses.notFound,
      },
    },
    async ({ params, body }, response) => {
      response.json(toVisitDetails(await actions.rescheduleVisit({ visitId: params.id, ...body })));
    },
  );

  api.route(
    {
      method: "post",
      path: "/admin/visits/:id/reassign",
      tag,
      access: "supervisor",
      summary: "Troca o técnico responsável (idempotente por operationId).",
      body: ReassignBody,
      responses: {
        200: { description: "Visita reatribuída.", schema: VisitDetailsSchema },
        400: errorResponses.validation,
        404: errorResponses.notFound,
      },
    },
    async ({ params, body }, response) => {
      response.json(toVisitDetails(await actions.reassignVisit({ visitId: params.id, ...body })));
    },
  );

  api.route(
    {
      method: "post",
      path: "/admin/alerts/:id/resolve",
      tag,
      access: "supervisor",
      summary: "Marca um alerta como resolvido (idempotente por operationId).",
      body: ResolveAlertBody,
      responses: { 200: { description: "Alerta resolvido.", schema: ResolvedAlertSchema }, 400: errorResponses.validation },
    },
    async ({ params, body }, response) => {
      response.json(await actions.resolveAlert({ alertId: params.id, ...body }));
    },
  );
}
