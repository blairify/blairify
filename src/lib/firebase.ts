import { type FirebaseApp, getApps, initializeApp } from "firebase/app";
import { type Auth, getAuth } from "firebase/auth";
import {
  CACHE_SIZE_UNLIMITED,
  disableNetwork,
  enableNetwork,
  type Firestore,
  getFirestore,
  initializeFirestore,
} from "firebase/firestore";
import { type Functions, getFunctions } from "firebase/functions";
import { firebaseMonitor } from "./firebase-monitor";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
};

// Validate Firebase configuration
const validateConfig = () => {
  const requiredFields = ["apiKey", "authDomain", "projectId"];
  const missing = requiredFields.filter(
    (field) => !firebaseConfig[field as keyof typeof firebaseConfig],
  );

  if (missing.length > 0) {
    const error = new Error(
      `Missing Firebase configuration: ${missing.join(", ")}`,
    );
    firebaseMonitor.reportError(error, "configuration");
    throw error;
  }
};

// Initialize Firebase with proper typing
let app: FirebaseApp | null;
let auth: Auth | null;
let db: Firestore | null;
let functions: Functions | null;

try {
  validateConfig();
  app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
  auth = getAuth(app);

  // Initialize Firestore with better offline handling
  if (getApps().length === 0) {
    db = initializeFirestore(app, {
      cacheSizeBytes: CACHE_SIZE_UNLIMITED,
      // Removed experimentalForceLongPolling as it causes internal assertion failures in Firebase v12.2.x
    });
  } else {
    db = getFirestore(app);
  }

  functions = getFunctions(app);

  firebaseMonitor.reportSuccess("initialization");
  console.log("🟢 Firebase initialized successfully");
} catch (error) {
  firebaseMonitor.reportError(error, "initialization");
  console.error("🔴 Firebase initialization failed:", error);
  console.error(
    "❗ This might be due to missing environment variables or invalid configuration",
  );

  // Set to null to prevent crashes
  app = null;
  auth = null;
  db = null;
  functions = null;
}

// Monitor Firebase connectivity in development
if (process.env.NODE_ENV === "development" && typeof window !== "undefined") {
  firebaseMonitor.onStatusChange((status) => {
    if (status.lastError?.isConnectionError) {
      console.warn("⚠️ Firebase connection issue detected:", {
        error: status.lastError.message,
        context: status.lastError.context,
        attempts: status.connectionAttempts,
        isOnline: status.isOnline,
      });

      if (status.connectionAttempts > 3) {
        console.error(
          "🚨 Multiple Firebase connection failures. Check your network and Firebase configuration.",
        );
      }
    }
  });
}

// Utility functions for managing Firestore network state
export const enableFirestoreNetwork = async () => {
  if (db) {
    try {
      await enableNetwork(db);
      console.log("🟢 Firestore network enabled");
      firebaseMonitor.reportSuccess("network-enable");
    } catch (error) {
      console.warn("⚠️ Failed to enable Firestore network:", error);
      firebaseMonitor.reportError(error, "network-enable");
    }
  }
};

export const disableFirestoreNetwork = async () => {
  if (db) {
    try {
      await disableNetwork(db);
      console.log("🔴 Firestore network disabled");
      firebaseMonitor.reportSuccess("network-disable");
    } catch (error) {
      console.warn("⚠️ Failed to disable Firestore network:", error);
      firebaseMonitor.reportError(error, "network-disable");
    }
  }
};

// Auto-reconnect logic for network issues
if (typeof window !== "undefined") {
  window.addEventListener("online", () => {
    console.log("🌐 Network back online, enabling Firestore");
    enableFirestoreNetwork();
  });

  window.addEventListener("offline", () => {
    console.log("🌐 Network offline, disabling Firestore");
    disableFirestoreNetwork();
  });
}

export { auth, db, functions };
export default app;
