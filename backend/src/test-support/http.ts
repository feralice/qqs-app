import { createRequest, createResponse, type RequestOptions } from "node-mocks-http";
import type { Express } from "express";

import { createApp } from "../app.js";
import { createTestDatabase } from "../shared/db/test-database.js";
import { seedDevelopmentData } from "../shared/db/seed.js";

export type TestRole = "employee" | "supervisor";

const credentials: Record<TestRole, { email: string; password: string }> = {
  employee: { email: "tecnico@qqs.app", password: "Tecnico123!" },
  supervisor: { email: "admin1@qqs.app", password: "Admin123!" },
};

export async function createTestApp(): Promise<Express> {
  const db = await createTestDatabase();
  await seedDevelopmentData(db);
  return createApp({ db, jwtSecret: "test-secret" });
}

// bcrypt e o banco respondem em várias etapas assíncronas; espera o fim da
// resposta em vez de um único tick.
export async function call(app: Express, options: RequestOptions) {
  const response = createResponse();
  app(createRequest(options), response);
  for (let tick = 0; tick < 2000 && !response._isEndCalled(); tick++) {
    await new Promise((resolve) => setImmediate(resolve));
  }
  return response;
}

export async function login(
  app: Express,
  role: TestRole = "employee",
  override?: { email: string; password: string },
): Promise<string> {
  const response = await call(app, { method: "POST", url: "/auth/login", body: override ?? credentials[role] });
  return response._getJSONData().accessToken as string;
}

export async function authedCall(app: Express, token: string, options: RequestOptions) {
  return call(app, { ...options, headers: { authorization: `Bearer ${token}`, ...options.headers } });
}
