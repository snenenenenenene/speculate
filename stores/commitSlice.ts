import { StateCreator } from "zustand";
import { CommitState } from "./types";

const createCommitSlice: StateCreator<CommitState> = (set, get) => ({
  localCommits: [],
  globalCommits: [],

  addLocalCommit: (message: string) => {
    const { chartInstances, currentDashboardTab } = get();
    const currentInstance = chartInstances.find(
      (instance) => instance.id === currentDashboardTab,
    );
    if (currentInstance) {
      set((state) => ({
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
    const { localCommits } = get();
    const commit = localCommits.find((commit) => commit.message === message);
    if (commit && commit.chartInstances.length > 0) {
      get().setChartInstance(commit.chartInstances[0]);
    }
  },

  addGlobalCommit: (message: string) => {
    const { chartInstances } = get();
    set((state) => ({
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
    const { globalCommits } = get();
    const commit = globalCommits.find((commit) => commit.message === message);
    if (commit) {
      get().setChartInstances(commit.chartInstances);
    }
  },
});

export default createCommitSlice;
