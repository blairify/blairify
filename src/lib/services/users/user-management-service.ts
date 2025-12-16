/**
 * User Management Service
 * CRUD operations for managing users in Firestore
 */

import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  type Timestamp,
  updateDoc,
  where,
} from "firebase/firestore";
import { db } from "../../firebase";

const USERS_COLLECTION = "users";

export interface UserManagementData {
  uid: string;
  email: string;
  displayName: string;
  photoURL?: string;
  role?: "user" | "admin" | "superadmin";
  isActive: boolean;
  subscription?: {
    plan: "free" | "pro" | "enterprise";
    status: "active" | "cancelled" | "expired";
  };
  createdAt?: Timestamp;
  lastLoginAt?: Timestamp;
}

/**
 * Get all users
 */
export async function getAllUsers(): Promise<UserManagementData[]> {
  if (!db) throw new Error("Firestore not initialized");

  const usersRef = collection(db, USERS_COLLECTION);
  const q = query(usersRef, orderBy("createdAt", "desc"));

  const snapshot = await getDocs(q);
  return snapshot.docs.map((doc) => {
    const data = doc.data();
    return {
      uid: doc.id,
      email: data.email || "",
      displayName: data.displayName || "Unknown",
      photoURL: data.photoURL,
      role: data.role || "user",
      isActive: data.isActive ?? true,
      subscription: data.subscription,
      createdAt: data.createdAt,
      lastLoginAt: data.lastLoginAt,
    } as UserManagementData;
  });
}

/**
 * Get a single user by UID
 */
export async function getUserById(
  uid: string,
): Promise<UserManagementData | null> {
  if (!db) throw new Error("Firestore not initialized");

  const userRef = doc(db, USERS_COLLECTION, uid);
  const snapshot = await getDoc(userRef);

  if (!snapshot.exists()) {
    return null;
  }

  const data = snapshot.data();
  return {
    uid: snapshot.id,
    email: data.email || "",
    displayName: data.displayName || "Unknown",
    photoURL: data.photoURL,
    role: data.role || "user",
    isActive: data.isActive ?? true,
    subscription: data.subscription,
    createdAt: data.createdAt,
    lastLoginAt: data.lastLoginAt,
  } as UserManagementData;
}

/**
 * Create a new user (admin only)
 */
export async function createUser(
  userData: Omit<UserManagementData, "uid" | "createdAt" | "lastLoginAt">,
): Promise<void> {
  if (!db) throw new Error("Firestore not initialized");

  // Generate a unique ID for the user
  const usersRef = collection(db, USERS_COLLECTION);
  const newUserRef = doc(usersRef);

  const newUser = {
    ...userData,
    createdAt: serverTimestamp(),
    lastLoginAt: serverTimestamp(),
    lastActiveAt: serverTimestamp(),
    preferences: {
      preferredDifficulty: "intermediate",
      preferredInterviewTypes: [],
      targetCompanies: [],
      notificationsEnabled: true,
      language: "en",
    },
    subscription: userData.subscription || {
      plan: "free",
      status: "active",
      features: [],
      limits: {
        sessionsPerMonth: 10,
        skillsTracking: 5,
        analyticsRetention: 30,
      },
    },
  };

  await setDoc(newUserRef, newUser);
}

/**
 * Update an existing user
 */
export async function updateUser(
  uid: string,
  updates: Partial<Omit<UserManagementData, "uid" | "createdAt">>,
): Promise<void> {
  if (!db) throw new Error("Firestore not initialized");

  const userRef = doc(db, USERS_COLLECTION, uid);
  await updateDoc(userRef, {
    ...updates,
    updatedAt: serverTimestamp(),
  });
}

/**
 * Delete a user
 */
export async function deleteUser(uid: string): Promise<void> {
  if (!db) throw new Error("Firestore not initialized");

  const userRef = doc(db, USERS_COLLECTION, uid);
  await deleteDoc(userRef);
}

/**
 * Toggle user active status
 */
export async function toggleUserStatus(
  uid: string,
  isActive: boolean,
): Promise<void> {
  if (!db) throw new Error("Firestore not initialized");

  const userRef = doc(db, USERS_COLLECTION, uid);
  await updateDoc(userRef, {
    isActive,
    updatedAt: serverTimestamp(),
  });
}

/**
 * Update user role
 */
export async function updateUserRole(
  uid: string,
  role: "user" | "admin" | "superadmin",
): Promise<void> {
  if (!db) throw new Error("Firestore not initialized");

  const userRef = doc(db, USERS_COLLECTION, uid);
  await updateDoc(userRef, {
    role,
    updatedAt: serverTimestamp(),
  });
}

/**
 * Search users by email or name
 */
export async function searchUsers(
  searchTerm: string,
): Promise<UserManagementData[]> {
  if (!db) throw new Error("Firestore not initialized");

  const usersRef = collection(db, USERS_COLLECTION);
  const snapshot = await getDocs(usersRef);

  const lowerSearch = searchTerm.toLowerCase();

  return snapshot.docs
    .map((doc) => {
      const data = doc.data();
      return {
        uid: doc.id,
        email: data.email || "",
        displayName: data.displayName || "Unknown",
        photoURL: data.photoURL,
        role: data.role || "user",
        isActive: data.isActive ?? true,
        subscription: data.subscription,
        createdAt: data.createdAt,
        lastLoginAt: data.lastLoginAt,
      } as UserManagementData;
    })
    .filter(
      (user) =>
        user.email.toLowerCase().includes(lowerSearch) ||
        user.displayName.toLowerCase().includes(lowerSearch),
    );
}

/**
 * Get users by role
 */
export async function getUsersByRole(
  role: "user" | "admin" | "superadmin",
): Promise<UserManagementData[]> {
  if (!db) throw new Error("Firestore not initialized");

  const usersRef = collection(db, USERS_COLLECTION);
  const q = query(
    usersRef,
    where("role", "==", role),
    orderBy("createdAt", "desc"),
  );

  const snapshot = await getDocs(q);
  return snapshot.docs.map((doc) => {
    const data = doc.data();
    return {
      uid: doc.id,
      email: data.email || "",
      displayName: data.displayName || "Unknown",
      photoURL: data.photoURL,
      role: data.role || "user",
      isActive: data.isActive ?? true,
      subscription: data.subscription,
      createdAt: data.createdAt,
      lastLoginAt: data.lastLoginAt,
    } as UserManagementData;
  });
}
