// publishSlice.ts
import { toast } from 'sonner';
import { StateCreator } from 'zustand';
import { PublishSettings, PublishState } from './types';

export const createPublishSlice: StateCreator<PublishState> = (set, get) => ({
  versions: [],
  loading: false,
  error: null,

  publishFlow: async (flowId: string, settings: Partial<PublishSettings>) => {
    try {
      set({ loading: true, error: null });

      const response = await fetch(`/api/flows/${flowId}/publish`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings),
      });

      if (!response.ok) throw new Error('Failed to publish flow');

      const data = await response.json();
      set(state => ({
        versions: [...state.versions, data.version],
        loading: false,
      }));

      toast.success('Flow published successfully');
    } catch (error) {
      set({ error: (error as Error).message, loading: false });
      toast.error('Failed to publish flow');
      throw error;
    }
  },

  unpublishFlow: async (flowId: string) => {
    try {
      set({ loading: true, error: null });

      const response = await fetch(`/api/flows/${flowId}/publish`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Failed to unpublish flow');

      set(state => ({
        versions: state.versions.map(v => 
          v.flowId === flowId ? { ...v, isLatest: false } : v
        ),
        loading: false,
      }));

      toast.success('Flow unpublished successfully');
    } catch (error) {
      set({ error: (error as Error).message, loading: false });
      toast.error('Failed to unpublish flow');
      throw error;
    }
  },

  getVersions: async (flowId: string) => {
    try {
      set({ loading: true, error: null });

      const response = await fetch(`/api/flows/${flowId}/versions`);
      if (!response.ok) throw new Error('Failed to fetch versions');

      const data = await response.json();
      set({ versions: data.versions, loading: false });

      return data.versions;
    } catch (error) {
      set({ error: (error as Error).message, loading: false });
      throw error;
    }
  },

  restoreVersion: async (flowId: string, versionId: string) => {
    try {
      set({ loading: true, error: null });

      const response = await fetch(`/api/flows/${flowId}/versions/${versionId}/restore`, {
        method: 'POST',
      });

      if (!response.ok) throw new Error('Failed to restore version');

      const data = await response.json();
      set(state => ({
        versions: state.versions.map(v => 
          v.id === versionId ? { ...v, isLatest: true } : { ...v, isLatest: false }
        ),
        loading: false,
      }));

      toast.success('Version restored successfully');
    } catch (error) {
      set({ error: (error as Error).message, loading: false });
      toast.error('Failed to restore version');
      throw error;
    }
  },
});