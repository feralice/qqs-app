CREATE TABLE "products" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"name_key" text NOT NULL,
	"description" text,
	"unit" text DEFAULT 'L' NOT NULL,
	"active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "products_name_key_unique" UNIQUE("name_key")
);
--> statement-breakpoint
CREATE TABLE "system_parameters" (
	"system_id" text NOT NULL,
	"position" integer NOT NULL,
	"name" text NOT NULL,
	"unit" text,
	"min" double precision,
	"max" double precision,
	CONSTRAINT "system_parameters_system_id_position_pk" PRIMARY KEY("system_id","position")
);
--> statement-breakpoint
CREATE TABLE "system_products" (
	"system_id" text NOT NULL,
	"position" integer NOT NULL,
	"product_id" text NOT NULL,
	"daily_dose" double precision NOT NULL,
	"maintenance_dose" double precision,
	CONSTRAINT "system_products_system_id_position_pk" PRIMARY KEY("system_id","position"),
	CONSTRAINT "system_products_system_id_product_id_unique" UNIQUE("system_id","product_id")
);
--> statement-breakpoint
ALTER TABLE "system_parameters" ADD CONSTRAINT "system_parameters_system_id_client_systems_id_fk" FOREIGN KEY ("system_id") REFERENCES "public"."client_systems"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "system_products" ADD CONSTRAINT "system_products_system_id_client_systems_id_fk" FOREIGN KEY ("system_id") REFERENCES "public"."client_systems"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "system_products" ADD CONSTRAINT "system_products_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE no action ON UPDATE no action;