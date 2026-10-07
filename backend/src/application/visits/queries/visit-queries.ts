import type { Actor } from "../../../domain/common/actor.js";
import { isVisibleTo, VisitNotFoundError, type Visit } from "../../../domain/visits/visit.js";
import type { VisitRepository } from "../ports.js";

// Visita de outro técnico responde 404, não 403: não confirma que o id existe.
export async function getVisibleVisit(repository: Pick<VisitRepository, "findById">, id: string, actor: Actor): Promise<Visit> {
  const visit = await repository.findById(id);
  if (!visit || !isVisibleTo(visit, actor)) throw new VisitNotFoundError();
  return visit;
}

export function listVisibleVisits(repository: Pick<VisitRepository, "list">, actor: Actor): Promise<Visit[]> {
  return repository.list(actor.role === "supervisor" ? undefined : { employeeId: actor.sub });
}
