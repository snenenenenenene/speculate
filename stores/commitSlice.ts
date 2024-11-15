/* eslint-disable @typescript-eslint/no-explicit-any */
import { StateCreator } from "zustand";
import { CommitState } from "./types";

const createCommitSlice: StateCreator<CommitState> = (set, get) => ({
  localCommits: [],
  globalCommits: [],

  addLocalCommit: (message: string) => {
    const { chartInstances, currentDashboardTab } = get() as any;
    const currentInstance = chartInstances.find(
      (instance) => instance.id === currentDashboardTab
    );
    if (currentInstance) {
      set((state: any) => ({
        localCommits: [
          ...state.localCommits,
          {
            version: state.localCommits.length + 1,
            date: new Date().toISOString(),
            message,
            chartInstances: [currentInstance],
          },
        ],
      }));
    }
  },

  revertToLocalCommit: (message: string) => {
    const { localCommits } = get() as any;
    const commit = localCommits.find((commit) => commit.message === message);
    if (commit && commit.chartInstances.length > 0) {
      (get() as any).setChartInstance(commit.chartInstances[0]);
    }
  },

  addGlobalCommit: (message: string) => {
    const { chartInstances } = get() as any;
    set((state: any) => ({
      globalCommits: [
        ...state.globalCommits,
        {
          version: state.globalCommits.length + 1,
          date: new Date().toISOString(),
          message,
          chartInstances,
        },
      ],
    }));
  },

  revertToGlobalCommit: (message: string) => {
    const { globalCommits } = get() as any;
    const commit = globalCommits.find((commit) => commit.message === message);
    if (commit) {
      (get() as any).setChartInstances(commit.chartInstances);
    }
  },
});

export default createCommitSlice;
