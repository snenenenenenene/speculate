"use client";

import { ReactFlowProvider } from "reactflow";
import FlowEditor from "./FlowEditor";
import { useParams } from "next/navigation";

export default function FlowPage() {
  const params = useParams();
  const projectId = params.projectId as string;
  const flowId = params.flowId as string;

  return (
    <ReactFlowProvider>
      <div className="h-full w-full flex">
        <FlowEditor 
          projectId={projectId} 
          flowId={flowId}
        />
      </div>
    </ReactFlowProvider>
  );
}