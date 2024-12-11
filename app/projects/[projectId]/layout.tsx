"use client";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft, GitCommit, Loader2, PanelLeft, Save, Settings, Upload } from "lucide-react";
import Link from "next/link";
import { useParams, usePathname, useRouter } from "next/navigation";
import { FlowSelector } from "@/components/dashboard/FlowSelector";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { Suspense } from "react";
import React from "react";
import SettingsModal from "@/app/projects/SettingsModal";
import { NodeSidebar } from "@/components/dashboard/NodeSidebar";

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
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // Extract flowId from pathname if it's a flow page
  const flowId = isFlowPage ? pathname.split('/flows/')[1] : undefined;

  const [flowData, setFlowData] = useState<{
    name: string;
    color: string;
    onePageMode: boolean;
    variables: { name: string; value: string; }[];
    globalVariables: { name: string; value: string; }[];
  } | null>(null);

  const saveFlowRef = React.useRef<() => Promise<void>>();

  // Make setSaveFunction available globally
  useEffect(() => {
    (window as any).setSaveFunction = (fn: () => Promise<void>) => {
      saveFlowRef.current = fn;
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
  }, []);

  useEffect(() => {
    if (isFlowPage && flowId) {
      loadFlowData();
    }
  }, [isFlowPage, flowId]);

  const loadFlowData = async () => {
    if (!flowId) return;

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

      setFlowData({
        name: flow.name || "",
        color: flow.color || "#6366f1",
        onePageMode: flow.onePageMode || false,
        variables: flow.variables || [],
        globalVariables: project.variables || []
      });
    } catch (error) {
      console.error('Error loading flow data:', error);
    }
  };

  // Refresh flow data when settings modal closes
  const handleSettingsModalClose = () => {
    setIsSettingsModalOpen(false);
    if (isFlowPage && flowId) {
      loadFlowData();
      setRefreshTrigger(prev => prev + 1); // Trigger FlowSelector refresh
    }
  };

  return (
    <div className="flex h-screen">
      {isFlowPage && (
        <NodeSidebar
          isCollapsed={isSidebarCollapsed}
          onCollapsedChange={setIsSidebarCollapsed}
          projectId={projectId}
        />
      )}
      <div className="flex flex-col flex-1">
        {/* Navbar */}
        <header className="flex h-14 items-center gap-4 border-b bg-background px-6">
          {isFlowPage && (
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
          )}

          {isFlowPage && (
            <>
              <FlowSelector
                currentFlow={flowId}
                projectId={projectId}
                onFlowSelect={(id) => router.push(`/projects/${projectId}/flows/${id}`)}
                refreshTrigger={refreshTrigger}
              />
              <div className="flex-1" />
              <div className="flex items-center gap-2">
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
                >
                  <GitCommit className="h-4 w-4" />
                  Publish
                </Button>
              </div>
            </>
          )}
        </header>

        {/* Main Content */}
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
    </div>
  );
}