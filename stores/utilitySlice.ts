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

  saveToDb: async (flows: ChartInstance[]) => {
    try {
      console.log("saveToDb called with:", flows);

      const response = await fetch("/api/flows", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ content: flows }),
      });

      if (!response.ok) {
        throw new Error("Failed to save to database");
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
