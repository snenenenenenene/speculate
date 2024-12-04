import { create } from "zustand";
import createChartSlice from "./chartSlice";
import createCommitSlice from "./commitSlice";
import createModalSlice from "./modalSlice";
import createProjectSlice from "./projectSlice";
import createUtilitySlice from "./utilitySlice";
import createVariableSlice from "./variableSlice";
import { RootState } from "./types";

const useRootStore = create((set, get) => {
  // First create utility store as it's needed by other stores
  const utilityStore = createUtilitySlice(set, get);

  // Create other stores with access to utility store
  const chartStore = createChartSlice(set, () => ({ ...get(), utilityStore }));
  const projectStore = createProjectSlice(set, () => ({ ...get(), utilityStore }));
  const commitStore = createCommitSlice(set, get);
  const variableStore = createVariableSlice(set, get);
  const modalStore = createModalSlice(set, get);

  return {
    // Store slices
    ...utilityStore,
    ...chartStore,
    ...projectStore,
    ...commitStore,
    ...variableStore,
    ...modalStore,

    // Store references
    utilityStore,
    chartStore,
    projectStore,
    commitStore,
    variableStore,
    modalStore
  };
});

export default useRootStore;