import { Router, type RequestHandler } from "express";

import { createAdminActions, type AdminVisitRepository } from "../application/admin-actions.js";
import type { AdminDashboardSummary } from "@qqs/contracts";
import { getAdminDashboard } from "../application/get-admin-dashboard.js";
import { searchVisitHistory } from "../application/search-visit-history.js";

export function adminRoutes(
  repository: AdminVisitRepository,
  options: { requireSupervisor: RequestHandler; listEmployees?: () => Promise<Array<{ id: string; name: string; email: string; role: "employee" | "supervisor" }>> },
): Router {
  const router = Router();
  const actions = createAdminActions(repository);

  router.get("/dashboard", options.requireSupervisor, async (request, response) => {
    const date = typeof request.query.date === "string" ? request.query.date : new Date().toISOString().slice(0, 10);
    const summary: AdminDashboardSummary = await getAdminDashboard(
      repository,
      { date },
      options.listEmployees ? { list: options.listEmployees } : undefined,
    );
    response.json(summary);
  });

  router.get("/history", options.requireSupervisor, async (request, response) => {
    const from = typeof request.query.from === "string" ? request.query.from : new Date().toISOString().slice(0, 10);
    const to = typeof request.query.to === "string" ? request.query.to : from;
    const result = await searchVisitHistory(repository, {
      from,
      to,
      employeeId: typeof request.query.employeeId === "string" ? request.query.employeeId : undefined,
      clientId: typeof request.query.clientId === "string" ? request.query.clientId : undefined,
      status: typeof request.query.status === "string" ? request.query.status as "assigned" | "in_progress" | "completed" : undefined,
    });
    response.json(result);
  });

  router.post("/visits/:id/reschedule", options.requireSupervisor, async (request, response) => {
    try {
      const visit = await actions.rescheduleVisit({
        visitId: request.params.id,
        scheduledFor: request.body.scheduledFor,
        operationId: request.body.operationId,
      });
      response.json(visit);
    } catch (error) {
      if (error instanceof Error && error.message === "visit not found") {
        response.status(404).json({ error: error.message });
        return;
      }
      response.status(400).json({ error: "invalid admin action" });
    }
  });

  router.post("/visits/:id/reassign", options.requireSupervisor, async (request, response) => {
    try {
      const visit = await actions.reassignVisit({
        visitId: request.params.id,
        employeeId: request.body.employeeId,
        operationId: request.body.operationId,
      });
      response.json(visit);
    } catch (error) {
      if (error instanceof Error && error.message === "visit not found") {
        response.status(404).json({ error: error.message });
        return;
      }
      response.status(400).json({ error: "invalid admin action" });
    }
  });

  router.post("/alerts/:id/resolve", options.requireSupervisor, async (request, response) => {
    const result = await actions.resolveAlert({
      alertId: request.params.id,
      operationId: request.body.operationId,
    });
    response.json(result);
  });

  return router;
}
