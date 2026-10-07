import bcrypt from "bcryptjs";

import type { Database } from "./database.js";
import { clientSystems, clients, users, visits } from "./schema.js";

let passwordHashes: Promise<{ admin: string; technician: string }> | undefined;

function hashes() {
  passwordHashes ??= Promise.all([bcrypt.hash("Admin123!", 10), bcrypt.hash("Tecnico123!", 10)]).then(
    ([admin, technician]) => ({ admin, technician }),
  );
  return passwordHashes;
}

// Contas e dados de teste do MVP; o servidor só chama isto fora de produção.
export async function seedDevelopmentData(db: Database): Promise<void> {
  const { admin, technician } = await hashes();

  await db
    .insert(users)
    .values([
      { id: "admin-1", name: "Administrador 1", email: "admin1@qqs.app", passwordHash: admin, role: "supervisor" },
      { id: "admin-2", name: "Administrador 2", email: "admin2@qqs.app", passwordHash: admin, role: "supervisor" },
      { id: "employee-001", name: "Técnico Teste", email: "tecnico@qqs.app", passwordHash: technician, role: "employee" },
      { id: "employee-002", name: "Carlos Silva", email: "carlos.silva@qqs.app", passwordHash: technician, role: "employee" },
      { id: "employee-003", name: "Mariana Souza", email: "mariana.souza@qqs.app", passwordHash: technician, role: "employee" },
    ])
    .onConflictDoNothing();

  await db
    .insert(clients)
    .values({
      id: "client-001",
      name: "Gases da Amazônia",
      cnpj: "11222333000181",
      address: "Manaus, AM",
      latitude: -3.1019,
      longitude: -60.025,
      radiusMeters: 200,
    })
    .onConflictDoNothing();

  await db
    .insert(clientSystems)
    .values([
      { id: "system-001", clientId: "client-001", name: "Torre 1", type: "tower" },
      { id: "system-002", clientId: "client-001", name: "Torre 2", type: "tower" },
      { id: "system-003", clientId: "client-001", name: "Caldeira 1", type: "boiler" },
    ])
    .onConflictDoNothing();

  await db
    .insert(visits)
    .values({
      id: "visit-001",
      clientId: "client-001",
      employeeId: "employee-001",
      status: "assigned",
      scheduledFor: new Date("2026-09-21T13:00:00.000Z"),
    })
    .onConflictDoNothing();
}
