import { cert, getApps, initializeApp } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";

type ServiceAccount = {
  projectId: string;
  clientEmail: string;
  privateKey: string;
};

function getServiceAccount(): ServiceAccount | null {
  const raw = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;
  if (!raw) return null;

  try {
    const parsed = JSON.parse(raw) as Partial<ServiceAccount>;
    if (!parsed.projectId || !parsed.clientEmail || !parsed.privateKey) {
      return null;
    }

    return {
      projectId: parsed.projectId,
      clientEmail: parsed.clientEmail,
      privateKey: parsed.privateKey.replace(/\\n/g, "\n"),
    };
  } catch {
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
