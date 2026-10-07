import type { ErrorRequestHandler, RequestHandler } from "express";
import type { Logger } from "pino";

import { AppError, NotFoundError, type ErrorKind } from "../../domain/common/errors.js";

const statusByKind: Record<ErrorKind, number> = {
  validation: 400,
  unauthorized: 401,
  forbidden: 403,
  not_found: 404,
  conflict: 409,
  unprocessable: 422,
  rate_limited: 429,
};

export type ErrorBody = { error: string; details?: unknown };

export const notFoundHandler: RequestHandler = (request, _response, next) => {
  next(new NotFoundError(`route not found: ${request.method} ${request.path}`));
};

export function errorHandler(logger: Logger): ErrorRequestHandler {
  return (error, _request, response, _next) => {
    if (error instanceof AppError) {
      const body: ErrorBody = { error: error.message };
      if (error.details !== undefined) body.details = error.details;
      response.status(statusByKind[error.kind]).json(body);
      return;
    }
    // JSON malformado chega do express.json() com status 400.
    if (error instanceof SyntaxError && "status" in error && error.status === 400) {
      response.status(400).json({ error: "malformed json body" } satisfies ErrorBody);
      return;
    }
    logger.error({ err: error }, "unhandled error");
    response.status(500).json({ error: "internal server error" } satisfies ErrorBody);
  };
}
