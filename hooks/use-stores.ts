/* eslint-disable @typescript-eslint/ban-ts-comment */
// hooks/useStores.ts

import { useRootStore } from '@/stores/rootStore';

export const useStores = () => {
  const {
    // Flow Management
    flows,
    currentDashboardTab,
    setFlows,
    addFlow,
    removeFlow,
    updateFlow,
    
    // Node Management
    removeNode,
    updateNode,
    addNode,
    updateNodes,
    
    // Edge Management
    addEdge,
    updateEdges,
    
    // Dashboard Management
    setCurrentDashboardTab,
    addNewTab,
    deleteTab,
    updateFlowName,
    setCurrentTabColor,
    setOnePage,
    
    // Project Management
    currentProject,
    setCurrentProject,
    
    // Import/Export
    importFlow,
    exportFlow,
    exportAllFlows,
  } = useRootStore();

  return {
    flowStore: {
      flows,
      currentDashboardTab,
      setFlows,
      addFlow,
      removeFlow,
      updateFlow,
      removeNode,
      updateNode,
      addNode,
      updateNodes,
      addEdge,
      updateEdges,
      setCurrentDashboardTab,
      addNewTab,
      deleteTab,
      updateFlowName,
      setCurrentTabColor,
      setOnePage,
      currentProject,
      setCurrentProject,
      importFlow,
      exportFlow,
      exportAllFlows,
    }
  };
};
