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
  syncStatus: SyncStatus;
};

export type StartVisitRequest = {
  operationId: OperationId;
  arrivedAt: string;
  location?: ArrivalLocation;
};

export type StartVisitResponse = VisitDetails;

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
