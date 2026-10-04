import { Router, type RequestHandler, type Response } from "express";

import type { AuthenticatedRequest } from "../../auth/presentation/authenticate.js";
import { addClientSystem, createClient, updateClient } from "../application/client-use-cases.js";
import type { ClientRepository } from "../application/ports.js";
import {
  ClientNotFoundError,
  CnpjAlreadyRegisteredError,
  DuplicateSystemError,
  InvalidClientError,
} from "../domain/client.js";

function sendError(response: Response, error: unknown): void {
  if (error instanceof InvalidClientError) {
    response.status(400).json({ error: error.message });
  } else if (error instanceof ClientNotFoundError) {
    response.status(404).json({ error: error.message });
  } else if (error instanceof CnpjAlreadyRegisteredError || error instanceof DuplicateSystemError) {
    response.status(409).json({ error: error.message });
  } else {
    response.status(500).json({ error: "internal server error" });
  }
}

export function clientRoutes(repository: ClientRepository, options: { requireSupervisor: RequestHandler }): Router {
  const router = Router();

  router.get("/clients", async (request: AuthenticatedRequest, response) => {
    const isSupervisor = request.auth?.role === "supervisor";
    const items = await repository.list({
      q: typeof request.query.q === "string" ? request.query.q : undefined,
      includeInactive: isSupervisor && request.query.includeInactive === "true",
    });
    response.json({ items });
  });

  router.get("/clients/:id", async (request, response) => {
    const client = await repository.findById(String(request.params.id));
    if (!client) {
      sendError(response, new ClientNotFoundError());
      return;
    }
    response.json(client);
  });

  router.post("/clients", options.requireSupervisor, async (request, response) => {
    try {
      response.status(201).json(await createClient(repository, request.body ?? {}));
    } catch (error) {
      sendError(response, error);
    }
  });

  router.patch("/clients/:id", options.requireSupervisor, async (request, response) => {
    try {
      response.json(await updateClient(repository, String(request.params.id), request.body ?? {}));
    } catch (error) {
      sendError(response, error);
    }
  });

  router.post("/clients/:id/systems", options.requireSupervisor, async (request, response) => {
    try {
      response.status(201).json(await addClientSystem(repository, String(request.params.id), request.body ?? {}));
    } catch (error) {
      sendError(response, error);
    }
  });

  return router;
}
