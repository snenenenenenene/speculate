"use client";

import { FlowSelector } from "@/components/dashboard/FlowSelector";
import { NodeSidebar } from "@/components/dashboard/NodeSidebar";
import { QuickActions } from "@/components/dashboard/QuickActions";
import { LoadingSpinner } from "@/components/ui/base";
import { useStores } from "@/hooks/useStores";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useParams, usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { ReactFlowProvider } from "reactflow";
import "reactflow/dist/style.css";
import SettingsModal from "./SettingsModal";

export default function FlowchartLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const params = useParams();
  const router = useRouter();
  const pathname = usePathname();
  const flowchartId = params?.flowchartId as string;
  const { chartStore } = useStores() as any;

  const [isLoading, setIsLoading] = useState(true);
  const [isRedirecting, setIsRedirecting] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [sidebarWidth, setSidebarWidth] = useState(280);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  const pathParts = pathname.split('/');
  const chartId = pathParts.includes('charts') ? pathParts[pathParts.length - 1] : null;
  const currentChart = chartId ? chartStore.getChartInstance(chartId) : null;
  const chartInstances = flowchartId ? chartStore.getChartInstances(flowchartId) : [];

  useEffect(() => {
    const loadFlowchart = async () => {
      if (!flowchartId || isRedirecting) {
        return;
      }

      try {
        setIsLoading(true);
        const response = await fetch(`/api/flowcharts/${flowchartId}`);
        console.log('Layout - Response status:', response.status);

        const data = await response.json();
        console.log('Layout - Response data:', data);

        if (!response.ok) {
          throw new Error(data.error || 'Failed to fetch flowchart');
        }

        if (pathname === `/dashboard/flowcharts/${flowchartId}`) {
          setIsRedirecting(true);
          if (data.charts?.length > 0) {
            console.log('Layout - Redirecting to first chart:', data.charts[0].id);
            router.push(`/dashboard/flowcharts/${flowchartId}/charts/${data.charts[0].id}`);
          } else {
            router.push(`/dashboard/flowcharts/${flowchartId}/charts`);
          }
        }
      } catch (error) {
        console.error('Layout - Error:', error);
        router.push('/dashboard/flowcharts');
      } finally {
        setIsLoading(false);
      }
    };

    loadFlowchart();
  }, [flowchartId, router, pathname, isRedirecting]);

  useEffect(() => {
    if (chartId) {
      console.log('Layout - Setting current dashboard tab:', chartId);
      chartStore.setCurrentDashboardTab(chartId);
    }
  }, [chartId, chartStore]);

  const handleNewFlow = async (flowchartId: string) => {
    try {
      const response = await fetch(`/api/flowcharts/${flowchartId}/charts`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: 'New Chart',
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create new chart');
      }

      const newChart = await response.json();
      router.push(`/dashboard/flowcharts/${flowchartId}/charts/${newChart.id}`);
    } catch (error) {
      console.error('Error creating new chart:', error);
    }
  };

  if (isLoading && pathname === `/dashboard/flowcharts/${flowchartId}`) {
    return (
      <div className="h-screen flex items-center justify-center">
        <LoadingSpinner className="h-6 w-6" />
      </div>
    );
  }

  return (
    <ReactFlowProvider>
      <div className="flex h-screen overflow-hidden bg-gray-50">
        <div className="absolute top-0 left-0 right-0 h-16 bg-white border-b border-gray-200 z-50">
          <div className="h-full flex items-center px-4 gap-4">
            <button
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors"
              aria-label={isSidebarOpen ? "Hide sidebar" : "Show sidebar"}
            >
              {isSidebarOpen ? (
                <ChevronLeft className="h-5 w-5 text-gray-600" />
              ) : (
                <ChevronRight className="h-5 w-5 text-gray-600" />
              )}
            </button>

            <FlowSelector
              currentFlow={currentChart}
              chartInstances={chartInstances}
              currentTab={chartId || ""}
              onFlowSelect={(_, chartId) =>
                router.push(`/dashboard/flowcharts/${flowchartId}/charts/${chartId}`)
              }
              onNewFlow={handleNewFlow}
              flowchartId={flowchartId}
            />

            <QuickActions onOpenSettings={() => setIsSettingsOpen(true)} />
          </div>
        </div>

        <AnimatePresence initial={false}>
          {isSidebarOpen && (
            <motion.aside
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: sidebarWidth, opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="h-screen border-r border-gray-200 bg-white flex flex-col overflow-hidden relative mt-16"
            >
              <NodeSidebar
                width={sidebarWidth}
                onWidthChange={setSidebarWidth}
              />

              <div className="border-t border-gray-200 p-3 bg-gray-50">
                <div className="text-xs text-gray-500 space-y-1">
                  <div className="flex items-center gap-2">
                    <kbd className="px-2 py-1 bg-gray-100 rounded text-gray-600">
                      Drag
                    </kbd>
                    <span>to add nodes</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <kbd className="px-2 py-1 bg-gray-100 rounded text-gray-600">
                      ⌘ S
                    </kbd>
                    <span>to save</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <kbd className="px-2 py-1 bg-gray-100 rounded text-gray-600">
                      Delete
                    </kbd>
                    <span>to remove node</span>
                  </div>
                </div>
              </div>
            </motion.aside>
          )}
        </AnimatePresence>

        <div className="flex-1 relative flex flex-col overflow-hidden mt-16">
          <main className="flex-1 relative bg-gray-50 pb-16">
            {children}
          </main>
        </div>
      </div>

      {currentChart && (
        <SettingsModal
          isOpen={isSettingsOpen}
          onClose={() => setIsSettingsOpen(false)}
          currentInstance={currentChart}
        />
      )}

      <style jsx global>{`
        .hide-scrollbar {
          scrollbar-width: none;
          -ms-overflow-style: none;
        }
        .hide-scrollbar::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </ReactFlowProvider>
  );
}