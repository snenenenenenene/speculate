/* eslint-disable @typescript-eslint/ban-ts-comment */
// hooks/useStores.ts

import { RootState } from "@/stores/types";
import useRootStore from "../stores/rootStore";

type Stores = {
  [K in keyof RootState]: RootState;
} & { rootStore: RootState };

export const useStores = (): Stores => {
  const rootStore = useRootStore();
  return {
    // @ts-ignore
    chartStore: rootStore,
    commitStore: rootStore,
    variableStore: rootStore,
    modalStore: rootStore,
    utilityStore: rootStore,
    projectStore: rootStore,
    rootStore,
  };
};
