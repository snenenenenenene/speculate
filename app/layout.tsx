// app/layout.tsx
import { NavWrapper } from "@/components/NavWrapper";
import { Providers } from "@/components/Providers";
import "./globals.css";

export const metadata = {
  title: "Speculate",
  description: "Questionnaire creation made easy",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="antialiased font-satoshi bg-base-50 min-h-screen">
        <Providers>
          <NavWrapper />
          {children}
        </Providers>
      </body>
    </html>
  );
}