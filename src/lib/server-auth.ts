import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { getUserData, type UserData } from "@/lib/services/auth/auth";

/**
 * Server-side authentication check for Next.js App Router
 * This should be used in server components and API routes
 */
export async function getServerAuth(): Promise<{
  user: UserData | null;
  isAuthenticated: boolean;
}> {
  try {
    const cookieStore = await cookies();
    const authToken =
      cookieStore.get("firebase-auth-token")?.value ||
      cookieStore.get("auth-token")?.value ||
      cookieStore.get("__session")?.value;

    if (!authToken) {
      return { user: null, isAuthenticated: false };
    }

    // In a real implementation, you would verify the token here
    // For now, we'll extract the UID from the token (this is simplified)
    // You should implement proper JWT verification or use Firebase Admin SDK

    // This is a placeholder - implement proper token verification
    const uid = extractUidFromToken(authToken);

    if (!uid) {
      return { user: null, isAuthenticated: false };
    }

    // For server-side auth, we'll create a minimal user object to avoid Firestore permission issues
    // The client-side components will handle fetching full user data from Firestore using proper auth context
    // This prevents "Permission denied" errors when server-side code tries to access Firestore without proper auth
    const userData: UserData = {
      uid,
      email: "", // Will be populated client-side
      displayName: null, // Will be populated client-side
      createdAt: new Date(), // Placeholder date
      lastLoginAt: new Date(), // Placeholder date
    };

    return {
      user: userData,
      isAuthenticated: true,
    };
  } catch (error) {
    console.error("Server auth check failed:", error);
    return { user: null, isAuthenticated: false };
  }
}

/**
 * Require authentication for a server component
 * Redirects to auth page if not authenticated
 */
export async function requireAuth(redirectTo?: string): Promise<UserData> {
  const { user, isAuthenticated } = await getServerAuth();

  if (!isAuthenticated || !user) {
    const authUrl = redirectTo
      ? `/auth?redirect=${encodeURIComponent(redirectTo)}`
      : "/auth";
    redirect(authUrl);
  }

  return user;
}

/**
 * Check if user is authenticated without redirecting
 * Useful for conditional rendering in server components
 */
export async function checkAuth(): Promise<UserData | null> {
  const { user } = await getServerAuth();
  return user;
}

/**
 * Extract UID from auth token
 * This is a placeholder implementation - you should implement proper JWT verification
 * or use Firebase Admin SDK for production
 */
function extractUidFromToken(token: string): string | null {
  try {
    // This is a simplified implementation
    // In production, you should:
    // 1. Use Firebase Admin SDK to verify the token
    // 2. Or implement proper JWT verification

    // For now, we'll assume the token format is "Bearer <jwt>"
    const cleanToken = token.replace("Bearer ", "");

    // Decode JWT payload (without verification - NOT for production)
    const parts = cleanToken.split(".");
    if (parts.length !== 3) return null;

    const payload = JSON.parse(atob(parts[1]));
    return payload.sub || payload.uid || null;
  } catch (error) {
    console.error("Failed to extract UID from token:", error);
    return null;
  }
}

/**
 * Server-side sign out
 * Clears auth cookies and redirects
 */
export async function serverSignOut(redirectTo: string = "/") {
  const cookieStore = await cookies();

  // Clear auth cookies
  cookieStore.delete("firebase-auth-token");
  cookieStore.delete("auth-token");
  cookieStore.delete("__session");

  redirect(redirectTo);
}
