/**
 * Auth Roles and Permissions
 * Handles role-based access control
 */

import type { User } from "firebase/auth";

// Superadmin user ID
export const SUPERADMIN_UID = "IO77D68k8EcS9mzAA5tYsepiI532";

// Role types
export type UserRole = "user" | "admin" | "superadmin";

/**
 * Check if user is superadmin
 */
export function isSuperAdmin(user: User | null): boolean {
  if (!user) return false;
  return user.uid === SUPERADMIN_UID;
}

/**
 * Check if user is admin or superadmin
 */
export function isAdmin(user: User | null, userRole?: string): boolean {
  if (!user) return false;
  if (isSuperAdmin(user)) return true;
  return userRole === "admin" || userRole === "superadmin";
}

/**
 * Get user role
 */
export function getUserRole(user: User | null, userRole?: string): UserRole {
  if (!user) return "user";
  if (isSuperAdmin(user)) return "superadmin";
  if (userRole === "admin") return "admin";
  return "user";
}

/**
 * Check if user has permission to manage practice library
 */
export function canManagePracticeLibrary(user: User | null): boolean {
  return isSuperAdmin(user);
}
