import { StateCreator } from "zustand";
import { ChartInstance, UtilityState } from "./types";

const createUtilitySlice = ((set, get) => ({
  currentTab: "",
  projectId: null,
  isLoading: false,

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

  saveToDb: async (chartInstances: ChartInstance[]) => {
    try {
      const { projectId } = get();
      
      if (!projectId) {
        throw new Error("No project selected");
      }

      const payload = {
        content: chartInstances.map(instance => ({
          ...instance,
          content: JSON.stringify({
            nodes: instance.nodes || [],
            edges: instance.edges || [],
            color: instance.color || "#80B500",
            onePageMode: instance.onePageMode || false,
            publishedVersions: instance.publishedVersions || [],
            variables: instance.variables || []
          })
        })),
        projectId
      };

      const response = await fetch("/api/save-chart", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || `Server error: ${response.status}`);
      }

      if (!data.success) {
        throw new Error(data.message || "Operation was not successful");
      }

      return data.flows;
    } catch (error) {
      console.error("Error saving to database:", error);
      throw error instanceof Error ? error : new Error("Unknown error occurred");
    }
  },

  loadSavedData: async () => {
    const state = get();
    
    if (state.isLoading || !state.projectId) {
      return null;
    }

    set({ isLoading: true });
    
    try {
      const response = await fetch(`/api/load-chart?projectId=${state.projectId}`);
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || `Server error: ${response.status}`);
      }

      if (!data.success) {
        throw new Error(data.message || "Failed to load data");
      }

      if (Array.isArray(data.content)) {
        const parsedContent = data.content.map(flow => ({
          ...flow,
          content: typeof flow.content === 'string' ? JSON.parse(flow.content) : flow.content
        }));
        return parsedContent;
      }

      return data.content;
    } catch (error) {
      console.error("Error loading saved data:", error);
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },
})) as StateCreator<UtilityState>;

export default createUtilitySlice;