"use client";

import type { User } from "firebase/auth";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { DatabaseService } from "@/lib/database";
import type { UserData } from "@/lib/services/auth/auth";
import { getUserData, onAuthStateChange } from "@/lib/services/auth/auth";
import { cookieUtils } from "@/lib/utils/cookies";

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

interface AuthContextType {
  user: User | null;
  userData: UserData | null;
  loading: boolean;
  signOut: () => Promise<void>;
  refreshUserData: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<User | null>(null);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChange(async (user) => {
      setUser(user);

      if (user) {
        // Set auth cookie for middleware to read
        const token = await user.getIdToken();
        cookieUtils.set("firebase-auth-token", token, {
          path: "/",
          secure: true,
          sameSite: "strict",
        });
        // Fetch additional user data from Firestore.
        // Auth state change can fire before user profile write completes
        // (esp. right after sign up), so we retry briefly.
        try {
          console.log(
            `🔍 [AuthProvider] Fetching userData for uid=${user.uid}, email=${user.email}`,
          );
          let data: UserData | null = null;
          const delaysMs = [0, 150, 300, 600, 1000];
          for (let i = 0; i < delaysMs.length; i++) {
            const delayMs = delaysMs[i];
            if (delayMs > 0) await sleep(delayMs);

            data = await getUserData(user.uid);
            console.log(
              `🔍 [AuthProvider] Attempt ${i + 1}: getUserData returned ${data ? "data" : "null"}`,
            );
            if (data) break;
          }

          if (!data) {
            console.warn(
              `⚠️ [AuthProvider] No Firestore profile found for ${user.uid}. Creating one now...`,
            );
            try {
              await DatabaseService.createUserWithCompleteProfile(user.uid, {
                email: user.email || "",
                displayName: user.displayName || "",
                ...(user.photoURL && { photoURL: user.photoURL }),
              });
              data = await getUserData(user.uid);
              console.log(
                `✅ [AuthProvider] Profile auto-created, userData: ${data ? "found" : "still null"}`,
              );
            } catch (createError) {
              console.error(
                "❌ [AuthProvider] Failed to auto-create profile:",
                createError,
              );
            }
          }

          setUserData(data);

          if (data?.onboardingCompleted) {
            cookieUtils.set("onboarding-complete", "1", {
              path: "/",
              secure: true,
              sameSite: "strict",
            });
          } else {
            cookieUtils.clear("onboarding-complete");
          }
        } catch (error) {
          // If getUserData fails (e.g., offline), we still set the user
          // but with null userData. The app can still function with just auth data
          console.error(
            "Failed to fetch user data, continuing with auth-only data:",
            error,
          );
          // Check if it's a Firestore internal assertion error
          if (
            error instanceof Error &&
            error.message.includes("INTERNAL ASSERTION FAILED")
          ) {
            console.error(
              "🚨 FIRESTORE INTERNAL ASSERTION ERROR detected in auth provider:",
              error.message,
            );
          }
          setUserData(null);
          cookieUtils.clear("onboarding-complete");
        }
      } else {
        // Clear auth cookie when user signs out
        cookieUtils.clear("firebase-auth-token");
        cookieUtils.clear("onboarding-complete");
        setUserData(null);
      }

      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleSignOut = useCallback(async () => {
    try {
      const { signOutUser } = await import("@/lib/services/auth/auth");
      await signOutUser();
    } catch (error) {
      console.error("Error signing out:", error);
    }
  }, []);

  const refreshUserData = useCallback(async () => {
    if (!user) return;
    try {
      const data = await getUserData(user.uid);
      setUserData(data);
    } catch (error) {
      console.warn("Failed to refresh user data:", error);
    }
  }, [user]);

  const value = useMemo(
    () => ({
      user,
      userData,
      loading,
      signOut: handleSignOut,
      refreshUserData,
    }),
    [user, userData, loading, refreshUserData, handleSignOut],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
