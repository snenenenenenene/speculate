/* eslint-disable @typescript-eslint/no-unused-vars */
import { StateCreator } from "zustand";
import { ChartInstance, UtilityState } from "./types";

const createUtilitySlice: StateCreator<UtilityState> = (set, get) => ({
  currentTab: "",

  setCurrentTab: (tabId: string) =>
    set((state) => {
      if (state.currentTab !== tabId) {
        console.log(`Updating currentTab in utilitySlice to: ${tabId}`);
        return { currentTab: tabId };
      }
      return state;
    }),

  saveToDb: async (chartInstances: ChartInstance[], projectId: string) => {
    try {
      console.log("saveToDb called with:", chartInstances);

      const response = await fetch("/api/save-chart", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ content: chartInstances, projectId }),
      });

      console.log("Response status:", response.status);

      if (!response.ok) {
        const errorData = await response.json();
        console.error("Error response:", errorData);
        throw new Error(errorData.message || "Failed to save to database");
      }

      const result = await response.json();
      console.log("Save result:", result);

      if (result.success) {
        console.log("Flows saved successfully:", result.flows);
      } else {
        throw new Error(
          result.message || "Unknown error occurred while saving"
        );
      }
    } catch (error) {
      console.error("Error saving to database:", error);
      throw error;
    }
  },

  loadSavedData: async () => {
    try {
      const response = await fetch("/api/load-chart");
      if (!response.ok) {
        throw new Error("Failed to load saved data");
      }
      const data = await response.json();
      if (data.content) {
        const parsedContent = JSON.parse(data.content);
        console.log("Parsed content:", parsedContent);
        return parsedContent;
      }
      return null;
    } catch (error) {
      console.error("Error loading saved data:", error);
      throw error;
    }
  },
});

export default createUtilitySlice;
