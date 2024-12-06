"use client";

import { UserMenu } from "@/components/ui/UserMenu";
import { cn } from "@/lib/utils";
import { useSession } from "next-auth/react";
import Link from "next/link";

export default function DashboardNav() {
  const { data: session } = useSession();

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center">
        <div className="mr-4 flex">
          <Link className="mr-6 flex items-center space-x-2" href="/dashboard">
            <span className="font-bold">Speculate</span>
          </Link>
        </div>
        <div className="flex flex-1 items-center space-x-2 justify-end">
          {session?.user ? (
            <UserMenu user={session.user} />
          ) : (
            <Link
              href="/auth/signin"
              className={cn(
                "inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors",
                "focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring",
                "disabled:pointer-events-none disabled:opacity-50",
                "hover:bg-accent hover:text-accent-foreground h-9 px-4 py-2",
                "border border-input bg-background shadow-sm"
              )}
            >
              Sign In
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
