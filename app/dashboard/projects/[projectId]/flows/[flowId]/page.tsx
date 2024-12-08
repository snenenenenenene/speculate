"use client";

import { nodeTypes } from "@/components/nodes/index";
import { LoadingSpinner } from "@/components/ui/base";
import { useStores } from "@/hooks/useStores";
import { generateChart } from "@/lib/ai-service";
import { cn } from "@/lib/utils";
import { AnimatePresence, motion } from "framer-motion";
import { Command, Lightbulb, SaveAll, Sparkles, X } from "lucide-react";
import { useRouter } from "next/navigation";
import React, { useCallback, useEffect, useMemo, useRef, useState, use } from "react";
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
  useReactFlow,
  ReactFlowProvider
} from "reactflow";

const {
  EndNode,
  FunctionNode,
  MultipleChoiceNode,
  SingleChoiceNode,
  StartNode,
  WeightNode,
  YesNoNode
} = nodeTypes;

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
          options: ["Yes", "No"],
          selected: null,
        },
      };
    case "singleChoice":
      return {
        ...baseNode,
        data: {
          ...baseNode.data,
          options: ["Option 1", "Option 2", "Option 3"],
          selected: null,
        },
      };
    case "multipleChoice":
      return {
        ...baseNode,
        data: {
          ...baseNode.data,
          options: ["Option 1", "Option 2", "Option 3"],
          selected: [],
        },
      };
    case "weightNode":
      return {
        ...baseNode,
        data: {
          ...baseNode.data,
          weight: 1,
        },
      };
    case "functionNode":
      return {
        ...baseNode,
        data: {
          ...baseNode.data,
          function: "",
          inputs: [],
          outputs: [],
        },
      };
    default:
      return baseNode;
  }
}

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
        // @ts-ignore
        ...generatedFlow,
        nodes: (generatedFlow as any).nodes.map((node: any, index: number) => ({
          ...node,
          position: calculateNodePosition(index, (generatedFlow as any).nodes.length),
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

export default function FlowPage({ params }: { params: { projectId: string; flowId: string } }) {
  const router = useRouter();
  const { flowStore } = useStores();
  const [loading, setLoading] = useState(true);
  const resolvedParams = React.use(params);
  const projectId = resolvedParams.projectId;
  const flowId = resolvedParams.flowId;
  const [nodes, setNodes] = useState([]);
  const [edges, setEdges] = useState([]);

  const onNodesChange = useCallback((changes) => setNodes((nds) => nds.map((node) => (changes.find((c) => c.id === node.id) || node))), []);
  const onEdgesChange = useCallback((changes) => setEdges((eds) => eds.map((edge) => (changes.find((c) => c.id === edge.id) || edge))), []);
  const onConnect = useCallback((connection: Connection) => setEdges((eds) => eds.concat(connection)), []);

  useEffect(() => {
    const fetchOrCreateFlow = async () => {
      try {
        let flow = await flowStore.getFlow(flowId);
        
        if (!flow) {
          // If flow doesn't exist, create it through the save-chart endpoint
          const response = await fetch('/api/save-chart', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              projectId,
            }),
          });

          if (!response.ok) {
            throw new Error('Failed to create flow');
          }

          const result = await response.json();
          if (result.error) {
            throw new Error(result.error);
          }

          flow = result.flow;
        }

        if (flow) {
          setNodes(flow.nodes || []);
          setEdges(flow.edges || []);
        } else {
          throw new Error('Failed to load or create flow');
        }
      } catch (error) {
        console.error('Error fetching/creating flow:', error);
        toast.error('Failed to load flow');
        router.push(`/dashboard/projects/${projectId}`);
      } finally {
        setLoading(false);
      }
    };

    fetchOrCreateFlow();
  }, [flowId, projectId, flowStore, router]);

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="h-screen w-full">
      <ReactFlowProvider>
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          nodeTypes={nodeTypes}
          edgeTypes={edgeTypes}
          fitView
          className="bg-base-100"
        >
          <Background variant={BackgroundVariant.Dots} gap={12} size={1} />
          {/* Rest of your component */}
        </ReactFlow>
      </ReactFlowProvider>
    </div>
  );
}