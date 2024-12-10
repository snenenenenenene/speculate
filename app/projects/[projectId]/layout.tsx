"use client";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft, GitCommit, Loader2, Save, Settings, Upload } from "lucide-react";
import Link from "next/link";
import { useParams, usePathname, useRouter } from "next/navigation";
import { FlowSelector } from "@/components/dashboard/FlowSelector";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { Suspense } from "react";
import React from "react";
import SettingsModal from "@/app/projects/SettingsModal";

export default function ProjectLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { projectId: string; flowId?: string };
}) {
  const unwrappedParams = React.use(params);
  const projectId = unwrappedParams.projectId;
  const pathname = usePathname();
  const router = useRouter();
  const isFlowPage = pathname.includes('/flows/');
  
  // Extract flowId from pathname if it's a flow page
  const flowId = isFlowPage ? pathname.split('/flows/')[1] : undefined;

  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [flowData, setFlowData] = useState<{
    name: string;
    color: string;
    onePageMode: boolean;
    variables: { name: string; value: string; }[];
  } | null>(null);

  const saveFlowRef = React.useRef<() => Promise<void>>();

  const setSaveFunction = (fn: () => Promise<void>) => {
    saveFlowRef.current = fn;
  };

  const handleSave = async () => {
    if (saveFlowRef.current) {
      setIsSaving(true);
      try {
        await saveFlowRef.current();
        toast.success('Flow saved successfully');
      } catch (error) {
        console.error('Error saving flow:', error);
        toast.error('Failed to save flow');
      } finally {
        setIsSaving(false);
      }
    }
  };

  const handleImportExport = () => {
    setIsImportModalOpen(true);
    toast.promise(
      new Promise((resolve) => {
        setTimeout(resolve, 2000);
      }),
      {
        loading: 'Importing...',
        success: 'Flow imported successfully',
        error: 'Failed to import flow',
      }
    );
  };

  const handleCommit = () => {
    toast.promise(
      new Promise((resolve, reject) => {
        // Simulate random success/failure
        setTimeout(() => {
          Math.random() > 0.3 ? resolve(true) : reject(new Error("Failed to commit"));
        }, 2000);
      }),
      {
        loading: 'Committing changes...',
        success: 'Changes committed successfully',
        error: 'Failed to commit changes',
      }
    );
  };

  const handleOpenSettings = async () => {
    if (!flowId) return;

    try {
      const response = await fetch(`/api/projects/${params.projectId}/flows/${flowId}`);
      if (!response.ok) throw new Error('Failed to load flow settings');
      
      const data = await response.json();
      await new Promise(resolve => {
        setFlowData(data);
        resolve(null);
      });
      setIsSettingsModalOpen(true);
    } catch (error) {
      console.error('Error loading flow settings:', error);
      toast.error('Failed to load flow settings');
    }
  };

  useEffect(() => {
    window.setSaveFunction = (fn: () => Promise<void>) => {
      saveFlowRef.current = fn;
    };
  }, []);

  useEffect(() => {
    const handleKeyDown = async (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key === 's') {
        event.preventDefault();
        handleSave();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleSave]);

  return (
    <div className="flex h-screen w-full flex-col">
      {/* Header */}
      <header className="flex h-14 items-center justify-between gap-4 border-b bg-background px-4">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            asChild
            className="gap-2"
          >
            <Link href={isFlowPage ? `/projects/${projectId}` : '/projects'}>
              <ArrowLeft className="h-4 w-4" />
              {isFlowPage ? 'Back to Project' : 'Back to Projects'}
            </Link>
          </Button>

          {isFlowPage && (
            <>
              <Separator orientation="vertical" className="h-6" />
              <FlowSelector
                currentFlow={flowId}
                projectId={projectId}
                onFlowSelect={(id) => router.push(`/projects/${projectId}/flows/${id}`)}
              />
            </>
          )}
        </div>

        {isFlowPage && (
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Button
                onClick={handleSave}
                disabled={isSaving}
                size="sm"
                className="gap-2"
              >
                {isSaving ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Saving
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4" />
                    Save
                    <span className="text-xs text-muted-foreground ml-2">⌘S</span>
                  </>
                )}
              </Button>

              <Button
                variant="ghost"
                size="sm"
                onClick={handleImportExport}
                className="gap-2"
              >
                <Upload className="h-4 w-4" />
                Import/Export
              </Button>

              <Button
                variant="ghost"
                size="sm"
                onClick={handleCommit}
                className="gap-2"
              >
                <GitCommit className="h-4 w-4" />
                Commit
              </Button>
            </div>

            <Separator orientation="vertical" className="h-6" />

            <Button
              variant="ghost"
              size="sm"
              onClick={handleOpenSettings}
              className="gap-2"
            >
              <Settings className="h-4 w-4" />
              Settings
            </Button>
          </div>
        )}
      </header>

      {/* Main Content */}
      <main className="flex-1 overflow-hidden w-full h-full">
        {children}
      </main>

      {/* Modals */}
      {isFlowPage && flowId && (
        <SettingsModal
          isOpen={isSettingsModalOpen}
          onClose={() => setIsSettingsModalOpen(false)}
          flowId={flowId}
          initialData={flowData}
          name={flowData?.name || ""}
          color={flowData?.color || "#6366f1"}
          onePageMode={flowData?.onePageMode || false}
          variables={flowData?.variables || []}
        />
      )}
    </div>
  );
}