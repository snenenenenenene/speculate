/* eslint-disable @typescript-eslint/ban-ts-comment */
/* eslint-disable @typescript-eslint/no-explicit-any */
// stores/rootStore.ts

import { create } from "zustand";
import createFlowSlice from "./flowSlice";
import createCommitSlice from "./commitSlice";
import createModalSlice from "./modalSlice";
import createUtilitySlice from "./utilitySlice";
import createVariableSlice from "./variableSlice";

export const useRootStore = create<any>((set, get) => ({
  // @ts-ignore
  ...createFlowSlice(set, get),
  // @ts-ignore
  ...createCommitSlice(set, get),
  // @ts-ignore
  ...createVariableSlice(set, get),
  // @ts-ignore
  ...createModalSlice(set, get),
  // @ts-ignore
  ...createUtilitySlice(set, get),
}));

export default useRootStore;
