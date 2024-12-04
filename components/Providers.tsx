'use client';

import { SessionProvider } from "next-auth/react";
import { useEffect } from "react";
import { useStores } from "@/hooks/useStores";

export function Providers({ children }: { children: React.ReactNode }) {
  const { utilityStore } = useStores() as any;

  useEffect(() => {
    // Initialize the utility store
    utilityStore.initializeStore();
  }, [utilityStore]);

  return <SessionProvider>{children}</SessionProvider>;
}