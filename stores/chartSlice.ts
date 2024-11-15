import { toast } from "react-hot-toast";
import { addEdge, applyEdgeChanges, applyNodeChanges } from "reactflow";
import { v4 as uuidv4 } from "uuid";
import { StateCreator } from "zustand";
import {
  ChartInstance,
  ChartState,
  CompleteExport,
  EdgeChange,
  FlowExport,
  NodeChange,
  ValidationResult,
} from "./types";

const APPLICATION_VERSION = "1.0.0";

const createChartSlice: StateCreator<ChartState> = (set, get) => ({
  chartInstances: [],
  currentDashboardTab: "",

  setCurrentDashboardTab: (tabId: string) =>
    set((state) => {
      if (state.currentDashboardTab !== tabId) {
        return { currentDashboardTab: tabId };
      }
      return state;
    }),

  addNewTab: (newTabName: string) => {
    const newTab: ChartInstance = {
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
      chartInstances: [...state.chartInstances, newTab],
      currentDashboardTab: newTab.id,
    }));

    return newTab.id;
  },

  updateNodes: (instanceId: string, changes: NodeChange[]) =>
    set((state) => ({
      chartInstances: state.chartInstances.map((instance) =>
        instance.id === instanceId
          ? { ...instance, nodes: applyNodeChanges(changes, instance.nodes) }
          : instance
      ),
    })),

  updateEdges: (instanceId: string, changes: EdgeChange[]) =>
    set((state) => ({
      chartInstances: state.chartInstances.map((instance) =>
        instance.id === instanceId
          ? { ...instance, edges: applyEdgeChanges(changes, instance.edges) }
          : instance
      ),
    })),

  addNode: (instanceId: string, newNode: Node) =>
    set((state) => ({
      chartInstances: state.chartInstances.map((instance) =>
        instance.id === instanceId
          ? { ...instance, nodes: [...instance.nodes, newNode] }
          : instance
      ),
    })),

  addEdge: (instanceId: string, newEdge: Edge) =>
    set((state) => ({
      chartInstances: state.chartInstances.map((instance) =>
        instance.id === instanceId
          ? { ...instance, edges: addEdge(newEdge, instance.edges) }
          : instance
      ),
    })),

  updateNode: (instanceId: string, nodeId: string, newData: Partial<Node>) =>
    set((state) => ({
      chartInstances: state.chartInstances.map((instance) =>
        instance.id === instanceId
          ? {
              ...instance,
              nodes: instance.nodes.map((node) =>
                node.id === nodeId ? { ...node, ...newData } : node
              ),
            }
          : instance
      ),
    })),

  removeNode: (instanceId: string, nodeId: string) =>
    set((state) => ({
      chartInstances: state.chartInstances.map((instance) =>
        instance.id === instanceId
          ? {
              ...instance,
              nodes: instance.nodes.filter((node) => node.id !== nodeId),
              edges: instance.edges.filter(
                (edge) => edge.source !== nodeId && edge.target !== nodeId
              ),
            }
          : instance
      ),
    })),

  deleteTab: (tabId: string) =>
    set((state) => {
      const updatedInstances = state.chartInstances.filter(
        (instance) => instance.id !== tabId
      );
      const newCurrentTab =
        updatedInstances.length > 0 ? updatedInstances[0].id : "";
      return {
        chartInstances: updatedInstances,
        currentDashboardTab: newCurrentTab,
      };
    }),

  updateChartInstance: (updatedInstance: ChartInstance) =>
    set((state) => ({
      chartInstances: state.chartInstances.map((instance) =>
        instance.id === updatedInstance.id ? updatedInstance : instance
      ),
    })),

  setChartInstances: (newInstances: ChartInstance[]) =>
    set({ chartInstances: newInstances }),

  updateChartInstanceName: (tabId: string, newName: string) =>
    set((state) => ({
      chartInstances: state.chartInstances.map((instance) =>
        instance.id === tabId ? { ...instance, name: newName } : instance
      ),
    })),

  setCurrentTabColor: (tabId: string, color: string) =>
    set((state) => ({
      chartInstances: state.chartInstances.map((instance) =>
        instance.id === tabId ? { ...instance, color } : instance
      ),
    })),

  setOnePage: (tabId: string, value: boolean) =>
    set((state) => ({
      chartInstances: state.chartInstances.map((instance) =>
        instance.id === tabId ? { ...instance, onePageMode: value } : instance
      ),
    })),

  addPublishedVersion: (tabId: string, version: number, date: string) =>
    set((state) => ({
      chartInstances: state.chartInstances.map((instance) =>
        instance.id === tabId
          ? {
              ...instance,
              publishedVersions: [
                ...(instance.publishedVersions || []),
                { version, date },
              ],
            }
          : instance
      ),
    })),

  revertToVersion: (tabId: string, version: number) =>
    set((state) => {
      const instance = state.chartInstances.find(
        (instance) => instance.id === tabId
      );
      if (instance && instance.publishedVersions) {
        const versionData = instance.publishedVersions.find(
          (v) => v.version === version
        );
        if (versionData) {
          return {
            chartInstances: state.chartInstances.map((instance) =>
              instance.id === tabId
                ? {
                    ...instance,
                    nodes: versionData.nodes,
                    edges: versionData.edges,
                  }
                : instance
            ),
          };
        }
      }
      return state;
    }),

  publishTab: (tabId: string) =>
    set((state) => {
      const instance = state.chartInstances.find(
        (instance) => instance.id === tabId
      );
      if (instance) {
        const newVersion = (instance.publishedVersions?.length || 0) + 1;
        return {
          chartInstances: state.chartInstances.map((instance) =>
            instance.id === tabId
              ? {
                  ...instance,
                  publishedVersions: [
                    ...(instance.publishedVersions || []),
                    {
                      version: newVersion,
                      date: new Date().toISOString(),
                      nodes: instance.nodes,
                      edges: instance.edges,
                    },
                  ],
                }
              : instance
          ),
        };
      }
      return state;
    }),

  getChartInstance: (tabId: string) => {
    const { chartInstances } = get();
    return chartInstances.find((instance) => instance.id === tabId);
  },

  getCurrentChartInstance: () => {
    const { chartInstances, currentDashboardTab } = get();
    return chartInstances.find(
      (instance) => instance.id === currentDashboardTab
    );
  },

  // New and updated import/export methods
  replaceFlow: async (instanceId: string, newFlow: ChartInstance) => {
    try {
      const currentInstance = get().getChartInstance(instanceId);
      const flowWithNewId = {
        ...newFlow,
        id: instanceId,
        // Preserve existing settings
        color: currentInstance?.color || newFlow.color || "#80B500",
        onePageMode:
          currentInstance?.onePageMode ?? newFlow.onePageMode ?? false,
        publishedVersions: currentInstance?.publishedVersions || [],
      };

      set((state) => ({
        chartInstances: state.chartInstances.map((instance) =>
          instance.id === instanceId ? flowWithNewId : instance
        ),
      }));

      return instanceId;
    } catch (error) {
      console.error("Error replacing flow:", error);
      throw error;
    }
  },

  replaceAllFlows: async (newFlows: ChartInstance[]) => {
    try {
      const flowsWithNewIds = newFlows.map((flow) => ({
        ...flow,
        id: uuidv4(),
        color: flow.color || "#80B500",
        onePageMode: flow.onePageMode ?? false,
        publishedVersions: [],
      }));

      // Update references between flows
      flowsWithNewIds.forEach((flow) => {
        flow.nodes.forEach((node) => {
          if (node.type === "endNode" && node.data?.endType === "redirect") {
            const targetFlow = newFlows.find(
              (f) => f.name === node.data.redirectTab
            );
            if (targetFlow) {
              const newTargetFlow = flowsWithNewIds.find(
                (f) => f.name === targetFlow.name
              );
              if (newTargetFlow) {
                node.data.redirectTab = newTargetFlow.name;
              }
            }
          }
        });
      });

      set({
        chartInstances: flowsWithNewIds,
        currentDashboardTab: flowsWithNewIds[0]?.id || "",
      });

      return flowsWithNewIds[0]?.id;
    } catch (error) {
      console.error("Error replacing all flows:", error);
      throw error;
    }
  },

  importFlow: async (file: File): Promise<string | null> => {
    try {
      const text = await file.text();
      const data = JSON.parse(text);

      const validationResult = get().validateImport(data);
      if (!validationResult.isValid) {
        toast.error(`Import validation failed: ${validationResult.errors[0]}`);
        return null;
      }

      if (data.type === "single") {
        const flow = data.flow;
        const newId = uuidv4();
        const newFlow = {
          ...flow,
          id: newId,
          color: flow.color || "#80B500",
          onePageMode: flow.onePageMode ?? false,
          publishedVersions: [],
        };

        set((state) => ({
          chartInstances: [...state.chartInstances, newFlow],
          currentDashboardTab: newId,
        }));

        return newId;
      }

      return null;
    } catch (error) {
      console.error("Import error:", error);
      throw error;
    }
  },

  importMultipleFlows: async (flows: ChartInstance[]) => {
    try {
      const newFlows = flows.map((flow) => ({
        ...flow,
        id: uuidv4(),
        color: flow.color || "#80B500",
        onePageMode: flow.onePageMode ?? false,
        publishedVersions: [],
      }));

      // Update references between flows
      newFlows.forEach((flow) => {
        flow.nodes.forEach((node) => {
          if (node.type === "endNode" && node.data?.endType === "redirect") {
            const targetFlow = flows.find(
              (f) => f.name === node.data.redirectTab
            );
            if (targetFlow) {
              const newTargetFlow = newFlows.find(
                (f) => f.name === targetFlow.name
              );
              if (newTargetFlow) {
                node.data.redirectTab = newTargetFlow.name;
              }
            }
          }
        });
      });

      set((state) => ({
        chartInstances: [...state.chartInstances, ...newFlows],
        currentDashboardTab: newFlows[0]?.id || state.currentDashboardTab,
      }));

      return newFlows[0]?.id;
    } catch (error) {
      console.error("Error importing multiple flows:", error);
      throw error;
    }
  },

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

      (data as CompleteExport).references.forEach((ref) => {
        const sourceFlowExists = (data as CompleteExport).flows.some(
          (f) => f.id === ref.sourceFlowId
        );
        const targetFlowExists = (data as CompleteExport).flows.some(
          (f) => f.id === ref.targetFlowId
        );

        if (!sourceFlowExists || !targetFlowExists) {
          errors.push(
            `Invalid flow reference: ${ref.sourceFlowId} -> ${ref.targetFlowId}`
          );
        }
      });
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
    };
  },

  exportFlow: (instanceId: string) => {
    const instance = get().getChartInstance(instanceId);
    if (!instance) {
      toast.error("Flow not found");
      return;
    }

    const exportData: FlowExport = {
      version: "1.0",
      exportDate: new Date().toISOString(),
      type: "single",
      applicationVersion: APPLICATION_VERSION,
      flow: instance,
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], {
      type: "application/json",
    });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${instance.name
      .toLowerCase()
      .replace(/\s+/g, "-")}-flow.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);

    toast.success("Flow exported successfully");
  },

  exportAllFlows: () => {
    const { chartInstances } = get();

    const references = chartInstances
      .flatMap((flow) =>
        flow.nodes
          .filter(
            (node) =>
              node.type === "endNode" && node.data?.endType === "redirect"
          )
          .map((node) => ({
            sourceFlowId: flow.id,
            targetFlowId:
              chartInstances.find((f) => f.name === node.data.redirectTab)
                ?.id || "",
            nodeId: node.id,
            type: "redirect" as const,
          }))
      )
      .filter((ref) => ref.targetFlowId);

    const exportData: CompleteExport = {
      version: "1.0",
      exportDate: new Date().toISOString(),
      type: "complete",
      applicationVersion: APPLICATION_VERSION,
      flows: chartInstances,
      references,
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
