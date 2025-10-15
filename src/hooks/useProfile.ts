/**
 * Profile Page Hook
 * Hook for managing profile data using our database service
 */

import { useCallback, useEffect, useState } from "react";
import { DatabaseService } from "@/lib/database";
import { useAuth } from "@/providers/auth-provider";
import type {
  InterviewType,
  UserPreferences,
  UserProfile,
} from "@/types/firestore";

interface ProfileFormData {
  displayName: string;
  role: string;
  experience: string;
  howDidYouHear: string;
  preferences: UserPreferences;
}

interface UseProfileReturn {
  profile: UserProfile | null;
  editData: ProfileFormData;
  isEditing: boolean;
  saving: boolean;
  loading: boolean;
  error: string | null;
  setEditData: (data: ProfileFormData) => void;
  setIsEditing: (editing: boolean) => void;
  saveProfile: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

export const useProfile = (): UseProfileReturn => {
  const { user, refreshUserData } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [editData, setEditData] = useState<ProfileFormData>({
    displayName: "",
    role: "",
    experience: "",
    howDidYouHear: "",
    preferences: {
      preferredDifficulty: "intermediate",
      preferredInterviewTypes: ["technical" as InterviewType],
      targetCompanies: [],
      notificationsEnabled: true,
      darkMode: false,
      language: "en",
      timezone: "America/New_York",
    },
  });

  // Load profile data
  const loadProfile = useCallback(async () => {
    if (!user?.uid) return;

    try {
      setLoading(true);
      setError(null);

      const userProfile = await DatabaseService.getUserProfile(user.uid);
      if (userProfile) {
        setProfile(userProfile);
        setEditData({
          displayName: userProfile.displayName || "",
          role: userProfile.role || "",
          experience: userProfile.experience || "",
          howDidYouHear: userProfile.howDidYouHear || "",
          preferences: userProfile.preferences,
        });
      }
    } catch (error) {
      console.error("Error loading profile:", error);
      setError("Failed to load profile data");
    } finally {
      setLoading(false);
    }
  }, [user?.uid]);

  // Save profile changes
  const saveProfile = async () => {
    if (!user?.uid || !profile) return;

    try {
      setSaving(true);
      setError(null);

      const updates: Partial<UserProfile> = {
        displayName: editData.displayName,
        role: editData.role,
        experience: editData.experience,
        howDidYouHear: editData.howDidYouHear,
        preferences: editData.preferences,
      };

      await DatabaseService.updateUserProfile(user.uid, updates);

      // Refresh the profile data
      await loadProfile();

      // Refresh auth provider data
      await refreshUserData();

      setIsEditing(false);
    } catch (error) {
      console.error("Error saving profile:", error);
      setError("Failed to save profile changes");
    } finally {
      setSaving(false);
    }
  };

  // Refresh profile data
  const refreshProfile = async () => {
    await loadProfile();
  };

  // Load profile on mount and when user changes
  useEffect(() => {
    loadProfile();
  }, [loadProfile]);

  return {
    profile,
    editData,
    isEditing,
    saving,
    loading,
    error,
    setEditData,
    setIsEditing,
    saveProfile,
    refreshProfile,
  };
};

export default useProfile;
