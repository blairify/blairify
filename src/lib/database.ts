/**
 * Main Database Service
 * Aggregates all database operations from modular files
 */

import {
  createSession,
  deleteSession,
  getSession,
  getUserSessions,
  saveInterviewResults,
  updateSession,
} from "./services/sessions/database-sessions";
import {
  createOrUpdateSkill,
  getDefaultSkills,
  getSkillsByCategory,
  getUserSkills,
} from "./services/skills/database-skills";
import { createUserWithCompleteProfile } from "./services/users/database-batch";
import {
  createUserProfile,
  deleteUserProfile,
  getUserProfile,
  updateLastLogin,
  updateUserProfile,
} from "./services/users/database-users";

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
  deleteSession,
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
  deleteSession,
  getSession,
  getUserSessions,
  updateSession,
  saveInterviewResults,

  // Batch operations
  createUserWithCompleteProfile,
};

export default DatabaseService;
