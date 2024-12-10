export interface BaseNodeData {
  instanceId: string;
  label: string;
  nodeType: string;
}

export interface ChoiceOption {
  id: string;
  label: string;
  nextNodeId: string | null;
}

export interface SingleChoiceNodeData extends BaseNodeData {
  question: string;
  options: ChoiceOption[];
}

export interface MultipleChoiceNodeData extends BaseNodeData {
  question: string;
  options: ChoiceOption[];
  minSelections?: number;
  maxSelections?: number;
}

export interface YesNoNodeData extends BaseNodeData {
  question: string;
}

export interface WeightNodeData extends BaseNodeData {
  weight: number;
}

export interface FunctionNodeData extends BaseNodeData {
  steps: Array<{
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
  }>;
  handles: string[];
}

export interface FunctionNodeSequence {
  type: string;
  value?: number;
  variable?: string;
  condition?: string;
  handleId?: string;
  children?: FunctionNodeSequence[];
}