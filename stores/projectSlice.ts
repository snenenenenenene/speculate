import { Project, ProjectFilters } from "@/types/project";
import { StateCreator } from "zustand";

export interface ProjectState {
  projects: Project[];
  currentProject: Project | null;
  filters: ProjectFilters;
  loading: boolean;
  error: string | null;
  hasLoaded: boolean;

  // Project CRUD
  fetchProjects: () => Promise<void>;
  createProject: (data: Partial<Project>) => Promise<Project>;
  updateProject: (id: string, data: Partial<Project>) => Promise<Project>;
  deleteProject: (id: string) => Promise<void>;

  // Project Selection
  setCurrentProject: (project: Project | null) => void;

  // Filters
  setFilters: (filters: Partial<ProjectFilters>) => void;
  resetFilters: () => void;
}

const createProjectSlice: StateCreator<ProjectState> = (set, get) => ({
  projects: [],
  currentProject: null,
  filters: {},
  loading: false,
  error: null,
  hasLoaded: false,

  fetchProjects: async () => {
    // If we've already loaded projects, don't fetch again
    if (get().hasLoaded) return;

    set({ loading: true, error: null });
    try {
      const response = await fetch("/api/projects");

      if (!response.ok) {
        throw new Error("Failed to fetch projects");
      }

      const projects = await response.json();
      set({
        projects,
        loading: false,
        hasLoaded: true, // Mark as loaded even if empty
        error: null,
      });
    } catch (error) {
      console.error("Error fetching projects:", error);
      set({
        loading: false,
        hasLoaded: true, // Mark as loaded even on error
        error: "Failed to load projects",
      });
    }
  },

  createProject: async (data) => {
    set({ loading: true, error: null });
    try {
      const response = await fetch("/api/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error("Failed to create project");
      const project = await response.json();
      set((state) => ({
        projects: [...state.projects, project],
        loading: false,
      }));
      return project;
    } catch (error) {
      set({ error: (error as Error).message, loading: false });
      throw error;
    }
  },

  updateProject: async (id, data) => {
    set({ loading: true, error: null });
    try {
      const response = await fetch(`/api/projects/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error("Failed to update project");
      const updatedProject = await response.json();
      set((state) => ({
        projects: state.projects.map((p) => (p.id === id ? updatedProject : p)),
        currentProject:
          state.currentProject?.id === id
            ? updatedProject
            : state.currentProject,
        loading: false,
      }));
      return updatedProject;
    } catch (error) {
      set({ error: (error as Error).message, loading: false });
      throw error;
    }
  },

  deleteProject: async (id) => {
    set({ loading: true, error: null });
    try {
      const response = await fetch(`/api/projects/${id}`, {
        method: "DELETE",
      });
      if (!response.ok) throw new Error("Failed to delete project");
      set((state) => ({
        projects: state.projects.filter((p) => p.id !== id),
        currentProject:
          state.currentProject?.id === id ? null : state.currentProject,
        loading: false,
      }));
    } catch (error) {
      set({ error: (error as Error).message, loading: false });
      throw error;
    }
  },

  setCurrentProject: (project) => {
    set({ currentProject: project });
  },

  setFilters: (filters) => {
    set((state) => ({
      filters: { ...state.filters, ...filters },
    }));
  },

  resetFilters: () => {
    set({ filters: {} });
  },
});

export default createProjectSlice;
