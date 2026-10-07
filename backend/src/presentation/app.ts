import cors from "cors";
import express, { type Express } from "express";
import swaggerUi from "swagger-ui-express";

import { registerAdminRoutes } from "./routes/admin/admin-routes.js";
import { BcryptPasswordHasher } from "../infrastructure/security/bcrypt-password-hasher.js";
import { DrizzleRefreshTokenRepository } from "../infrastructure/persistence/drizzle-refresh-token-repository.js";
import { DrizzleUserRepository } from "../infrastructure/persistence/drizzle-user-repository.js";
import { JwtTokenService } from "../infrastructure/security/jwt-token-service.js";
import { LoginRateLimiter } from "../infrastructure/security/login-rate-limiter.js";
import { registerAuthRoutes } from "./routes/auth/auth-routes.js";
import { authenticate, authorize } from "./http/authenticate.js";
import { DrizzleClientRepository } from "../infrastructure/persistence/drizzle-client-repository.js";
import { registerClientRoutes } from "./routes/clients/client-routes.js";
import { DrizzleVisitRepository } from "../infrastructure/persistence/drizzle-visit-repository.js";
import { registerVisitRoutes } from "./routes/visits/visit-routes.js";
import type { Database } from "../infrastructure/db/database.js";
import { ApiRouter } from "./http/api-router.js";
import { errorHandler, notFoundHandler } from "./http/error-handler.js";
import { registerHealthRoute } from "./routes/health/health-route.js";
import { requestLogger } from "./http/request-logger.js";
import { buildOpenApiDocument } from "./http/openapi.js";
import { listEmployees } from "../application/auth/queries/list-employees.js";
import { systemClock } from "../infrastructure/clock/system-clock.js";
import { CsvExporter } from "../infrastructure/csv/csv.js";
import { DrizzleIdempotencyStore } from "../infrastructure/idempotency/drizzle-idempotency-store.js";
import { createLogger, type Logger } from "../infrastructure/logging/logger.js";

export type AppDependencies = {
  db: Database;
  jwtSecret?: string;
  logger?: Logger;
};

// Composition root: único lugar que conhece as implementações concretas.
export function createApp({ db, jwtSecret, logger = createLogger() }: AppDependencies): Express {
  const users = new DrizzleUserRepository(db);
  const clients = new DrizzleClientRepository(db);
  const visits = new DrizzleVisitRepository(db);
  const tokens = new JwtTokenService(jwtSecret ?? process.env.JWT_SECRET ?? "dev-only-secret-troque-em-producao");

  const requireLogin = authenticate(tokens);
  const api = new ApiRouter({
    authenticated: [requireLogin],
    supervisor: [requireLogin, authorize("supervisor")],
  });

  registerHealthRoute(api);
  registerAuthRoutes(api, {
    users,
    hasher: new BcryptPasswordHasher(),
    tokens,
    refreshTokens: new DrizzleRefreshTokenRepository(db),
    rateLimiter: new LoginRateLimiter(),
  });
  registerClientRoutes(api, clients);
  registerVisitRoutes(api, { visits, users, clients, clock: systemClock });
  registerAdminRoutes(api, {
    visits,
    idempotency: new DrizzleIdempotencyStore(db),
    exporter: new CsvExporter(),
    employees: { list: () => listEmployees(users) },
    clock: systemClock,
  });

  const openApi = buildOpenApiDocument(api.routes, {
    title: "QQS App API",
    version: "0.1.0",
    description: "API do aplicativo de visitas técnicas: autenticação, empresas, visitas com check-in por raio e administração.",
  });

  const app = express();
  app.use(requestLogger(logger));
  app.use((_request, response, next) => {
    // Permite que o app web em localhost chame a API pela rede local (Chrome Private Network Access).
    response.setHeader("Access-Control-Allow-Private-Network", "true");
    next();
  });
  app.use(cors({ origin: true, credentials: true }));
  app.use(express.json());
  app.get("/openapi.json", (_request, response) => {
    response.json(openApi);
  });
  app.use("/docs", swaggerUi.serve, swaggerUi.setup(openApi, { customSiteTitle: "QQS App API" }));
  app.use(api.router);
  app.use(notFoundHandler);
  app.use(errorHandler(logger));

  return app;
}
