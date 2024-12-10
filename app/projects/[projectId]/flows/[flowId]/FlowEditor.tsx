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
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Save } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import ReactFlow, {
  Background,
  Controls,
  useReactFlow,
  Node,
  Edge,
  applyEdgeChanges,
  applyNodeChanges,
  addEdge,
  OnNodesChange,
  OnEdgesChange,
  OnConnect,
  ConnectionMode,
} from "reactflow";
import "reactflow/dist/style.css";
import '@/styles/flow-theme.css';
import { useFlowStore } from "@/app/stores/flowStore";
import { nanoid } from "nanoid";

const nodeTypes = {
  startNode: StartNode,
  endNode: EndNode,
  singleChoice: SingleChoiceNode,
  multipleChoice: MultipleChoiceNode,
  yesNo: YesNoNode,
  weightNode: WeightNode,
  functionNode: FunctionNode,
};

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

export default function FlowEditor({
  projectId,
  flowId,
}: {
  projectId: string;
  flowId: string;
}) {
  const { nodes, edges, onNodesChange, onEdgesChange, setNodes, setEdges } = useFlowStore();
  const [isLoading, setIsLoading] = useState(true);
  const [flowData, setFlowData] = useState<any>(null);
  const { setViewport, project } = useReactFlow();

  const saveFlow = useCallback(async () => {
    const flowData = {
      nodes,
      edges,
    };
    
    try {
      const response = await fetch(`/api/projects/${projectId}/flows/${flowId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(flowData),
      });

      if (!response.ok) {
        throw new Error('Failed to save flow');
      }
    } catch (error) {
      console.error('Error saving flow:', error);
      throw error;
    }
  }, [nodes, edges, projectId, flowId]);

  useEffect(() => {
    const parentLayout = window.parent as any;
    if (parentLayout && parentLayout.setSaveFunction) {
      parentLayout.setSaveFunction(saveFlow);
    } else if (typeof (window as any).setSaveFunction === 'function') {
      (window as any).setSaveFunction(saveFlow);
    }
    
    return () => {
      if (parentLayout && parentLayout.setSaveFunction) {
        parentLayout.setSaveFunction(null);
      } else if (typeof (window as any).setSaveFunction === 'function') {
        (window as any).setSaveFunction(null);
      }
    };
  }, [saveFlow]);

  useEffect(() => {
    const fetchFlow = async () => {
      setIsLoading(true);
      try {
        const response = await fetch(
          `/api/projects/${projectId}/flows/${flowId}`
        );
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || "Failed to fetch flow");
        }

        const flow = data.flow;
        console.log('Fetched flow:', flow);

        if (flow.content) {
          const content = JSON.parse(flow.content);
          setNodes(content.nodes || []);
          setEdges(content.edges || []);
        } else {
          setNodes([]);
          setEdges([]);
        }

        setFlowData(flow);

        // Set initial viewport
        setViewport({ x: 0, y: 0, zoom: 1 });
      } catch (error) {
        console.error("Error loading flow:", error);
        toast.error("Failed to load flow");
      } finally {
        setIsLoading(false);
      }
    };

    fetchFlow();
  }, [projectId, flowId]);

  const onConnect = useCallback((params: Connection) => {
    setEdges((eds) => addEdge(params, eds));
  }, [setEdges]);

  const onDrop = useCallback(
    (event: DragEvent) => {
      event.preventDefault();

      const type = event.dataTransfer?.getData("application/reactflow");
      if (!type) {
        return;
      }

      const position = project({
        x: event.clientX - 280,
        y: event.clientY - 64,
      });

      const newNode: Node = {
        id: `${type}-${nanoid()}`,
        type,
        position,
        data: { label: `${type} node` },
      };

      setNodes((nds) => [...nds, newNode]);
      toast.success(`Added ${type} node`);
    },
    [project, setNodes]
  );

  const handleDeleteNode = useCallback((nodeId: string) => {
    setNodes((nds) => nds.filter((node) => node.id !== nodeId));
    setEdges((eds) => eds.filter((edge) => edge.source !== nodeId && edge.target !== nodeId));
  }, [setNodes, setEdges]);

  const handleEditNode = useCallback((nodeId: string, newData: any) => {
    setNodes((nodes) =>
      nodes.map((node) =>
        node.id === nodeId ? { ...node, data: { ...node.data, ...newData } } : node
      )
    );
    toast.success("Node updated");
  }, []);

  const handleClearCanvas = useCallback(() => {
    toast.promise(
      () => new Promise((resolve) => {
        setTimeout(() => {
          setNodes([]);
          setEdges([]);
          resolve(true);
        }, 500);
      }),
      {
        loading: 'Clearing canvas...',
        success: 'Canvas cleared',
        error: 'Failed to clear canvas',
      }
    );
  }, []);

  const handleExportFlow = useCallback(() => {
    try {
      const flow = { nodes, edges };
      const json = JSON.stringify(flow, null, 2);
      const blob = new Blob([json], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `flow-${flowId}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      toast.success("Flow exported successfully");
    } catch (error) {
      toast.error("Failed to export flow");
    }
  }, [nodes, edges, flowId]);

  const handleImportFlow = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) {
      toast.error("No file selected");
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const flow = JSON.parse(e.target?.result as string);
        setNodes(flow.nodes || []);
        setEdges(flow.edges || []);
        toast.success("Flow imported successfully");
      } catch (error) {
        toast.error("Failed to import flow: Invalid file format");
      }
    };
    reader.readAsText(file);
  }, []);

  const handleAutoLayout = useCallback(() => {
    toast.promise(
      () => new Promise((resolve) => {
        // Simulate auto-layout calculation
        setTimeout(() => {
          // Add your auto-layout logic here
          resolve(true);
        }, 1000);
      }),
      {
        loading: 'Optimizing layout...',
        success: 'Layout optimized',
        error: 'Failed to optimize layout',
      }
    );
  }, []);

  useEffect(() => {
    const handleKeyDown = async (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key === 's') {
        event.preventDefault();
        try {
          const response = await fetch(`/api/projects/${projectId}/flows/${flowId}`, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              content: JSON.stringify({ nodes, edges }),
            }),
          });

          if (!response.ok) {
            throw new Error('Failed to save flow');
          }

          toast.success('Flow saved successfully');
        } catch (error) {
          console.error('Error saving flow:', error);
          toast.error('Failed to save flow');
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [projectId, flowId, nodes, edges]);

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  console.log(nodes)

  return (
    <div className="flex h-full w-full">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onDragOver={(event) => event.preventDefault()}
        onDrop={onDrop}
        nodeTypes={nodeTypes}
        connectionMode={ConnectionMode.Loose}
        fitView
        className="bg-white"
      >
        <Background color={flowData?.color || "#27272a"} gap={16} />
        <Controls />
      </ReactFlow>
    </div>
  );
}
