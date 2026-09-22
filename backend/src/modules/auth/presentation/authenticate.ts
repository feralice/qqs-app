import type { NextFunction, Request, Response } from "express";
import type { UserRole } from "@qqs/contracts";

import type { AccessTokenPayload, TokenService } from "../application/ports.js";

export type AuthenticatedRequest = Request & { auth?: AccessTokenPayload };

// Confere o header "Authorization: Bearer <token>" e anexa o usuário logado em req.auth.
export function authenticate(tokens: TokenService) {
  return (request: AuthenticatedRequest, response: Response, next: NextFunction): void => {
    const header = request.headers.authorization;
    const token = header?.startsWith("Bearer ") ? header.slice("Bearer ".length) : undefined;
    if (!token) {
      response.status(401).json({ error: "missing access token" });
      return;
    }

    const payload = tokens.verifyAccessToken(token);
    if (!payload) {
      response.status(401).json({ error: "invalid or expired access token" });
      return;
    }

    request.auth = payload;
    next();
  };
}

// Só libera a rota pros perfis listados. Usar depois de authenticate().
export function authorize(...roles: UserRole[]) {
  return (request: AuthenticatedRequest, response: Response, next: NextFunction): void => {
    if (!request.auth || !roles.includes(request.auth.role)) {
      response.status(403).json({ error: "forbidden" });
      return;
    }
    next();
  };
}
