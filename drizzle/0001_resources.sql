CREATE TABLE "resources" (
	"id" text PRIMARY KEY NOT NULL,
	"title" text NOT NULL,
	"url" text NOT NULL,
	"type" text NOT NULL,
	"tags" text[] DEFAULT '{}' NOT NULL,
	"difficulty" text,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone NOT NULL,
	"updated_at" timestamp with time zone NOT NULL
);
--> statement-breakpoint
CREATE INDEX "resources_tags_gin" ON "resources" USING gin ("tags");
--> statement-breakpoint
CREATE INDEX "resources_is_active_idx" ON "resources" ("is_active");
