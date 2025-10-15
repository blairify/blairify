/**
 * Manual Database Test
 * Test the database service functions manually
 */

import { DatabaseService } from "@/lib/database";

export const testDatabaseOperations = async (userId: string) => {
  console.info("🧪 Starting database tests for user:", userId);

  try {
    // Test creating a user profile
    console.info("📝 Creating user profile...");
    const profileData = {
      email: "test@example.com",
      displayName: "Test User",
      role: "Software Engineer",
      experience: "mid-level",
      howDidYouHear: "web search",
    };

    const createdProfile = await DatabaseService.createUserWithCompleteProfile(
      userId,
      profileData,
    );
    console.info("✅ User profile created:", createdProfile);

    // Test getting user profile
    console.info("📖 Getting user profile...");
    const retrievedProfile = await DatabaseService.getUserProfile(userId);
    console.info("✅ User profile retrieved:", retrievedProfile);

    // Test getting user skills
    console.info("📖 Getting user skills...");
    const skills = await DatabaseService.getUserSkills(userId);
    console.info("✅ User skills retrieved:", skills.length, "skills");
    skills.forEach((skill) => {
      console.info(`  - ${skill.name}: Level ${skill.currentLevel}/10`);
    });

    // Test getting user sessions
    console.info("📖 Getting user sessions...");
    const sessions = await DatabaseService.getUserSessions(userId);
    console.info("✅ User sessions retrieved:", sessions.length, "sessions");

    console.info("🎉 All database tests passed!");
    return true;
  } catch (error) {
    console.error("❌ Database test failed:", error);
    return false;
  }
};

export default testDatabaseOperations;
