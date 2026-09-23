import cors from "cors";
import express, { type Express } from "express";

import { healthRouter } from "./shared/http/health-route.js";
import { InMemoryVisitRepository } from "./modules/visits/infrastructure/in-memory-visit-repository.js";
import { visitRoutes } from "./modules/visits/presentation/visit-routes.js";
import { InMemoryUserRepository } from "./modules/auth/infrastructure/in-memory-user-repository.js";
import { InMemoryRefreshTokenRepository } from "./modules/auth/infrastructure/in-memory-refresh-token-repository.js";
import { BcryptPasswordHasher } from "./modules/auth/infrastructure/bcrypt-password-hasher.js";
import { JwtTokenService } from "./modules/auth/infrastructure/jwt-token-service.js";
import { LoginRateLimiter } from "./modules/auth/infrastructure/login-rate-limiter.js";
import { authRoutes } from "./modules/auth/presentation/auth-routes.js";
import { authenticate, authorize } from "./modules/auth/presentation/authenticate.js";

export function createApp(): Express {
  const app = express();

  const userRepository = new InMemoryUserRepository();
  const tokens = new JwtTokenService(process.env.JWT_SECRET ?? "dev-only-secret-troque-em-producao");
  const authDeps = {
    users: userRepository,
    hasher: new BcryptPasswordHasher(),
    tokens,
    refreshTokens: new InMemoryRefreshTokenRepository(),
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
  app.use(
    visitRoutes(new InMemoryVisitRepository(), {
      requireSupervisor: authorize("supervisor"),
      userRepository,
    }),
  );

  return app;
}
