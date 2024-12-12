// app/layout.tsx
import { Inter } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";
import { Toaster } from "sonner";
import { NavbarWrapper } from "@/components/layout/navbar-wrapper";
import { ClientProviders } from "@/components/client-providers";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "Speculate",
  description: "Flow-based editor for speculative execution",
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