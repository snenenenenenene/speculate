// stores/utilitySlice.ts
import { StateCreator } from "zustand";
import { UtilityState } from "./types";

const createUtilitySlice: StateCreator<UtilityState> = (set, get) => ({
  currentFlowchartId: "",
  currentChartId: "",

  setCurrentIds: (flowchartId: string, chartId?: string) =>
    set({ currentFlowchartId: flowchartId, currentChartId: chartId || "" }),

  // Load a specific chart
  loadChart: async (flowchartId: string, chartId: string) => {
    try {
      const response = await fetch(
        `/api/flowcharts/${flowchartId}/charts/${chartId}`
      );
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to load chart");
      }

      return data;
    } catch (error) {
      console.error("Error loading chart:", error);
      throw error;
    }
  },

  // Load a flowchart and its charts
  loadFlowchart: async (flowchartId: string) => {
    console.log("MEOWW", flowchartId);
    try {
      const response = await fetch(`/api/flowcharts/${flowchartId}`);

      console.log("response", response);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to load flowchart");
      }

      return data;
    } catch (error) {
      console.error("Error loading flowchart:", error);
      throw error;
    }
  },

  // Save a specific chart
  saveChart: async (flowchartId: string, chartId: string, content: any) => {
    try {
      const response = await fetch(
        `/api/flowcharts/${flowchartId}/charts/${chartId}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ content }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to save chart");
      }

      return data;
    } catch (error) {
      console.error("Error saving chart:", error);
      throw error;
    }
  },

  // For backwards compatibility
  loadSavedData: async (flowchartId: string) => {
    try {
      const flowchart = await get().loadFlowchart(flowchartId);
      return {
        ...flowchart,
        charts: flowchart.charts || [],
      };
    } catch (error) {
      console.error("Error loading saved data:", error);
      throw error;
    }
  },

  // Utility method to save to database
  saveToDb: async (content: any) => {
    const { currentFlowchartId, currentChartId } = get();
    if (!currentFlowchartId || !currentChartId) {
      throw new Error("No active chart selected");
    }
    return get().saveChart(currentFlowchartId, currentChartId, content);
  },
});

export default createUtilitySlice;
