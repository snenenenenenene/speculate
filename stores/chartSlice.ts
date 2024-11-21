/* eslint-disable @typescript-eslint/no-explicit-any */
import { toast } from "react-hot-toast";
import { addEdge, applyEdgeChanges, applyNodeChanges, Edge } from "reactflow";
import { v4 as uuidv4 } from "uuid";
import { StateCreator } from "zustand";
import { CompleteExport, FlowExport, ValidationResult } from "./types";

export interface ChartState {
  currentFlowchartId: string;
  currentChartId: string;
  currentDashboardTab: string;
  tempGeneratedChart: any;
  chartInstances: any[];
  setChartInstances: (instances: any[]) => void;
  getFlowchart: () => any;
  updateChart: (flowchartId: string, chartId: string, updates: any) => void;
  setCurrentIds: (flowchartId: string, chartId?: string) => void;
  updateNodes: (chartId: string, changes: any[]) => void;
  updateEdges: (chartId: string, changes: any[]) => void;
  addNode: (chartId: string, newNode: any) => void;
  addEdge: (chartId: string, newEdge: Edge) => void;
  updateNode: (chartId: string, nodeId: string, newData: any) => void;
  removeNode: (chartId: string, nodeId: string) => void;
  deleteChart: (flowchartId: string, chartId: string) => void;
  updateChartName: (
    flowchartId: string,
    chartId: string,
    newName: string
  ) => void;
  setChartColor: (flowchartId: string, chartId: string, color: string) => void;
  setOnePage: (flowchartId: string, chartId: string, value: boolean) => void;
  addPublishedVersion: (
    flowchartId: string,
    chartId: string,
    version: number,
    date: string
  ) => void;
  getChartInstance: (chartId: string) => any;
  getCurrentChartInstance: () => any;
  addAIChart: (flowchartId: string, chartData: any) => string;
  validateImport: (data: FlowExport | CompleteExport) => ValidationResult;
  exportChart: (flowchartId: string, chartId: string) => void;
  exportAllCharts: (flowchartId: string) => void;
  setCurrentDashboardTab: (tabId: string) => void;
}

const APPLICATION_VERSION = "1.0.0";

const createChartSlice: StateCreator<ChartState> = (set, get) => ({
  currentFlowchartId: "",
  currentChartId: "",
  currentDashboardTab: "",
  tempGeneratedChart: null,
  chartInstances: [],

  setChartInstances: (instances) => {
    console.log("Setting chart instances:", instances);
    set({ chartInstances: instances });
  },

  setCurrentDashboardTab: (tabId: string) => {
    if (get().currentDashboardTab !== tabId) {
      set({ currentDashboardTab: tabId });
    }
  },

  getChartInstances: (flowchartId: string) => {
    const { chartInstances } = get();
    return chartInstances.filter(
      (chart: any) => chart.flowchartId === flowchartId
    );
  },

  setCurrentIds: (flowchartId: string, chartId?: string) =>
    set({
      currentFlowchartId: flowchartId,
      currentChartId: chartId || "",
    }),

  updateNodes: (chartId: string, changes: any[]) => {
    const { getFlowchart, updateChart } = get() as any;
    const flowchart = getFlowchart();

    if (flowchart) {
      const chart = flowchart.charts.find((c: any) => c.id === chartId);
      if (chart) {
        updateChart(flowchart.id, chartId, {
          nodes: applyNodeChanges(changes, chart.nodes),
        });
      }
    }
  },

  updateEdges: (chartId: string, changes: any[]) => {
    const { getFlowchart, updateChart } = get() as any;
    const flowchart = getFlowchart();

    if (flowchart) {
      const chart = flowchart.charts.find((c: any) => c.id === chartId);
      if (chart) {
        updateChart(flowchart.id, chartId, {
          edges: applyEdgeChanges(changes, chart.edges),
        });
      }
    }
  },

  addNode: (chartId: string, newNode: any) => {
    const { getFlowchart, updateChart } = get() as any;
    const flowchart = getFlowchart();

    if (flowchart) {
      const chart = flowchart.charts.find((c: any) => c.id === chartId);
      if (chart) {
        updateChart(flowchart.id, chartId, {
          nodes: [...chart.nodes, newNode],
        });
      }
    }
  },

  addEdge: (chartId: string, newEdge: Edge) => {
    const { getFlowchart, updateChart } = get() as any;
    const flowchart = getFlowchart();

    if (flowchart) {
      const chart = flowchart.charts.find((c: any) => c.id === chartId);
      if (chart) {
        updateChart(flowchart.id, chartId, {
          edges: addEdge(newEdge, chart.edges),
        });
      }
    }
  },

  updateNode: (chartId: string, nodeId: string, newData: any) => {
    const { getFlowchart, updateChart } = get() as any;
    const flowchart = getFlowchart();

    if (flowchart) {
      const chart = flowchart.charts.find((c: any) => c.id === chartId);
      if (chart) {
        updateChart(flowchart.id, chartId, {
          nodes: chart.nodes.map((node: any) =>
            node.id === nodeId ? { ...node, ...newData } : node
          ),
        });
      }
    }
  },

  removeNode: (chartId: string, nodeId: string) => {
    const { getFlowchart, updateChart } = get() as any;
    const flowchart = getFlowchart();

    if (flowchart) {
      const chart = flowchart.charts.find((c: any) => c.id === chartId);
      if (chart) {
        updateChart(flowchart.id, chartId, {
          nodes: chart.nodes.filter((node: any) => node.id !== nodeId),
          edges: chart.edges.filter(
            (edge: any) => edge.source !== nodeId && edge.target !== nodeId
          ),
        });
      }
    }
  },

  deleteChart: (flowchartId: string, chartId: string) => {
    const { deleteChart } = get() as any;
    deleteChart(flowchartId, chartId);
    set({ currentChartId: "" });
  },

  updateChartName: (flowchartId: string, chartId: string, newName: string) => {
    const { updateChart } = get() as any;
    updateChart(flowchartId, chartId, { name: newName });
  },

  setChartColor: (flowchartId: string, chartId: string, color: string) => {
    const { updateChart } = get() as any;
    updateChart(flowchartId, chartId, { color });
  },

  setOnePage: (flowchartId: string, chartId: string, value: boolean) => {
    const { updateChart } = get() as any;
    updateChart(flowchartId, chartId, { onePageMode: value });
  },

  addPublishedVersion: (
    flowchartId: string,
    chartId: string,
    version: number,
    date: string
  ) => {
    const { getFlowchart, updateChart } = get() as any;
    const flowchart = getFlowchart(flowchartId);
    const chart = flowchart?.charts.find((c: any) => c.id === chartId);

    if (chart) {
      updateChart(flowchartId, chartId, {
        publishedVersions: [
          ...(chart.publishedVersions || []),
          { version, date },
        ],
      });
    }
  },

  getChartInstance: (chartId: string) => {
    if (!chartId) return null;
    const { getFlowchart } = get() as any;
    const flowchart = getFlowchart();
    return flowchart?.charts.find((c: any) => c.id === chartId);
  },

  getCurrentChartInstance: () => {
    const { currentChartId, getChartInstance } = get();
    return getChartInstance(currentChartId);
  },

  addAIChart: (flowchartId: string, chartData: any) => {
    const { updateChart } = get() as any;
    const newChart = {
      id: uuidv4(),
      name: chartData.name || "New AI Chart",
      nodes: chartData.nodes || [],
      edges: chartData.edges || [],
      color: "#80B500",
      onePageMode: false,
      publishedVersions: [],
      variables: [],
    };

    updateChart(flowchartId, newChart.id, newChart);
    set({ currentChartId: newChart.id });
    return newChart.id;
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

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
    };
  },

  exportChart: (flowchartId: string, chartId: string) => {
    const { getChartInstance } = get();
    const chart = getChartInstance(chartId);
    if (!chart) {
      toast.error("Chart not found");
      return;
    }

    const exportData: FlowExport = {
      version: "1.0",
      exportDate: new Date().toISOString(),
      type: "single",
      applicationVersion: APPLICATION_VERSION,
      flow: chart,
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], {
      type: "application/json",
    });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${chart.name
      .toLowerCase()
      .replace(/\s+/g, "-")}-chart.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);

    toast.success("Chart exported successfully");
  },

  exportAllCharts: (flowchartId: string) => {
    const { getFlowchart } = get() as any;
    const flowchart = getFlowchart(flowchartId);

    if (!flowchart) {
      toast.error("Flowchart not found");
      return;
    }

    const exportData: CompleteExport = {
      version: "1.0",
      exportDate: new Date().toISOString(),
      type: "complete",
      applicationVersion: APPLICATION_VERSION,
      flows: flowchart.charts,
      references: [],
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], {
      type: "application/json",
    });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${flowchart.name}-charts-${new Date()
      .toISOString()
      .slice(0, 10)}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);

    toast.success("All charts exported successfully");
  },
});

export default createChartSlice;
