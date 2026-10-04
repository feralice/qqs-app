import {
  boolean,
  doublePrecision,
  integer,
  jsonb,
  pgTable,
  text,
  timestamp,
  unique,
} from "drizzle-orm/pg-core";
import type { ArrivalLocation, EmployeeSummary, UserRole, VisitPhoto } from "@qqs/contracts";

const timestampColumn = (name: string) => timestamp(name, { withTimezone: true });
const createdAt = () => timestampColumn("created_at").notNull().defaultNow();

export const users = pgTable("users", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  role: text("role").$type<UserRole>().notNull(),
  active: boolean("active").notNull().default(true),
  createdAt: createdAt(),
});

export const refreshTokens = pgTable("refresh_tokens", {
  token: text("token").primaryKey(),
  userId: text("user_id").notNull().references(() => users.id),
  expiresAt: timestampColumn("expires_at").notNull(),
});

export const clients = pgTable("clients", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  cnpj: text("cnpj").notNull().unique(),
  address: text("address").notNull(),
  latitude: doublePrecision("latitude").notNull(),
  longitude: doublePrecision("longitude").notNull(),
  radiusMeters: integer("radius_meters").notNull(),
  active: boolean("active").notNull().default(true),
  createdAt: createdAt(),
  updatedAt: timestampColumn("updated_at").notNull().defaultNow(),
});

export const clientSystems = pgTable(
  "client_systems",
  {
    id: text("id").primaryKey(),
    clientId: text("client_id").notNull().references(() => clients.id),
    name: text("name").notNull(),
    type: text("type").notNull(),
    createdAt: createdAt(),
  },
  (table) => [unique().on(table.clientId, table.name)],
);

export const visits = pgTable("visits", {
  id: text("id").primaryKey(),
  clientId: text("client_id").notNull().references(() => clients.id),
  employeeId: text("employee_id").notNull().references(() => users.id),
  status: text("status").$type<"assigned" | "in_progress" | "completed">().notNull().default("assigned"),
  scheduledFor: timestampColumn("scheduled_for"),
  arrivedAt: timestampColumn("arrived_at"),
  arrivalLocation: jsonb("arrival_location").$type<ArrivalLocation>(),
  arrivalDistanceMeters: integer("arrival_distance_meters"),
  outsideRadius: boolean("outside_radius").notNull().default(false),
  arrivalJustification: text("arrival_justification"),
  lastStartOperationId: text("last_start_operation_id").unique(),
  leftAt: timestampColumn("left_at"),
  departureLocation: jsonb("departure_location").$type<ArrivalLocation>(),
  durationMinutes: integer("duration_minutes"),
  description: text("description"),
  attendants: jsonb("attendants").$type<EmployeeSummary[]>(),
  photos: jsonb("photos").$type<VisitPhoto[]>(),
  finishedAt: timestampColumn("finished_at"),
  lastFinishOperationId: text("last_finish_operation_id").unique(),
  createdAt: createdAt(),
  updatedAt: timestampColumn("updated_at").notNull().defaultNow(),
});
