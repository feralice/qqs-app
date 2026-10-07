import type { EmployeeSummary } from "@qqs/contracts";

import type { UserRepository } from "../ports.js";

// Sem hash de senha nem usuários inativos: é o que pode sair da API.
export async function listEmployees(users: Pick<UserRepository, "list">): Promise<EmployeeSummary[]> {
  return (await users.list()).filter((user) => user.active).map(({ id, name, email, role }) => ({ id, name, email, role }));
}
