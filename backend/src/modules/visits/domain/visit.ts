import type {
  ArrivalLocation,
  ClientId,
  ClientLocation,
  EmployeeSummary,
  OperationId,
  UserId,
  VisitId,
  VisitPhoto,
  VisitStatus,
} from "@qqs/contracts";

export type Visit = {
  id: VisitId;
  clientId: ClientId;
  employeeId: UserId;
  status: Extract<VisitStatus, "assigned" | "in_progress" | "completed">;
  clientName?: string;
  clientAddress?: string;
  clientLocation?: ClientLocation;
  scheduledFor?: string;
  systems?: Array<{ id: string; name: string; type: string }>;
  arrivedAt?: string;
  arrivalLocation?: ArrivalLocation;
  arrivalDistanceMeters?: number;
  outsideRadius?: boolean;
  arrivalJustification?: string;
  lastStartOperationId?: OperationId;
  leftAt?: string;
  departureLocation?: ArrivalLocation;
  durationMinutes?: number;
  description?: string;
  attendants?: EmployeeSummary[];
  photos?: VisitPhoto[];
  finishedAt?: string;
  lastFinishOperationId?: OperationId;
};
