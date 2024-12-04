import { create } from "zustand";
import createChartSlice from "./chartSlice";
import createCommitSlice from "./commitSlice";
import createModalSlice from "./modalSlice";
import createProjectSlice from "./projectSlice";
import createUtilitySlice from "./utilitySlice";
import createVariableSlice from "./variableSlice";

const useRootStore = create<any>((set, get) => {
  // Create the stores with access to each other
  const stores = {
    // Create utility store first as it's needed by others
    ...createUtilitySlice(set, get),
    
    // Create other stores with access to utility store
    ...createChartSlice(set, () => ({ ...get(), utilityStore: stores })),
    ...createProjectSlice(set, () => ({ ...get(), utilityStore: stores })),
    ...createCommitSlice(set, get),
    ...createVariableSlice(set, get),
    ...createModalSlice(set, get),
  };
  
  return stores;
});

export default useRootStore;