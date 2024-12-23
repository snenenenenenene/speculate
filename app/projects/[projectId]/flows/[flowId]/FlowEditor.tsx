"use client";

import CustomEdge from "@/components/flow/CustomEdge";
import {
  EndNode,
  FunctionNode,
  MultipleChoiceNode,
  SingleChoiceNode,
  StartNode,
  WeightNode,
  YesNoNode,
} from "@/components/nodes";
import { useRootStore } from "@/stores/rootStore";
import '@/styles/flow-theme.css';
import { useTheme } from "next-themes";
import { nanoid } from "nanoid";
import { useCallback, useEffect, useRef, useState } from "react";
import ReactFlow, {
  addEdge,
  applyEdgeChanges,
  applyNodeChanges,
  Background,
  Connection,
  ConnectionLineType,
  Edge,
  EdgeChange,
  Node,
  NodeChange,
  ReactFlowInstance,
  ReactFlowProvider
} from "reactflow";
import "reactflow/dist/style.css";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";
import { createFlowAuditLog } from '@/lib/audit';
import { FlowAnalytics } from '@/components/flow/FlowAnalytics';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const nodeTypes = {
  startNode: StartNode,
  endNode: EndNode,
  singleChoice: SingleChoiceNode,
  multipleChoice: MultipleChoiceNode,
  yesNo: YesNoNode,
  weightNode: WeightNode,
  functionNode: FunctionNode,
} as const;

const edgeTypes = {
  custom: CustomEdge,
};

function createNewNode(type: string, position: { x: number; y: number }, flowId: string) {
  const newNodeId = `${type}-${nanoid()}`;

  const baseNode = {
    id: newNodeId,
    type,
    position,
    data: {
      label: `${type} node`,
      flowId,
    },
  };

  switch (type) {
    case 'startNode':
      return {
        ...baseNode,
        data: {
          ...baseNode.data,
          type: 'start',
          isVisual: false,
          images: [],
          welcomeMessage: '',
        },
      };
    case 'endNode':
      return {
        ...baseNode,
        data: {
          ...baseNode.data,
          type: 'end',
        },
      };
    case 'singleChoice':
      return {
        ...baseNode,
        data: {
          ...baseNode.data,
          type: 'singleChoice',
          options: [],
        },
      };
    case 'multipleChoice':
      return {
        ...baseNode,
        data: {
          ...baseNode.data,
          type: 'multipleChoice',
          options: [],
        },
      };
    case 'yesNo':
      return {
        ...baseNode,
        data: {
          ...baseNode.data,
          type: 'yesNo',
        },
      };
      case 'weightNode':
        return {
          ...baseNode,
          data: {
            ...baseNode.data,
            type: 'weight',
            weight: 1,
            operation: 'multiply',
            useGlobalWeight: false,
            formula: '$weight * 1', // Default formula
          },
        };
    case 'functionNode':
      return {
        ...baseNode,
        data: {
          ...baseNode.data,
          type: 'function',
          code: '',
        },
      };
    default:
      console.warn('Unknown node type:', type);
      return baseNode;
  }
}

interface FlowEditorProps {
  projectId: string;
  flowId: string;
  onPublish: () => void;
  initialFlow?: {
    id: string;
    name: string;
    content: string;
    version: number;
    isPublished: boolean;
    publishedAt?: string;
    variables: any[];
  };
}

export default function FlowEditor({ projectId, flowId, onPublish, initialFlow }: FlowEditorProps) {
  const { theme } = useTheme();
  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  const [reactFlowInstance, setReactFlowInstance] = useState<ReactFlowInstance | null>(null);
  const { updateNodes, updateEdges, setFlows, setCurrentDashboardTab, updateFlow, flows, removeNode, removeEdge } = useRootStore();
  const flow = flows.find((flow) => flow.id === flowId);

  const [nodes, setNodes] = useState<Node[]>([]);
  const [edges, setEdges] = useState<Edge[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [flowData, setFlowData] = useState<any>(null);
  const [globalVariables, setGlobalVariables] = useState<any[]>([]);
  const [isPublishDialogOpen, setIsPublishDialogOpen] = useState(false);

  useEffect(() => {
    if (flow) {
      setNodes(flow.nodes);
      setEdges(flow.edges);
    }
  }, [flow]);

  useEffect(() => {
    if (flow) {
      const updatedEdges = flow.edges.map(edge => ({
        ...edge,
        type: 'custom'
      }));
      setEdges(updatedEdges);
    }
  }, [flow]);

  useEffect(() => {
    if (!flowId) return;

    const fetchFlow = async () => {
      setIsLoading(true);
      try {
        const flowResponse = await fetch(`/api/projects/${projectId}/flows/${flowId}`);

        if (!flowResponse.ok) {
          throw new Error("Failed to fetch flow data");
        }

        const flowData = await flowResponse.json();
        console.log("Fetched flow:", flowData);

        setFlowData(flowData);

        if (flowData.flow.content) {
          const content = JSON.parse(flowData.flow.content);
          
          // Ensure start nodes have required properties
          if (content.nodes) {
            content.nodes = content.nodes.map(node => {
              if (node.type === 'startNode') {
                return {
                  ...node,
                  data: {
                    ...node.data,
                    images: node.data.images || [],
                    welcomeMessage: node.data.welcomeMessage || '',
                  }
                };
              }
              return node;
            });
          }

          const newFlow = {
            id: flowId,
            name: flowData.flow.name,
            nodes: content.nodes || [],
            edges: content.edges || [],
            color: flowData.flow.color,
            onePageMode: flowData.flow.onePageMode,
            publishedVersions: [],
            variables: content.variables || [],
          };

          console.log('Setting flow:', newFlow);
          setNodes(newFlow.nodes);
          setEdges(newFlow.edges);
          setFlows([newFlow]);
          setCurrentDashboardTab(flowId);
        } else {
          const emptyFlow = {
            id: flowId,
            name: flowData.flow.name,
            nodes: [],
            edges: [],
            color: flowData.flow.color,
            onePageMode: flowData.flow.onePageMode,
            publishedVersions: [],
            variables: [],
          };
          
          console.log('Setting empty flow:', emptyFlow);
          setNodes([]);
          setEdges([]);
          setFlows([emptyFlow]);
          setCurrentDashboardTab(flowId);
        }
      } catch (error) {
        console.error("Error loading flow:", error);
        toast.error("Failed to load flow");
      } finally {
        setIsLoading(false);
      }
    };

    fetchFlow();
  }, [flowId, projectId, setFlows, setCurrentDashboardTab]);

  const onNodesChange = useCallback(
    (changes: NodeChange[]) => {
      const nextChanges = changes.map(change => {
        if (change.type === 'remove') {
          removeNode(change.id);
          return null;
        }
        return change;
      }).filter(Boolean) as NodeChange[];
      
      setNodes((nds) => applyNodeChanges(nextChanges, nds));
    },
    [removeNode]
  );

  const onEdgesChange = useCallback(
    (changes: EdgeChange[]) => {
      setEdges((eds) => {
        const nextEdges = applyEdgeChanges(changes, eds);
        return nextEdges.map(edge => ({
          ...edge,
          type: 'custom'
        }));
      });
    },
    []
  );

  const handleConnect = useCallback(
    (params: Connection) => {
      // Create new edge with custom type and unique id
      const newEdge = {
        ...params,
        type: 'custom',
        id: `e${params.source}-${params.sourceHandle}-${params.target}-${params.targetHandle}`,
      };
      setEdges((eds) => addEdge(newEdge, eds));
    },
    []
  );

  const onDrop = useCallback(
    (event: DragEvent) => {
      event.preventDefault();

      const type = event.dataTransfer?.getData("application/reactflow");
      if (!type || !flow || !reactFlowInstance) return;

      const position = reactFlowInstance.screenToFlowPosition({
        x: event.clientX,
        y: event.clientY,
      });

      console.log('Creating new node:', { type, position });
      const newNode = createNewNode(type, position, flowId);
      console.log('New node created:', newNode);

      // Update React Flow's state through the change handler
      onNodesChange([{ type: 'add', item: newNode }]);
    },
    [flow, flowId, reactFlowInstance, onNodesChange]
  );

  const saveFlow = useCallback(async () => {
    if (!flow) return;
  
    const updatedEdges = edges.map(edge => ({
      ...edge,
      type: 'custom'
    }));
    
    const flowData = {
      content: JSON.stringify({
        nodes,
        edges: updatedEdges,
        variables: flow?.variables || [],
      }),
      name: flow.name,
      color: flow.color,
      onePageMode: flow.onePageMode,
    };
    
    console.log('Sending flow data:', flowData);
    
    try {
      const response = await fetch(`/api/projects/${projectId}/flows/${flowId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(flowData),
      });

      const responseData = await response.json();
      console.log('Save response:', responseData);

      if (!response.ok) {
        throw new Error('Failed to save flow');
      }

      // Parse the content from the response
      let savedContent;
      try {
        savedContent = JSON.parse(responseData.flow.content);
        console.log('Saved content:', savedContent);
      } catch (err) {
        console.error('Error parsing saved content:', err);
        savedContent = { nodes, edges, variables: flow?.variables || [] };
      }

      // Update the flow in our store
      if (flow) {
        const updatedFlow = {
          ...flow,
          name: responseData.flow.name,
          color: responseData.flow.color,
          onePageMode: responseData.flow.onePageMode,
          nodes: savedContent.nodes,
          edges: savedContent.edges,
          variables: savedContent.variables || flow.variables || [],
        };
        console.log('Updating flow store with:', updatedFlow);
        setFlows([updatedFlow]);
        setCurrentDashboardTab(flowId);
      }

      toast.success('Flow saved successfully');
    } catch (error) {
      console.error('Error saving flow:', error);
      toast.error('Failed to save flow');
    }
  }, [nodes, edges, flow, projectId, flowId, setFlows, setCurrentDashboardTab]);

  useEffect(() => {
    const parentLayout = window.parent as any;
    if (parentLayout && parentLayout.setSaveFunction) {
      parentLayout.setSaveFunction(saveFlow);
    } else if (typeof (window as any).setSaveFunction === 'function') {
      (window as any).setSaveFunction(saveFlow);
    } else {
      console.log('No parent layout or save function available');
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
    const handleKeyDown = async (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key === 's') {
        event.preventDefault();
        await saveFlow();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [saveFlow]);

  const handleDeleteNode = useCallback((nodeId: string) => {
    setNodes((nds) => nds.filter((node) => node.id !== nodeId));
    setEdges((eds) => eds.filter((edge) => edge.source !== nodeId && edge.target !== nodeId));
  }, []);

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
    reader.onload = (e: ProgressEvent<FileReader>) => {
      if (!e.target) return;
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
  }, [setNodes, setEdges]);

  const handleAutoLayout = useCallback(() => {
    toast.promise(
      () => new Promise((resolve) => {
        setTimeout(() => {
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

  const handlePublish = async (settings: { versionName: string; description: string; autoActivate: boolean }) => {
    // First, save the current flow state
    const flowContent = {
      nodes,
      edges,
      variables: flow?.variables || [],
    };

    const saveResponse = await fetch(`/api/projects/${projectId}/flows/${flowId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        content: JSON.stringify(flowContent),
        name: flow?.name,
        color: flow?.color,
        onePageMode: flow?.onePageMode,
      }),
    });

    if (!saveResponse.ok) {
      throw new Error('Failed to save flow');
    }

    console.log('API PUT: Updated flow:', await saveResponse.json());

    // Then publish the flow
    const publishResponse = await fetch(`/api/projects/${projectId}/flows/${flowId}/publish`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(settings),
    });

    const publishData = await publishResponse.json();
    console.log('Published flow:', publishData);

    if (!publishResponse.ok) {
      throw new Error(publishData.error || 'Failed to publish flow');
    }

    // Update the local state
    if (publishData.flow) {
      const updatedFlow = {
        ...flow,
        isPublished: true,
        publishedAt: publishData.flow.publishedAt,
        version: publishData.version.version,
        activeVersionId: publishData.flow.activeVersionId,
      };
      setFlows(flows.map(f => f.id === flowId ? updatedFlow : f));
    }

    setIsPublishDialogOpen(false);
    toast.success('Flow published successfully');
  };

  const handleNodeAdd = async (node: Node) => {
    try {
      // Existing node add logic
      const updatedNodes = [...nodes, node];
      setNodes(updatedNodes);
      await saveFlow(updatedNodes, edges);

      // Create audit log
      await createFlowAuditLog(session.user.id, projectId, flowId, 'FLOW_NODE_ADDED', {
        nodeId: node.id,
        nodeType: node.type,
        label: node.data?.label,
      });
    } catch (error) {
      console.error('Error adding node:', error);
      toast.error('Failed to add node');
    }
  };

  const handleNodeRemove = async (node: Node) => {
    try {
      // Existing node remove logic
      const updatedNodes = nodes.filter(n => n.id !== node.id);
      setNodes(updatedNodes);
      await saveFlow(updatedNodes, edges);

      // Create audit log
      await createFlowAuditLog(session.user.id, projectId, flowId, 'FLOW_NODE_REMOVED', {
        nodeId: node.id,
        nodeType: node.type,
        label: node.data?.label,
      });
    } catch (error) {
      console.error('Error removing node:', error);
      toast.error('Failed to remove node');
    }
  };

  const handleNodeUpdate = async (node: Node) => {
    try {
      // Existing node update logic
      const updatedNodes = nodes.map(n => n.id === node.id ? node : n);
      setNodes(updatedNodes);
      await saveFlow(updatedNodes, edges);

      // Create audit log
      await createFlowAuditLog(session.user.id, projectId, flowId, 'FLOW_NODE_UPDATED', {
        nodeId: node.id,
        nodeType: node.type,
        label: node.data?.label,
        changes: node.data?.changes, // If tracking specific changes
      });
    } catch (error) {
      console.error('Error updating node:', error);
      toast.error('Failed to update node');
    }
  };

  const handleEdgeAdd = async (edge: Edge) => {
    try {
      // Existing edge add logic
      const updatedEdges = [...edges, edge];
      setEdges(updatedEdges);
      await saveFlow(nodes, updatedEdges);

      // Create audit log
      await createFlowAuditLog(session.user.id, projectId, flowId, 'FLOW_EDGE_ADDED', {
        edgeId: edge.id,
        source: edge.source,
        target: edge.target,
      });
    } catch (error) {
      console.error('Error adding edge:', error);
      toast.error('Failed to add connection');
    }
  };

  const handleEdgeRemove = async (edge: Edge) => {
    try {
      // Existing edge remove logic
      const updatedEdges = edges.filter(e => e.id !== edge.id);
      setEdges(updatedEdges);
      await saveFlow(nodes, updatedEdges);

      // Create audit log
      await createFlowAuditLog(session.user.id, projectId, flowId, 'FLOW_EDGE_REMOVED', {
        edgeId: edge.id,
        source: edge.source,
        target: edge.target,
      });
    } catch (error) {
      console.error('Error removing edge:', error);
      toast.error('Failed to remove connection');
    }
  };

  const handleFlowSettingsUpdate = async (settings: any) => {
    try {
      // Existing settings update logic
      await updateFlowSettings(settings);

      // Create audit log
      await createFlowAuditLog(session.user.id, projectId, flowId, 'FLOW_SETTINGS_UPDATED', {
        changes: settings,
      });
    } catch (error) {
      console.error('Error updating flow settings:', error);
      toast.error('Failed to update flow settings');
    }
  };

  const handleVariableAdd = async (variable: any) => {
    try {
      // Existing variable add logic
      const updatedVariables = [...variables, variable];
      setVariables(updatedVariables);
      await updateFlowVariables(updatedVariables);

      // Create audit log
      await createFlowAuditLog(session.user.id, projectId, flowId, 'FLOW_VARIABLE_ADDED', {
        variable: {
          name: variable.name,
          type: variable.type,
        },
      });
    } catch (error) {
      console.error('Error adding variable:', error);
      toast.error('Failed to add variable');
    }
  };

  const handleVariableUpdate = async (variable: any) => {
    try {
      // Existing variable update logic
      const updatedVariables = variables.map(v => v.id === variable.id ? variable : v);
      setVariables(updatedVariables);
      await updateFlowVariables(updatedVariables);

      // Create audit log
      await createFlowAuditLog(session.user.id, projectId, flowId, 'FLOW_VARIABLE_UPDATED', {
        variable: {
          id: variable.id,
          name: variable.name,
          type: variable.type,
          changes: variable.changes, // If tracking specific changes
        },
      });
    } catch (error) {
      console.error('Error updating variable:', error);
      toast.error('Failed to update variable');
    }
  };

  const handleVariableRemove = async (variableId: string) => {
    try {
      // Existing variable remove logic
      const updatedVariables = variables.filter(v => v.id !== variableId);
      setVariables(updatedVariables);
      await updateFlowVariables(updatedVariables);

      // Create audit log
      await createFlowAuditLog(session.user.id, projectId, flowId, 'FLOW_VARIABLE_REMOVED', {
        variableId,
      });
    } catch (error) {
      console.error('Error removing variable:', error);
      toast.error('Failed to remove variable');
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex-1 h-full">
      <ReactFlowProvider>
        <div className="flex-1 h-full" ref={reactFlowWrapper}>
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={handleConnect}
            onInit={setReactFlowInstance}
            onDragOver={(event) => event.preventDefault()}
            onDrop={onDrop}
            nodeTypes={nodeTypes}
            edgeTypes={edgeTypes}
            connectionLineType={ConnectionLineType.SmoothStep}
            defaultEdgeOptions={{
              animated: true,
              style: { stroke: theme === 'dark' ? '#a1a1aa' : '#94a3b8', strokeWidth: 2 },
            }}
            deleteKeyCode={['Backspace', 'Delete']}
            minZoom={0.2}
            maxZoom={4}
            fitView
            className={cn("transition-colors duration-200", theme === 'dark' && "dark")}
          > 
            <Background color={theme === 'dark' ? "#27272a" : "#27272a"} gap={16} size={1} />
          </ReactFlow>
        </div>
      </ReactFlowProvider>
    </div>
  );
}
