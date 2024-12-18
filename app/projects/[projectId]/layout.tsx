"use client";

import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ThemeToggle } from "@/components/theme-toggle";
import { cn } from "@/lib/utils";

export default function ProjectLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { projectId: string; flowId?: string };
}) {
  const pathname = usePathname();
  const isFlowPage = pathname.includes('/flows/');

  return (
    <div className="flex h-screen bg-background">
      {/* Project Navbar - Only show on non-flow pages */}
      {!isFlowPage && (
        <header className="fixed top-0 left-0 right-0 flex h-14 items-center gap-4 border-b bg-background px-6 z-10">
          <Link href="/projects">
            <Button variant="ghost" size="sm" className="gap-2">
              <ArrowLeft className="h-4 w-4" />
              Back to Projects
            </Button>
          </Link>
          <div className="flex-1" />
          <ThemeToggle />
        </header>
      )}

      {/* Main Content */}
      <main className={cn("flex-1", !isFlowPage && "pt-14")}>
        {children}
      </main>
    </div>
  );
}