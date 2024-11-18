/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import {
  EndNode, FunctionNode, MultipleChoiceNode, SingleChoiceNode,
  StartNode, WeightNode, YesNoNode
} from "@/components/nodes/index";
import { LoadingSpinner } from "@/components/ui/base";
import { useStores } from "@/hooks/useStores";
import { generateChart } from "@/lib/ai-service";
import { cn } from "@/lib/utils";
import { AnimatePresence, motion } from "framer-motion";
import { Command, Lightbulb, SaveAll, Sparkles, X } from "lucide-react";
import { useRouter } from "next/navigation";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { Toaster, toast } from "react-hot-toast";
import ReactFlow, {
  Background, BackgroundVariant,
  BaseEdge,
  Connection, ConnectionLineType,
  Controls,
  EdgeLabelRenderer, EdgeProps,
  MiniMap,
  getSmoothStepPath,
  useReactFlow
} from "reactflow";

function EditableEdge({ id, sourceX, sourceY, targetX, targetY, sourcePosition, targetPosition, style = {}, markerEnd }: EdgeProps) {
  const { setEdges } = useReactFlow();
  const [edgePath, labelX, labelY] = getSmoothStepPath({
    sourceX, sourceY, sourcePosition, targetX, targetY, targetPosition,
  });

  const onEdgeClick = () => {
    setEdges((edges) => edges.filter((edge) => edge.id !== id));
  };

  return (
    <>
      <BaseEdge path={edgePath} markerEnd={markerEnd} style={style} />
      <EdgeLabelRenderer>
        <div
          style={{
            position: "absolute",
            transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
            fontSize: 12,
            pointerEvents: "all",
          }}
          className="nodrag nopan"
        >
          <button
            className="w-5 h-5 bg-gray-200 dark:bg-gray-800 border border-white rounded-full text-xs leading-none hover:shadow-md"
            onClick={onEdgeClick}
          >×</button>
        </div>
      </EdgeLabelRenderer>
    </>
  );
}

const nodeTypes = {
  yesNo: YesNoNode,
  singleChoice: SingleChoiceNode,
  multipleChoice: MultipleChoiceNode,
  endNode: EndNode,
  startNode: StartNode,
  weightNode: WeightNode,
  functionNode: FunctionNode,
};

const edgeTypes = {
  editableEdge: EditableEdge,
};

interface AIFlowGeneratorProps {
  onGenerate: (input: string) => Promise<any>;
  loading?: boolean;
}

function AIFlowGenerator({ onGenerate, loading }: AIFlowGeneratorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [thinking, setThinking] = useState(false);
  const [generatedFlow, setGeneratedFlow] = useState(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const router = useRouter();
  const { chartStore } = useStores() as any;
  const { viewPort } = useReactFlow();

  const handleSubmit = async () => {
    if (!input.trim()) return;
    setThinking(true);
    try {
      const flow = await onGenerate(input);
      setGeneratedFlow(flow);
    } catch (error) {
      toast.error("Failed to generate flow");
    }
    setThinking(false);
  };

  // Helper function to calculate node positions in a grid layout
  const calculateNodePosition = (index: number, totalNodes: number) => {
    const GRID_SPACING = 200; // Space between nodes
    const NODES_PER_ROW = Math.ceil(Math.sqrt(totalNodes));
    const row = Math.floor(index / NODES_PER_ROW);
    const col = index % NODES_PER_ROW;

    // Center the grid in the viewport
    const centerX = (window.innerWidth / 2) - ((NODES_PER_ROW - 1) * GRID_SPACING) / 2;
    const centerY = (window.innerHeight / 2) - ((Math.ceil(totalNodes / NODES_PER_ROW) - 1) * GRID_SPACING) / 2;

    return {
      x: centerX + (col * GRID_SPACING),
      y: centerY + (row * GRID_SPACING)
    };
  };

  const handleApplyChart = () => {
    if (!generatedFlow) return;

    try {
      // Position nodes in a grid layout
      const processedFlow = {
        ...generatedFlow,
        nodes: generatedFlow.nodes.map((node: any, index: number) => ({
          ...node,
          position: calculateNodePosition(index, generatedFlow.nodes.length),
          type: node.type || 'default', // Ensure node type is defined
          data: {
            ...node.data,
            label: node.data?.label || 'Unnamed Node'
          }
        }))
      };

      const newChartId = chartStore.addAIChart(processedFlow);
      router.push(`/dashboard/${newChartId}`);
      setIsOpen(false);
      setGeneratedFlow(null);
      setInput('');
      toast.success('Chart created successfully!');
    } catch (error) {
      console.error('Error applying chart:', error);
      toast.error('Failed to create flow chart');
    }
  };

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
    // Close on escape
    if (e.key === 'Escape') {
      setIsOpen(false);
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        className="fixed bottom-6 right-6 z-50"
        initial={false}
      >
        {!isOpen ? (
          <motion.button
            onClick={() => setIsOpen(true)}
            className={cn(
              "flex items-center gap-2 px-4 py-3",
              "bg-purple-600 text-white rounded-full",
              "shadow-lg hover:shadow-xl hover:bg-purple-700",
              "transform transition-all hover:-translate-y-0.5",
              "focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2"
            )}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Sparkles className="h-5 w-5" />
            <span className="font-medium">Generate with AI</span>
          </motion.button>
        ) : (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className={cn(
              "w-[500px] bg-white rounded-2xl shadow-2xl",
              "border border-gray-200",
              "overflow-hidden"
            )}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-purple-600" />
                <h3 className="font-medium text-gray-900">AI Flow Generator</h3>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1 rounded-full hover:bg-gray-100 text-gray-500"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Content */}
            <div className="p-4">
              <div className="space-y-4">
                {/* Input Field */}
                <div className={cn(
                  "relative rounded-xl border border-gray-200",
                  "transition-all duration-200",
                  "focus-within:border-purple-500 focus-within:ring-1 focus-within:ring-purple-500"
                )}>
                  <textarea
                    ref={inputRef}
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Describe your flow chart... (e.g. 'Create a user authentication flow')"
                    rows={3}
                    className="w-full p-3 text-gray-900 bg-transparent resize-none focus:outline-none"
                  />
                  <div className="flex items-center justify-between px-3 py-2 border-t border-gray-100 bg-gray-50">
                    <div className="flex items-center gap-2 text-xs text-gray-500">
                      <Command className="h-3 w-3" />
                      <span>+ Enter to generate</span>
                    </div>
                    <button
                      onClick={handleSubmit}
                      disabled={thinking || !input.trim()}
                      className={cn(
                        "flex items-center gap-2 px-3 py-1.5",
                        "text-sm font-medium rounded-lg",
                        "bg-purple-600 text-white",
                        "hover:bg-purple-700 transition-colors",
                        "disabled:opacity-50 disabled:cursor-not-allowed"
                      )}
                    >
                      {thinking ? (
                        <>
                          <LoadingSpinner className="h-4 w-4" />
                          Generating...
                        </>
                      ) : (
                        <>
                          <Sparkles className="h-4 w-4" />
                          Generate
                        </>
                      )}
                    </button>
                  </div>
                </div>

                {/* Result Section */}
                <AnimatePresence>
                  {generatedFlow && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="space-y-3"
                    >
                      <div className="p-3 rounded-lg bg-gray-50 border border-gray-200">
                        <pre className="text-xs text-gray-700 overflow-auto max-h-40">
                          {JSON.stringify(generatedFlow, null, 2)}
                        </pre>
                      </div>
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => setGeneratedFlow(null)}
                          className={cn(
                            "px-3 py-1.5 text-sm font-medium rounded-lg",
                            "text-gray-700 hover:bg-gray-100",
                            "transition-colors"
                          )}
                        >
                          Discard
                        </button>
                        <button
                          onClick={handleApplyChart}
                          className={cn(
                            "flex items-center gap-2 px-3 py-1.5",
                            "text-sm font-medium rounded-lg",
                            "bg-purple-600 text-white",
                            "hover:bg-purple-700 transition-colors"
                          )}
                        >
                          <SaveAll className="h-4 w-4" />
                          Apply Flow
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>

            {/* Tips Section */}
            {!generatedFlow && !thinking && (
              <div className="p-4 border-t border-gray-100 bg-gray-50">
                <h4 className="text-sm font-medium text-gray-900 mb-2">Tips:</h4>
                <ul className="space-y-1 text-sm text-gray-600">
                  <li className="flex items-center gap-2">
                    <Lightbulb className="h-4 w-4 text-yellow-500" />
                    Be specific about the type of flow you want
                  </li>
                  <li className="flex items-center gap-2">
                    <Lightbulb className="h-4 w-4 text-yellow-500" />
                    Include key decision points and outcomes
                  </li>
                </ul>
              </div>
            )}
          </motion.div>
        )}
      </motion.div>
    </AnimatePresence>
  );
}
const DashboardInstancePage = ({ params }) => {
  const { chartStore } = useStores() as any;
  const { project } = useReactFlow();
  const [loadingAI, setLoadingAI] = useState(false);

  const resolvedParams = React.use(params);
  const instanceId = decodeURIComponent(resolvedParams.instanceId);

  const onNodesChange = useCallback(
    (changes) => {
      if (chartStore.getChartInstance(instanceId)) {
        chartStore.updateNodes(instanceId, changes);
      }
    },
    [chartStore, instanceId]
  );

  const onEdgesChange = useCallback(
    (changes) => {
      if (chartStore.getChartInstance(instanceId)) {
        chartStore.updateEdges(instanceId, changes);
      }
    },
    [chartStore, instanceId]
  );

  const onConnect = useCallback(
    (connection: Connection) => {
      if (chartStore.getChartInstance(instanceId)) {
        chartStore.addEdge(instanceId, { ...connection, type: "editableEdge" });
      }
    },
    [chartStore, instanceId]
  );

  const handleGenerateAI = async (description: string) => {
    setLoadingAI(true);
    try {
      const chart = await generateChart(description);
      return chart;
    } catch (error) {
      toast.error("Failed to generate chart");
      throw error;
    } finally {
      setLoadingAI(false);
    }
  };

  useEffect(() => {
    const loadData = async () => {
      try {
        if (chartStore.chartInstances.length === 0) {
          const response = await fetch("/api/load-chart");
          if (response.ok) {
            const data = await response.json();
            chartStore.setChartInstances(JSON.parse(data.content));
          }
        }
        chartStore.setCurrentDashboardTab(instanceId);
      } catch (error) {
        toast.error("Failed to load flow");
      }
    };

    loadData();
  }, [instanceId, chartStore]);

  const currentInstance = chartStore.getChartInstance(instanceId);

  if (!currentInstance) {
    return (
      <div className="flex h-full items-center justify-center">
        <p className="text-lg text-red-600">Flow not found</p>
      </div>
    );
  }

  return (
    <div className="h-full">
      <ReactFlow
        nodes={currentInstance.nodes}
        edges={currentInstance.edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        connectionLineType={ConnectionLineType.SmoothStep}
        fitView
      >
        <AIFlowGenerator
          onGenerate={handleGenerateAI}
          loading={loadingAI}
        />
        <MiniMap />
        <Controls />
        <Background variant={BackgroundVariant.Dots} />
      </ReactFlow>
      <Toaster />
    </div>
  );
};

export default DashboardInstancePage;