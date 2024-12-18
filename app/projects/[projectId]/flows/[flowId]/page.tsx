"use client";

import { Suspense, useState } from "react";
import FlowEditor from "./FlowEditor";
import { Loader2 } from "lucide-react";
import React from "react";
import { PublishDialog } from "@/components/flow/PublishDialog";
import { toast } from "sonner";

interface PageProps {
  params: { projectId: string; flowId: string };
}

export default function Page({ params }: PageProps) {
  const { projectId, flowId } = params;
  const [isPublishDialogOpen, setIsPublishDialogOpen] = useState(false);
  const [currentVersion, setCurrentVersion] = useState(1);

  const handlePublish = async (settings: { versionName: string; description: string; autoActivate: boolean }) => {
    try {
      const response = await fetch(`/api/projects/${projectId}/flows/${flowId}/publish`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(settings),
      });

      const data = await response.json();
      console.log('Published flow:', data);

      if (!response.ok) {
        throw new Error(data.error || 'Failed to publish flow');
      }

      setIsPublishDialogOpen(false);
      setCurrentVersion(data.version.version);
      toast.success('Flow published successfully');
      
      // Refresh the page to show updated version info
      window.location.reload();
    } catch (error) {
      console.error('Error publishing flow:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to publish flow');
    }
  };

  return (
    <>
      <Suspense fallback={
        <div className="flex h-full items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      }>
        <FlowEditor
          projectId={projectId}
          flowId={flowId}
          onPublish={() => setIsPublishDialogOpen(true)}
        />
      </Suspense>

      <PublishDialog
        open={isPublishDialogOpen}
        onOpenChange={setIsPublishDialogOpen}
        onPublish={handlePublish}
        projectId={projectId}
        flowId={flowId}
        currentVersion={currentVersion}
      />
    </>
  );
}