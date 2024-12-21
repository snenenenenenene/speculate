"use client";

import { cn } from "@/lib/utils";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { User, CreditCard, Coins, Building2 } from "lucide-react";

const sidebarNavItems = [
  {
    title: "Account",
    href: "/settings",
    icon: User,
  },
  {
    title: "Organizations",
    href: "/settings/team",
    icon: Building2,
  },
  {
    title: "Billing",
    href: "/settings/billing",
    icon: CreditCard,
  },
  {
    title: "Credits",
    href: "/settings/credits",
    icon: Coins,
  },
];

export default function SettingsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  return (
    <div className="flex min-h-[calc(100vh-4rem)] flex-col">
      <div className="container mx-auto flex w-full max-w-6xl flex-col gap-6 px-4 py-24">
        <div className="flex flex-col space-y-8 lg:flex-row lg:space-x-12 lg:space-y-0">
          <aside className="lg:w-1/5">
            <nav className="flex space-x-2 lg:flex-col lg:space-x-0 lg:space-y-1">
              {sidebarNavItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium hover:bg-accent",
                    pathname === item.href
                      ? "bg-accent"
                      : "text-muted-foreground"
                  )}
                >
                  <item.icon className="h-4 w-4" />
                  {item.title}
                </Link>
              ))}
            </nav>
          </aside>
          <div className="flex-1 lg:max-w-3xl">{children}</div>
        </div>
      </div>
    </div>
  );
} 