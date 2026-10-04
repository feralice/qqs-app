import cors from "cors";
import express, { type Express } from "express";

import { healthRouter } from "./shared/http/health-route.js";
import { DrizzleVisitRepository } from "./modules/visits/infrastructure/drizzle-visit-repository.js";
import { visitRoutes } from "./modules/visits/presentation/visit-routes.js";
import { DrizzleUserRepository } from "./modules/auth/infrastructure/drizzle-user-repository.js";
import { DrizzleRefreshTokenRepository } from "./modules/auth/infrastructure/drizzle-refresh-token-repository.js";
import { BcryptPasswordHasher } from "./modules/auth/infrastructure/bcrypt-password-hasher.js";
import { JwtTokenService } from "./modules/auth/infrastructure/jwt-token-service.js";
import { LoginRateLimiter } from "./modules/auth/infrastructure/login-rate-limiter.js";
import { authRoutes } from "./modules/auth/presentation/auth-routes.js";
import { authenticate, authorize } from "./modules/auth/presentation/authenticate.js";
import { adminRoutes } from "./modules/admin/presentation/admin-routes.js";
import type { Database } from "./shared/db/database.js";
import { DrizzleClientRepository } from "./modules/clients/infrastructure/drizzle-client-repository.js";
import { clientRoutes } from "./modules/clients/presentation/client-routes.js";

export type AppDependencies = {
  db: Database;
  jwtSecret?: string;
};

export function createApp({ db, jwtSecret }: AppDependencies): Express {
  const app = express();

  const userRepository = new DrizzleUserRepository(db);
  const tokens = new JwtTokenService(jwtSecret ?? process.env.JWT_SECRET ?? "dev-only-secret-troque-em-producao");
  const authDeps = {
    users: userRepository,
    hasher: new BcryptPasswordHasher(),
    tokens,
    refreshTokens: new DrizzleRefreshTokenRepository(db),
    rateLimiter: new LoginRateLimiter(),
  };

  app.use((req, res, next) => {
    res.setHeader("Access-Control-Allow-Private-Network", "true");
    console.log(`[Backend HTTP] ${req.method} ${req.url}`);
    next();
  });
  app.use(cors({ origin: true, credentials: true }));
  app.use(express.json());
  app.use(healthRouter());
  app.use(authRoutes(authDeps));

  // Tudo registrado a partir daqui exige login.
  app.use(authenticate(tokens));
  const clientRepository = new DrizzleClientRepository(db);
  app.use(clientRoutes(clientRepository, { requireSupervisor: authorize("supervisor") }));
  const visitRepository = new DrizzleVisitRepository(db);
  app.use(visitRoutes(visitRepository, { userRepository, clientRepository }));
  app.use(
    "/admin",
    adminRoutes(visitRepository, {
      requireSupervisor: authorize("supervisor"),
      listEmployees: async () => (await userRepository.list()).filter((user) => user.active),
    }),
  );

  return app;
}
