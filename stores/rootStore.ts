import { create } from "zustand";
import createFlowSlice from "./flowSlice";
import createCommitSlice from "./commitSlice";
import createModalSlice from "./modalSlice";
import createUtilitySlice from "./utilitySlice";
import createVariableSlice from "./variableSlice";
import createSelectionSlice from "./selectionSlice";
import { RootState } from "./types";

export const useRootStore = create<RootState>((set, get) => {
  // Create utility store first since other stores might need it
  const utilityStore = createUtilitySlice(set, get);

  const flowStore = createFlowSlice(set, get);
  const commitStore = createCommitSlice(set, get);
  const variableStore = createVariableSlice(set, get);
  const modalStore = createModalSlice(set, get);
  const selectionStore = createSelectionSlice(set, get); 

  return {
    // Store slices
    ...utilityStore,
    ...flowStore,
    ...commitStore,
    ...variableStore,
    ...modalStore,
    ...selectionStore,
    // Store references for direct access if needed
    utilityStore,
    flowStore,
    commitStore,
    variableStore,
    modalStore,
    selectionStore,
  };
});

export default useRootStore;