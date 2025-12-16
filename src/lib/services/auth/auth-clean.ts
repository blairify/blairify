import {
  type AuthError,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword as firebaseSignIn,
  GithubAuthProvider,
  GoogleAuthProvider,
  onAuthStateChanged,
  signInWithPopup,
  signOut,
  type User,
  updateProfile,
} from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { auth, db } from "../../firebase";

// Auth providers
const githubProvider = new GithubAuthProvider();
const googleProvider = new GoogleAuthProvider();

// Add scopes for GitHub
githubProvider.addScope("user:email");

// User data interface
export interface UserData {
  uid: string;
  email: string;
  displayName: string | null;
  photoURL?: string;
  avatarIcon?: string;
  role?: string;
  experience?: string;
  createdAt: Date;
  lastLoginAt: Date;
}

// Register with email and password
export const registerWithEmailAndPassword = async (
  email: string,
  password: string,
  displayName: string,
  additionalData: {
    role: string;
    experience: string;
  },
): Promise<{ user: User | null; error: string | null }> => {
  try {
    // Check if Firebase is initialized
    if (!auth || !db) {
      return {
        user: null,
        error:
          "Firebase is not properly initialized. Please check your configuration.",
      };
    }

    const userCredential = await createUserWithEmailAndPassword(
      auth,
      email,
      password,
    );
    const user = userCredential.user;

    // Update the user's display name
    await updateProfile(user, { displayName });

    // Save additional user data to Firestore
    const userData: UserData = {
      uid: user.uid,
      email: user.email || "",
      displayName,
      photoURL: user.photoURL || undefined,
      role: additionalData.role,
      experience: additionalData.experience,
      createdAt: new Date(),
      lastLoginAt: new Date(),
    };

    await setDoc(doc(db, "users", user.uid), userData);

    return { user, error: null };
  } catch (error) {
    const authError = error as AuthError;
    return { user: null, error: getErrorMessage(authError) };
  }
};

// Sign in with email and password
export const signInWithEmailAndPassword = async (
  email: string,
  password: string,
): Promise<{ user: User | null; error: string | null }> => {
  try {
    if (!auth) {
      return { user: null, error: "Firebase Auth is not properly initialized" };
    }

    const userCredential = await firebaseSignIn(auth, email, password);
    const user = userCredential.user;

    // Update last login time
    if (user && db) {
      await updateUserLastLogin(user.uid);
    }

    return { user, error: null };
  } catch (error) {
    const authError = error as AuthError;
    return { user: null, error: getErrorMessage(authError) };
  }
};

// Sign in with GitHub
export const signInWithGitHub = async (): Promise<{
  user: User | null;
  error: string | null;
}> => {
  try {
    if (!auth || !db) {
      return { user: null, error: "Firebase is not properly initialized" };
    }

    const result = await signInWithPopup(auth, githubProvider);
    const user = result.user;

    // Check if user exists in Firestore
    const userDoc = await getDoc(doc(db, "users", user.uid));
    if (!userDoc.exists()) {
      // Create user document if it doesn't exist
      const userData: UserData = {
        uid: user.uid,
        email: user.email || "",
        displayName: user.displayName,
        photoURL: user.photoURL || undefined,
        createdAt: new Date(),
        lastLoginAt: new Date(),
      };
      await setDoc(doc(db, "users", user.uid), userData);
    } else {
      // Update last login time
      await updateUserLastLogin(user.uid);
    }

    return { user, error: null };
  } catch (error) {
    const authError = error as AuthError;
    return { user: null, error: getErrorMessage(authError) };
  }
};

// Sign in with Google
export const signInWithGoogle = async (): Promise<{
  user: User | null;
  error: string | null;
}> => {
  try {
    if (!auth || !db) {
      return { user: null, error: "Firebase is not properly initialized" };
    }

    const result = await signInWithPopup(auth, googleProvider);
    const user = result.user;

    // Check if user exists in Firestore
    const userDoc = await getDoc(doc(db, "users", user.uid));
    if (!userDoc.exists()) {
      // Create user document if it doesn't exist
      const userData: UserData = {
        uid: user.uid,
        email: user.email || "",
        displayName: user.displayName,
        photoURL: user.photoURL || undefined,
        createdAt: new Date(),
        lastLoginAt: new Date(),
      };

      await setDoc(doc(db, "users", user.uid), userData);
    } else {
      // Update last login time
      await updateUserLastLogin(user.uid);
    }

    return { user, error: null };
  } catch (error) {
    const authError = error as AuthError;
    return { user: null, error: getErrorMessage(authError) };
  }
};

// Sign out
export const signOutUser = async (): Promise<{ error: string | null }> => {
  try {
    if (!auth) {
      return { error: "Firebase Auth is not properly initialized" };
    }
    await signOut(auth);
    return { error: null };
  } catch (error) {
    const authError = error as AuthError;
    return { error: getErrorMessage(authError) };
  }
};

// Update user's last login time
const updateUserLastLogin = async (uid: string) => {
  try {
    if (!db) {
      console.warn("Firestore is not initialized, skipping last login update");
      return;
    }
    await setDoc(
      doc(db, "users", uid),
      { lastLoginAt: new Date() },
      { merge: true },
    );
  } catch (error) {
    console.error("Error updating last login:", error);
  }
};

// Get user data from Firestore
export const getUserData = async (uid: string): Promise<UserData | null> => {
  try {
    if (!db) {
      console.warn("Firestore is not initialized, skipping user data fetch");
      return null;
    }

    const userDoc = await getDoc(doc(db, "users", uid));
    if (userDoc.exists()) {
      return userDoc.data() as UserData;
    }
    return null;
  } catch (error: unknown) {
    // Handle specific Firebase offline errors gracefully
    const firebaseError = error as { code?: string; message?: string };
    if (
      firebaseError?.code === "failed-precondition" ||
      firebaseError?.message?.includes("offline") ||
      firebaseError?.message?.includes("network") ||
      firebaseError?.message?.includes("400") ||
      firebaseError?.message?.includes("unavailable")
    ) {
      console.warn(
        "Firebase is offline or experiencing connectivity issues. User data will be available when connection is restored.",
      );
      return null;
    }

    console.error("Error getting user data:", error);
    return null;
  }
};

// Auth state listener
export const onAuthStateChange = (callback: (user: User | null) => void) => {
  if (!auth) {
    console.warn("Firebase Auth is not initialized");
    return () => {};
  }
  return onAuthStateChanged(auth, callback);
};

// Error message helper
const getErrorMessage = (error: AuthError): string => {
  switch (error.code) {
    case "auth/user-not-found":
      return "No account found with this email address.";
    case "auth/wrong-password":
      return "Incorrect password.";
    case "auth/email-already-in-use":
      return "An account with this email already exists.";
    case "auth/weak-password":
      return "Password should be at least 6 characters.";
    case "auth/invalid-email":
      return "Please enter a valid email address.";
    case "auth/user-disabled":
      return "This account has been disabled.";
    case "auth/too-many-requests":
      return "Too many failed attempts. Please try again later.";
    case "auth/operation-not-allowed":
      return "This sign-in method is not enabled.";
    case "auth/popup-closed-by-user":
      return "Sign-in popup was closed before completing the process.";
    case "auth/popup-blocked":
      return "Sign-in popup was blocked by your browser.";
    case "auth/cancelled-popup-request":
      return "Only one popup request is allowed at a time.";
    case "auth/account-exists-with-different-credential":
      return "An account already exists with the same email address but different sign-in credentials.";
    case "auth/requires-recent-login":
      return "This operation requires recent authentication. Please sign in again.";
    case "auth/credential-already-in-use":
      return "This credential is already associated with a different user account.";
    case "auth/invalid-credential":
      return "The provided credential is malformed or has expired.";
    default:
      return error.message || "An unexpected error occurred.";
  }
};
