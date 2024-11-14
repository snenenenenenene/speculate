/* eslint-disable @typescript-eslint/no-explicit-any */
// stores/rootStore.ts

import { create } from "zustand";
import createChartSlice from "./chartSlice";
import createCommitSlice from "./commitSlice";
import createModalSlice from "./modalSlice";
import createUtilitySlice from "./utilitySlice";
import createVariableSlice from "./variableSlice";

const useRootStore = create<any>((set, get) => ({
  ...createChartSlice(set, get),
  ...createCommitSlice(set, get),
  ...createVariableSlice(set, get),
  ...createModalSlice(set, get),
  ...createUtilitySlice(set, get),
}));

export default useRootStore;
