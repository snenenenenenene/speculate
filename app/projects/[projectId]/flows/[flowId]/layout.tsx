"use client";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Loader2, PanelLeft, Save, Settings, Upload, GitCommit, ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import { FlowSelector } from "@/components/dashboard/FlowSelector";
import { useState, useEffect, useCallback } from "react";
import { toast } from "sonner";
import React from "react";
import SettingsModal from "@/app/projects/SettingsModal";
import { NodeSidebar } from "@/components/dashboard/NodeSidebar";
import { PublishDialog } from "@/components/flow/PublishDialog";
import { ThemeToggle } from "@/components/theme-toggle";
import Link from "next/link";

interface Variable {
  name: string;
  value: string;
  scope: 'local' | 'global';
}

interface FlowData {
  name: string;
  color: string;
  onePageMode: boolean;
  variables: Variable[];
  globalVariables: Variable[];
  version?: number;
  isPublished?: boolean;
  publishedAt?: string;
  content?: string;
}

interface FlowLayoutProps {
  children: React.ReactNode;
  params: { projectId: string; flowId: string };
}

export default function FlowLayout({
  children,
  params,
}: FlowLayoutProps) {
  const unwrappedParams = React.use(params);
  const { projectId, flowId } = unwrappedParams;
  const router = useRouter();
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [isPublishDialogOpen, setIsPublishDialogOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const [flowData, setFlowData] = useState<FlowData | null>(null);

  const saveFlowRef = React.useRef<() => Promise<void>>();

  // Make setSaveFunction available globally
  useEffect(() => {
    (window as any).setSaveFunction = (fn: () => Promise<void>) => {
      saveFlowRef.current = fn;
    };

    return () => {
      (window as any).setSaveFunction = null;
    };
  }, []);

  const handleSave = async () => {
    if (!saveFlowRef.current) {
      toast.error('No save function available');
      return;
    }

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
  };

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key === 's') {
        event.preventDefault();
        handleSave();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleSave]);

  const loadFlowData = useCallback(async () => {
    try {
      // Fetch both flow and project data
      const [flowResponse, projectResponse] = await Promise.all([
        fetch(`/api/projects/${projectId}/flows/${flowId}`),
        fetch(`/api/projects/${projectId}`)
      ]);

      if (!flowResponse.ok) throw new Error('Failed to load flow data');
      if (!projectResponse.ok) throw new Error('Failed to load project data');
      
      const { flow } = await flowResponse.json();
      const { project } = await projectResponse.json();

      // Transform variables to include scope
      const localVariables = (flow.variables || []).map((v: any) => ({
        ...v,
        scope: 'local' as const
      }));
      const globalVariables = (project.variables || []).map((v: any) => ({
        ...v,
        scope: 'global' as const
      }));

      setFlowData({
        name: flow.name || "",
        color: flow.color || "#6366f1",
        onePageMode: flow.onePageMode || false,
        variables: localVariables,
        globalVariables: globalVariables,
        version: flow.version,
        isPublished: flow.isPublished,
        publishedAt: flow.publishedAt,
        content: flow.content,
      });
    } catch (error) {
      console.error('Error loading flow data:', error);
    }
  }, [projectId, flowId]);

  useEffect(() => {
    loadFlowData();
  }, [loadFlowData]);

  // Refresh flow data when settings modal closes
  const handleSettingsModalClose = useCallback(() => {
    setIsSettingsModalOpen(false);
    // Ensure we reload the flow data
    loadFlowData().then(() => {
      // After loading flow data, trigger a refresh of the FlowSelector
      setRefreshTrigger(prev => prev + 1);
      // Also refresh the router to ensure all components are updated
      router.refresh();
    });
  }, [loadFlowData, router]);

  const handlePublishFlow = useCallback(async (settings: any) => {
    // Save the current flow state
    if (!saveFlowRef.current) {
      toast.error('Flow editor not ready');
      return;
    }

    await saveFlowRef.current();

    // Get the latest flow data
    const flowResponse = await fetch(`/api/projects/${projectId}/flows/${flowId}`);
    const { flow } = await flowResponse.json();

    // Parse the content
    const flowContent = flow.content ? JSON.parse(flow.content) : null;

    const response = await fetch(`/api/projects/${projectId}/flows/${flowId}/publish`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        ...settings,
        content: flowContent,
      })
    });
    
    const result = await response.json();
    console.log('Publish response:', result);

    if (result.success && result.version && result.flow) {
      toast.success('Flow published successfully');
      setIsPublishDialogOpen(false);
      setRefreshTrigger(prev => prev + 1); // Refresh flow list
      loadFlowData(); // Refresh flow data to update version info
    }
  }, [projectId, flowId, loadFlowData]);

  return (
    <div className="flex-1 flex flex-col h-full">
      {/* Flow Navbar */}
      <header className="flex h-14 items-center gap-4 border-b bg-background px-6">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
          className="h-8 w-8 mr-2"
        >
          <PanelLeft className={cn("h-4 w-4 transition-transform", 
            isSidebarCollapsed && "rotate-180"
          )} />
          <span className="sr-only">Toggle Sidebar</span>
        </Button>

        <FlowSelector
          currentFlow={flowId}
          projectId={projectId}
          onFlowSelect={(id) => router.push(`/projects/${projectId}/flows/${id}`)}
          refreshTrigger={refreshTrigger}
        />

        <div className="flex-1" />
        
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsImportModalOpen(true)}
            className="gap-2"
          >
            <Upload className="h-4 w-4" />
            Import
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsSettingsModalOpen(true)}
            className="gap-2"
          >
            <Settings className="h-4 w-4" />
            Settings
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleSave}
            className="gap-2"
            disabled={isSaving}
          >
            {isSaving ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Save className="h-4 w-4" />
            )}
            Save
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="gap-2"
            onClick={() => setIsPublishDialogOpen(true)}
          >
            <GitCommit className="h-4 w-4" />
            Publish
          </Button>
        </div>
      </header>

      {/* Main Content with Sidebar */}
      <div className="flex flex-1 overflow-hidden">
        <NodeSidebar
          isCollapsed={isSidebarCollapsed}
          onCollapsedChange={setIsSidebarCollapsed}
          projectId={projectId}
        >
          <div className={cn("px-3 pt-4 mb-2", isSidebarCollapsed ? "hidden" : "block")}>
            <Link
              href={`/projects/${params.projectId}`}
              className={cn(
                "flex items-center gap-2 text-sm font-medium",
                "hover:text-accent-foreground"
              )}
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Project
            </Link>
          </div>
        </NodeSidebar>
        <main className="flex-1 overflow-hidden">
          {children}
        </main>
      </div>

      {/* Modals */}
      <SettingsModal
        isOpen={isSettingsModalOpen}
        onClose={handleSettingsModalClose}
        projectId={projectId}
        flowId={flowId}
        initialData={flowData}
      />

      {/* Publish Dialog */}
      <PublishDialog
        open={isPublishDialogOpen}
        onOpenChange={setIsPublishDialogOpen}
        onPublish={handlePublishFlow}
        projectId={projectId}
        flowId={flowId}
        currentVersion={flowData?.version || 0}
      />
    </div>
  );
}