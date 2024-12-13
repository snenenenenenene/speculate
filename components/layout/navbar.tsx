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
import { Settings } from "lucide-react";
import { signIn, signOut, useSession } from "next-auth/react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";

export function Navbar() {
  const pathname = usePathname();
  const { data: session, status } = useSession();

  return (
    <nav className="fixed top-0 z-50 w-full border-b border-black/10 bg-white/75 backdrop-blur-sm dark:border-white/10 dark:bg-black/75">
      <div className="mx-auto flex h-16 max-w-screen-xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <div className="flex items-center space-x-4">
          <Link
            href="/"
            className="text-xl flex font-bold text-black dark:text-white"
          >
            		<div className="w-8 h-8 relative transition-transform duration-300 group-hover:scale-110">
						<img
							src="/logo.png"
							alt="Speculate Logo"
							className="object-cover w-full h-full"
						/>
					</div>
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
              Projects
            </Link>
            <Link
              href="/docs"
              className={`text-sm font-medium ${
                pathname === "/docs"
                  ? "text-black dark:text-white"
                  : "text-black/60 hover:text-black dark:text-white/60 dark:hover:text-white"
              }`}
            >
              Documentation
            </Link>
            <Link
              href="/pricing"
              className={`text-sm font-medium ${
                pathname === "/pricing"
                  ? "text-black dark:text-white"
                  : "text-black/60 hover:text-black dark:text-white/60 dark:hover:text-white"
              }`}
            >
              Pricing
            </Link>
          </div>
        </div>

        <div className="flex items-center space-x-4">
          {status === "loading" ? (
            <div className="h-8 w-8 animate-pulse rounded-full bg-black/10 dark:bg-white/10" />
          ) : status === "authenticated" && session?.user ? (
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
          ) : (
            <Button
              variant="outline"
              className="border-black/20 text-black hover:bg-black/[0.03] dark:border-white/20 dark:text-white dark:hover:bg-white/[0.03]"
              onClick={() => signIn("google")}
            >
              Sign in
            </Button>
          )}
        </div>
      </div>
    </nav>
  );
}
