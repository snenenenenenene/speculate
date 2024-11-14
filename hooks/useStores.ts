// hooks/useStores.ts

import { RootState } from "@/stores/types";
import useRootStore from "../stores/rootStore";

type Stores = {
  [K in keyof RootState]: RootState;
} & { rootStore: RootState };

export const useStores = (): Stores => {
  const rootStore = useRootStore();
  return {
    chartStore: rootStore,
    commitStore: rootStore,
    variableStore: rootStore,
    modalStore: rootStore,
    utilityStore: rootStore,
    rootStore,
  };
};
