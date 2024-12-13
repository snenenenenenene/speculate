// app/layout.tsx
import { Inter } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";
import { Toaster } from "sonner";
import { NavbarWrapper } from "@/components/layout/navbar-wrapper";
import { ClientProviders } from "@/components/client-providers";
import { Metadata } from "next";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Speculate",
  description: "Flow-based editor for speculative execution",
  icons: {
    icon: '/favicon.ico',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={cn(
        "min-h-screen bg-background font-sans antialiased",
        inter.className
      )}>
        <ClientProviders>
          <div className="min-h-screen flex flex-col">
            <NavbarWrapper />
            {children}
          </div>
          <Toaster />
        </ClientProviders>
      </body>
    </html>
  );
}