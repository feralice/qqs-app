CREATE TABLE "client_systems" (
	"id" text PRIMARY KEY NOT NULL,
	"client_id" text NOT NULL,
	"name" text NOT NULL,
	"type" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "client_systems_client_id_name_unique" UNIQUE("client_id","name")
);
--> statement-breakpoint
CREATE TABLE "clients" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"cnpj" text NOT NULL,
	"address" text NOT NULL,
	"latitude" double precision NOT NULL,
	"longitude" double precision NOT NULL,
	"radius_meters" integer NOT NULL,
	"active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "clients_cnpj_unique" UNIQUE("cnpj")
);
--> statement-breakpoint
CREATE TABLE "refresh_tokens" (
	"token" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"expires_at" timestamp with time zone NOT NULL
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"email" text NOT NULL,
	"password_hash" text NOT NULL,
	"role" text NOT NULL,
	"active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "visits" (
	"id" text PRIMARY KEY NOT NULL,
	"client_id" text NOT NULL,
	"employee_id" text NOT NULL,
	"status" text DEFAULT 'assigned' NOT NULL,
	"scheduled_for" timestamp with time zone,
	"arrived_at" timestamp with time zone,
	"arrival_location" jsonb,
	"arrival_distance_meters" integer,
	"outside_radius" boolean DEFAULT false NOT NULL,
	"arrival_justification" text,
	"last_start_operation_id" text,
	"left_at" timestamp with time zone,
	"departure_location" jsonb,
	"duration_minutes" integer,
	"description" text,
	"attendants" jsonb,
	"photos" jsonb,
	"finished_at" timestamp with time zone,
	"last_finish_operation_id" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "visits_last_start_operation_id_unique" UNIQUE("last_start_operation_id"),
	CONSTRAINT "visits_last_finish_operation_id_unique" UNIQUE("last_finish_operation_id")
);
--> statement-breakpoint
ALTER TABLE "client_systems" ADD CONSTRAINT "client_systems_client_id_clients_id_fk" FOREIGN KEY ("client_id") REFERENCES "public"."clients"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "refresh_tokens" ADD CONSTRAINT "refresh_tokens_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "visits" ADD CONSTRAINT "visits_client_id_clients_id_fk" FOREIGN KEY ("client_id") REFERENCES "public"."clients"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "visits" ADD CONSTRAINT "visits_employee_id_users_id_fk" FOREIGN KEY ("employee_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;