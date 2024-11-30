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

      const data = await response.json();
      return {
        ...data,
        content: data.content
          ? JSON.parse(data.content)
          : { nodes: [], edges: [] },
      };
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
    try {
      const response = await fetch("/api/flowcharts");
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to load flowcharts");
      }
      const data = await response.json();

      // Transform the data to include parsed content for each chart
      return data.map((flowchart) => ({
        ...flowchart,
        charts: flowchart.charts.map((chart) => ({
          ...chart,
          content: chart.content
            ? JSON.parse(chart.content)
            : { nodes: [], edges: [] },
        })),
      }));
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

    try {
      const response = await fetch(
        `/api/flowcharts/${currentFlowchartId}/charts/${currentChartId}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            content: {
              nodes: content.nodes || [],
              edges: content.edges || [],
            },
          }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to save chart");
      }

      return await response.json();
    } catch (error) {
      console.error("Error saving to database:", error);
      throw error;
    }
  },
});

export default createUtilitySlice;
