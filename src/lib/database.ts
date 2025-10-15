/**
 * Main Database Service
 * Aggregates all database operations from modular files
 */

import { createUserWithCompleteProfile } from "./database-batch";
import {
  createSession,
  getSession,
  getUserSessions,
  saveInterviewResults,
  updateSession,
} from "./database-sessions";
import {
  createOrUpdateSkill,
  getDefaultSkills,
  getSkillsByCategory,
  getUserSkills,
} from "./database-skills";
// Import all functions from modular files
import {
  createUserProfile,
  deleteUserProfile,
  getUserProfile,
  updateLastLogin,
  updateUserProfile,
} from "./database-users";

// Re-export all functions for backwards compatibility
export {
  // User Profile operations
  getUserProfile,
  createUserProfile,
  updateUserProfile,
  deleteUserProfile,
  updateLastLogin,
  // Skills operations
  getUserSkills,
  getSkillsByCategory,
  createOrUpdateSkill,
  getDefaultSkills,
  // Session operations
  createSession,
  getSession,
  getUserSessions,
  updateSession,
  saveInterviewResults,
  // Batch operations
  createUserWithCompleteProfile,
};

// ================================
// MAIN DATABASE SERVICE
// ================================

export const DatabaseService = {
  // User Profile operations
  getUserProfile,
  createUserProfile,
  updateUserProfile,
  updateLastLogin,

  // Skills operations
  getUserSkills,
  getSkillsByCategory,
  createOrUpdateSkill,
  getDefaultSkills,

  // Session operations
  createSession,
  getSession,
  getUserSessions,
  updateSession,
  saveInterviewResults,

  // Batch operations
  createUserWithCompleteProfile,
};

export default DatabaseService;
