import { randomUUID } from "node:crypto";
import { Router, type Response } from "express";
import type { ArrivalLocation, EmployeeSummary, VisitDetails, VisitPhoto } from "@qqs/contracts";

import { startVisit, type VisitRepository } from "../application/start-visit.js";
import { finishVisit } from "../application/finish-visit.js";
import type { Visit } from "../domain/visit.js";
import type { UserRepository } from "../../auth/application/ports.js";
import type { AuthenticatedRequest } from "../../auth/presentation/authenticate.js";
import type { ClientRepository } from "../../clients/application/ports.js";

function toDetails(visit: Visit): VisitDetails {
  const systems = visit.systems ?? [];
  return {
    id: visit.id,
    clientId: visit.clientId,
    employeeId: visit.employeeId,
    clientName: visit.clientName ?? visit.clientId,
    scheduledFor: visit.scheduledFor ?? new Date(0).toISOString(),
    status: visit.status,
    systemsCount: systems.length,
    clientAddress: visit.clientAddress,
    clientLocation: visit.clientLocation,
    systems,
    arrival: visit.arrivedAt
      ? {
          arrivedAt: visit.arrivedAt,
          location: visit.arrivalLocation,
          distanceMeters: visit.arrivalDistanceMeters,
          outsideRadius: visit.outsideRadius,
          justification: visit.arrivalJustification,
        }
      : undefined,
    departure: visit.leftAt ? { leftAt: visit.leftAt, location: visit.departureLocation } : undefined,
    durationMinutes: visit.durationMinutes,
    description: visit.description,
    attendants: visit.attendants,
    photos: visit.photos,
    finishedAt: visit.finishedAt,
    syncStatus: "synced",
  };
}

const visitErrors: Record<string, number> = {
  "invalid arrival data": 400,
  "visit already exists": 409,
  "visit already finished": 409,
  "visit not in progress": 409,
  "justification required": 422,
};

function sendError(response: Response, error: unknown): void {
  const status = error instanceof Error ? visitErrors[error.message] : undefined;
  if (status) {
    response.status(status).json({ error: (error as Error).message });
    return;
  }
  response.status(500).json({ error: "internal server error" });
}

export function visitRoutes(
  repository: VisitRepository,
  options: { userRepository: UserRepository; clientRepository: ClientRepository },
): Router {
  const router = Router();

  // Técnico só enxerga as próprias visitas; supervisor enxerga todas.
  async function findVisible(request: AuthenticatedRequest, id: string): Promise<Visit | undefined> {
    const visit = await repository.findById(id);
    if (!visit) return undefined;
    if (request.auth?.role !== "supervisor" && visit.employeeId !== request.auth?.sub) return undefined;
    return visit;
  }

  router.get("/employees", async (_request, response) => {
    const users = await options.userRepository.list();
    const items: EmployeeSummary[] = users
      .filter((user) => user.active)
      .map((user) => ({ id: user.id, name: user.name, email: user.email, role: user.role }));
    response.json({ items });
  });

  router.get("/visits", async (request: AuthenticatedRequest, response) => {
    const isSupervisor = request.auth?.role === "supervisor";
    const visits = await repository.list(isSupervisor ? undefined : { employeeId: request.auth?.sub });
    response.json({ items: visits.map(toDetails) });
  });

  router.get("/visits/:id", async (request: AuthenticatedRequest, response) => {
    const visit = await findVisible(request, String(request.params.id));
    if (!visit) {
      response.status(404).json({ error: "visit not found" });
      return;
    }
    response.json(toDetails(visit));
  });

  // O id pode vir do aparelho (criação offline); reenviar o mesmo id devolve a visita já criada.
  router.post("/visits", async (request: AuthenticatedRequest, response) => {
    try {
      const body = request.body ?? {};
      const id = typeof body.id === "string" && body.id ? body.id : randomUUID();
      if (await repository.findById(id)) {
        const visible = await findVisible(request, id);
        if (!visible) {
          response.status(404).json({ error: "visit not found" });
          return;
        }
        response.status(200).json(toDetails(visible));
        return;
      }

      const client = typeof body.clientId === "string" ? await options.clientRepository.findById(body.clientId) : undefined;
      if (!client?.active) {
        response.status(404).json({ error: "client not found" });
        return;
      }

      const isSupervisor = request.auth?.role === "supervisor";
      const employeeId = isSupervisor ? body.employeeId : request.auth?.sub;
      const employee = typeof employeeId === "string" ? await options.userRepository.findById(employeeId) : undefined;
      if (!employee?.active) {
        response.status(400).json({ error: "employee not found" });
        return;
      }

      const scheduledFor = typeof body.scheduledFor === "string" && !Number.isNaN(Date.parse(body.scheduledFor))
        ? new Date(body.scheduledFor).toISOString()
        : new Date().toISOString();

      const visit = await repository.save({ id, clientId: client.id, employeeId: employee.id, scheduledFor, status: "assigned" });
      response.status(201).json(toDetails(visit));
    } catch (error) {
      sendError(response, error);
    }
  });

  router.post("/visits/:id/start", async (request: AuthenticatedRequest, response) => {
    try {
      const current = await findVisible(request, String(request.params.id));
      if (!current?.clientLocation) {
        response.status(404).json({ error: "visit not found" });
        return;
      }

      const visit = await startVisit(repository, {
        visitId: current.id,
        clientId: current.clientId,
        employeeId: current.employeeId,
        operationId: request.body.operationId,
        arrivedAt: request.body.arrivedAt,
        location: request.body.location as ArrivalLocation | undefined,
        clientLocation: current.clientLocation,
        justification: typeof request.body.justification === "string" ? request.body.justification : undefined,
      });
      response.json(toDetails({ ...current, ...visit }));
    } catch (error) {
      sendError(response, error);
    }
  });

  router.post("/visits/:id/finish", async (request: AuthenticatedRequest, response) => {
    try {
      const current = await findVisible(request, String(request.params.id));
      if (!current) {
        response.status(404).json({ error: "visit not found" });
        return;
      }

      const visit = await finishVisit(repository, {
        visitId: current.id,
        clientId: current.clientId,
        employeeId: current.employeeId,
        operationId: request.body.operationId ?? `op-finish-${Date.now()}`,
        finishedAt: request.body.finishedAt ?? new Date().toISOString(),
        location: request.body.location as ArrivalLocation | undefined,
        description: request.body.description as string | undefined,
        attendants: request.body.attendants as EmployeeSummary[] | undefined,
        photos: request.body.photos as VisitPhoto[] | undefined,
      });
      response.json(toDetails({ ...current, ...visit }));
    } catch (error) {
      sendError(response, error);
    }
  });

  return router;
}
