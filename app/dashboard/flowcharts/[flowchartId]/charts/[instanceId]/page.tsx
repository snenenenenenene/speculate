/* eslint-disable react-hooks/rules-of-hooks */
/* eslint-disable @typescript-eslint/ban-ts-comment */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import {
  EndNode,
  FunctionNode,
  MultipleChoiceNode,
  SingleChoiceNode,
  StartNode,
  WeightNode,
  YesNoNode
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
  Background,
  BackgroundVariant,
  BaseEdge,
  Connection,
  ConnectionLineType,
  EdgeLabelRenderer,
  EdgeProps,
  getSmoothStepPath,
  useReactFlow
} from "reactflow";

function createNewNode(type: string, position: { x: number; y: number }, instanceId: string) {
  const newNodeId = `${type}-${Math.random().toString(36).substr(2, 9)}`;

  const baseNode = {
    id: newNodeId,
    type,
    position,
    data: {
      label: `${type} node`,
      instanceId,
    },
    style: {
      background: '#ffffff',
      border: '1px solid #e2e8f0',
      borderRadius: '8px',
      padding: '12px',
    },
  };

  switch (type) {
    case "yesNo":
      return {
        ...baseNode,
        data: {
          ...baseNode.data,
          question: "Yes/No Question",
          options: [
            { label: "yes", nextNodeId: null },
            { label: "no", nextNodeId: null },
          ],
        },
      };

    case "singleChoice":
    case "multipleChoice":
      return {
        ...baseNode,
        data: {
          ...baseNode.data,
          question: `${type === 'singleChoice' ? 'Single' : 'Multiple'} Choice Question`,
          options: [
            { id: crypto.randomUUID(), label: "Option 1", nextNodeId: null },
            { id: crypto.randomUUID(), label: "Option 2", nextNodeId: null },
          ],
        },
      };

    case "weightNode":
      return {
        ...baseNode,
        data: {
          ...baseNode.data,
          weight: 1,
          nextNodeId: null,
          previousQuestionIds: [],
          options: [{ label: "DEFAULT", nextNodeId: null }],
        },
      };

    case "functionNode":
      return {
        ...baseNode,
        data: {
          ...baseNode.data,
          variableScope: "local",
          selectedVariable: "",
          sequences: [],
          handles: ["default"],
        },
      };

    case "startNode":
      return {
        ...baseNode,
        data: {
          ...baseNode.data,
          label: "Start",
          options: [{ label: "DEFAULT", nextNodeId: null }],
        },
        style: {
          ...baseNode.style,
          background: '#ecfdf5',
          borderColor: '#6ee7b7',
        },
      };

    case "endNode":
      return {
        ...baseNode,
        data: {
          ...baseNode.data,
          label: "End",
          endType: "end",
          redirectTab: "",
        },
        style: {
          ...baseNode.style,
          background: '#fef2f2',
          borderColor: '#fca5a5',
        },
      };

    default:
      return baseNode;
  }
}

function EditableEdge({ id, sourceX, sourceY, targetX, targetY, sourcePosition, targetPosition, style = {}, markerEnd }: EdgeProps) {
  const { setEdges } = useReactFlow();
  const [edgePath, labelX, labelY] = getSmoothStepPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
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

  const calculateNodePosition = (index: number, totalNodes: number) => {
    const GRID_SPACING = 200;
    const NODES_PER_ROW = Math.ceil(Math.sqrt(totalNodes));
    const row = Math.floor(index / NODES_PER_ROW);
    const col = index % NODES_PER_ROW;
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
      const processedFlow = {
        // @ts-ignore
        ...generatedFlow,
        nodes: (generatedFlow as any).nodes.map((node: any, index: number) => ({
          ...node,
          position: calculateNodePosition(index, (generatedFlow as any).nodes.length),
          type: node.type || 'default',
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
    if (e.key === 'Escape') {
      setIsOpen(false);
    }
  };

  return (
    <AnimatePresence>
      <motion.div className="fixed bottom-6 right-6 z-50" initial={false}>
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

            <div className="p-4">
              <div className="space-y-4">
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
  const { chartStore, utilityStore } = useStores() as any;
  const router = useRouter();
  const { project } = useReactFlow();
  const [loadingAI, setLoadingAI] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const resolvedParams = React.use(params);
  const instanceId = decodeURIComponent((resolvedParams as any).instanceId);
  const flowchartId = decodeURIComponent((resolvedParams as any).flowchartId);

  useEffect(() => {
    const loadData = async () => {
      if (chartStore.chartInstances.length === 0) {
        setIsLoading(true);
        try {
          const savedData = await utilityStore.loadSavedData();
          if (savedData && Array.isArray(savedData)) {
            chartStore.setChartInstances(savedData);
          }
        } catch (error) {
          console.error('Error loading data:', error);
          toast.error("Failed to load chart data");
        } finally {
          setIsLoading(false);
        }
      }
    };

    loadData();
  }, [chartStore, utilityStore]);

  const saveToServer = useCallback(
    async (updatedChart: any) => {
      try {
        const response = await fetch(
          `/api/flowcharts/${flowchartId}/charts/${instanceId}`,
          {
            method: "PATCH",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              content: {
                nodes: updatedChart.nodes || [],
                edges: updatedChart.edges || []
              }
            }),
          }
        );

        if (!response.ok) {
          throw new Error("Failed to save changes");
        }
      } catch (error) {
        console.error("Error saving changes:", error);
        toast.error("Failed to save changes");
      }
    },
    [flowchartId, instanceId]
  );

  const onNodesChange = useCallback(
    (changes) => {
      if (chartStore.getChartInstance(instanceId)) {
        chartStore.updateNodes(instanceId, changes);
        const updatedInstance = chartStore.getChartInstance(instanceId);
        saveToServer(updatedInstance);
      }
    },
    [chartStore, instanceId, saveToServer]
  );

  const onEdgesChange = useCallback(
    (changes) => {
      if (chartStore.getChartInstance(instanceId)) {
        chartStore.updateEdges(instanceId, changes);
        const updatedInstance = chartStore.getChartInstance(instanceId);
        saveToServer(updatedInstance);
      }
    },
    [chartStore, instanceId, saveToServer]
  );

  const onConnect = useCallback(
    (connection: Connection) => {
      if (chartStore.getChartInstance(instanceId)) {
        chartStore.addEdge(instanceId, {
          ...connection,
          type: 'editableEdge',
          id: `edge-${Math.random().toString(36).substr(2, 9)}`
        });
        const updatedInstance = chartStore.getChartInstance(instanceId);
        saveToServer(updatedInstance);
      }
    },
    [chartStore, instanceId, saveToServer]
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

  const onDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault();
      const type = event.dataTransfer.getData("application/reactflow");
      const position = project({ x: event.clientX, y: event.clientY });
      const newNode = createNewNode(type, position, instanceId);
      if (newNode) {
        chartStore.addNode(instanceId, newNode);
        const updatedInstance = chartStore.getChartInstance(instanceId);
        saveToServer(updatedInstance);
      }
    },
    [project, chartStore, instanceId, saveToServer]
  );

  const onDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = "move";
  }, []);

  const currentInstance = chartStore.getChartInstance(instanceId);

  if (!currentInstance) {
    return (
      <div className="flex h-full items-center justify-center">
        <p className="text-lg text-red-600">Chart not found</p>
      </div>
    );
  }

  return (
    <div className="h-full">
      <ReactFlow
        onDrop={onDrop}
        onDragOver={onDragOver}
        nodes={currentInstance.nodes || []}
        edges={currentInstance.edges || []}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        connectionLineType={ConnectionLineType.SmoothStep}
        fitView
        defaultViewport={{ x: 0, y: 0, zoom: 1 }}
      >
        <AIFlowGenerator
          onGenerate={handleGenerateAI}
          loading={loadingAI}
        />
        <Background variant={BackgroundVariant.Dots} />
      </ReactFlow>
      <Toaster />
    </div>
  );
};

export default DashboardInstancePage;