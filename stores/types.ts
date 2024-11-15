/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-empty-object-type */
import { Edge, Node } from "reactflow";

export interface ChartInstance {
  id: string;
  name: string;
  nodes: Node[];
  edges: Edge[];
  color: string;
  onePageMode: boolean;
  publishedVersions: {
    version: number;
    date: string;
    nodes: Node[];
    edges: Edge[];
  }[];
  variables: Variable[];
}

export interface ExportMetadata {
  version: string;
  exportDate: string;
  type: "single" | "complete";
  applicationVersion: string;
}

export interface FlowExport extends ExportMetadata {
  flow: ChartInstance;
}

export interface CompleteExport extends ExportMetadata {
  flows: ChartInstance[];
  references: FlowReference[];
}

export interface FlowReference {
  sourceFlowId: string;
  targetFlowId: string;
  nodeId: string;
  type: "redirect" | "reference";
}

export interface Variable {
  name: string;
  value: string;
}

export interface ChartState {
  chartInstances: ChartInstance[];
  currentDashboardTab: string;
  setCurrentDashboardTab: (tabId: string) => void;
  addNewTab: (newTabName: string) => string;
  updateNodes: (instanceId: string, changes: NodeChange[]) => void;
  updateEdges: (instanceId: string, changes: EdgeChange[]) => void;
  addNode: (instanceId: string, newNode: Node) => void;
  addEdge: (instanceId: string, newEdge: Edge) => void;
  updateNode: (
    instanceId: string,
    nodeId: string,
    newData: Partial<Node>
  ) => void;
  removeNode: (instanceId: string, nodeId: string) => void;
  deleteTab: (tabId: string) => void;
  updateChartInstance: (updatedInstance: ChartInstance) => void;
  updateChartInstanceName: (tabId: string, newName: string) => void;
  setCurrentTabColor: (tabId: string, color: string) => void;
  setOnePage: (tabId: string, value: boolean) => void;
  addPublishedVersion: (tabId: string, version: number, date: string) => void;
  revertToVersion: (tabId: string, version: number) => void;
  publishTab: (tabId: string) => void;
  getChartInstance: (tabId: string) => ChartInstance | undefined;
  getCurrentChartInstance: () => ChartInstance | undefined;
  setChartInstances: (instances: ChartInstance[]) => void;

  // New Import/Export methods
  exportFlow: (instanceId: string) => void;
  exportAllFlows: () => void;
  importFlow: (file: File) => Promise<void>;
  validateImport: (data: FlowExport | CompleteExport) => ValidationResult;
}

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

export interface QuestionnaireState {
  // Define questionnaire state and methods
}

export interface CommitState {
  // Define commit state and methods
}

export interface VariableState {
  variables: {
    global: Variable[];
    local: Variable[];
  };
  setVariables: (variables: VariableState["variables"]) => void;
  addVariable: (scope: "global" | "local", variable: Variable) => void;
  removeVariable: (scope: "global" | "local", index: number) => void;
  updateVariable: (
    scope: "global" | "local",
    index: number,
    updatedVariable: Variable
  ) => void;
}

export interface ModalState {
  modalContent: null;
  isModalOpen: boolean;
  openModal: (content: any) => void;
  closeModal: () => void;
}

export interface UtilityState {
  currentTab: string;
  setCurrentTab: (tabId: string) => void;
  saveToDb: (chartInstances: ChartInstance[]) => Promise<void>;
  loadSavedData: () => Promise<ChartInstance[] | null>;
}

export interface RootState
  extends ChartState,
    QuestionnaireState,
    CommitState,
    VariableState,
    ModalState,
    UtilityState {
  // Add any additional root-level state or methods here
}

export type NodeChange = {
  id: string;
  type: string;
  position?: { x: number; y: number };
  data?: any;
};

export type EdgeChange = {
  id: string;
  source?: string;
  target?: string;
};
