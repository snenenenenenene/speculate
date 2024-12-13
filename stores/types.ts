// File: /stores/types.ts

import { Edge, Node } from "reactflow";
import { Project } from "@/types/project";

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
    nodes?: Node[];
    edges?: Edge[];
  }[];
  variables: Variable[];
}

export interface NodeChange {
  id: string;
  type: string;
  position?: { x: number; y: number };
  data?: any;
}

export interface EdgeChange {
  id: string;
  source?: string;
  target?: string;
}

export interface Variable {
  name: string;
  value: string;
}

export interface ChartState {
  chartInstances: ChartInstance[];
  currentDashboardTab: string;
  isLoading: boolean;
  error: string | null;
  
  // Methods
  setCurrentDashboardTab: (tabId: string) => void;
  addNewTab: (newTabName: string) => Promise<string>;
  updateNodes: (instanceId: string, changes: NodeChange[]) => void;
  updateEdges: (instanceId: string, changes: EdgeChange[]) => void;
  addNode: (instanceId: string, newNode: Node) => void;
  addEdge: (instanceId: string, newEdge: Edge) => void;
  updateNode: (instanceId: string, nodeId: string, newData: Partial<Node>) => void;
  removeNode: (instanceId: string, nodeId: string) => void;
  deleteTab: (tabId: string) => void;
  updateChartInstance: (updatedInstance: ChartInstance) => void;
  setChartInstances: (instances: ChartInstance[]) => void;
  updateChartInstanceName: (tabId: string, newName: string) => void;
  setCurrentTabColor: (tabId: string, color: string) => void;
  setOnePage: (tabId: string, value: boolean) => void;
  getChartInstance: (tabId: string) => ChartInstance | undefined;
  getCurrentChartInstance: () => ChartInstance | undefined;
}

export interface ProjectState {
  projects: Project[];
  currentProject: Project | null;
  isLoading: boolean;
  error: string | null;
  hasLoaded: boolean;
  isFetching: boolean;

  // Methods
  fetchProjects: () => Promise<void>;
  createProject: (data: Partial<Project>) => Promise<Project>;
  updateProject: (id: string, data: Partial<Project>) => Promise<Project>;
  deleteProject: (id: string) => Promise<void>;
  setCurrentProject: (project: Project | null) => void;
}

export interface MultipleChoiceSelection {
  optionIds: string[];
  timestamp: number;
}

export interface SelectionState {
  selections: Record<string, MultipleChoiceSelection>;
  setSelection: (nodeId: string, selection: MultipleChoiceSelection) => void;
  clearSelection: (nodeId: string) => void;
  clearAllSelections: () => void;
}

export interface CommitState {
  localCommits: Commit[];
  globalCommits: Commit[];
  
  // Methods
  addLocalCommit: (message: string) => void;
  addGlobalCommit: (message: string) => void;
  revertToLocalCommit: (message: string) => void;
  revertToGlobalCommit: (message: string) => void;
}

export interface VariableState {
  variables: {
    global: Variable[];
    local: Variable[];
  };
  
  // Methods
  setVariables: (variables: VariableState["variables"]) => void;
  addVariable: (scope: "global" | "local", variable: Variable) => void;
  removeVariable: (scope: "global" | "local", index: number) => void;
  updateVariable: (scope: "global" | "local", index: number, updatedVariable: Variable) => void;
}

export interface ModalState {
  modalContent: any | null;
  isModalOpen: boolean;
  
  // Methods
  openModal: (content: any) => void;
  closeModal: () => void;
}

export interface UtilityState {
  currentTab: string;
  projectId: string | null;
  isLoading: boolean;
  error: string | null;
  
  // Methods
  setCurrentTab: (tabId: string) => void;
  setProjectId: (projectId: string) => void;
  initializeStore: () => void;
  saveToDb: (chartInstances: ChartInstance[]) => Promise<void>;
  loadSavedData: () => Promise<ChartInstance[] | null>;
}

export interface Commit {
  version: number;
  date: string;
  message: string;
  chartInstances: ChartInstance[];
}

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

// Combined RootState type
export interface RootState extends
SelectionState,
  ChartState,
  ProjectState,
  CommitState,
  VariableState,
  ModalState,
  UtilityState {
    // Additional root-level state
    isInitialized: boolean;
    error: string | null;
    isLoading: boolean;

    // Store references
    utilityStore: UtilityState;
    chartStore: ChartState;
    projectStore: ProjectState;
    commitStore: CommitState;
    variableStore: VariableState;
    modalStore: ModalState;

    // Root-level methods
    setInitialized: (value: boolean) => void;
    setError: (error: string | null) => void;
    setLoading: (isLoading: boolean) => void;
    resetStores: () => void;
    getState: () => RootState;
    syncStores: () => Promise<void>;
}

export interface Commit {
  id: string;
  date: string;
  message: string;
  flows: ChartInstance[];
}

export interface CommitState {
  localCommits: Commit[];
  globalCommits: Commit[];
  saveLocalCommit: (message: string) => void;
  restoreToLocalCommit: (commit: Commit) => void;
  saveGlobalCommit: (message: string) => void;
  restoreToGlobalCommit: (commit: Commit) => void;
  exportCommits: () => void;
  importCommits: (commit: Commit) => void;
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
  showGrid: boolean;
  toggleGrid: () => void;
  saveToDb: (flows: ChartInstance[]) => Promise<void>;
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
