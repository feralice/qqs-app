import type { ClientId, UserId, VisitId, VisitStatus } from "@qqs/contracts";

export type Visit = {
  id: VisitId;
  clientId: ClientId;
  employeeId: UserId;
  status: Extract<VisitStatus, "in_progress">;
  arrivedAt: string;
};
