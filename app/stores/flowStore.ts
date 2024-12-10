import { create } from 'zustand';
import { Node, Edge, applyNodeChanges, applyEdgeChanges } from 'reactflow';
import { toast } from 'sonner';

interface FlowState {
  nodes: Node[];
  edges: Edge[];
  isSaving: boolean;
  setNodes: (nodes: Node[] | ((prev: Node[]) => Node[])) => void;
  setEdges: (edges: Edge[] | ((prev: Edge[]) => Edge[])) => void;
  onNodesChange: (changes: any) => void;
  onEdgesChange: (changes: any) => void;
  saveFlow: (projectId: string, flowId: string) => Promise<void>;
}

export const useFlowStore = create<FlowState>((set, get) => ({
  nodes: [],
  edges: [],
  isSaving: false,
  setNodes: (nodes) => set({ 
    nodes: typeof nodes === 'function' ? nodes(get().nodes) : nodes 
  }),
  setEdges: (edges) => set({ 
    edges: typeof edges === 'function' ? edges(get().edges) : edges 
  }),
  onNodesChange: (changes) => {
    set({
      nodes: applyNodeChanges(changes, get().nodes)
    });
  },
  onEdgesChange: (changes) => {
    set({
      edges: applyEdgeChanges(changes, get().edges)
    });
  },
  saveFlow: async (projectId: string, flowId: string) => {
    const { nodes, edges, isSaving } = get();
    if (isSaving) return;

    set({ isSaving: true });
    
    try {
      const response = await fetch(`/api/projects/${projectId}/flows/${flowId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ nodes, edges }),
      });

      if (!response.ok) {
        throw new Error('Failed to save flow');
      }

      toast.success('Flow saved successfully');
    } catch (error) {
      console.error('Error saving flow:', error);
      toast.error('Failed to save flow');
      throw error;
    } finally {
      set({ isSaving: false });
    }
  },
}));
