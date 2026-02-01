import { cert, getApps, initializeApp } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";

type ServiceAccount = {
  projectId: string;
  clientEmail: string;
  privateKey: string;
};

interface RawServiceAccount {
  project_id?: string;
  client_email?: string;
  private_key?: string;
}

function getServiceAccount(): ServiceAccount | null {
  const raw = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;
  if (!raw) {
    console.error("FIREBASE_SERVICE_ACCOUNT_KEY is not set");
    return null;
  }

  try {
    const parsed = JSON.parse(raw) as RawServiceAccount;
    if (!parsed.project_id || !parsed.client_email || !parsed.private_key) {
      console.error(
        "FIREBASE_SERVICE_ACCOUNT_KEY is missing required fields:",
        {
          hasProjectId: !!parsed.project_id,
          hasClientEmail: !!parsed.client_email,
          hasPrivateKey: !!parsed.private_key,
        },
      );
      return null;
    }

    return {
      projectId: parsed.project_id,
      clientEmail: parsed.client_email,
      privateKey: parsed.private_key.replace(/\\n/g, "\n"),
    };
  } catch (e) {
    console.error("Failed to parse FIREBASE_SERVICE_ACCOUNT_KEY:", e);
    return null;
  }
}

export function getAdminFirestore() {
  if (getApps().length === 0) {
    const serviceAccount = getServiceAccount();
    if (!serviceAccount) {
      throw new Error(
        "Missing FIREBASE_SERVICE_ACCOUNT_KEY for firebase-admin initialization",
      );
    }

    initializeApp({ credential: cert(serviceAccount) });
  }

  return getFirestore();
}
