import { StateCreator } from "zustand";
import { VariableState } from "./types";

const createVariableSlice: StateCreator<VariableState> = (set, get) => ({
  variables: {
    global: [],
    local: [],
  },

  setVariables: (variables) => set({ variables }),

  addVariable: (
    scope: "global" | "local",
    variable: { name: string; value: string },
  ) =>
    set((state) => ({
      variables: {
        ...state.variables,
        [scope]: [...state.variables[scope], variable],
      },
    })),

  removeVariable: (scope: "global" | "local", index: number) =>
    set((state) => ({
      variables: {
        ...state.variables,
        [scope]: state.variables[scope].filter((_, i) => i !== index),
      },
    })),

  updateVariable: (
    scope: "global" | "local",
    index: number,
    updatedVariable: { name: string; value: string },
  ) =>
    set((state) => ({
      variables: {
        ...state.variables,
        [scope]: state.variables[scope].map((v, i) =>
          i === index ? updatedVariable : v,
        ),
      },
    })),
});

export default createVariableSlice;
