CREATE TABLE "processed_operations" (
	"operation_id" text PRIMARY KEY NOT NULL,
	"action" text NOT NULL,
	"result" jsonb NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
