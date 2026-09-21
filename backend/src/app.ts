import express, { type Express } from "express";

import { healthRouter } from "./shared/http/health-route.js";

export function createApp(): Express {
  const app = express();

  app.use(express.json());
  app.use(healthRouter());

  return app;
}
