"use client";

import {
  EndNode,
  FunctionNode,
  MultipleChoiceNode,
  SingleChoiceNode,
  StartNode,
  WeightNode,
  YesNoNode,
} from "@/components/nodes/index";
import { useStores } from "@/hooks/useStores";
import { motion } from "framer-motion";
import { Play, Redo, Save, Settings, Undo, ZoomIn, ZoomOut } from "lucide-react";
import React, { useCallback, useEffect, useState } from "react";
import { Toaster, toast } from "react-hot-toast";
import ReactFlow, {
  Background,
  Connection,
  ConnectionLineType,
  Controls,
  MiniMap,
  Panel,
  useReactFlow
} from "reactflow";

import { LoadingSpinner } from "@/components/ui/base";
import {
  BaseEdge,
  EdgeLabelRenderer,
  EdgeProps,
  getSmoothStepPath
} from 'reactflow';
import SettingsModal from "./SettingsModal";

function EditableEdge({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  style = {},
  markerEnd,
}: EdgeProps) {
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
            position: 'absolute',
            transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
            fontSize: 12,
            pointerEvents: 'all',
          }}
          className="nodrag nopan"
        >
          <button
            className="w-5 h-5 bg-gray-200 dark:bg-gray-800 border border-white rounded-full text-xs leading-none hover:shadow-md"
            onClick={onEdgeClick}
          >
            ×
          </button>
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

// Helper function to create new nodes
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

const DashboardInstancePage = ({ params }) => {
  const { chartStore, utilityStore } = useStores();
  const { project, zoomIn, zoomOut } = useReactFlow();
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingChart, setIsLoadingChart] = useState(true);

  const instanceId = decodeURIComponent(React.use(params).instanceId);

  useEffect(() => {
    const loadData = async () => {
      setIsLoadingChart(true);
      try {
        // Load chart instances if they haven't been loaded yet
        if (chartStore.chartInstances.length === 0) {
          const response = await fetch('/api/load-chart');
          if (response.ok) {
            const data = await response.json();
            if (data.content) {
              const parsedContent = JSON.parse(data.content);
              chartStore.setChartInstances(parsedContent);
            }
          }
        }

        // Set current tab
        chartStore.setCurrentDashboardTab(instanceId);
        utilityStore.setCurrentTab(instanceId);

      } catch (error) {
        console.error('Failed to load chart instance:', error);
        toast.error('Failed to load flow');
      } finally {
        setIsLoadingChart(false);
        setIsLoading(false);
      }
    };

    loadData();
  }, [instanceId, chartStore, utilityStore]);

  const currentInstance = chartStore.getChartInstance(instanceId);

  const onNodesChange = useCallback(
    (changes) => {
      if (currentInstance) {
        chartStore.updateNodes(instanceId, changes);
      }
    },
    [chartStore, instanceId, currentInstance]
  );

  const onEdgesChange = useCallback(
    (changes) => {
      if (currentInstance) {
        chartStore.updateEdges(instanceId, changes);
      }
    },
    [chartStore, instanceId, currentInstance]
  );

  const onConnect = useCallback(
    (connection: Connection) => {
      if (currentInstance) {
        chartStore.addEdge(instanceId, { ...connection, type: "editableEdge" });
      }
    },
    [chartStore, instanceId, currentInstance]
  );

  const onDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = "move";
  }, []);

  const onDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault();
      if (!currentInstance) return;

      const type = event.dataTransfer.getData("application/reactflow");
      const position = project({ x: event.clientX, y: event.clientY });
      const newNode = createNewNode(type, position, instanceId);
      if (newNode) {
        chartStore.addNode(instanceId, newNode);
      }
    },
    [project, chartStore, instanceId, currentInstance]
  );

  const handleSave = async () => {
    setIsLoading(true);
    try {
      await utilityStore.saveToDb(chartStore.chartInstances);
      toast.success("Flow saved successfully");
    } catch (error) {
      console.error(error)
      toast.error("Failed to save flow");
    } finally {
      setIsLoading(false);
    }
  };

  // Show loading state while checking for instances and current instance
  if (isLoadingChart) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="text-center">
          <LoadingSpinner className="h-8 w-8 animate-spin" />
          <p className="mt-4 text-gray-600">Loading flow...</p>
        </div>
      </div>
    );
  }

  // Show error state if instance not found after loading
  if (!currentInstance) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="text-center">
          <p className="text-lg text-red-600">Flow not found</p>
          <p className="mt-2 text-gray-600">This flow may have been deleted or never existed.</p>
        </div>
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
        onDragOver={onDragOver}
        onDrop={onDrop}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        connectionLineType={ConnectionLineType.SmoothStep}
        defaultEdgeOptions={{
          animated: true,
          style: { stroke: '#94a3b8', strokeWidth: 2 },
        }}
        fitView
      >
        {/* Top Controls */}
        <Panel position="top-right" className="flex gap-2">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-1 bg-white/80 backdrop-blur-sm p-1.5 rounded-lg shadow-sm border border-gray-200"
          >
            <button
              onClick={() => zoomIn()}
              className="p-1.5 rounded hover:bg-gray-100 text-gray-600"
              aria-label="Zoom in"
            >
              <ZoomIn className="h-4 w-4" />
            </button>
            <button
              onClick={() => zoomOut()}
              className="p-1.5 rounded hover:bg-gray-100 text-gray-600"
              aria-label="Zoom out"
            >
              <ZoomOut className="h-4 w-4" />
            </button>
            <div className="w-px h-5 bg-gray-200 mx-1" />
            <button
              onClick={() => {/* Implement undo */ }}
              className="p-1.5 rounded hover:bg-gray-100 text-gray-600"
              aria-label="Undo"
            >
              <Undo className="h-4 w-4" />
            </button>
            <button
              onClick={() => {/* Implement redo */ }}
              className="p-1.5 rounded hover:bg-gray-100 text-gray-600"
              aria-label="Redo"
            >
              <Redo className="h-4 w-4" />
            </button>
            <div className="w-px h-5 bg-gray-200 mx-1" />
            <button
              onClick={() => {
                const modal = document.getElementById('settings_modal') as HTMLDialogElement | null;
                if (modal) modal.showModal();
              }}
              className="p-1.5 rounded hover:bg-gray-100 text-gray-600"
              aria-label="Settings"
            >
              <Settings className="h-4 w-4" />
            </button>
          </motion.div>
        </Panel>

        {/* Bottom Controls */}
        <Panel position="bottom-right" className="flex gap-2 mb-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-2"
          >
            <button
              onClick={handleSave}
              disabled={isLoading}
              className="flex items-center gap-2 px-3 py-1.5 bg-white/80 backdrop-blur-sm rounded-lg border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <>
                  <div className="h-4 w-4 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4" />
                  Save
                </>
              )}
            </button>
            <button
              onClick={() => {
                toast.success("Starting flow simulation...");
                // Implement simulation logic
              }}
              className="flex items-center gap-2 px-3 py-1.5 bg-green-500 rounded-lg text-sm font-medium text-white hover:bg-green-600"
            >
              <Play className="h-4 w-4" />
              Simulate
            </button>
          </motion.div>
        </Panel>

        <Background
          color="#94a3b8"
          className="bg-slate-50"
          variant="dots"
          gap={12}
          size={1}
        />
        <MiniMap
          className="bg-white/80 backdrop-blur-sm border border-gray-200 rounded-lg"
          nodeStrokeWidth={3}
          zoomable
          pannable
          nodeColor={(node) => {
            switch (node.type) {
              case 'startNode':
                return '#6ee7b7';
              case 'endNode':
                return '#fca5a5';
              default:
                return '#e2e8f0';
            }
          }}
        />
        <Controls
          className="bg-white/80 backdrop-blur-sm border border-gray-200 rounded-lg"
          showInteractive={false}
        />
      </ReactFlow>

      <Toaster
        position="top-right"
        toastOptions={{
          duration: 3000,
          style: {
            background: '#333',
            color: '#fff',
            borderRadius: '8px',
          },
        }}
      />
      <SettingsModal />
    </div>
  );
};

export default DashboardInstancePage;