// app/projects/[projectId]/flows/layout.tsx
import { ReactNode } from "react";

export default function FlowsLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <div className="min-h-screen bg-base-50">
      {children}
    </div>
  );
}