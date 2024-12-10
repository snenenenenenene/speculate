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
  const { setViewport, project } = useReactFlow();

  const handleSaveFlow = useCallback(async () => {
    try {
      console.log('Saving flow - Current nodes:', nodes);
      console.log('Saving flow - Current edges:', edges);
      
      const payload = {
        content: JSON.stringify({ nodes, edges })  // Stringify the content as the server expects
      };
      console.log('Saving flow - Payload:', payload);
      
      const response = await fetch(`/api/projects/${projectId}/flows/${flowId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error('Failed to save flow');
      }

      console.log('Flow saved successfully');
      return Promise.resolve();
    } catch (error) {
      console.error('Error saving flow:', error);
      return Promise.reject(error);
    }
  }, [projectId, flowId, nodes, edges]);

  useEffect(() => {
    if (window.setSaveFunction) {
      window.setSaveFunction(handleSaveFlow);
    }
  }, [handleSaveFlow]);

  useEffect(() => {
    const loadFlow = async () => {
      try {
        const response = await fetch(`/api/projects/${projectId}/flows/${flowId}`);
        if (!response.ok) {
          throw new Error('Failed to load flow');
        }

        const { flow } = await response.json();
        console.log('Loading flow - Raw response:', flow);
        
        if (flow?.content) {
          console.log('Loading flow - Content:', flow.content);
          const flowContent = typeof flow.content === 'string' ? JSON.parse(flow.content) : flow.content;
          console.log('Loading flow - Parsed content:', flowContent);
          setNodes(flowContent.nodes || []);
          setEdges(flowContent.edges || []);
        } else {
          console.log('Loading flow - No content found, setting empty nodes/edges');
          setNodes([]);
          setEdges([]);
        }

        // Set initial viewport
        setViewport({ x: 0, y: 0, zoom: 1 });
      } catch (error) {
        console.error('Error loading flow:', error);
        toast.error('Failed to load flow');
      } finally {
        setIsLoading(false);
      }
    };

    loadFlow();
  }, [projectId, flowId, setNodes, setEdges, setViewport]);

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
      <NodeSidebar
        width={280}
        onWidthChange={(width) => {}}
      />
      <div className="h-full w-full flex">
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
        >
          <Background />
          <Controls />
        </ReactFlow>
      </div>
    </div>
  );
}
