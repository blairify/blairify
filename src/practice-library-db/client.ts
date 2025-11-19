import { Pool } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-serverless";
import * as schema from "./schema";

const connectionString = process.env.PRACTICE_LIBRARY_DATABASE_URL;

if (!connectionString) {
  throw new Error("PRACTICE_LIBRARY_DATABASE_URL is not set");
}

const pool = new Pool({ connectionString });

export const practiceDb = drizzle(pool, { schema });
