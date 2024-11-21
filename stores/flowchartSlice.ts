/* eslint-disable @typescript-eslint/no-explicit-any */
import { v4 as uuidv4 } from "uuid";
import { StateCreator } from "zustand";

interface Chart {
  id: string;
  name: string;
  nodes: any[];
  edges: any[];
  color: string;
  onePageMode: boolean;
  publishedVersions: any[];
  variables: any[];
}

interface Flowchart {
  id: string;
  name: string;
  color: string;
  charts: Chart[];
  createdAt: string;
  updatedAt: string;
}

const createFlowchartSlice: StateCreator<any> = (set, get) => ({
  flowcharts: [],

  createFlowchart: (name: string, color: string = "#80B500") => {
    const newFlowchart: Flowchart = {
      id: uuidv4(),
      name,
      color,
      charts: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    set((state) => ({
      flowcharts: [...state.flowcharts, newFlowchart],
    }));

    return newFlowchart.id;
  },

  getFlowchart: (id: string) => {
    const { flowcharts } = get();
    return flowcharts.find((f: Flowchart) => f.id === id);
  },

  updateFlowchart: (id: string, updates: Partial<Flowchart>) =>
    set((state) => ({
      flowcharts: state.flowcharts.map((f: Flowchart) =>
        f.id === id
          ? { ...f, ...updates, updatedAt: new Date().toISOString() }
          : f
      ),
    })),

  createChart: (flowchartId: string, name: string) => {
    const newChart: Chart = {
      id: uuidv4(),
      name,
      nodes: [],
      edges: [],
      color: "#80B500",
      onePageMode: false,
      publishedVersions: [],
      variables: [],
    };

    set((state) => ({
      flowcharts: state.flowcharts.map((f: Flowchart) =>
        f.id === flowchartId
          ? {
              ...f,
              charts: [...f.charts, newChart],
              updatedAt: new Date().toISOString(),
            }
          : f
      ),
    }));

    return newChart.id;
  },

  getChart: (flowchartId: string, chartId: string) => {
    const flowchart = get().getFlowchart(flowchartId);
    return flowchart?.charts.find((c: Chart) => c.id === chartId);
  },

  updateChart: (
    flowchartId: string,
    chartId: string,
    updates: Partial<Chart>
  ) =>
    set((state) => ({
      flowcharts: state.flowcharts.map((f: Flowchart) =>
        f.id === flowchartId
          ? {
              ...f,
              charts: f.charts.map((c: Chart) =>
                c.id === chartId ? { ...c, ...updates } : c
              ),
              updatedAt: new Date().toISOString(),
            }
          : f
      ),
    })),

  deleteFlowchart: (id: string) =>
    set((state) => ({
      flowcharts: state.flowcharts.filter((f: Flowchart) => f.id !== id),
    })),

  deleteChart: (flowchartId: string, chartId: string) =>
    set((state) => ({
      flowcharts: state.flowcharts.map((f: Flowchart) =>
        f.id === flowchartId
          ? {
              ...f,
              charts: f.charts.filter((c: Chart) => c.id !== chartId),
              updatedAt: new Date().toISOString(),
            }
          : f
      ),
    })),
});

export default createFlowchartSlice;
