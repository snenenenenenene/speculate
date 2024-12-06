// components/NavWrapper.tsx
"use client";

import { usePathname } from "next/navigation";
import Navbar from "./Navbar";

export function NavWrapper() {
  const pathname = usePathname();
  const isFlowEditor = pathname?.includes('/flows/');
  
  if (isFlowEditor) {
    return null;
  }

  return <Navbar />;
}