/**
 * Firestore Utilities
 * Provides robust wrappers for Firestore operations with offline handling
 */

import {
  type DocumentData,
  type DocumentReference,
  type DocumentSnapshot,
  doc,
  enableNetwork,
  getDoc,
  getDocs,
  type Query,
  type QuerySnapshot,
  setDoc,
  updateDoc,
} from "firebase/firestore";
import { db } from "./firebase";
import { firebaseMonitor } from "./firebase-monitor";

// Connection retry configuration
const RETRY_ATTEMPTS = 3;
const RETRY_DELAY = 1000; // 1 second

// Utility to wait for a specified time
const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

// Check if error is a connection/offline error (not a permissions error)
const isConnectionError = (error: unknown): boolean => {
  if (!error) return false;

  const errorStr = error.toString().toLowerCase();

  // Special handling for Firestore internal assertion errors
  if (errorStr.includes("internal assertion failed")) {
    console.error("🚨 FIRESTORE INTERNAL ASSERTION FAILED detected:", error);
    return false; // Don't retry these, they need special handling
  }

  const connectionErrors = [
    "offline",
    "network",
    "failed-precondition",
    "unavailable",
    "deadline-exceeded",
    "400",
    "bad request",
    "transport errored",
    "webchannel",
    "err_aborted",
  ];

  // Don't retry on permission errors
  if (
    errorStr.includes("permission-denied") ||
    errorStr.includes("insufficient permissions")
  ) {
    return false;
  }

  return connectionErrors.some((err) => errorStr.includes(err));
};

// Robust wrapper for Firestore getDoc operations
export const safeGetDoc = async (
  docRef: DocumentReference<DocumentData>,
  retryCount = 0,
): Promise<DocumentSnapshot<DocumentData>> => {
  if (!db) {
    throw new Error("Firestore is not initialized");
  }

  try {
    const docSnap = await getDoc(docRef);
    firebaseMonitor.reportSuccess("firestore-read");
    return docSnap;
  } catch (error: unknown) {
    console.error(`Firestore getDoc error (attempt ${retryCount + 1}):`, error);

    if (isConnectionError(error) && retryCount < RETRY_ATTEMPTS) {
      console.warn(`Retrying Firestore operation in ${RETRY_DELAY}ms...`);

      // Try to re-enable network connection
      try {
        await enableNetwork(db);
      } catch (networkError) {
        console.warn("Failed to re-enable network:", networkError);
      }

      await wait(RETRY_DELAY * (retryCount + 1)); // Exponential backoff
      return safeGetDoc(docRef, retryCount + 1);
    }

    firebaseMonitor.reportError(error, "firestore-read");
    throw error;
  }
};

// Robust wrapper for Firestore setDoc operations
export const safeSetDoc = async (
  docRef: DocumentReference<DocumentData>,
  data: DocumentData,
  options?: { merge?: boolean },
  retryCount = 0,
): Promise<void> => {
  if (!db) {
    throw new Error("Firestore is not initialized");
  }

  try {
    if (options) {
      await setDoc(docRef, data, options);
    } else {
      await setDoc(docRef, data);
    }
    firebaseMonitor.reportSuccess("firestore-write");
  } catch (error: unknown) {
    console.error(`Firestore setDoc error (attempt ${retryCount + 1}):`, error);

    if (isConnectionError(error) && retryCount < RETRY_ATTEMPTS) {
      console.log(`Retrying Firestore operation in ${RETRY_DELAY}ms...`);

      // Try to re-enable network connection
      try {
        await enableNetwork(db);
      } catch (networkError) {
        console.warn("Failed to re-enable network:", networkError);
      }

      await wait(RETRY_DELAY * (retryCount + 1));
      return safeSetDoc(docRef, data, options, retryCount + 1);
    }

    firebaseMonitor.reportError(error, "firestore-write");
    throw error;
  }
};

// Robust wrapper for Firestore updateDoc operations
export const safeUpdateDoc = async (
  docRef: DocumentReference<DocumentData>,
  data: Partial<DocumentData>,
  retryCount = 0,
): Promise<void> => {
  if (!db) {
    throw new Error("Firestore is not initialized");
  }

  try {
    await updateDoc(docRef, data);
    firebaseMonitor.reportSuccess("firestore-update");
  } catch (error: unknown) {
    console.error(
      `Firestore updateDoc error (attempt ${retryCount + 1}):`,
      error,
    );

    if (isConnectionError(error) && retryCount < RETRY_ATTEMPTS) {
      console.log(`Retrying Firestore operation in ${RETRY_DELAY}ms...`);

      try {
        await enableNetwork(db);
      } catch (networkError) {
        console.warn("Failed to re-enable network:", networkError);
      }

      await wait(RETRY_DELAY * (retryCount + 1));
      return safeUpdateDoc(docRef, data, retryCount + 1);
    }

    firebaseMonitor.reportError(error, "firestore-update");
    throw error;
  }
};

// Robust wrapper for Firestore query operations
export const safeGetDocs = async (
  q: Query<DocumentData>,
  retryCount = 0,
): Promise<QuerySnapshot<DocumentData>> => {
  if (!db) {
    throw new Error("Firestore is not initialized");
  }

  try {
    const querySnapshot = await getDocs(q);
    firebaseMonitor.reportSuccess("firestore-query");
    return querySnapshot;
  } catch (error: unknown) {
    console.error(
      `Firestore getDocs error (attempt ${retryCount + 1}):`,
      error,
    );

    if (isConnectionError(error) && retryCount < RETRY_ATTEMPTS) {
      console.log(`Retrying Firestore operation in ${RETRY_DELAY}ms...`);

      try {
        await enableNetwork(db);
      } catch (networkError) {
        console.warn("Failed to re-enable network:", networkError);
      }

      await wait(RETRY_DELAY * (retryCount + 1));
      return safeGetDocs(q, retryCount + 1);
    }

    firebaseMonitor.reportError(error, "firestore-query");
    throw error;
  }
};

// Helper to check if Firestore is online
export const checkFirestoreConnection = async (): Promise<boolean> => {
  if (!db) return false;

  try {
    // Try to read a minimal document to test connectivity
    const testDoc = doc(db, "connection-test", "ping");
    await getDoc(testDoc);
    return true;
  } catch (error) {
    console.warn("Firestore connection test failed:", error);
    return false;
  }
};
