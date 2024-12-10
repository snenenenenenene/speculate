// app/projects/[projectId]/flows/layout.tsx
import { ReactNode } from "react";

export default function FlowsLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <div className="h-screen bg-base-50 flex">
      {children}
    </div>
  );
}