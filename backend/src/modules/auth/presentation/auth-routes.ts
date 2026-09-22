import { Router } from "express";
import type {
  LoginRequest,
  LoginResponse,
  RefreshRequest,
  RefreshResponse,
  RegisterRequest,
  RegisterResponse,
} from "@qqs/contracts";

import { EmailAlreadyRegisteredError, InvalidCredentialsError, InvalidRefreshTokenError, InvalidRegistrationError } from "../domain/user.js";
import { login } from "../application/login.js";
import { refresh } from "../application/refresh.js";
import { logout } from "../application/logout.js";
import { register } from "../application/register.js";
import type { PasswordHasher, RefreshTokenRepository, TokenService, UserRepository } from "../application/ports.js";
import type { LoginRateLimiter } from "../infrastructure/login-rate-limiter.js";

export function authRoutes(deps: {
  users: UserRepository;
  hasher: PasswordHasher;
  tokens: TokenService;
  refreshTokens: RefreshTokenRepository;
  rateLimiter: LoginRateLimiter;
}): Router {
  const router = Router();

  router.post("/auth/login", async (request, response) => {
    const body = request.body as LoginRequest;
    const email = body.email?.trim().toLowerCase();

    if (!email || !body.password) {
      response.status(400).json({ error: "email and password are required" });
      return;
    }

    if (deps.rateLimiter.isLocked(email)) {
      response.status(429).json({ error: "too many login attempts, try again later" });
      return;
    }

    try {
      const result = await login(deps, { email, password: body.password });
      deps.rateLimiter.registerSuccess(email);
      const payload: LoginResponse = result;
      response.json(payload);
    } catch (error) {
      if (error instanceof InvalidCredentialsError) {
        deps.rateLimiter.registerFailure(email);
        response.status(401).json({ error: "invalid credentials" });
        return;
      }
      response.status(500).json({ error: "internal server error" });
    }
  });

  router.post("/auth/register", async (request, response) => {
    const body = request.body as RegisterRequest;

    try {
      const result = await register(deps, {
        name: body.name,
        email: body.email,
        password: body.password,
      });
      const payload: RegisterResponse = result;
      response.status(201).json(payload);
    } catch (error) {
      if (error instanceof InvalidRegistrationError) {
        response.status(400).json({ error: error.message });
        return;
      }
      if (error instanceof EmailAlreadyRegisteredError) {
        response.status(409).json({ error: "email already registered" });
        return;
      }
      response.status(500).json({ error: "internal server error" });
    }
  });

  router.post("/auth/refresh", async (request, response) => {
    const body = request.body as RefreshRequest;
    if (!body.refreshToken) {
      response.status(400).json({ error: "refreshToken is required" });
      return;
    }

    try {
      const result = await refresh(deps, { refreshToken: body.refreshToken });
      const payload: RefreshResponse = result;
      response.json(payload);
    } catch (error) {
      if (error instanceof InvalidRefreshTokenError) {
        response.status(401).json({ error: "invalid refresh token" });
        return;
      }
      response.status(500).json({ error: "internal server error" });
    }
  });

  router.post("/auth/logout", async (request, response) => {
    const body = request.body as RefreshRequest;
    if (body.refreshToken) {
      await logout(deps, { refreshToken: body.refreshToken });
    }
    response.status(204).send();
  });

  return router;
}
