import { StateCreator } from "zustand";
import { ChartInstance, UtilityState } from "./types";

const createUtilitySlice: StateCreator<UtilityState> = (set, get) => ({
  currentTab: "",
  projectId: null,

  setCurrentTab: (tabId: string) =>
    set((state) => {
      if (state.currentTab !== tabId) {
        console.log(`Setting current tab to: ${tabId}`);
        return { currentTab: tabId };
      }
      return state;
    }),

  setProjectId: (projectId: string) => {
    const currentProjectId = get().projectId;
    if (currentProjectId === projectId) {
      return;
    }
    
    console.log(`Setting project ID to:`, projectId);
    set({ projectId });
    
    // Store in localStorage for persistence
    try {
      localStorage.setItem('currentProjectId', projectId);
    } catch (e) {
      console.warn('Failed to save projectId to localStorage:', e);
    }
  },

  initializeStore: () => {
    try {
      const savedProjectId = localStorage.getItem('currentProjectId');
      if (savedProjectId) {
        set({ projectId: savedProjectId });
      }
    } catch (e) {
      console.warn('Failed to load projectId from localStorage:', e);
    }
  },

  saveToDb: async (chartInstances: ChartInstance[]) => {
    try {
      const { projectId } = get();
      
      if (!projectId) {
        throw new Error("No project selected");
      }

      console.log("Saving with projectId:", projectId);

      const response = await fetch("/api/save-chart", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ 
          content: chartInstances,
          projectId 
        }),
      });

      let responseText;
      try {
        responseText = await response.text();
        console.log("Raw response:", responseText);
        
        const data = JSON.parse(responseText);
        
        if (!response.ok) {
          throw new Error(data.message || `Server error: ${response.status}`);
        }

        if (!data.success) {
          throw new Error(data.message || "Operation was not successful");
        }

        console.log("Save successful:", data);
        return data.flows;
      } catch (parseError) {
        console.error("Response parsing error:", parseError);
        console.error("Raw response text:", responseText);
        throw new Error("Failed to parse server response");
      }

    } catch (error) {
      console.error("Error saving to database:", error);
      throw error instanceof Error ? error : new Error("Unknown error occurred");
    }
  },

  loadSavedData: async () => {
    try {
      const { projectId } = get();
      
      if (!projectId) {
        console.warn("No project ID available for loading data");
        return null;
      }

      console.log("Loading data for project:", projectId);

      const response = await fetch(`/api/load-chart?projectId=${projectId}`);
      
      let responseText;
      try {
        responseText = await response.text();
        console.log("Raw load response:", responseText);
        
        const data = JSON.parse(responseText);
        
        if (!response.ok) {
          throw new Error(data.message || `Server error: ${response.status}`);
        }

        if (!data.success) {
          throw new Error(data.message || "Failed to load data");
        }

        // Parse the content if it's stored as a string
        if (Array.isArray(data.content)) {
          const parsedContent = data.content.map(flow => ({
            ...flow,
            content: typeof flow.content === 'string' ? JSON.parse(flow.content) : flow.content
          }));
          console.log("Loaded and parsed data:", parsedContent);
          return parsedContent;
        }

        return data.content;
      } catch (parseError) {
        console.error("Response parsing error:", parseError);
        console.error("Raw response text:", responseText);
        throw new Error("Failed to parse loaded data");
      }

    } catch (error) {
      console.error("Error loading saved data:", error);
      throw error instanceof Error ? error : new Error("Failed to load data");
    }
  },
});

export default createUtilitySlice;