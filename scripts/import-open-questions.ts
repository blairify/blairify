import dotenv from "dotenv";
import fs from "fs";
import path from "path";

// Load environment variables before importing client
dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });

import { practiceDb } from "../src/practice-library-db/client";
import { openQuestions } from "../src/practice-library-db/schema";

async function main() {
    const openQuestionsPath = path.resolve(process.cwd(), "public/open-questions.json");

    console.log("Reading open questions file...");
    const rawOpenQuestions = fs.readFileSync(openQuestionsPath, "utf8");
    const openQuestionsData = JSON.parse(rawOpenQuestions);

    console.log(`Parsed ${openQuestionsData.length} open questions.`);

    if (!process.env.PRACTICE_LIBRARY_DATABASE_URL) {
        throw new Error("PRACTICE_LIBRARY_DATABASE_URL is not set");
    }

    const now = new Date();

    await practiceDb.transaction(async (tx) => {
        if (openQuestionsData.length > 0) {
            console.log("Importing open questions...");
            const batchSize = 50;
            for (let i = 0; i < openQuestionsData.length; i += batchSize) {
                const batch = openQuestionsData.slice(i, i + batchSize);
                await tx.insert(openQuestions).values(
                    batch.map((q: any) => ({
                        id: q.id,
                        status: q.status,
                        reviewerId: q.reviewer_id ?? null,
                        reviewedAt: q.reviewed_at ? new Date(q.reviewed_at) : null,
                        difficulty: q.difficulty,
                        isDemoMode: q.is_demo_mode ?? false,
                        companyType: q.company_type ?? "enterprise",
                        title: q.title,
                        description: q.description,
                        prompt: q.prompt,
                        topic: q.topic,
                        subtopics: q.subtopics ?? [],
                        tags: q.tags ?? [],
                        estimatedTimeMinutes: q.estimated_time_minutes ?? 0,
                        aiEvaluationHint: q.ai_evaluation_hint ?? q.aiEvaluationHint ?? null,
                        companies: q.companies ?? null,
                        positions: q.positions ?? [],
                        primaryTechStack: q.primary_tech_stack ?? [],
                        interviewTypes: q.interview_types ?? [],
                        seniorityLevels: q.seniority_levels ?? [],
                        createdAt: q.created_at ? new Date(q.created_at) : now,
                        updatedAt: q.updated_at ? new Date(q.updated_at) : now,
                        createdBy: q.created_by ?? "admin",
                        referenceAnswers: q.reference_answers ?? null,
                    }))
                ).onConflictDoNothing();
            }
        }
    });

    console.log("✅ Open questions import completed successfully!");
}

main().catch((err) => {
    console.error("❌ Import failed:", err);
    process.exit(1);
});
