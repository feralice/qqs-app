import type { UserId, UserRole } from "@qqs/contracts";

// Quem está fazendo a requisição, já autenticado.
export type Actor = {
  sub: UserId;
  role: UserRole;
};
