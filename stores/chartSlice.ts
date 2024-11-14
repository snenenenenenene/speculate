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
        console.log(`Updating currentDashboardTab to: ${tabId}`);
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

  validateImport: (data: FlowExport | CompleteExport): ValidationResult => {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Version checks
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

      // Validate node references
      flow.edges.forEach((edge) => {
        const sourceExists = flow.nodes.some((node) => node.id === edge.source);
        const targetExists = flow.nodes.some((node) => node.id === edge.target);

        if (!sourceExists || !targetExists) {
          errors.push(`Invalid edge reference in flow: ${flow.name}`);
        }
      });

      // Validate node types
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

      // Validate references between flows
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

    // Collect all references between flows
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

  importFlow: async (file: File) => {
    try {
      const text = await file.text();
      const data = JSON.parse(text);

      // Validate import data
      const validationResult = get().validateImport(data);

      if (!validationResult.isValid) {
        toast.error(`Import validation failed: ${validationResult.errors[0]}`);
        console.error("Validation errors:", validationResult.errors);
        return;
      }

      if (validationResult.warnings.length > 0) {
        validationResult.warnings.forEach((warning) => {
          toast.warning(warning);
        });
      }

      if (data.type === "single") {
        // Single flow import
        const flow = data.flow;
        flow.id = uuidv4(); // Generate new ID to avoid conflicts
        set((state) => ({
          chartInstances: [...state.chartInstances, flow],
          currentDashboardTab: flow.id,
        }));
        toast.success(`Flow "${flow.name}" imported successfully`);
      } else {
        // Complete system import
        const newFlows = data.flows.map((flow) => ({
          ...flow,
          id: uuidv4(), // Generate new IDs for all flows
        }));

        // Update references with new IDs
        const oldToNewIds = Object.fromEntries(
          data.flows.map((oldFlow, index) => [oldFlow.id, newFlows[index].id])
        );

        // Update redirect references in nodes
        newFlows.forEach((flow) => {
          flow.nodes.forEach((node) => {
            if (node.type === "endNode" && node.data?.endType === "redirect") {
              const targetFlow = data.flows.find(
                (f) => f.name === node.data.redirectTab
              );
              if (targetFlow) {
                node.data.redirectTab =
                  newFlows.find((f) => f.id === oldToNewIds[targetFlow.id])
                    ?.name || node.data.redirectTab;
              }
            }
          });
        });

        set((state) => ({
          chartInstances: [...state.chartInstances, ...newFlows],
          currentDashboardTab: newFlows[0].id,
        }));
        toast.success(`${newFlows.length} flows imported successfully`);
      }
    } catch (error) {
      console.error("Import error:", error);
      toast.error("Failed to import flow: Invalid file format");
    }
  },
});

export default createChartSlice;
