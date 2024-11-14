"use client";

import { FlowSelector } from "@/components/dashboard/FlowSelector";
import ImportExportModal from "@/components/dashboard/ImportExportModal";
import { NodeSidebar } from "@/components/dashboard/NodeSidebar";
import { QuickActions } from "@/components/dashboard/QuickActions";
import { LoadingSpinner } from "@/components/ui/base";
import { useStores } from "@/hooks/useStores";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import { ReactFlowProvider } from "reactflow";
import "reactflow/dist/style.css";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { chartStore, utilityStore } = useStores();
  const { chartInstances, setChartInstances, addNewTab } = chartStore;
  const { currentTab, setCurrentTab } = utilityStore;
  const router = useRouter();

  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [sidebarWidth, setSidebarWidth] = useState(280);
  const [isImportExportModalOpen, setIsImportExportModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadChartInstances = async () => {
      try {
        const response = await fetch("/api/load-chart");
        if (response.ok) {
          const data = await response.json();
          if (data.content) {
            const parsedContent = JSON.parse(data.content);
            setChartInstances(parsedContent);
            if (parsedContent.length > 0 && !currentTab) {
              setCurrentTab(parsedContent[0].id);
              router.push(`/dashboard/${parsedContent[0].id}`);
            }
          }
        }
      } catch (error) {
        console.error("Failed to load chart instances:", error);
        toast.error("Failed to load flows");
      } finally {
        setIsLoading(false);
      }
    };

    loadChartInstances();
  }, [setChartInstances, setCurrentTab, currentTab, router]);

  const handleAddNewFlow = () => {
    const newTabName = `New Flow ${chartInstances.length + 1}`;
    const newTabId = addNewTab(newTabName);
    router.push(`/dashboard/${newTabId}`);
  };

  const currentFlow = chartInstances.find(
    (instance) => instance.id === currentTab
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <LoadingSpinner size={40} />
          <p className="mt-4 text-gray-600">Loading your workspace...</p>
        </div>
      </div>
    );
  }

  return (
    <ReactFlowProvider>
      <div className="flex h-screen overflow-hidden bg-gray-50">
        {/* Top Navigation Bar */}
        <div className="absolute top-0 left-0 right-0 h-16 bg-white border-b border-gray-200 z-50">
          <div className="h-full flex items-center px-4 gap-4">
            {/* Sidebar Toggle */}
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

            {/* Flow Selector */}
            <FlowSelector
              currentFlow={currentFlow}
              chartInstances={chartInstances}
              currentTab={currentTab}
              onFlowSelect={(id) => {
                setCurrentTab(id);
                router.push(`/dashboard/${id}`);
              }}
              onNewFlow={handleAddNewFlow}
            />

            {/* Quick Actions */}
            {currentFlow && (
              <QuickActions
                onExportClick={() => setIsImportExportModalOpen(true)}
              />
            )}
          </div>
        </div>

        {/* Sidebar */}
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

              {/* Keyboard Shortcuts */}
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

        {/* Main Content Area */}
        <div className="flex-1 relative flex flex-col overflow-hidden mt-16">
          <main className="flex-1 relative bg-gray-50 pb-16">
            {children}
          </main>
        </div>
      </div>

      {/* Import/Export Modal */}
      {isImportExportModalOpen && (
        <ImportExportModal
          isOpen={isImportExportModalOpen}
          onClose={() => setIsImportExportModalOpen(false)}
          chartStore={chartStore}
        />
      )}

      {/* Global Styles */}
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