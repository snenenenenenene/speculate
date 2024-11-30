import { toast } from "react-hot-toast";
import { v4 as uuidv4 } from "uuid";
import { StateCreator } from "zustand";
import {
  ChartInstance,
  CompleteExport,
  FlowExport,
  NodeChange,
  ValidationResult,
} from "./types";

const APPLICATION_VERSION = "1.0.0";

const createChartSlice: StateCreator<any> = (set, get) => ({
  chartInstances: [],
  currentDashboardTab: "",
  tempGeneratedChart: null,

  setCurrentDashboardTab: (tabId: string) => {
    if (get().currentDashboardTab !== tabId) {
      set({ currentDashboardTab: tabId });
    }
  },

  setChartInstances: (instances: ChartInstance[]) => {
    // Add check to prevent unnecessary updates
    const currentInstances = get().chartInstances;
    if (
      currentInstances.length === instances.length &&
      JSON.stringify(currentInstances) === JSON.stringify(instances)
    ) {
      return;
    }
    set({ chartInstances: instances });
  },

  updateNodes: (instanceId: string, changes: NodeChange[]) =>
    set((state) => ({
      chartInstances: state.chartInstances.map((instance) =>
        instance.id === instanceId
          ? {
              ...instance,
              nodes: changes,
            }
          : instance
      ),
    })),

  updateEdges: (instanceId: string, changes: any[]) =>
    set((state) => ({
      chartInstances: state.chartInstances.map((instance) =>
        instance.id === instanceId
          ? {
              ...instance,
              edges: changes,
            }
          : instance
      ),
    })),

  addNode: (instanceId: string, newNode: any) =>
    set((state) => ({
      chartInstances: state.chartInstances.map((instance) =>
        instance.id === instanceId
          ? {
              ...instance,
              nodes: [...(instance.nodes || []), newNode],
            }
          : instance
      ),
    })),

  addEdge: (instanceId: string, newEdge: any) =>
    set((state) => ({
      chartInstances: state.chartInstances.map((instance) =>
        instance.id === instanceId
          ? {
              ...instance,
              edges: [...(instance.edges || []), newEdge],
            }
          : instance
      ),
    })),

  updateNodeData: (instanceId: string, nodeId: string, newData: any) =>
    set((state) => ({
      chartInstances: state.chartInstances.map((instance) =>
        instance.id === instanceId
          ? {
              ...instance,
              nodes: instance.nodes.map((node) =>
                node.id === nodeId ? { ...node, data: newData } : node
              ),
            }
          : instance
      ),
    })),

  removeNode: (instanceId: string, nodeId: string) =>
    set((state) => ({
      chartInstances: state.chartInstances.map((instance) =>
        instance.id === instanceId
          ? {
              ...instance,
              nodes: instance.nodes.filter((node) => node.id !== nodeId),
              edges: instance.edges.filter(
                (edge) => edge.source !== nodeId && edge.target !== nodeId
              ),
            }
          : instance
      ),
    })),

  deleteTab: (tabId: string) =>
    set((state) => {
      const updatedInstances = state.chartInstances.filter(
        (instance) => instance.id !== tabId
      );
      const newCurrentTab =
        updatedInstances.length > 0 ? updatedInstances[0].id : "";
      return {
        chartInstances: updatedInstances,
        currentDashboardTab: newCurrentTab,
      };
    }),

  updateChart: (flowchartId: string, chartId: string, updatedChart: any) =>
    set((state) => ({
      chartInstances: state.chartInstances.map((instance) =>
        instance.id === chartId ? { ...instance, ...updatedChart } : instance
      ),
    })),

  updateChartInstanceName: (tabId: string, newName: string) =>
    set((state) => ({
      chartInstances: state.chartInstances.map((instance) =>
        instance.id === tabId ? { ...instance, name: newName } : instance
      ),
    })),

  setCurrentTabColor: (tabId: string, color: string) =>
    set((state) => ({
      chartInstances: state.chartInstances.map((instance) =>
        instance.id === tabId ? { ...instance, color } : instance
      ),
    })),

  setOnePage: (tabId: string, value: boolean) =>
    set((state) => ({
      chartInstances: state.chartInstances.map((instance) =>
        instance.id === tabId ? { ...instance, onePageMode: value } : instance
      ),
    })),

  addPublishedVersion: (tabId: string, version: number, date: string) =>
    set((state) => ({
      chartInstances: state.chartInstances.map((instance) =>
        instance.id === tabId
          ? {
              ...instance,
              publishedVersions: [
                ...(instance.publishedVersions || []),
                { version, date },
              ],
            }
          : instance
      ),
    })),

  revertToVersion: (tabId: string, version: number) => {
    const instance = get().chartInstances.find(
      (instance) => instance.id === tabId
    );
    if (instance && instance.publishedVersions) {
      const versionData = instance.publishedVersions.find(
        (v) => v.version === version
      );
      if (versionData) {
        set((state) => ({
          chartInstances: state.chartInstances.map((instance) =>
            instance.id === tabId
              ? {
                  ...instance,
                  nodes: versionData.nodes,
                  edges: versionData.edges,
                }
              : instance
          ),
        }));
      }
    }
  },

  getChartInstance: (chartId: string) => {
    return get().chartInstances.find((instance) => instance.id === chartId);
  },

  getCurrentChartInstance: () => {
    const { chartInstances, currentDashboardTab } = get();
    return chartInstances.find(
      (instance) => instance.id === currentDashboardTab
    );
  },

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

      flow.edges.forEach((edge) => {
        const sourceExists = flow.nodes.some((node) => node.id === edge.source);
        const targetExists = flow.nodes.some((node) => node.id === edge.target);

        if (!sourceExists || !targetExists) {
          errors.push(`Invalid edge reference in flow: ${flow.name}`);
        }
      });

      flow.nodes.forEach((node) => {
        if (
          !node.type ||
          ![
            "yesNo",
            "singleChoice",
            "multipleChoice",
            "endNode",
            "startNode",
            "weightNode",
            "functionNode",
          ].includes(node.type)
        ) {
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
      warnings,
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
      flow: instance,
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], {
      type: "application/json",
    });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${instance.name
      .toLowerCase()
      .replace(/\s+/g, "-")}-flow.json`;
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
      references: [],
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], {
      type: "application/json",
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
  },

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

    set((state) => ({
      chartInstances: [...state.chartInstances, newChart],
      currentDashboardTab: newChart.id,
    }));

    return newChart.id;
  },
});

export default createChartSlice;
