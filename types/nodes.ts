export type NodeType = 'startNode' | 'endNode' | 'singleChoice' | 'multipleChoice' | 'yesNo' | 'weight' | 'function' | 'input' | 'matrix' | 'ranking' | 'scoreAggregation' | 'skipLogic';

// Base node data interface
export interface BaseNodeData {
  instanceId: string;
  nodeType: NodeType;
  label?: string;
}

export interface StartNodeData extends BaseNodeData {
  nodeType: 'startNode';
  message?: string;
  variables?: Array<{ name: string; value: string; }>;
}

export interface EndNodeData extends BaseNodeData {
  nodeType: 'endNode';
  message?: string;
  endType?: 'terminal' | 'redirect';
  redirectFlow?: string;
  variableMap?: Record<string, string>;
}

export interface ChoiceOption {
  id: string;
  label: string;
  nextNodeId: string | null;
  weight?: number;
  variableName?: string;
  value?: string | number;
  mediaUrl?: string;
}

export interface SingleChoiceNodeData extends BaseNodeData {
  nodeType: 'singleChoice';
  question: string;
  options: ChoiceOption[];
  defaultOption?: string;
}

export interface MultipleChoiceNodeData extends BaseNodeData {
  nodeType: 'multipleChoice';
  question: string;
  options: ChoiceOption[];
  minSelections?: number;
  maxSelections?: number;
  scoreCalculation?: 'sum' | 'average' | 'multiply';
}

export interface YesNoNodeData extends BaseNodeData {
  nodeType: 'yesNo';
  question: string;
  yesLabel?: string;
  noLabel?: string;
  yesNextNodeId?: string;
  noNextNodeId?: string;
  yesValue?: string | number;
  noValue?: string | number;
}

export interface WeightNodeData extends BaseNodeData {
  nodeType: 'weight';
  weight: number;
  operation: 'multiply' | 'add';
  targetVariable?: string;
}

export interface FunctionStep {
  id: string;
  type: 'operation' | 'condition';
  operation?: {
    type: 'addition' | 'subtraction' | 'multiplication' | 'division';
    targetVariable: string;
    value: number;
  };
  condition?: {
    variable: string;
    operator: '>' | '<' | '>=' | '<=' | '==' | '!=';
    value: number;
    trueHandle: string;
    falseHandle: string;
  };
}

export interface FunctionNodeData extends BaseNodeData {
  nodeType: 'function';
  steps: FunctionStep[];
  handles: string[];
}

export interface InputNodeData extends BaseNodeData {
  nodeType: 'input';
  inputType: 'text' | 'textarea' | 'email' | 'number' | 'phone' | 'date' | 'file';
  label: string;
  placeholder?: string;
  defaultValue?: string;
  validation?: Array<{
    type: 'required' | 'min' | 'max' | 'pattern' | 'email' | 'phone';
    value?: string | number;
    message: string;
  }>;
  variableName: string;
}

export interface MatrixOption {
  id: string;
  label: string;
  value: number;
}

export interface MatrixRow {
  id: string;
  question: string;
  variableName: string;
}

export interface MatrixNodeData extends BaseNodeData {
  nodeType: 'matrix';
  title: string;
  rows: MatrixRow[];
  columns: MatrixOption[];
  cellType: 'radio' | 'checkbox';
}

export interface RankingItem {
  id: string;
  label: string;
  weight?: number;
  variableName?: string;
}

export interface RankingNodeData extends BaseNodeData {
  nodeType: 'ranking';
  title: string;
  items: RankingItem[];
  minRank?: number;
  maxRank?: number;
  weightDistribution?: 'linear' | 'exponential';
}

export interface ScoreAggregationNodeData extends BaseNodeData {
  nodeType: 'scoreAggregation';
  sources: Array<{
    id: string;
    variableName: string;
    weight?: number;
  }>;
  method: 'sum' | 'average' | 'weighted';
  outputVariable: string;
}

export interface SkipLogicCondition {
  id: string;
  variable: string;
  operator: '>' | '<' | '>=' | '<=' | '==' | '!=';
  value: string | number;
  nextNodeId: string;
}

export interface SkipLogicNodeData extends BaseNodeData {
  nodeType: 'skipLogic';
  conditions: SkipLogicCondition[];
  defaultNodeId?: string;
}