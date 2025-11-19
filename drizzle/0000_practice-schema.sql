CREATE TABLE "practice_matching_pairs" (
	"id" text PRIMARY KEY NOT NULL,
	"question_id" text NOT NULL,
	"left" text NOT NULL,
	"right" text NOT NULL,
	"explanation" text
);
--> statement-breakpoint
CREATE TABLE "practice_mcq_options" (
	"id" text PRIMARY KEY NOT NULL,
	"question_id" text NOT NULL,
	"text" text NOT NULL,
	"is_correct" boolean NOT NULL,
	"explanation" text
);
--> statement-breakpoint
CREATE TABLE "practice_questions" (
	"id" text PRIMARY KEY NOT NULL,
	"type" text NOT NULL,
	"difficulty" text NOT NULL,
	"status" text NOT NULL,
	"is_demo_mode" boolean DEFAULT false NOT NULL,
	"company_type" text NOT NULL,
	"title" text NOT NULL,
	"description" text NOT NULL,
	"prompt" text NOT NULL,
	"topic" text NOT NULL,
	"subtopics" text[] DEFAULT '{}' NOT NULL,
	"tags" text[] DEFAULT '{}' NOT NULL,
	"estimated_time_minutes" integer DEFAULT 0 NOT NULL,
	"ai_evaluation_hint" text,
	"multi_choice_answers" text[],
	"companies" jsonb,
	"positions" text[] DEFAULT '{}' NOT NULL,
	"primary_tech_stack" text[] DEFAULT '{}' NOT NULL,
	"interview_types" text[] DEFAULT '{}' NOT NULL,
	"seniority_levels" text[] DEFAULT '{}' NOT NULL,
	"created_at" timestamp with time zone NOT NULL,
	"updated_at" timestamp with time zone NOT NULL,
	"created_by" text NOT NULL,
	"open_reference_answers" jsonb,
	"truefalse_correct_answer" boolean,
	"truefalse_explanation" text,
	"matching_shuffle_left" boolean,
	"matching_shuffle_right" boolean,
	"matching_pairs" jsonb
);
--> statement-breakpoint
CREATE TABLE "practice_system_design_charts" (
	"id" text PRIMARY KEY NOT NULL,
	"question_id" text NOT NULL,
	"chart" jsonb DEFAULT '[]'::jsonb NOT NULL
);
--> statement-breakpoint
ALTER TABLE "practice_matching_pairs" ADD CONSTRAINT "practice_matching_pairs_question_id_practice_questions_id_fk" FOREIGN KEY ("question_id") REFERENCES "public"."practice_questions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "practice_mcq_options" ADD CONSTRAINT "practice_mcq_options_question_id_practice_questions_id_fk" FOREIGN KEY ("question_id") REFERENCES "public"."practice_questions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "practice_system_design_charts" ADD CONSTRAINT "practice_system_design_charts_question_id_practice_questions_id_fk" FOREIGN KEY ("question_id") REFERENCES "public"."practice_questions"("id") ON DELETE cascade ON UPDATE no action;