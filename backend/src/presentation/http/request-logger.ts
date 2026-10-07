import type { RequestHandler } from "express";
import type { Logger } from "pino";

export function requestLogger(logger: Logger): RequestHandler {
  return (request, response, next) => {
    const startedAt = performance.now();
    response.on("finish", () => {
      logger.info(
        {
          method: request.method,
          path: request.path,
          status: response.statusCode,
          durationMs: Math.round(performance.now() - startedAt),
        },
        "request completed",
      );
    });
    next();
  };
}
