// app/projects/[projectId]/flows/[flowId]/page.tsx
"use client";

import { NodeSidebar } from "@/components/dashboard/NodeSidebar";
import {
  EndNode,
  FunctionNode,
  MultipleChoiceNode,
  SingleChoiceNode,
  StartNode,
  WeightNode,
  YesNoNode,
} from "@/components/nodes";
import { LoadingSpinner } from "@/components/ui/base";
import { generateChart } from "@/lib/ai-service";
import { cn } from "@/lib/utils";
import { Sparkles } from "lucide-react";
import { useParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import ReactFlow, {
  Background,
  BackgroundVariant,
  ConnectionMode,
  Controls,
  Node,
  addEdge,
  applyEdgeChanges,
  applyNodeChanges,
  useReactFlow,
} from "reactflow";
import 'reactflow/dist/style.css';

const nodeTypes = {
  startNode: StartNode,
  endNode: EndNode,
  singleChoice: SingleChoiceNode,
  multipleChoice: MultipleChoiceNode,
  yesNo: YesNoNode,
  weightNode: WeightNode,
  functionNode: FunctionNode,
};

function createNewNode(type: string, position: { x: number; y: number }) {
  const newNodeId = `${type}-${Math.random().toString(36).substr(2, 9)}`;

  const baseNode = {
    id: newNodeId,
    type,
    position,
    data: {
      label: `${type} node`,
    },
  };

  // Add type-specific data here
  switch (type) {
    case "startNode":
      return {
        ...baseNode,
        data: {
          ...baseNode.data,
          options: [{ label: "Start", nextNodeId: null }],
        },
      };
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
      return {
        ...baseNode,
        data: {
          ...baseNode.data,
          question: "Single Choice Question",
          options: [
            { id: crypto.randomUUID(), label: "Option 1", nextNodeId: null },
            { id: crypto.randomUUID(), label: "Option 2", nextNodeId: null },
          ],
        },
      };
    case "multipleChoice":
      return {
        ...baseNode,
        data: {
          ...baseNode.data,
          question: "Multiple Choice Question",
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
    case "endNode":
      return {
        ...baseNode,
        data: {
          ...baseNode.data,
          label: "End",
          endType: "end",
          redirectTab: "",
        },
      };
    default:
      return baseNode;
  }
}

export default function FlowEditorPage() {
  const params = useParams();
  const { projectId, flowId } = params as { projectId: string; flowId: string };
  const [nodes, setNodes] = useState<Node[]>([]);
  const [edges, setEdges] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [sidebarWidth, setSidebarWidth] = useState(280);
  const { project } = useReactFlow();

  useEffect(() => {
    const loadFlow = async () => {
      try {
        const response = await fetch(`/api/projects/${projectId}/flows/${flowId}`);
        const data = await response.json();
        
        if (data.content) {
          const flowContent = JSON.parse(data.content);
          setNodes(flowContent.nodes || []);
          setEdges(flowContent.edges || []);
        }
      } catch (error) {
        console.error("Error loading flow:", error);
        toast.error("Failed to load flow");
      } finally {
        setIsLoading(false);
      }
    };

    loadFlow();
  }, [projectId, flowId]);

  const onDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = "move";
  }, []);

  const onDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault();

      const type = event.dataTransfer.getData("application/reactflow");
      
      if (typeof type === "undefined" || !type) {
        return;
      }

      const position = project({
        x: event.clientX,
        y: event.clientY,
      });

      const newNode = createNewNode(type, position);
      setNodes((nds) => [...nds, newNode]);
    },
    [project]
  );

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <LoadingSpinner className="h-8 w-8 text-primary-600" />
      </div>
    );
  }

  return (
    <div className="h-screen flex bg-base-50">
      {/* Node Sidebar */}
      <div className="flex h-full">
        <NodeSidebar
          width={sidebarWidth}
          onWidthChange={setSidebarWidth}
        />
      </div>

      {/* Flow Editor */}
      <div className="flex-1">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={(changes) => setNodes((nds) => applyNodeChanges(changes, nds))}
          onEdgesChange={(changes) => setEdges((eds) => applyEdgeChanges(changes, eds))}
          onConnect={(connection) => setEdges((eds) => addEdge(connection, eds))}
          nodeTypes={nodeTypes}
          connectionMode={ConnectionMode.Loose}
          onDragOver={onDragOver}
          onDrop={onDrop}
          fitView
        >
          <Background variant={BackgroundVariant.Dots} gap={12} size={1} />
          <Controls />
        </ReactFlow>
      </div>

      {/* AI Flow Generator Button */}
      <div className="fixed bottom-6 right-6 z-50">
        <button
          className={cn(
            "flex items-center gap-2 px-4 py-3",
            "bg-primary-600 text-white rounded-full",
            "shadow-lg hover:shadow-xl hover:bg-primary-700",
            "transform transition-all hover:-translate-y-0.5",
            "focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
          )}
          onClick={() => {/* Open AI generator */}}
        >
          <Sparkles className="h-5 w-5" />
          <span className="font-medium">Generate with AI</span>
        </button>
      </div>
    </div>
  );
}