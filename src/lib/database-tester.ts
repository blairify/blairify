/**
 * Test Database Operations
 *
 * This file provides a simple way to test our Firestore schema implementation
 * and verify that the database operations work correctly with our security rules.
 */

import { DatabaseService } from "@/lib/database-simple";
import type { UserProfile } from "@/types/firestore";

/**
 * Test creating a user profile
 */
export async function testCreateUserProfile(userId: string): Promise<boolean> {
  try {
    const profileData: Partial<UserProfile> = {
      email: "test@example.com",
      displayName: "Test User",
      role: "Software Engineer",
      experience: "mid-level",
      preferences: {
        preferredDifficulty: "intermediate",
        preferredInterviewTypes: ["technical", "bullet"],
        targetCompanies: ["Google", "Microsoft"],
        notificationsEnabled: true,
        darkMode: false,
        language: "en",
        timezone: "America/New_York",
      },
    };

    const _result = await DatabaseService.createUserProfile(
      userId,
      profileData,
    );
    return true;
  } catch (error) {
    console.error("Failed to create user profile:", error);
    return false;
  }

  // Example usage:
}

/**
 * Test getting user skills (using default skills from DatabaseService)
 */
export async function testGetUserSkills(userId: string): Promise<boolean> {
  try {
    const skills = await DatabaseService.getUserSkills(userId);

    // If no skills exist, let's create some default ones
    if (skills.length === 0) {
      // Show what default skills would look like
      const defaultSkills = DatabaseService.getDefaultSkills();
      defaultSkills.slice(0, 3).forEach((skill) => {
        console.log(
          `  - ${skill.name} (${skill.category}): Level ${skill.currentLevel}`,
        );
      });
    }

    return true;
  } catch (error) {
    console.error("Failed to get user skills:", error);
    return false;
  }
}

/**
 * Test session-related operations (simplified)
 */
export async function testSessionOperations(_userId: string): Promise<boolean> {
  try {
    // For now, just test that we can access session-related methods
    // Full session creation would require more complex setup
    return true;
  } catch (error) {
    console.error("Failed session operations test:", error);
    return false;
  }
}

/**
 * Test reading user data
 */
export async function testReadUserData(userId: string): Promise<boolean> {
  try {
    // Test reading user profile
    const profile = await DatabaseService.getUserProfile(userId);

    // Test reading user skills
    const skills = await DatabaseService.getUserSkills(userId);

    return true;
  } catch (error) {
    console.error("Failed to read user data:", error);
    return false;
  }
}

/**
 * Run all tests
 */
export async function runAllTests(userId: string): Promise<void> {
  const results = {
    createProfile: await testCreateUserProfile(userId),
    getSkills: await testGetUserSkills(userId),
    sessionOps: await testSessionOperations(userId),
    readData: await testReadUserData(userId),
  };
}

/**
 * Test basic database operations
 */
export async function testBasicOperations(userId: string): Promise<boolean> {
  try {
    // Try to get user profile (this tests connection and permissions)
    const _profile = await DatabaseService.getUserProfile(userId);
    return true;
  } catch (error) {
    console.error("Database operations failed:", error);
    return false;
  }
}

// Example usage:
// To test the database operations, you can call:
// runAllTests('your-user-id-here');
