/**
 * Firebase Status Monitor
 * Provides real-time monitoring of Firebase connection status
 * and helps debug connection issues
 */

export class FirebaseStatusMonitor {
  private static instance: FirebaseStatusMonitor;
  private listeners: ((status: FirebaseStatus) => void)[] = [];
  private currentStatus: FirebaseStatus = {
    isOnline: true,
    isFirebaseConnected: false,
    lastError: null,
    connectionAttempts: 0,
  };

  static getInstance(): FirebaseStatusMonitor {
    if (!FirebaseStatusMonitor.instance) {
      FirebaseStatusMonitor.instance = new FirebaseStatusMonitor();
    }
    return FirebaseStatusMonitor.instance;
  }

  constructor() {
    if (typeof window !== "undefined") {
      // Monitor network status
      window.addEventListener("online", () => {
        this.updateStatus({ isOnline: true });
      });

      window.addEventListener("offline", () => {
        this.updateStatus({ isOnline: false, isFirebaseConnected: false });
      });

      // Initialize with current network status
      this.updateStatus({ isOnline: navigator.onLine });
    }
  }

  updateStatus(updates: Partial<FirebaseStatus>) {
    this.currentStatus = { ...this.currentStatus, ...updates };
    this.listeners.forEach((listener) => {
      listener(this.currentStatus);
    });
  }

  getStatus(): FirebaseStatus {
    return { ...this.currentStatus };
  }

  onStatusChange(listener: (status: FirebaseStatus) => void): () => void {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter((l) => l !== listener);
    };
  }

  reportError(error: Error | unknown, context: string) {
    const isConnectionError = this.isConnectionError(error);

    this.updateStatus({
      lastError: {
        message: error instanceof Error ? error.message : "Unknown error",
        code: (error as { code?: string })?.code || "unknown",
        context,
        timestamp: new Date(),
        isConnectionError,
      },
      isFirebaseConnected: !isConnectionError,
      connectionAttempts: isConnectionError
        ? this.currentStatus.connectionAttempts + 1
        : 0,
    });
  }

  reportSuccess(_context: string) {
    this.updateStatus({
      isFirebaseConnected: true,
      lastError: null,
      connectionAttempts: 0,
    });
  }

  private isConnectionError(error: unknown): boolean {
    if (!error) return false;

    const connectionIndicators = [
      "offline",
      "network",
      "failed-precondition",
      "unavailable",
      "deadline-exceeded",
      "400",
      "bad request",
      "WebChannelConnection",
      "transport errored",
      "Listen",
      "webchannel_blob",
      "ERR_ABORTED",
      "gsessionid",
      "firestore.googleapis.com",
    ];

    const errorStr = JSON.stringify(error).toLowerCase();
    return connectionIndicators.some((indicator) =>
      errorStr.includes(indicator),
    );
  }
}

export interface FirebaseStatus {
  isOnline: boolean;
  isFirebaseConnected: boolean;
  lastError: {
    message: string;
    code: string;
    context: string;
    timestamp: Date;
    isConnectionError: boolean;
  } | null;
  connectionAttempts: number;
}

// Global instance
export const firebaseMonitor = FirebaseStatusMonitor.getInstance();
