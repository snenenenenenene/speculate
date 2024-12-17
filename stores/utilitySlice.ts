import { StateCreator } from "zustand";
import { ChartInstance } from "./types";
import { toast } from "sonner";

interface UtilityState {
  projectId: string | null;
  setProjectId: (projectId: string) => void;
  saveToDb: (flows: ChartInstance[]) => Promise<ChartInstance[]>;
}

const createUtilitySlice: StateCreator<UtilityState> = (set, get) => ({
  projectId: null,

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

  saveToDb: async (flows: ChartInstance[]) => {
    try {
      console.log("saveToDb called with:", flows);
      const projectId = get().projectId;
      
      if (!projectId) {
        throw new Error("No project ID set");
      }

      const response = await fetch("/api/flows", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ 
          projectId,
          content: flows.map(flow => ({
            ...flow,
            nodes: flow.nodes || [],
            edges: flow.edges || [],
            variables: flow.variables || []
          }))
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to save to database");
      }

      const data = await response.json();
      return data.charts;
    } catch (error) {
      console.error("Error saving to database:", error);
      toast.error("Failed to save flow");
      throw error;
    }
  },
});

export default createUtilitySlice;