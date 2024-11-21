// stores/utilitySlice.ts
import { StateCreator } from "zustand";
import { UtilityState } from "./types";

const createUtilitySlice: StateCreator<UtilityState> = (set, get) => ({
  currentFlowchartId: "",
  currentChartId: "",

  setCurrentIds: (flowchartId: string, chartId?: string) =>
    set({ currentFlowchartId: flowchartId, currentChartId: chartId || "" }),

  loadChart: async (flowchartId: string, chartId: string) => {
    try {
      if (!flowchartId || flowchartId === "undefined") {
        throw new Error("Missing flowchart ID");
      }

      const response = await fetch(
        `/api/flowcharts/${flowchartId}/charts/${chartId}`
      );

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to load chart");
      }

      return await response.json();
    } catch (error) {
      console.error("Error loading chart:", error);
      throw error;
    }
  },

  loadFlowchart: async (flowchartId: string) => {
    try {
      if (!flowchartId || flowchartId === "undefined") {
        throw new Error("Missing flowchart ID");
      }

      const response = await fetch(`/api/flowcharts/${flowchartId}`);
      console.log("response", response);

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to load flowchart");
      }

      return await response.json();
    } catch (error) {
      console.error("Error loading flowchart:", error);
      throw error;
    }
  },

  loadSavedData: async () => {
    // For initial load, get all flowcharts instead of a specific one
    try {
      const response = await fetch("/api/flowcharts");
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to load flowcharts");
      }
      return await response.json();
    } catch (error) {
      console.error("Error loading saved data:", error);
      throw error;
    }
  },

  saveToDb: async (content: any) => {
    const { currentFlowchartId, currentChartId } = get();
    if (!currentFlowchartId || !currentChartId) {
      throw new Error("No active chart selected");
    }
    return get().saveChart(currentFlowchartId, currentChartId, content);
  },
});

export default createUtilitySlice;
