"use client";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Settings, Plus } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import Image from "next/image";

export function ProjectNavbar() {
  const pathname = usePathname();
  const { data: session } = useSession();

  if (!session?.user) {
    return null;
  }

  return (
    <nav className="fixed top-0 z-50 w-full border-b border-black/10 bg-white/75 backdrop-blur-sm dark:border-white/10 dark:bg-black/75">
      <div className="mx-auto flex h-16 max-w-screen-xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <div className="flex items-center space-x-4">
          <Link
            href="/projects"
            className="text-xl font-bold text-black dark:text-white"
          >
            Speculate
          </Link>
        </div>

        <div className="flex items-center justify-center flex-1 max-w-2xl">
          <div className="hidden items-center justify-center space-x-4 md:flex">
            <Link
              href="/projects"
              className={`text-sm font-medium ${
                pathname === "/projects"
                  ? "text-black dark:text-white"
                  : "text-black/60 hover:text-black dark:text-white/60 dark:hover:text-white"
              }`}
            >
              All Projects
            </Link>
            <Link
              href="/projects/shared"
              className={`text-sm font-medium ${
                pathname === "/projects/shared"
                  ? "text-black dark:text-white"
                  : "text-black/60 hover:text-black dark:text-white/60 dark:hover:text-white"
              }`}
            >
              Shared with me
            </Link>
          </div>
        </div>

        <div className="flex items-center space-x-4">
          <Button
            variant="outline"
            size="sm"
            className="border-black/20 text-black hover:bg-black/[0.03] dark:border-white/20 dark:text-white dark:hover:bg-white/[0.03]"
          >
            <Plus className="h-4 w-4 mr-2" />
            New Project
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className="flex items-center space-x-2 hover:bg-black/[0.03] dark:hover:bg-white/[0.03] h-8 w-8 p-0"
              >
                {session.user.image ? (
                  <Image
                    src={session.user.image}
                    alt={session.user.name || "User"}
                    width={32}
                    height={32}
                    className="rounded-full"
                  />
                ) : (
                  <div className="h-8 w-8 rounded-full bg-black/10 dark:bg-white/10 flex items-center justify-center">
                    <span className="text-sm font-medium text-black dark:text-white">
                      {session.user.name?.[0] || "U"}
                    </span>
                  </div>
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none">
                    {session.user.name}
                  </p>
                  <p className="text-xs leading-none text-black/60 dark:text-white/60">
                    {session.user.email}
                  </p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link href="/settings" className="flex items-center">
                  <Settings className="mr-2 h-4 w-4" />
                  Settings
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem
                className="text-red-600 dark:text-red-400"
                onClick={() => signOut({ callbackUrl: "/" })}
              >
                Sign out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </nav>
  );
}
