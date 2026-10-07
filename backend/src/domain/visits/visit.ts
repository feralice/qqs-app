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

import type { Actor } from "../common/actor.js";
import { ConflictError, NotFoundError, UnprocessableError, ValidationError } from "../common/errors.js";

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

export class VisitNotFoundError extends NotFoundError {
  constructor() {
    super("visit not found");
  }
}

export class InvalidArrivalDataError extends ValidationError {
  constructor() {
    super("invalid arrival data");
  }
}

export class VisitAlreadyStartedError extends ConflictError {
  constructor() {
    super("visit already exists");
  }
}

export class VisitAlreadyFinishedError extends ConflictError {
  constructor() {
    super("visit already finished");
  }
}

export class VisitNotInProgressError extends ConflictError {
  constructor() {
    super("visit not in progress");
  }
}

// RF-016: fora do raio a visita segue, mas só com justificativa.
export class JustificationRequiredError extends UnprocessableError {
  constructor() {
    super("justification required");
  }
}

export class EmployeeNotFoundError extends ValidationError {
  constructor() {
    super("employee not found");
  }
}

// Técnico só enxerga as próprias visitas; supervisor enxerga todas.
export function isVisibleTo(visit: Visit, actor: Actor): boolean {
  return actor.role === "supervisor" || visit.employeeId === actor.sub;
}
