/* eslint-disable @typescript-eslint/no-explicit-any */
import { toast } from "react-hot-toast";
import { addEdge, applyEdgeChanges, applyNodeChanges, Edge } from "reactflow";
import { v4 as uuidv4 } from "uuid";
import { StateCreator } from "zustand";
import {
  ChartInstance,
  CompleteExport,
  EdgeChange,
  FlowExport,
  NodeChange,
  ValidationResult,
} from "./types";

const APPLICATION_VERSION = "1.0.0";

const createChartSlice: StateCreator<any> = (set, get) => ({
  flows: [],
  currentDashboardTab: "",
  tempGeneratedChart: null, // Temporary storage for AI-generated chart

  setCurrentDashboardTab: (tabId: string) =>
    set((state) => {
      if (state.currentDashboardTab !== tabId) {
        return { currentDashboardTab: tabId };
      }
      return state;
    }),

  updateNodes: (instanceId: string, changes: NodeChange[]) =>
    set((state) => ({
      flows: state.flows.map((flow) =>
        flow.id === instanceId
          ? {
              ...flow,
              nodes: Array.isArray(changes) ? applyNodeChanges(changes, flow.nodes) : flow.nodes,
            }
          : flow
      ),
    })),

  updateEdges: (instanceId: string, changes: EdgeChange[]) =>
    set((state) => ({
      flows: state.flows.map((flow) =>
        flow.id === instanceId
          ? {
              ...flow,
              edges: applyEdgeChanges(changes as any, flow.edges),
            }
          : flow
      ),
    })),

  addNewTab: async (newTabName: string) => {
    const newFlow: ChartInstance = {
      id: uuidv4(),
      name: newTabName,
      nodes: [],
      edges: [],
      color: "#80B500",
      onePageMode: false,
      publishedVersions: [],
      variables: [],
    };

    set((state) => ({
      flows: [...state.flows, newFlow],
      currentDashboardTab: newFlow.id,
    }));

    try {
      await get().saveToDb([...get().flows]); // Save all flows
      return newFlow.id;
    } catch (error) {
      console.error("Failed to save new tab:", error);
      throw error;
    }
  },

  addNode: (instanceId: string, newNode: Node) =>
    set((state: any) => ({
      flows: state.flows.map((flow) =>
        flow.id === instanceId
          ? { ...flow, nodes: [...flow.nodes, newNode] }
          : flow
      ),
    })),

  addEdge: (instanceId: string, newEdge: Edge) =>
    set((state) => ({
      flows: state.flows.map((flow) =>
        flow.id === instanceId
          ? { ...flow, edges: addEdge(newEdge, flow.edges) }
          : flow
      ),
    })),

  updateNode: (instanceId: string, nodeId: string, newData: Partial<Node>) =>
    set((state: any) => ({
      flows: state.flows.map((flow) =>
        flow.id === instanceId
          ? {
              ...flow,
              nodes: flow.nodes.map((node) =>
                node.id === nodeId ? { ...node, ...newData } : node
              ),
            }
          : flow
      ),
    })),

  removeNode: (instanceId: string, nodeId: string) => {
    console.log('ChartSlice: Removing node', { instanceId, nodeId });
    console.log('ChartSlice: Current state before removal:', get().flows);
    
    set((state) => {
      const newState = {
        flows: state.flows.map((flow) =>
          flow.id === instanceId
            ? {
                ...flow,
                nodes: flow.nodes.filter((node) => {
                  const keep = node.id !== nodeId;
                  console.log('ChartSlice: Filtering node', { nodeId: node.id, keep });
                  return keep;
                }),
                edges: flow.edges.filter(
                  (edge) => edge.source !== nodeId && edge.target !== nodeId
                ),
              }
            : flow
        ),
      };
      console.log('ChartSlice: New state after removal:', newState);
      return newState;
    });
    
    const updatedFlow = get().flows.find(flow => flow.id === instanceId);
    console.log('ChartSlice: Updated flow after removal:', updatedFlow);
    
    return updatedFlow;
  },

  deleteTab: (tabId: string) =>
    set((state) => {
      const updatedFlows = state.flows.filter(
        (flow) => flow.id !== tabId
      );
      const newCurrentTab =
        updatedFlows.length > 0 ? updatedFlows[0].id : "";
      return {
        flows: updatedFlows,
        currentDashboardTab: newCurrentTab,
      };
    }),

  updateFlow: (updatedFlow: ChartInstance) =>
    set((state) => ({
      flows: state.flows.map((flow) =>
        flow.id === updatedFlow.id ? updatedFlow : flow
      ),
    })),

  addFlow: (flow: ChartInstance) => {
    console.log('ChartSlice: Adding flow:', flow);
    set((state) => ({
      flows: [...state.flows, flow],
    }));
    console.log('ChartSlice: Updated flows:', get().flows);
  },

  setFlows: (flows: ChartInstance[]) => {
    console.log('ChartSlice: Setting flows:', flows);
    set({ flows });
    console.log('ChartSlice: Updated flows:', get().flows);
  },

  updateFlowName: (tabId: string, newName: string) =>
    set((state) => ({
      flows: state.flows.map((flow) =>
        flow.id === tabId ? { ...flow, name: newName } : flow
      ),
    })),

  setCurrentTabColor: (tabId: string, color: string) =>
    set((state) => ({
      flows: state.flows.map((flow) =>
        flow.id === tabId ? { ...flow, color } : flow
      ),
    })),

  setOnePage: (tabId: string, value: boolean) =>
    set((state) => ({
      flows: state.flows.map((flow) =>
        flow.id === tabId ? { ...flow, onePageMode: value } : flow
      ),
    })),

  addPublishedVersion: (tabId: string, version: number, date: string) =>
    set((state: any) => ({
      flows: state.flows.map((flow) =>
        flow.id === tabId
          ? {
              ...flow,
              publishedVersions: [
                ...(flow.publishedVersions || []),
                { version, date },
              ],
            }
          : flow
      ),
    })),

  revertToVersion: (tabId: string, version: number) =>
    set((state) => {
      const flow = state.flows.find(
        (flow) => flow.id === tabId
      );
      if (flow && flow.publishedVersions) {
        const versionData = flow.publishedVersions.find(
          (v) => v.version === version
        );
        if (versionData) {
          return {
            flows: state.flows.map((flow) =>
              flow.id === tabId
                ? {
                    ...flow,
                    nodes: versionData.nodes,
                    edges: versionData.edges,
                  }
                : flow
            ),
          };
        }
      }
      return state;
    }),

  publishTab: (tabId: string) =>
    set((state) => {
      const flow = state.flows.find(
        (flow) => flow.id === tabId
      );
      if (flow) {
        const newVersion = (flow.publishedVersions?.length || 0) + 1;
        return {
          flows: state.flows.map((flow) =>
            flow.id === tabId
              ? {
                  ...flow,
                  publishedVersions: [
                    ...(flow.publishedVersions || []),
                    {
                      version: newVersion,
                      date: new Date().toISOString(),
                      nodes: flow.nodes,
                      edges: flow.edges,
                    },
                  ],
                }
              : flow
          ),
        };
      }
      return state;
    }),

  getFlow: (tabId: string) => {
    const { flows } = get();
    return flows.find((flow) => flow.id === tabId);
  },

  getCurrentFlow: () => {
    const { flows, currentDashboardTab } = get();
    console.log('ChartSlice: Getting current flow', {
      flows,
      currentDashboardTab,
      hasFlows: Array.isArray(flows) && flows.length > 0
    });
    
    if (!Array.isArray(flows) || flows.length === 0) {
      console.error('ChartSlice: No flows found');
      return null;
    }
    
    if (!currentDashboardTab) {
      console.error('ChartSlice: No current dashboard tab selected');
      return null;
    }
    
    const flow = flows.find((flow) => flow.id === currentDashboardTab);
    console.log('ChartSlice: Found flow:', flow);
    return flow || null;
  },
  addAIChart: (chartData: any) => {
    const newFlow: ChartInstance = {
      id: uuidv4(),
      name: chartData.name || "New AI Flow",
      nodes: chartData.nodes || [],
      edges: chartData.edges || [],
      color: "#80B500",
      onePageMode: false,
      publishedVersions: [],
      variables: [],
    };

    set((state) => ({
      flows: [...state.flows, newFlow],
      currentDashboardTab: newFlow.id,
    }));

    return newFlow.id;
  },
  applyAIChart: () =>
    set((state) => {
      if (state.tempGeneratedChart) {
        return {
          flows: [...state.flows, state.tempGeneratedChart],
          tempGeneratedChart: null,
        };
      }
      return state;
    }),

  discardAIChart: () =>
    set(() => ({
      tempGeneratedChart: null,
    })),

  validateImport: (data: FlowExport | CompleteExport): ValidationResult => {
    const errors: string[] = [];
    const warnings: string[] = [];

    if (!data.version || !data.exportDate) {
      errors.push("Invalid export format: missing metadata");
    }

    if (data.applicationVersion !== APPLICATION_VERSION) {
      warnings.push(
        `Flow was exported from a different version (${data.applicationVersion})`
      );
    }

    const validateFlow = (flow: ChartInstance) => {
      if (!flow.name || !flow.nodes || !flow.edges) {
        errors.push(`Invalid flow structure: ${flow.name || "Unnamed flow"}`);
        return;
      }

      flow.edges.forEach((edge) => {
        const sourceExists = flow.nodes.some((node) => node.id === edge.source);
        const targetExists = flow.nodes.some((node) => node.id === edge.target);

        if (!sourceExists || !targetExists) {
          errors.push(`Invalid edge reference in flow: ${flow.name}`);
        }
      });

      flow.nodes.forEach((node) => {
        if (
          !node.type ||
          ![
            "yesNo",
            "singleChoice",
            "multipleChoice",
            "endNode",
            "startNode",
            "weightNode",
            "functionNode",
          ].includes(node.type)
        ) {
          errors.push(`Invalid node type in flow: ${flow.name}`);
        }
      });
    };

    if (data.type === "single") {
      validateFlow((data as FlowExport).flow);
    } else {
      (data as CompleteExport).flows.forEach(validateFlow);
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
    };
  },

  exportFlow: (instanceId: string) => {
    const flow = get().getFlow(instanceId);
    if (!flow) {
      toast.error("Flow not found");
      return;
    }

    const exportData: FlowExport = {
      version: "1.0",
      exportDate: new Date().toISOString(),
      type: "single",
      applicationVersion: APPLICATION_VERSION,
      flow,
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], {
      type: "application/json",
    });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${flow.name
      .toLowerCase()
      .replace(/\s+/g, "-")}-flow.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);

    toast.success("Flow exported successfully");
  },

  exportAllFlows: () => {
    const { flows } = get();

    const exportData: CompleteExport = {
      version: "1.0",
      exportDate: new Date().toISOString(),
      type: "complete",
      applicationVersion: APPLICATION_VERSION,
      flows,
      references: [],
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], {
      type: "application/json",
    });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `all-flows-${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);

    toast.success("All flows exported successfully");
  },
});

export default createChartSlice;
