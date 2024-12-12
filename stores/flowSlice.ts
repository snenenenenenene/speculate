/* eslint-disable @typescript-eslint/no-explicit-any */
import { toast } from "sonner";
import { Edge, Node, applyEdgeChanges, applyNodeChanges } from "reactflow";
import { v4 as uuidv4 } from "uuid";
import { 
  ChartInstance, 
  EdgeChange, 
  NodeChange, 
  ValidationResult 
} from "./types";

interface FlowState {
  flows: ChartInstance[];
  currentDashboardTab: string;
  tempGeneratedChart: null;
  currentProject: null;
  
  // Flow Management
  setFlows: (flows: ChartInstance[]) => void;
  addFlow: (flow: ChartInstance) => void;
  removeFlow: (flowId: string) => void;
  updateFlow: (updatedFlow: ChartInstance) => void;
  
  // Node Management
  removeNode: (flowId: string, nodeId: string) => void;
  updateNode: (flowId: string, nodeId: string, newData: any) => void;
  addNode: (flowId: string, newNode: Node) => void;
  updateNodes: (flowId: string, changes: NodeChange[]) => void;
  
  // Edge Management
  addEdge: (flowId: string, newEdge: Edge) => void;
  updateEdges: (flowId: string, changes: EdgeChange[]) => void;
  
  // Dashboard Management
  setCurrentDashboardTab: (tabId: string) => void;
  addNewTab: (newTabName: string) => Promise<string>;
  deleteTab: (tabId: string) => void;
  updateFlowName: (tabId: string, newName: string) => void;
  setCurrentTabColor: (tabId: string, color: string) => void;
  setOnePage: (tabId: string, value: boolean) => void;
  
  // Project Management
  setCurrentProject: (project: any) => void;
  
  // Import/Export
  importFlow: (file: File) => Promise<void>;
  exportFlow: (flowId: string) => Promise<void>;
  exportAllFlows: () => Promise<void>;
}

const createFlowSlice: StateCreator<FlowState> = (set, get) => ({
  flows: [],
  currentDashboardTab: "",
  tempGeneratedChart: null,
  currentProject: null,

  setFlows: (flows) => {
    console.log('FlowSlice: Setting flows:', flows);
    set({ flows });
    console.log('FlowSlice: Updated flows:', get().flows);
  },

  addFlow: (flow) => {
    console.log('FlowSlice: Adding flow:', flow);
    set((state) => ({
      flows: [...state.flows, flow],
    }));
    console.log('FlowSlice: Updated flows:', get().flows);
  },

  removeFlow: (flowId) => 
    set((state) => ({
      flows: state.flows.filter((flow) => flow.id !== flowId),
    })),

  updateFlow: (updatedFlow) =>
    set((state) => ({
      flows: state.flows.map((flow) =>
        flow.id === updatedFlow.id ? updatedFlow : flow
      ),
    })),

  removeNode: (flowId, nodeId) => {
    console.log('FlowSlice: Removing node', { flowId, nodeId });
    set((state) => {
      const newState = {
        flows: state.flows.map((flow) =>
          flow.id === flowId
            ? {
                ...flow,
                nodes: flow.nodes.filter((node) => node.id !== nodeId),
                edges: flow.edges.filter(
                  (edge) => edge.source !== nodeId && edge.target !== nodeId
                ),
              }
            : flow
        ),
      };
      console.log('FlowSlice: New state after removal:', newState);
      return newState;
    });
  },

  updateNode: (flowId, nodeId, newData) =>
    set((state) => ({
      flows: state.flows.map((flow) =>
        flow.id === flowId
          ? {
              ...flow,
              nodes: flow.nodes.map((node) =>
                node.id === nodeId ? { ...node, data: { ...node.data, ...newData } } : node
              ),
            }
          : flow
      ),
    })),

  addNode: (flowId, newNode) =>
    set((state) => ({
      flows: state.flows.map((flow) =>
        flow.id === flowId
          ? { ...flow, nodes: [...flow.nodes, newNode] }
          : flow
      ),
    })),

  updateNodes: (flowId, changes) =>
    set((state) => ({
      flows: state.flows.map((flow) =>
        flow.id === flowId
          ? {
              ...flow,
              nodes: Array.isArray(changes) ? applyNodeChanges(changes, flow.nodes) : flow.nodes,
            }
          : flow
      ),
    })),

  addEdge: (flowId, newEdge) =>
    set((state) => ({
      flows: state.flows.map((flow) =>
        flow.id === flowId
          ? { ...flow, edges: [...flow.edges, newEdge] }
          : flow
      ),
    })),

  updateEdges: (flowId, changes) =>
    set((state) => ({
      flows: state.flows.map((flow) =>
        flow.id === flowId
          ? {
              ...flow,
              edges: applyEdgeChanges(changes, flow.edges),
            }
          : flow
      ),
    })),

  setCurrentDashboardTab: (tabId) =>
    set((state) => {
      if (state.currentDashboardTab !== tabId) {
        return { currentDashboardTab: tabId };
      }
      return state;
    }),

  addNewTab: async (newTabName) => {
    const newFlow: ChartInstance = {
      id: uuidv4(),
      name: newTabName,
      nodes: [],
      edges: [],
      color: "#80B500",
      onePageMode: false,
      publishedVersions: [],
      variables: [],
    };

    set((state) => ({
      flows: [...state.flows, newFlow],
      currentDashboardTab: newFlow.id,
    }));

    try {
      // TODO: Implement save to DB functionality
      return newFlow.id;
    } catch (error) {
      console.error("Failed to save new tab:", error);
      throw error;
    }
  },

  deleteTab: (tabId) =>
    set((state) => {
      const updatedFlows = state.flows.filter(
        (flow) => flow.id !== tabId
      );
      const newCurrentTab =
        updatedFlows.length > 0 ? updatedFlows[0].id : "";
      return {
        flows: updatedFlows,
        currentDashboardTab: newCurrentTab,
      };
    }),

  updateFlowName: (tabId, newName) =>
    set((state) => ({
      flows: state.flows.map((flow) =>
        flow.id === tabId ? { ...flow, name: newName } : flow
      ),
    })),

  setCurrentTabColor: (tabId, color) =>
    set((state) => ({
      flows: state.flows.map((flow) =>
        flow.id === tabId ? { ...flow, color } : flow
      ),
    })),

  setOnePage: (tabId, value) =>
    set((state) => ({
      flows: state.flows.map((flow) =>
        flow.id === tabId ? { ...flow, onePageMode: value } : flow
      ),
    })),

  setCurrentProject: (project) => set({ currentProject: project }),

  importFlow: async (file) => {
    try {
      const content = await file.text();
      const flowData = JSON.parse(content);
      
      // Validate the imported data
      // TODO: Implement proper validation
      
      const newFlow: ChartInstance = {
        ...flowData,
        id: uuidv4(), // Generate new ID to avoid conflicts
      };
      
      set((state) => ({
        flows: [...state.flows, newFlow],
      }));
      
      toast.success('Flow imported successfully');
    } catch (error) {
      console.error('Error importing flow:', error);
      toast.error('Failed to import flow');
      throw error;
    }
  },

  exportFlow: async (flowId) => {
    try {
      const { flows } = get();
      const flow = flows.find((f) => f.id === flowId);
      
      if (!flow) {
        throw new Error('Flow not found');
      }
      
      const flowData = JSON.stringify(flow, null, 2);
      const blob = new Blob([flowData], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      
      const a = document.createElement('a');
      a.href = url;
      a.download = `${flow.name || 'flow'}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      toast.success('Flow exported successfully');
    } catch (error) {
      console.error('Error exporting flow:', error);
      toast.error('Failed to export flow');
      throw error;
    }
  },

  exportAllFlows: async () => {
    try {
      const { flows } = get();
      const flowsData = JSON.stringify(flows, null, 2);
      const blob = new Blob([flowsData], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      
      const a = document.createElement('a');
      a.href = url;
      a.download = 'all_flows.json';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      toast.success('All flows exported successfully');
    } catch (error) {
      console.error('Error exporting flows:', error);
      toast.error('Failed to export flows');
      throw error;
    }
  },
});

export default createFlowSlice;
