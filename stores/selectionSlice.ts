// stores/selectionSlice.ts
import { StateCreator } from "zustand";
import { SelectionState } from "./types";

const createSelectionSlice: StateCreator<SelectionState> = (set) => ({
  selections: {},

  setSelection: (nodeId, selection) => 
    set((state) => ({
      selections: {
        ...state.selections,
        [nodeId]: selection
      }
    })),

  clearSelection: (nodeId) =>
    set((state) => {
      const { [nodeId]: _, ...rest } = state.selections;
      return { selections: rest };
    }),

  clearAllSelections: () => set({ selections: {} })
});

export default createSelectionSlice;