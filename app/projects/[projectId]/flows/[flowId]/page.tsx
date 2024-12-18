"use client";

import { Suspense } from "react";
import FlowEditor from "./FlowEditor";
import { Loader2 } from "lucide-react";
import React from "react";

interface PageProps {
  params: { projectId: string; flowId: string };
}

export default function Page({ params }: PageProps) {
  const unwrappedParams = React.use(params);
  const { projectId, flowId } = unwrappedParams;

  return (
    <Suspense fallback={
      <div className="flex h-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    }>
      <FlowEditor
        projectId={projectId}
        flowId={flowId}
      />
    </Suspense>
  );
}