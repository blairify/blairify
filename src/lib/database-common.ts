/**
 * Common Database Utilities and Constants
 */

import { db } from "./firebase";

// ================================
// DATABASE HELPER FUNCTIONS
// ================================

export const ensureDatabase = () => {
  if (!db) {
    throw new Error("Firestore database is not initialized");
  }
  return db;
};

export const COLLECTIONS = {
  USERS: "users",
  SKILLS: "skills",
  SESSIONS: "sessions",
  ANALYTICS: "analytics",
  PROGRESS: "progress",
} as const;
