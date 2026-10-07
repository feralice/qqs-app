import { pino, type Logger } from "pino";

export type { Logger };

export function createLogger(level: string = process.env.LOG_LEVEL ?? "info"): Logger {
  return pino({
    level,
    // Nunca registrar credenciais, mesmo em nível debug.
    redact: ["*.authorization", "*.password", "*.refreshToken", "*.accessToken"],
  });
}
