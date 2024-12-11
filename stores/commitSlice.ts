/* eslint-disable @typescript-eslint/no-explicit-any */
import { StateCreator } from "zustand";
import { CommitState } from "./types";
import { v4 as uuidv4 } from 'uuid';
import { APPLICATION_VERSION } from '@/lib/constants';

const createCommitSlice: StateCreator<CommitState> = (set, get) => ({
  localCommits: [],
  globalCommits: [],

  saveLocalCommit: (message: string) => {
    const { flows, currentDashboardTab } = get() as any;
    const currentFlow = flows.find(
      (flow: any) => flow.id === currentDashboardTab
    );

    if (!currentFlow) {
      console.error("No current flow found");
      return;
    }

    const commit = {
      id: uuidv4(),
      date: new Date().toISOString(),
      message,
      flows: [currentFlow],
    };

    set((state: any) => ({
      localCommits: [...state.localCommits, commit],
    }));

    return commit;
  },

  restoreToLocalCommit: (commit: any) => {
    if (!commit) return;

    if (commit && commit.flows.length > 0) {
      (get() as any).setFlows([commit.flows[0]]);
    }
  },

  saveGlobalCommit: (message: string) => {
    const { flows } = get() as any;

    if (!flows) {
      console.error("No flows found");
      return;
    }

    const commit = {
      id: uuidv4(),
      date: new Date().toISOString(),
      message,
      flows,
    };

    set((state: any) => ({
      globalCommits: [...state.globalCommits, commit],
    }));

    return commit;
  },

  restoreToGlobalCommit: (commit: any) => {
    if (!commit) return;

    (get() as any).setFlows(commit.flows);
  },

  exportCommits: () => {
    const { flows } = get() as any;

    if (!flows) {
      console.error("No flows found");
      return;
    }

    const exportData = {
      version: "1.0",
      exportDate: new Date().toISOString(),
      type: "commits",
      applicationVersion: APPLICATION_VERSION,
      flows,
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], {
      type: "application/json",
    });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "flow-commits.json";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  },

  importCommits: (commit: any) => {
    if (!commit) return;

    (get() as any).setFlows(commit.flows);
  },
});

export default createCommitSlice;
