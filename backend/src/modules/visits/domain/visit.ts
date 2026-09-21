import type {
  ArrivalLocation,
  ClientId,
  UserId,
  VisitId,
  VisitStatus,
  OperationId,
} from "@qqs/contracts";

export type Visit = {
  id: VisitId;
  clientId: ClientId;
  employeeId: UserId;
  status: Extract<VisitStatus, "assigned" | "in_progress">;
  clientName?: string;
  clientAddress?: string;
  scheduledFor?: string;
  systems?: Array<{ id: string; name: string; type: string }>;
  arrivedAt?: string;
  arrivalLocation?: ArrivalLocation;
  lastStartOperationId?: OperationId;
};
