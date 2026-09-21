import express, { type Express } from "express";

import { healthRouter } from "./shared/http/health-route.js";
import { InMemoryVisitRepository } from "./modules/visits/infrastructure/in-memory-visit-repository.js";
import { visitRoutes } from "./modules/visits/presentation/visit-routes.js";

export function createApp(): Express {
  const app = express();

  app.use(express.json());
  app.use(healthRouter());
  app.use(visitRoutes(new InMemoryVisitRepository()));

  return app;
}
