import type { NextFunction, Response } from "express";
import type { UserRole } from "@qqs/contracts";

import { ForbiddenError, UnauthorizedError } from "../../domain/common/errors.js";
import type { AuthenticatedRequest } from "./api-router.js";
import type { TokenService } from "../../application/auth/ports.js";

// Confere o header "Authorization: Bearer <token>" e anexa o usuário logado em req.auth.
export function authenticate(tokens: TokenService) {
  return (request: AuthenticatedRequest, _response: Response, next: NextFunction): void => {
    const header = request.headers.authorization;
    const token = header?.startsWith("Bearer ") ? header.slice("Bearer ".length) : undefined;
    if (!token) {
      next(new UnauthorizedError("missing access token"));
      return;
    }

    const payload = tokens.verifyAccessToken(token);
    if (!payload) {
      next(new UnauthorizedError("invalid or expired access token"));
      return;
    }

    request.auth = payload;
    next();
  };
}

// Só libera a rota pros perfis listados. Usar depois de authenticate().
export function authorize(...roles: UserRole[]) {
  return (request: AuthenticatedRequest, _response: Response, next: NextFunction): void => {
    next(request.auth && roles.includes(request.auth.role) ? undefined : new ForbiddenError("forbidden"));
  };
}
