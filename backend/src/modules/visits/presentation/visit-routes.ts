import { Router, type RequestHandler } from "express";
import type { ArrivalLocation, VisitDetails, VisitSummary } from "@qqs/contracts";

import { startVisit } from "../application/start-visit.js";
import type { InMemoryVisitRepository } from "../infrastructure/in-memory-visit-repository.js";

function toDetails(visit: Awaited<ReturnType<InMemoryVisitRepository["findById"]>>): VisitDetails | undefined {
  if (!visit) return undefined;

  const systems = visit.systems ?? [];
  return {
    id: visit.id,
    clientId: visit.clientId,
    clientName: visit.clientName ?? visit.clientId,
    scheduledFor: visit.scheduledFor ?? new Date(0).toISOString(),
    status: visit.status,
    systemsCount: systems.length,
    clientAddress: visit.clientAddress,
    systems,
    arrival: visit.arrivedAt
      ? { arrivedAt: visit.arrivedAt, location: visit.arrivalLocation }
      : undefined,
    syncStatus: visit.status === "in_progress" ? "synced" : "pending",
  };
}

export function visitRoutes(
  repository: InMemoryVisitRepository,
  options: { requireSupervisor: RequestHandler },
): Router {
  const router = Router();

  router.get("/visits", async (_request, response) => {
    const visits = await repository.list();
    const items: VisitSummary[] = visits.map((visit) => ({
      id: visit.id,
      clientId: visit.clientId,
      clientName: visit.clientName ?? visit.clientId,
      scheduledFor: visit.scheduledFor ?? new Date(0).toISOString(),
      status: visit.status,
      systemsCount: visit.systems?.length ?? 0,
    }));
    response.json({ items });
  });

  router.get("/visits/:id", async (request, response) => {
    const visit = await repository.findById(request.params.id);
    const details = toDetails(visit);
    if (!details) {
      response.status(404).json({ error: "visit not found" });
      return;
    }
    response.json(details);
  });

  router.post("/visits", options.requireSupervisor, async (request, response) => {
    const visit = await repository.save({
      id: request.body.id,
      clientId: request.body.clientId,
      employeeId: request.body.employeeId ?? "employee-001",
      clientName: request.body.clientName,
      clientAddress: request.body.clientAddress,
      scheduledFor: request.body.scheduledFor,
      systems: request.body.systems ?? [],
      status: "assigned",
    });
    response.status(201).json(toDetails(visit));
  });

  router.post("/visits/:id/start", async (request, response) => {
    try {
      const current = await repository.findById(request.params.id);
      if (!current) {
        response.status(404).json({ error: "visit not found" });
        return;
      }

      const location = request.body.location as ArrivalLocation | undefined;
      const visit = await startVisit(repository, {
        visitId: current.id,
        clientId: current.clientId,
        employeeId: current.employeeId,
        operationId: request.body.operationId,
        arrivedAt: request.body.arrivedAt,
        location,
      });
      response.json(toDetails({ ...current, ...visit }));
    } catch (error) {
      if (error instanceof Error && error.message === "invalid arrival data") {
        response.status(400).json({ error: error.message });
        return;
      }
      if (error instanceof Error && error.message === "visit already exists") {
        response.status(409).json({ error: error.message });
        return;
      }
      response.status(500).json({ error: "internal server error" });
    }
  });

  return router;
}
