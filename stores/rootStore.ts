import { create } from "zustand";
import createFlowSlice from "./flowSlice";
import createCommitSlice from "./commitSlice";
import createModalSlice from "./modalSlice";
import createUtilitySlice from "./utilitySlice";
import createVariableSlice from "./variableSlice";
import { RootState } from "./types";

export const useRootStore = create<RootState>((set, get) => {
  // Create utility store first since other stores might need it
  const utilityStore = createUtilitySlice(set, get);

  // Create other stores
  const flowStore = createFlowSlice(set, get);
  const commitStore = createCommitSlice(set, get);
  const variableStore = createVariableSlice(set, get);
  const modalStore = createModalSlice(set, get);

  return {
    // Store slices
    ...utilityStore,
    ...flowStore,
    ...commitStore,
    ...variableStore,
    ...modalStore,

    // Store references for direct access if needed
    utilityStore,
    flowStore,
    commitStore,
    variableStore,
    modalStore,
  };
});

export default useRootStore;