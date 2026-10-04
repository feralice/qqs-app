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

export type GeoPoint = {
  latitude: number;
  longitude: number;
};

const EARTH_RADIUS_METERS = 6_371_000;

export function distanceMeters(a: GeoPoint, b: GeoPoint): number {
  const toRadians = (degrees: number) => (degrees * Math.PI) / 180;
  const deltaLatitude = toRadians(b.latitude - a.latitude);
  const deltaLongitude = toRadians(b.longitude - a.longitude);
  const h =
    Math.sin(deltaLatitude / 2) ** 2 +
    Math.cos(toRadians(a.latitude)) *
      Math.cos(toRadians(b.latitude)) *
      Math.sin(deltaLongitude / 2) ** 2;
  return Math.round(2 * EARTH_RADIUS_METERS * Math.asin(Math.sqrt(h)));
}

// Desde julho de 2026 a Receita emite CNPJ alfanumérico (IN RFB 2.229/2024): letras nas 12
// primeiras posições valem código ASCII menos 48; os dois dígitos verificadores seguem numéricos.
export function normalizeCnpj(value: string): string {
  return value.replace(/[.\/\-\s]/g, "").toUpperCase();
}

function cnpjCheckDigit(base: string): number {
  const weights = base.length === 12 ? [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2] : [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
  const sum = [...base].reduce((total, char, index) => total + (char.charCodeAt(0) - 48) * weights[index], 0);
  const remainder = sum % 11;
  return remainder < 2 ? 0 : 11 - remainder;
}

export function isValidCnpj(value: string): boolean {
  const cnpj = normalizeCnpj(value);
  if (!/^[0-9A-Z]{12}\d{2}$/.test(cnpj) || /^(.)\1+$/.test(cnpj)) {
    return false;
  }
  const first = cnpjCheckDigit(cnpj.slice(0, 12));
  const second = cnpjCheckDigit(cnpj.slice(0, 12) + first);
  return cnpj.endsWith(`${first}${second}`);
}

export type ClientLocation = GeoPoint & {
  radiusMeters: number;
};

export type ClientSystem = {
  id: string;
  clientId: ClientId;
  name: string;
  type: string;
};

export type ClientSummary = {
  id: ClientId;
  name: string;
  cnpj: string;
  address: string;
  latitude: number;
  longitude: number;
  radiusMeters: number;
  active: boolean;
  systems: ClientSystem[];
};

export type CreateClientRequest = {
  name: string;
  cnpj: string;
  address: string;
  latitude: number;
  longitude: number;
  radiusMeters: number;
  systems?: Array<{ name: string; type: string }>;
};

export type UpdateClientRequest = Partial<Omit<CreateClientRequest, "systems">> & {
  active?: boolean;
};

export type AddClientSystemRequest = {
  name: string;
  type: string;
};

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
  employeeId?: UserId;
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

export type VisitArrival = {
  arrivedAt: string;
  location?: ArrivalLocation;
  distanceMeters?: number;
  outsideRadius?: boolean;
  justification?: string;
};

export type VisitDetails = VisitSummary & {
  clientAddress?: string;
  clientLocation?: ClientLocation;
  systems: VisitSystem[];
  arrival?: VisitArrival;
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
  justification?: string;
};

export type StartVisitResponse = VisitDetails;

export type FinishVisitRequest = {
  operationId: OperationId;
  finishedAt: string;
  location?: ArrivalLocation;
  description?: string;
  attendantIds?: string[];
  attendants?: EmployeeSummary[];
  photos?: VisitPhoto[];
};

export type FinishVisitResponse = VisitDetails;

export type CreateVisitRequest = {
  id?: VisitId;
  clientId: ClientId;
  employeeId?: UserId;
  scheduledFor: string;
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

export type AdminDashboardCounts = {
  scheduled: number;
  inProgress: number;
  completed: number;
  overdue: number;
};

export type AdminAlertSummary = {
  id: string;
  visitId: VisitId;
  type: "overdue" | "problem" | "outside_radius";
  message: string;
  createdAt: string;
};

export type EmployeeOperationalStatus = EmployeeSummary & {
  status: "available" | "busy" | "offline";
  activeVisits: number;
};

export type AdminDashboardSummary = {
  date: string;
  counts: AdminDashboardCounts;
  alerts: AdminAlertSummary[];
  employees: EmployeeOperationalStatus[];
  lastUpdatedAt: string;
  isLoaded: boolean;
};
