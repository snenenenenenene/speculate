/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import {
  EndNode, FunctionNode, MultipleChoiceNode, SingleChoiceNode,
  StartNode, WeightNode, YesNoNode
} from "@/components/nodes/index";
import { useStores } from "@/hooks/useStores";
import { generateChart } from "@/lib/ai-service";
import { AnimatePresence, motion } from "framer-motion";
import { Sparkles } from "lucide-react";
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

function AIFlowGenerator({ onGenerate, loading }) {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [thinking, setThinking] = useState(false);
  const [generatedFlow, setGeneratedFlow] = useState(null);
  const inputRef = useRef(null);
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

  const handleApplyChart = () => {
    if (!generatedFlow) return;
    const newChartId = chartStore.addAIChart(generatedFlow);
    router.push(`/dashboard/${newChartId}`);
    setIsOpen(false);
    setGeneratedFlow(null);
    setInput('');
    toast.success('Chart created successfully!');
  };

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  return (
    <div className="fixed top-20 left-[20vw] z-20">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center px-4 py-2 bg-purple-600 text-white rounded-t-lg shadow-lg hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500"
      >
        <Sparkles className="h-5 w-5 mr-2" />
        <span>AI Flow</span>
      </button>

      <AnimatePresence>
        {isOpen && (
          <>
            {(thinking || generatedFlow) && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="bg-purple-50 p-4 rounded-lg shadow-lg mb-2 max-w-md"
              >
                {thinking ? (
                  <div className="text-purple-700">
                    <motion.span
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ repeat: Infinity, duration: 1.5 }}
                    >
                      Generating flow chart...
                    </motion.span>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <pre className="bg-white p-2 rounded text-xs overflow-auto max-h-40">
                      {JSON.stringify(generatedFlow, null, 2)}
                    </pre>
                    <div className="flex justify-end space-x-2">
                      <button
                        onClick={() => setGeneratedFlow(null)}
                        className="px-3 py-1 text-sm text-purple-600 hover:bg-purple-100 rounded"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleApplyChart}
                        className="px-3 py-1 text-sm bg-purple-600 text-white hover:bg-purple-700 rounded"
                      >
                        Apply
                      </button>
                    </div>
                  </div>
                )}
              </motion.div>
            )}

            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="relative"
            >
              <input
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSubmit();
                  }
                }}
                placeholder="Describe your flow chart..."
                className="w-[400px] p-3 rounded-b-lg border border-t-0 border-purple-200 focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
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