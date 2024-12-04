import { StateCreator } from "zustand";
import { addEdge, applyEdgeChanges, applyNodeChanges } from "reactflow";
import { v4 as uuidv4 } from "uuid";
import { toast } from "react-hot-toast";
import { ChartInstance, ChartState, CompleteExport, FlowExport, ValidationResult } from "./types";

const APPLICATION_VERSION = "1.0.0";

const createChartSlice: StateCreator<any> = (set, get) => ({
  chartInstances: [],
  currentDashboardTab: "",
  isLoading: false,
  error: null,
  tempGeneratedChart: null,

  // Core state management
  setCurrentDashboardTab: (tabId: string) =>
    set((state) => {
      if (state.currentDashboardTab !== tabId) {
        return { currentDashboardTab: tabId };
      }
      return state;
    }),

  setChartInstances: (newInstances: ChartInstance[]) =>
    set({ 
      chartInstances: newInstances,
      isLoading: false 
    }),

  // Instance management
  getChartInstance: (tabId: string) => {
    if (!tabId) return null;
    const { chartInstances } = get();
    return chartInstances.find(instance => instance.id === tabId) || null;
  },

  getCurrentChartInstance: () => {
    const { chartInstances, currentDashboardTab } = get();
    return chartInstances.find(instance => instance.id === currentDashboardTab) || null;
  },

  // Tab management
  addNewTab: async (newTabName: string) => {
    const { utilityStore } = get();
    
    const newTab: ChartInstance = {
      id: uuidv4(),
      name: newTabName,
      nodes: [],
      edges: [],
      color: "#80B500",
      onePageMode: false,
      publishedVersions: [],
      variables: [],
    };

    try {
      set(state => ({
        chartInstances: [...state.chartInstances, newTab],
        currentDashboardTab: newTab.id,
        error: null
      }));

      // Only save to database after local state is updated
      await utilityStore.saveToDb(get().chartInstances);
      
      return newTab.id;
    } catch (error) {
      // Revert on error
      set(state => ({
        chartInstances: state.chartInstances.filter(instance => instance.id !== newTab.id),
        error: error.message
      }));
      throw error;
    }
  },

  deleteTab: (tabId: string) => {
    if (!tabId) return;
    set(state => {
      const updatedInstances = state.chartInstances.filter(instance => instance.id !== tabId);
      return {
        chartInstances: updatedInstances,
        currentDashboardTab: updatedInstances[0]?.id || "",
        error: null
      };
    });
  },

  // Node and edge management
  updateNodes: (instanceId: string, changes) => {
    if (!instanceId) return;
    set(state => ({
      chartInstances: state.chartInstances.map(instance =>
        instance.id === instanceId
          ? { ...instance, nodes: applyNodeChanges(changes, instance.nodes) }
          : instance
      )
    }));
  },

  updateEdges: (instanceId: string, changes) => {
    if (!instanceId) return;
    set(state => ({
      chartInstances: state.chartInstances.map(instance =>
        instance.id === instanceId
          ? { ...instance, edges: applyEdgeChanges(changes, instance.edges) }
          : instance
      )
    }));
  },

  addNode: (instanceId: string, newNode) => {
    if (!instanceId || !newNode) return;
    set(state => ({
      chartInstances: state.chartInstances.map(instance =>
        instance.id === instanceId
          ? { ...instance, nodes: [...instance.nodes, newNode] }
          : instance
      )
    }));
  },

  addEdge: (instanceId: string, newEdge) => {
    if (!instanceId || !newEdge) return;
    set(state => ({
      chartInstances: state.chartInstances.map(instance =>
        instance.id === instanceId
          ? { ...instance, edges: addEdge(newEdge, instance.edges) }
          : instance
      )
    }));
  },

  removeNode: (instanceId: string, nodeId: string) => {
    if (!instanceId || !nodeId) return;
    set(state => ({
      chartInstances: state.chartInstances.map(instance =>
        instance.id === instanceId
          ? {
              ...instance,
              nodes: instance.nodes.filter(node => node.id !== nodeId),
              edges: instance.edges.filter(edge => 
                edge.source !== nodeId && edge.target !== nodeId
              )
            }
          : instance
      )
    }));
  },

  // Instance properties management
  updateChartInstanceName: (tabId: string, newName: string) =>
    set(state => ({
      chartInstances: state.chartInstances.map(instance =>
        instance.id === tabId ? { ...instance, name: newName } : instance
      )
    })),

  setCurrentTabColor: (tabId: string, color: string) =>
    set(state => ({
      chartInstances: state.chartInstances.map(instance =>
        instance.id === tabId ? { ...instance, color } : instance
      )
    })),

  setOnePage: (tabId: string, value: boolean) =>
    set(state => ({
      chartInstances: state.chartInstances.map(instance =>
        instance.id === tabId ? { ...instance, onePageMode: value } : instance
      )
    })),

  // AI chart management
  addAIChart: (chartData: any) => {
    const newChart: ChartInstance = {
      id: uuidv4(),
      name: chartData.name || "New AI Flow",
      nodes: chartData.nodes || [],
      edges: chartData.edges || [],
      color: "#80B500",
      onePageMode: false,
      publishedVersions: [],
      variables: [],
    };

    set(state => ({
      chartInstances: [...state.chartInstances, newChart],
      currentDashboardTab: newChart.id,
      error: null
    }));

    return newChart.id;
  },

  // Version control
  addPublishedVersion: (tabId: string, version: number, date: string) =>
    set(state => ({
      chartInstances: state.chartInstances.map(instance =>
        instance.id === tabId
          ? {
              ...instance,
              publishedVersions: [
                ...(instance.publishedVersions || []),
                { version, date }
              ]
            }
          : instance
      )
    })),

  revertToVersion: (tabId: string, version: number) =>
    set(state => {
      const instance = state.chartInstances.find(instance => instance.id === tabId);
      if (instance?.publishedVersions) {
        const versionData = instance.publishedVersions.find(v => v.version === version);
        if (versionData) {
          return {
            chartInstances: state.chartInstances.map(instance =>
              instance.id === tabId
                ? { ...instance, nodes: versionData.nodes, edges: versionData.edges }
                : instance
            )
          };
        }
      }
      return state;
    }),

  // Import/Export functionality
  validateImport: (data: FlowExport | CompleteExport): ValidationResult => {
    const errors: string[] = [];
    const warnings: string[] = [];

    if (!data.version || !data.exportDate) {
      errors.push("Invalid export format: missing metadata");
    }

    if (data.applicationVersion !== APPLICATION_VERSION) {
      warnings.push(
        `Flow was exported from a different version (${data.applicationVersion})`
      );
    }

    const validateFlow = (flow: ChartInstance) => {
      if (!flow.name || !flow.nodes || !flow.edges) {
        errors.push(`Invalid flow structure: ${flow.name || "Unnamed flow"}`);
        return;
      }

      // Validate edges
      flow.edges.forEach(edge => {
        const sourceExists = flow.nodes.some(node => node.id === edge.source);
        const targetExists = flow.nodes.some(node => node.id === edge.target);

        if (!sourceExists || !targetExists) {
          errors.push(`Invalid edge reference in flow: ${flow.name}`);
        }
      });

      // Validate nodes
      flow.nodes.forEach(node => {
        if (!node.type || ![
          "yesNo",
          "singleChoice",
          "multipleChoice",
          "endNode",
          "startNode",
          "weightNode",
          "functionNode"
        ].includes(node.type)) {
          errors.push(`Invalid node type in flow: ${flow.name}`);
        }
      });
    };

    if (data.type === "single") {
      validateFlow((data as FlowExport).flow);
    } else {
      (data as CompleteExport).flows.forEach(validateFlow);
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  },

  exportFlow: (instanceId: string) => {
    const instance = get().getChartInstance(instanceId);
    if (!instance) {
      toast.error("Flow not found");
      return;
    }

    const exportData: FlowExport = {
      version: "1.0",
      exportDate: new Date().toISOString(),
      type: "single",
      applicationVersion: APPLICATION_VERSION,
      flow: instance
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], {
      type: "application/json"
    });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${instance.name.toLowerCase().replace(/\s+/g, "-")}-flow.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);

    toast.success("Flow exported successfully");
  },

  exportAllFlows: () => {
    const { chartInstances } = get();

    const exportData: CompleteExport = {
      version: "1.0",
      exportDate: new Date().toISOString(),
      type: "complete",
      applicationVersion: APPLICATION_VERSION,
      flows: chartInstances,
      references: []
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], {
      type: "application/json"
    });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `all-flows-${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);

    toast.success("All flows exported successfully");
  }
});

export default createChartSlice;