import { create } from 'zustand';
import { Project } from '@/types/project';

interface ProjectStore {
  projects: Project[];
  currentProject: Project | null;
  loading: boolean;
  error: string | null;
  fetchProjects: () => Promise<void>;
  fetchProject: (id: string) => Promise<Project | null>;
  setCurrentProject: (project: Project | null) => void;
}

export const useProjectStore = create<ProjectStore>((set, get) => ({
  projects: [],
  currentProject: null,
  loading: false,
  error: null,

  fetchProjects: async () => {
    try {
      set({ loading: true, error: null });
      const response = await fetch('/api/projects');
      if (!response.ok) {
        throw new Error('Failed to fetch projects');
      }
      const data = await response.json();
      set({ projects: data });
    } catch (error: any) {
      set({ error: error.message });
    } finally {
      set({ loading: false });
    }
  },

  fetchProject: async (id: string) => {
    // Don't fetch if we already have the current project loaded
    const { currentProject } = get();
    if (currentProject?.id === id) {
      return currentProject;
    }

    try {
      set({ loading: true, error: null });
      const response = await fetch(`/api/projects/${id}`);
      if (!response.ok) {
        throw new Error('Failed to fetch project');
      }
      const project = await response.json();
      set({ currentProject: project });
      return project;
    } catch (error: any) {
      set({ error: error.message });
      return null;
    } finally {
      set({ loading: false });
    }
  },

  setCurrentProject: (project: Project | null) => {
    set({ currentProject: project });
  },
}));
