// app/projects/[projectId]/layout.tsx
"use client";

import { LoadingSpinner } from "@/components/ui/base";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { Activity, Key, LayoutPanelTop, ListTodo, Settings } from "lucide-react";
import Link from "next/link";
import { useParams, usePathname } from "next/navigation";
import { ReactNode } from "react";

const tabs = [
  {
    name: "Overview",
    href: "",
    icon: LayoutPanelTop
  },
  {
    name: "Flows",
    href: "flows",
    icon: ListTodo
  },
  {
    name: "API",
    href: "api",
    icon: Key
  },
  {
    name: "Analytics",
    href: "analytics",
    icon: Activity
  },
  {
    name: "Settings",
    href: "settings",
    icon: Settings
  }
];

export default function ProjectLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const params = useParams();
  const projectId = params.projectId as string;

  // Function to check if a tab is active
  const isTabActive = (tabHref: string) => {
    if (tabHref === "") {
      return pathname === `/projects/${projectId}`;
    }
    return pathname.includes(`/projects/${projectId}/${tabHref}`);
  };

  if (!projectId) {
    return (
      <div className="flex h-full items-center justify-center">
        <LoadingSpinner className="h-6 w-6 text-primary-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-base-50">
      {/* Project Header */}
      <header className="bg-white border-b border-base-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-4">
            <nav className="flex space-x-8">
              {tabs.map((tab) => {
                const isActive = isTabActive(tab.href);
                const href = tab.href === "" ? `/projects/${projectId}` : `/projects/${projectId}/${tab.href}`;
                
                return (
                  <Link
                    key={tab.name}
                    href={href}
                    className={cn(
                      "inline-flex items-center gap-2 px-1 py-2 text-sm font-medium border-b-2 -mb-[1px]",
                      "transition-colors duration-200",
                      isActive
                        ? "border-primary-600 text-primary-600"
                        : "border-transparent text-base-600 hover:text-base-900 hover:border-base-300"
                    )}
                  >
                    <tab.icon className="h-4 w-4" />
                    {tab.name}
                  </Link>
                );
              })}
            </nav>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          {children}
        </motion.div>
      </main>
    </div>
  );
}