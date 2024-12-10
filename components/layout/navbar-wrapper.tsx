"use client";

import { Navbar } from "@/components/layout/navbar";
import { usePathname } from "next/navigation";

export function NavbarWrapper() {
  const pathname = usePathname();
  
  // Hide navbar on specific project routes (projectId and below)
  if (pathname) {
    const segments = pathname.split('/');
    if (segments[1] === "projects" && segments.length > 2) {
      return null;
    }
  }

  return <Navbar />;
}
