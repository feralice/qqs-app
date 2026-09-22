export type UserId = string;
export type ClientId = string;
export type VisitId = string;
export type OperationId = string;

export type UserRole = "employee" | "supervisor";

export type SyncStatus = "pending" | "syncing" | "synced" | "failed";

export type VisitStatus =
  | "assigned"
  | "draft"
  | "in_progress"
  | "completed"
  | "synced"
  | "pending_sync"
  | "sync_failed";

export type ArrivalLocation = {
  latitude: number;
  longitude: number;
  accuracy?: number;
};

export type EmployeeSummary = {
  id: UserId;
  name: string;
  email: string;
  role: UserRole;
};

export type VisitPhoto = {
  id: string;
  uri: string;
  caption?: string;
  takenAt: string;
};

export type VisitDeparture = {
  leftAt: string;
  location?: ArrivalLocation;
};

export type VisitSummary = {
  id: VisitId;
  clientId: ClientId;
  clientName: string;
  scheduledFor: string;
  status: VisitStatus;
  systemsCount: number;
};

export type VisitSystem = {
  id: string;
  name: string;
  type: string;
};

export type VisitDetails = VisitSummary & {
  clientAddress?: string;
  systems: VisitSystem[];
  arrival?: {
    arrivedAt: string;
    location?: ArrivalLocation;
  };
  departure?: VisitDeparture;
  durationMinutes?: number;
  description?: string;
  attendants?: EmployeeSummary[];
  photos?: VisitPhoto[];
  finishedAt?: string;
  syncStatus: SyncStatus;
};

export type StartVisitRequest = {
  operationId: OperationId;
  arrivedAt: string;
  location?: ArrivalLocation;
};

export type StartVisitResponse = VisitDetails;

export type FinishVisitRequest = {
  operationId: OperationId;
  finishedAt: string;
  location?: ArrivalLocation;
  description?: string;
  attendantIds?: string[];
  photos?: VisitPhoto[];
};

export type FinishVisitResponse = VisitDetails;

export type CreateVisitRequest = {
  clientId: ClientId;
  employeeId: UserId;
  scheduledFor: string;
  systems: Array<{ id?: string; name: string; type: string }>;
};

export type CreateVisitResponse = VisitDetails;

export type AuthUser = {
  id: UserId;
  name: string;
  email: string;
  role: UserRole;
};

export type LoginRequest = {
  email: string;
  password: string;
};

export type LoginResponse = {
  accessToken: string;
  refreshToken: string;
  user: AuthUser;
};

export type RefreshRequest = {
  refreshToken: string;
};

export type RefreshResponse = {
  accessToken: string;
  refreshToken: string;
};

export type RegisterRequest = {
  name: string;
  email: string;
  password: string;
};

export type RegisterResponse = LoginResponse;
