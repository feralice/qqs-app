import {
  integer,
  jsonb,
  pgTable,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";

export const clients = pgTable("clients", {
  id: uuid("id").primaryKey(),
  name: text("name").notNull(),
  address: text("address"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const visits = pgTable("visits", {
  id: uuid("id").primaryKey(),
  clientId: uuid("client_id").notNull().references(() => clients.id),
  employeeId: uuid("employee_id").notNull(),
  status: text("status").notNull().default("assigned"),
  scheduledFor: timestamp("scheduled_for", { withTimezone: true }),
  arrivedAt: timestamp("arrived_at", { withTimezone: true }),
  arrivalLatitude: text("arrival_latitude"),
  arrivalLongitude: text("arrival_longitude"),
  arrivalAccuracy: integer("arrival_accuracy"),
  lastStartOperationId: text("last_start_operation_id").unique(),
  metadata: jsonb("metadata").$type<Record<string, unknown>>(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});
