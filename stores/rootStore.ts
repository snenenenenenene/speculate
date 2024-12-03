/* eslint-disable @typescript-eslint/ban-ts-comment */
/* eslint-disable @typescript-eslint/no-explicit-any */
// stores/rootStore.ts

import { create } from "zustand";
import createChartSlice from "./chartSlice";
import createCommitSlice from "./commitSlice";
import createModalSlice from "./modalSlice";
import createProjectSlice from "./projectSlice";
import createUtilitySlice from "./utilitySlice";
import createVariableSlice from "./variableSlice";

const useRootStore = create<any>((set, get) => ({
  // @ts-ignore
  ...createChartSlice(set, get),
  // @ts-ignore
  ...createCommitSlice(set, get),
  // @ts-ignore
  ...createVariableSlice(set, get),
  // @ts-ignore
  ...createModalSlice(set, get),
  // @ts-ignore
  ...createUtilitySlice(set, get),
  // @ts-ignore
  ...createProjectSlice(set, get),
}));

export default useRootStore;
