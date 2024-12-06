/* eslint-disable @typescript-eslint/ban-ts-comment */
// hooks/useStores.ts

import { RootState } from "@/stores/types";
import useRootStore from "../stores/rootStore";

export const useStores = () => {
  const rootStore = useRootStore();
  return {
    chartStore: rootStore.chartStore,
    commitStore: rootStore.commitStore,
    variableStore: rootStore.variableStore,
    modalStore: rootStore.modalStore,
    utilityStore: rootStore.utilityStore,
    projectStore: rootStore.projectStore,
  };
};
