/* eslint-disable @typescript-eslint/no-unused-vars */
import { StateCreator } from "zustand";
import { VariableState } from "./types";

const STORAGE_KEY = 'speculate-variables';

const loadPersistedVariables = () => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      console.log('Loading persisted variables:', stored);
      return JSON.parse(stored);
    }
  } catch (error) {
    console.error('Error loading persisted variables:', error);
  }
  return {
    global: [],
    local: [],
  };
};

const persistVariables = (variables: any) => {
  try {
    console.log('Persisting variables:', variables);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(variables));
  } catch (error) {
    console.error('Error persisting variables:', error);
  }
};

const createVariableSlice: StateCreator<VariableState> = (set, get) => ({
  variables: loadPersistedVariables(),

  setVariables: (variables) => {
    console.log('Setting variables:', variables);
    persistVariables(variables);
    set({ variables });
  },

  addVariable: (
    scope: "global" | "local",
    variable: { name: string; value: string }
  ) => {
    console.log(`Adding ${scope} variable:`, variable);
    set((state) => {
      const newState = {
        variables: {
          ...state.variables,
          [scope]: [...state.variables[scope], variable],
        },
      };
      persistVariables(newState.variables);
      return newState;
    });
  },

  removeVariable: (scope: "global" | "local", index: number) => {
    console.log(`Removing ${scope} variable at index:`, index);
    set((state) => {
      const newState = {
        variables: {
          ...state.variables,
          [scope]: state.variables[scope].filter((_, i) => i !== index),
        },
      };
      persistVariables(newState.variables);
      return newState;
    });
  },

  updateVariable: (
    scope: "global" | "local",
    index: number,
    updatedVariable: { name: string; value: string }
  ) => {
    console.log(`Updating ${scope} variable at index:`, index, updatedVariable);
    set((state) => {
      const newState = {
        variables: {
          ...state.variables,
          [scope]: state.variables[scope].map((v, i) =>
            i === index ? updatedVariable : v
          ),
        },
      };
      persistVariables(newState.variables);
      return newState;
    });
  },
});

export default createVariableSlice;
