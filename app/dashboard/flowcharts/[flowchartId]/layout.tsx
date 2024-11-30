"use client";

import { FlowSelector } from "@/components/dashboard/FlowSelector";
import { NodeSidebar } from "@/components/dashboard/NodeSidebar";
import { QuickActions } from "@/components/dashboard/QuickActions";
import { LoadingSpinner } from "@/components/ui/base";
import { useStores } from "@/hooks/useStores";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useParams, usePathname, useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
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
  const [error, setError] = useState<string | null>(null);
  const [isRedirecting, setIsRedirecting] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [sidebarWidth, setSidebarWidth] = useState(280);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [hasInitialLoad, setHasInitialLoad] = useState(false);

  const pathParts = pathname.split('/');
  const chartId = pathParts.includes('charts') ? pathParts[pathParts.length - 1] : null;
  const currentChart = chartId ? chartStore.getChartInstance(chartId) : null;

  const chartInstances = chartStore.chartInstances.filter(
    (chart: any) => chart.flowchartId === flowchartId
  );

  const loadFlowchart = useCallback(async () => {
    if (!flowchartId || hasInitialLoad) return;

    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch(`/api/flowcharts/${flowchartId}`, {
        cache: 'no-store',
        headers: {
          'Cache-Control': 'no-cache'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch flowchart');
      }

      const data = await response.json();

      if (data.charts) {
        chartStore.setChartInstances(data.charts);
        setHasInitialLoad(true);

        if (pathname === `/dashboard/flowcharts/${flowchartId}` && data.charts.length > 0) {
          setIsRedirecting(true);
          router.push(`/dashboard/flowcharts/${flowchartId}/charts/${data.charts[0].id}`);
        }
      }
    } catch (error: any) {
      console.error('Failed to load flowchart:', error);
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  }, [flowchartId, pathname, router, chartStore, hasInitialLoad]);

  useEffect(() => {
    if (!flowchartId || isRedirecting) return;

    loadFlowchart();

    return () => {
      setIsRedirecting(false);
    };
  }, [loadFlowchart, flowchartId, isRedirecting]);

  useEffect(() => {
    if (chartId) {
      chartStore.setCurrentDashboardTab(chartId);
    }
  }, [chartId, chartStore]);

  const handleNewFlow = async () => {
    if (!flowchartId) return;

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
    } catch (error: any) {
      console.error('Error creating new chart:', error);
      setError(error.message);
    }
  };

  if (isLoading && !hasInitialLoad) {
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
            </motion.aside>
          )}
        </AnimatePresence>

        <div className="flex-1 relative flex flex-col overflow-hidden mt-16">
          <main className="flex-1 relative bg-gray-50">
            {error ? (
              <div className="p-4 text-red-600 bg-red-50 rounded-lg m-4">
                {error}
              </div>
            ) : (
              children
            )}
          </main>
        </div>

        {currentChart && (
          <SettingsModal
            isOpen={isSettingsOpen}
            onClose={() => setIsSettingsOpen(false)}
            currentInstance={currentChart}
          />
        )}
      </div>
    </ReactFlowProvider>
  );
}