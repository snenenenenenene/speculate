"use client";

import { FlowSelector } from "@/components/dashboard/FlowSelector";
import { ImportChoiceDialog } from "@/components/dashboard/ImportChoiceDialog";
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
import { cn } from "@/lib/utils";
import {
  ArrowLeft,
  GitCommit,
  Save,
  Settings,
  Upload,
} from "lucide-react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import ReactFlow, {
  Background,
  Controls,
  ReactFlowProvider,
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

function FlowEditor({ 
  projectId, 
  flowId,
  isSaving,
  onSave
}: { 
  projectId: string; 
  flowId: string;
  isSaving: boolean;
  onSave: (nodes: Node[], edges: Edge[]) => void;
}) {
  const [nodes, setNodes] = useState<Node[]>([]);
  const [edges, setEdges] = useState<Edge[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [sidebarWidth, setSidebarWidth] = useState(280);
  const { setViewport, project } = useReactFlow();

  // Expose nodes and edges to parent via keyboard shortcut
  useEffect(() => {
    const handleSave = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        onSave(nodes, edges);
      }
    };

    window.addEventListener('keydown', handleSave);
    return () => window.removeEventListener('keydown', handleSave);
  }, [nodes, edges, onSave]);

  useEffect(() => {
    const loadFlow = async () => {
      try {
        const response = await fetch(`/api/projects/${projectId}/flows/${flowId}`);
        if (!response.ok) {
          throw new Error('Failed to load flow');
        }
        
        const data = await response.json();
        if (data.flow?.content) {
          const flowContent = JSON.parse(data.flow.content);
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

  const onNodesChange: OnNodesChange = useCallback((changes) => {
    console.log('Node changes:', changes);
    setNodes((nds) => applyNodeChanges(changes, nds));
  }, []);

  const onEdgesChange: OnEdgesChange = useCallback((changes) => {
    console.log('Edge changes:', changes);
    setEdges((eds) => applyEdgeChanges(changes, eds));
  }, []);

  const onConnect: OnConnect = useCallback((params) => {
    console.log('New connection:', params);
    setEdges((eds) => addEdge(params, eds));
  }, []);

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
        x: event.clientX - sidebarWidth,
        y: event.clientY - 64, // Adjust for header height
      });

      const newNode = createNewNode(type, position, flowId);
      setNodes((nds) => [...nds, newNode]);
    },
    [project, sidebarWidth, flowId]
  );

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <LoadingSpinner className="h-8 w-8 text-primary-600" />
      </div>
    );
  }

  return (
    <div className="h-full flex">
      {/* Node Sidebar */}
      <div className="h-full border-r border-base-200">
        <NodeSidebar
          width={sidebarWidth}
          onWidthChange={setSidebarWidth}
        />
      </div>

      <div className="flex-1">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          onDragOver={onDragOver}
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

export default function FlowEditorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const params = useParams();
  const router = useRouter();
  const projectId = params.projectId as string;
  const flowId = params.flowId as string;

  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [importChoiceOpen, setImportChoiceOpen] = useState(false);
  const [pendingImport, setPendingImport] = useState<any>(null);
  const [isSaving, setIsSaving] = useState(false);

  const saveFlow = async (nodes: Node[], edges: Edge[], showToast = true) => {
    setIsSaving(true);
    let savingToast;
    if (showToast) {
      savingToast = toast.loading('Saving changes...');
    }

    try {
      const flowContent = {
        nodes,
        edges,
        viewport: { x: 0, y: 0, zoom: 1 }
      };

      const response = await fetch(`/api/projects/${projectId}/flows/${flowId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: 'My Flow', // You might want to make this dynamic
          content: JSON.stringify(flowContent)
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to save flow');
      }

      if (showToast) {
        toast.success('Changes saved successfully', { id: savingToast });
      }
    } catch (error) {
      console.error('Error saving:', error);
      if (showToast) {
        toast.error('Failed to save changes', { id: savingToast });
      }
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <ReactFlowProvider>
      <div className="flex h-screen overflow-hidden bg-base-50">
        {/* Top Navigation Bar */}
        <div className="absolute top-0 left-0 right-0 h-16 bg-white border-b border-base-200 z-50">
          <div className="h-full flex items-center px-4 gap-4">
            {/* Back to Project */}
            <Link
              href={`/projects/${projectId}`}
              className="flex items-center gap-1.5 text-gray-600 hover:text-gray-900 
                       transition-colors p-1.5 hover:bg-gray-50 rounded-lg"
            >
              <ArrowLeft className="h-4 w-4" />
              <span className="text-sm">Back</span>
            </Link>

            <div className="h-6 w-px bg-base-200" />

            {/* Flow Selector */}
            <FlowSelector
              currentFlow={flowId}
              projectId={projectId}
              onFlowSelect={(id) => router.push(`/projects/${projectId}/flows/${id}`)}
            />

            <div className="h-6 w-px bg-base-200" />

            {/* Quick Actions */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => saveFlow(nodes, edges, true)}
                disabled={isSaving}
                className={cn(
                  "flex items-center justify-center gap-2 px-3 py-1.5",
                  "text-sm font-medium rounded-lg transition-all",
                  "bg-blue-50 text-blue-600 hover:bg-blue-100",
                  "disabled:opacity-50 disabled:cursor-not-allowed",
                  "min-w-[80px]"
                )}
              >
                {isSaving ? (
                  <>
                    <LoadingSpinner className="h-4 w-4" />
                    <span>Saving</span>
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4" />
                    <span>Save</span>
                  </>
                )}
              </button>

              <button
                onClick={() => setIsImportModalOpen(true)}
                className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-base-600 hover:bg-base-50 rounded-lg transition-colors"
              >
                <Upload className="h-4 w-4" />
                Import/Export
              </button>

              <button className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-base-600 hover:bg-base-50 rounded-lg transition-colors">
                <GitCommit className="h-4 w-4" />
                Commit
              </button>

              <div className="h-6 w-px bg-base-200" />

              <button className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-base-600 hover:bg-base-50 rounded-lg transition-colors">
                <Settings className="h-4 w-4" />
                Settings
              </button>
            </div>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 relative flex flex-col overflow-hidden mt-16">
          <main className="flex-1 relative bg-base-50">
            <FlowEditor 
              projectId={projectId} 
              flowId={flowId}
              isSaving={isSaving}
              onSave={(nodes, edges) => saveFlow(nodes, edges, true)}
            />
          </main>
        </div>

        {/* Import Choice Dialog */}
        {pendingImport && (
          <ImportChoiceDialog
            isOpen={importChoiceOpen}
            onClose={() => {
              setImportChoiceOpen(false);
              setPendingImport(null);
            }}
            importType={pendingImport.type}
            onReplace={() => {/* Handle replace */}}
            onAppend={() => {/* Handle append */}}
          />
        )}
      </div>
    </ReactFlowProvider>
  );
}