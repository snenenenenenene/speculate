// shareSlice.ts
import { toast } from 'sonner';
import { StateCreator } from 'zustand';
import { ShareSettings, ShareState } from './types';

export const createShareSlice: StateCreator<ShareState> = (set, get) => ({
  shares: [],
  loading: false,
  error: null,

  shareFlow: async (flowId: string, settings: Partial<ShareSettings>) => {
    try {
      set({ loading: true, error: null });

      const response = await fetch(`/api/flows/${flowId}/share`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings),
      });

      if (!response.ok) {
        throw new Error('Failed to share flow');
      }

      const data = await response.json();
      set(state => ({
        shares: [...state.shares, data.share],
        loading: false,
      }));

      toast.success('Flow shared successfully');
      return data.shareUrl;
    } catch (error) {
      set({ error: (error as Error).message, loading: false });
      toast.error('Failed to share flow');
      throw error;
    }
  },

  getShareLink: async (flowId: string) => {
    try {
      const response = await fetch(`/api/flows/${flowId}/share`);
      if (!response.ok) throw new Error('Failed to get share link');
      const data = await response.json();
      return data.shareUrl;
    } catch (error) {
      toast.error('Failed to get share link');
      throw error;
    }
  },

  revokeShare: async (shareId: string) => {
    try {
      set({ loading: true, error: null });

      const response = await fetch(`/api/shares/${shareId}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Failed to revoke share');

      set(state => ({
        shares: state.shares.filter(share => share.id !== shareId),
        loading: false,
      }));

      toast.success('Share revoked successfully');
    } catch (error) {
      set({ error: (error as Error).message, loading: false });
      toast.error('Failed to revoke share');
      throw error;
    }
  },

  getShares: async (flowId: string) => {
    try {
      set({ loading: true, error: null });

      const response = await fetch(`/api/flows/${flowId}/shares`);
      if (!response.ok) throw new Error('Failed to fetch shares');

      const data = await response.json();
      set({ shares: data.shares, loading: false });

      return data.shares;
    } catch (error) {
      set({ error: (error as Error).message, loading: false });
      throw error;
    }
  },
});