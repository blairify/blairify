"use client";

import type { ReactNode } from "react";
import { SWRConfig } from "swr";

interface SWRProviderProps {
  children: ReactNode;
}

export function SWRProvider({ children }: SWRProviderProps) {
  return (
    <SWRConfig
      value={{
        // Global SWR configuration
        revalidateOnFocus: false,
        revalidateOnReconnect: false,
        refreshInterval: 0,
        dedupingInterval: 5 * 60 * 1000, // 5 minutes
        keepPreviousData: true,
        errorRetryCount: 2,
        errorRetryInterval: 3000,
        onError: (error, key) => {
          console.error("SWR Error:", { key, error: error.message });
        },
        onSuccess: (data, key) => {
          console.info("SWR Success:", {
            key,
            dataLength: Array.isArray(data) ? data.length : "non-array",
          });
        },
      }}
    >
      {children}
    </SWRConfig>
  );
}
