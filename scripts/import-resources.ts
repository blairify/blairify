import dotenv from "dotenv";
import fs from "fs";
import path from "path";

// Load environment variables before importing client
dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });

import { practiceDb } from "../src/practice-library-db/client";
import { resources } from "../src/practice-library-db/schema";

async function main() {
    const resourcesPath = path.resolve(process.cwd(), "public/resources.json");

    console.log("Reading resources file...");
    const rawResources = fs.readFileSync(resourcesPath, "utf8");
    const resourcesData = JSON.parse(rawResources);

    console.log(`Parsed ${resourcesData.length} resources.`);

    if (!process.env.PRACTICE_LIBRARY_DATABASE_URL) {
        throw new Error("PRACTICE_LIBRARY_DATABASE_URL is not set");
    }

    const now = new Date();

    await practiceDb.transaction(async (tx) => {
        if (resourcesData.length > 0) {
            console.log("Importing resources...");
            const batchSize = 100;
            for (let i = 0; i < resourcesData.length; i += batchSize) {
                const batch = resourcesData.slice(i, i + batchSize);
                await tx.insert(resources).values(
                    batch.map((r: any) => ({
                        id: r.id,
                        title: r.title,
                        url: r.url,
                        type: r.type,
                        tags: r.tags ?? [],
                        difficulty: r.difficulty ?? null,
                        isActive: r.is_active ?? true,
                        createdAt: r.created_at ? new Date(r.created_at) : now,
                        updatedAt: r.updated_at ? new Date(r.updated_at) : now,
                    }))
                ).onConflictDoNothing();
            }
        }
    });

    console.log("✅ Resources import completed successfully!");
}

main().catch((err) => {
    console.error("❌ Import failed:", err);
    process.exit(1);
});
