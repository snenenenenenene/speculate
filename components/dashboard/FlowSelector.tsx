// components/dashboard/FlowSelector.tsx
"use client";

import { cn } from "@/lib/utils";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronDown, LayoutGrid, Plus, Search } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "react-hot-toast";

interface Flow {
  id: string;
  name: string;
  createdAt: string;
  color: string;
}

interface FlowSelectorProps {
  projectId: string;
  currentFlow?: string;
  onFlowSelect: (id: string) => void;
  refreshTrigger?: number;
}

export function FlowSelector({
  projectId,
  currentFlow,
  onFlowSelect,
  refreshTrigger,
}: FlowSelectorProps) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [flows, setFlows] = useState<Flow[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentFlowDetails, setCurrentFlowDetails] = useState<Flow | null>(null);

  useEffect(() => {
    const fetchFlows = async () => {
      try {
        const response = await fetch(`/api/projects/${projectId}/flows`);
        const data = await response.json();
        if (response.ok) {
          console.log('Fetched flows:', data.flows);
          setFlows(data.flows);
          if (currentFlow) {
            const current = data.flows.find((f: Flow) => f.id === currentFlow);
            if (current) {
              setCurrentFlowDetails(current);
            }
          }
        } else {
          throw new Error(data.error);
        }
      } catch (error) {
        console.error('Error fetching flows:', error);
        toast.error('Failed to fetch flows');
      } finally {
        setIsLoading(false);
      }
    };

    fetchFlows();
  }, [projectId, currentFlow, refreshTrigger]);

  const filteredFlows = flows.filter(flow =>
    flow.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleCreateFlow = async () => {
    try {
      const response = await fetch(`/api/projects/${projectId}/flows`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: 'New Flow',
          id: projectId
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create flow');
      }

      const data = await response.json();
      router.push(`/projects/${projectId}/flows/${projectId}`);
      setIsOpen(false);
    } catch (error) {
      console.error('Error creating flow:', error);
      toast.error('Failed to create flow');
    }
  };

  if (isLoading) {
    return (
      <div className="h-9 w-48 bg-base-50 rounded-lg animate-pulse" />
    );
  }

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "flex items-center gap-2 px-4 py-1.5 rounded-lg",
          "hover:bg-base-50 transition-colors duration-200",
          "border border-base-200"
        )}
      >
        <LayoutGrid className="h-4 w-4 text-base-500" />
        <div className="flex items-center gap-3">
          <div 
            className="w-2 h-2 rounded-full"
            style={{ backgroundColor: currentFlowDetails?.color || "#18181b" }}
          />
          <span className="text-sm font-medium">
            {currentFlowDetails?.name || "Select a flow"}
          </span>
        </div>
        <ChevronDown className="h-4 w-4 text-base-500" />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute top-full left-0 mt-2 w-72 bg-white rounded-lg shadow-lg border border-base-200 overflow-hidden z-50"
          >
            <div className="p-2">
              <div className="relative mb-2">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-base-400" />
                <input
                  type="text"
                  placeholder="Search flows..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 text-sm bg-base-50 border border-base-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>

              <div className="max-h-64 overflow-y-auto">
                {filteredFlows.map((flow) => (
                  <div
                    key={flow.id}
                    className={cn(
                      "flex items-center gap-3 px-3 py-2 rounded-lg cursor-pointer transition-colors",
                      flow.id === currentFlow
                        ? "bg-zinc-100"
                        : "hover:bg-zinc-50"
                    )}
                    onClick={() => {
                      onFlowSelect(flow.id);
                      setIsOpen(false);
                    }}
                  >
                    <div 
                      className="w-2 h-2 rounded-full"
                      style={{ backgroundColor: flow.color }}
                    />
                    <span className="text-sm font-medium">
                      {flow.name}
                    </span>
                  </div>
                ))}

                {filteredFlows.length === 0 && searchQuery && (
                  <p className="text-center py-3 text-sm text-base-500">
                    No flows found
                  </p>
                )}
              </div>

              <div className="border-t border-base-200 mt-2 pt-2">
                <button
                  onClick={handleCreateFlow}
                  className="w-full flex items-center gap-2 px-3 py-2 text-sm font-medium text-primary-600 hover:bg-primary-50 rounded-lg transition-colors duration-200"
                >
                  <Plus className="h-4 w-4" />
                  Create New Flow
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}