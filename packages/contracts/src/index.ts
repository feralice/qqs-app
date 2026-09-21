export type UserId = string;
export type ClientId = string;
export type VisitId = string;
export type OperationId = string;

export type UserRole = "employee" | "supervisor";

export type SyncStatus = "pending" | "syncing" | "synced" | "failed";

export type VisitStatus = "draft" | "in_progress" | "completed" | "synced";
