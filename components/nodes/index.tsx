/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
// components/nodes/index.tsx
import { Handle, NodeProps, Position } from 'reactflow';
import { memo, useCallback, useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { toast } from 'sonner';
import { nanoid } from 'nanoid';
import { Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { FunctionNodeData, MultipleChoiceNodeData, SingleChoiceNodeData, WeightNodeData, YesNoNodeData } from '@/types/nodes';
import { useStores } from '@/hooks/useStores';
import { Card } from '@/components/ui/card';

type OperationType = 'addition' | 'subtraction' | 'multiplication' | 'division';

interface NodeWrapperProps {
  title: string;
  children: React.ReactNode;
  selected?: boolean;
  onDelete?: () => void;
  handles?: {
    top?: boolean;
    bottom?: boolean;
  };
  headerClassName?: string;
}

const NodeWrapper = memo(({ title, children, selected, onDelete, handles, headerClassName }: NodeWrapperProps) => {
  return (
    <Card className={`min-w-[300px] shadow-md ${selected ? 'ring-2 ring-blue-500' : ''}`}>
      <div className={`flex items-center justify-between p-3 border-b ${headerClassName || ''}`}>
        <span className="font-medium">{title}</span>
        {onDelete && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onDelete}
            className="h-8 w-8 p-0"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        )}
      </div>
      {handles?.top && (
        <Handle
          type="target"
          position={Position.Top}
          style={{ top: -5 }}
        />
      )}
      {children}
      {handles?.bottom && (
        <Handle
          type="source"
          position={Position.Bottom}
          style={{ bottom: -5 }}
        />
      )}
    </Card>
  );
});

NodeWrapper.displayName = 'NodeWrapper';

export const StartNode = memo(({ id, data, selected }: NodeProps) => {
  const { chartStore } = useStores() as any;

  const handleDelete = useCallback((onSuccess: () => void, onError: (error: Error) => void) => {
    console.log('StartNode: Attempting to delete node', { id, instanceId: data.instanceId });
    try {
      const result = chartStore.removeNode(data.instanceId, id);
      console.log('StartNode: Node deletion result:', result);
      console.log('StartNode: Current nodes after deletion:', chartStore.getCurrentChartInstance()?.nodes);
      onSuccess();
    } catch (error) {
      console.error('StartNode: Error deleting node:', error);
      onError(error instanceof Error ? error : new Error('Failed to delete node'));
    }
  }, [chartStore, data.instanceId, id]);

  return (
    <NodeWrapper
      title="Start"
      selected={selected}
      onDelete={() => handleDelete(() => {}, () => {})}
      handles={{ bottom: true }}
    >
      <div className="space-y-2">
        <Label>Message</Label>
        <Input
          value={data.message || ""}
          onChange={(e) => {}}
          placeholder="Enter start message..."
          className="h-9"
        />
      </div>
    </NodeWrapper>
  );
});

export const EndNode = memo(({ id, data, selected }: NodeProps) => {
  const { chartStore } = useStores();
  const params = useParams();
  const flowId = params.flowId as string;

  const handleDelete = useCallback(() => {
    console.log('EndNode: Attempting to delete node', { id, instanceId: flowId });
    if (!flowId) {
      console.error('EndNode: No flow ID found');
      return;
    }
    
    const currentInstance = chartStore.getCurrentChartInstance();
    if (!currentInstance) {
      console.error('EndNode: No current instance found');
      return;
    }
    
    try {
      chartStore.removeNode(flowId, id);
      toast.success('Node deleted successfully');
    } catch (error) {
      console.error('Error deleting node:', error);
      toast.error('Failed to delete node');
    }
  }, [id, flowId, chartStore]);

  return (
    <NodeWrapper
      title="End"
      selected={selected}
      onDelete={handleDelete}
      handles={{ top: true }}
    >
      <div className="space-y-2">
        <Label>Message</Label>
        <Input
          value={data.message || ""}
          onChange={(e) => {}}
          placeholder="Enter end message..."
          className="h-9"
        />
      </div>
    </NodeWrapper>
  );
});

export const SingleChoiceNode = memo(({ id, data, selected }: NodeProps<SingleChoiceNodeData>) => {
  const { chartStore } = useStores();
  const params = useParams();
  const flowId = params.flowId as string;

  const handleDelete = useCallback(() => {
    console.log('SingleChoiceNode: Attempting to delete node', { id, instanceId: flowId });
    if (!flowId) {
      console.error('SingleChoiceNode: No flow ID found');
      return;
    }
    
    const currentInstance = chartStore.getCurrentChartInstance();
    if (!currentInstance) {
      console.error('SingleChoiceNode: No current instance found');
      return;
    }
    
    try {
      chartStore.removeNode(flowId, id);
      toast.success('Node deleted successfully');
    } catch (error) {
      console.error('SingleChoiceNode: Error deleting node:', error);
      toast.error('Failed to delete node');
    }
  }, [id, flowId, chartStore]);

  const DEFAULT_QUESTION = "Select one of the following options:";

  const handleQuestionChange = useCallback((value: string) => {
    data.question = value;
  }, [data]);

  const handleOptionChange = useCallback((optionId: string, value: string) => {
    const option = data.options?.find(opt => opt.id === optionId);
    if (option) {
      option.label = value;
    }
  }, [data.options]);

  const handleAddOption = useCallback(() => {
    const newOption = { id: nanoid(), label: '', nextNodeId: null };
    data.options = [...(data.options || []), newOption];
  }, [data]);

  const handleRemoveOption = useCallback((optionId: string) => {
    data.options = data.options?.filter(opt => opt.id !== optionId) || [];
  }, [data]);

  // Initialize options if they don't exist
  useEffect(() => {
    if (!data.options) {
      data.options = [
        { id: nanoid(), label: 'Option 1', nextNodeId: null },
        { id: nanoid(), label: 'Option 2', nextNodeId: null }
      ];
    }
  }, [data]);

  return (
    <NodeWrapper
      title="Single Choice"
      selected={selected}
      onDelete={handleDelete}
      handles={{ top: true, bottom: true }}
    >
      <div className="space-y-4">
        <div className="space-y-2">
          <Label>Question</Label>
          <Input
            value={data.question || DEFAULT_QUESTION}
            onChange={(e) => handleQuestionChange(e.target.value)}
            placeholder="Enter your question..."
            className="h-9"
          />
        </div>

        <div className="space-y-2">
          <Label>Options</Label>
          {data.options?.map((option, index) => (
            <div key={option.id} className="flex items-center gap-2">
              <Input
                value={option.label}
                onChange={(e) => handleOptionChange(option.id, e.target.value)}
                placeholder={`Option ${index + 1}`}
                className="h-9"
              />
              <Button
                variant="ghost"
                size="icon"
                onClick={() => handleRemoveOption(option.id)}
                className="h-9 w-9 p-0"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))}
          <Button
            variant="outline"
            size="sm"
            onClick={handleAddOption}
            className="w-full"
          >
            Add Option
          </Button>
        </div>
      </div>
    </NodeWrapper>
  );
});

export const MultipleChoiceNode = memo(({ id, data, selected }: NodeProps<MultipleChoiceNodeData>) => {
  const { chartStore } = useStores();
  const params = useParams();
  const flowId = params.flowId as string;

  const handleDelete = useCallback(() => {
    console.log('MultipleChoiceNode: Attempting to delete node', { id, instanceId: flowId });
    if (!flowId) {
      console.error('MultipleChoiceNode: No flow ID found');
      return;
    }
    
    const currentInstance = chartStore.getCurrentChartInstance();
    if (!currentInstance) {
      console.error('MultipleChoiceNode: No current instance found');
      return;
    }
    
    try {
      chartStore.removeNode(flowId, id);
      toast.success('Node deleted successfully');
    } catch (error) {
      console.error('MultipleChoiceNode: Error deleting node:', error);
      toast.error('Failed to delete node');
    }
  }, [id, flowId, chartStore]);

  const { chartStore } = useStores() as any;
  const DEFAULT_QUESTION = "Select all that apply:";

  const handleQuestionChange = useCallback((value: string) => {
    data.question = value;
  }, [data]);

  const handleOptionChange = useCallback((optionId: string, value: string) => {
    const option = data.options?.find(opt => opt.id === optionId);
    if (option) {
      option.label = value;
    }
  }, [data.options]);

  const handleAddOption = useCallback(() => {
    const newOption = { id: nanoid(), label: '', nextNodeId: null };
    data.options = [...(data.options || []), newOption];
  }, [data]);

  const handleRemoveOption = useCallback((optionId: string) => {
    data.options = data.options?.filter(opt => opt.id !== optionId) || [];
  }, [data]);

  // Initialize options if they don't exist
  useEffect(() => {
    if (!data.options) {
      data.options = [
        { id: nanoid(), label: 'Option 1', nextNodeId: null },
        { id: nanoid(), label: 'Option 2', nextNodeId: null }
      ];
    }
  }, [data]);

  return (
    <NodeWrapper
      title="Multiple Choice"
      selected={selected}
      onDelete={handleDelete}
      handles={{ top: true, bottom: true }}
    >
      <div className="space-y-4">
        <div className="space-y-2">
          <Label>Question</Label>
          <Input
            value={data.question || DEFAULT_QUESTION}
            onChange={(e) => handleQuestionChange(e.target.value)}
            placeholder="Enter your question..."
            className="h-9"
          />
        </div>

        <div className="space-y-2">
          <Label>Options</Label>
          {data.options?.map((option, index) => (
            <div key={option.id} className="flex items-center gap-2">
              <Input
                value={option.label}
                onChange={(e) => handleOptionChange(option.id, e.target.value)}
                placeholder={`Option ${index + 1}`}
                className="h-9"
              />
              <Button
                variant="ghost"
                size="icon"
                onClick={() => handleRemoveOption(option.id)}
                className="h-9 w-9 p-0"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))}
          <Button
            variant="outline"
            size="sm"
            onClick={handleAddOption}
            className="w-full"
          >
            Add Option
          </Button>
        </div>
      </div>
    </NodeWrapper>
  );
});

export const YesNoNode = memo(({ id, data, selected }: NodeProps<YesNoNodeData>) => {
  const { chartStore } = useStores();
  const params = useParams();
  const flowId = params.flowId as string;

  const handleDelete = useCallback(() => {
    console.log('YesNoNode: Attempting to delete node', { id, instanceId: flowId });
    if (!flowId) {
      console.error('YesNoNode: No flow ID found');
      return;
    }
    
    const currentInstance = chartStore.getCurrentChartInstance();
    if (!currentInstance) {
      console.error('YesNoNode: No current instance found');
      return;
    }
    
    try {
      chartStore.removeNode(flowId, id);
      toast.success('Node deleted successfully');
    } catch (error) {
      console.error('YesNoNode: Error deleting node:', error);
      toast.error('Failed to delete node');
    }
  }, [id, flowId, chartStore]);

  const handleQuestionChange = useCallback((value: string) => {
    data.question = value;
  }, [data]);

  return (
    <NodeWrapper
      title="Yes/No"
      selected={selected}
      onDelete={handleDelete}
      handles={{ top: true }}
    >
      <div className="space-y-4">
        <div className="space-y-2">
          <Label>Question</Label>
          <Input
            value={data.question || ""}
            onChange={(e) => handleQuestionChange(e.target.value)}
            placeholder="Enter your question..."
            className="h-9"
          />
        </div>
      </div>
    </NodeWrapper>
  );
});

export const WeightNode = memo(({ id, data, selected }: NodeProps<WeightNodeData>) => {
  const { chartStore } = useStores();
  const params = useParams();
  const flowId = params.flowId as string;

  const handleDelete = useCallback(() => {
    console.log('WeightNode: Attempting to delete node', { id, instanceId: flowId });
    if (!flowId) {
      console.error('WeightNode: No flow ID found');
      return;
    }
    
    const currentInstance = chartStore.getCurrentChartInstance();
    if (!currentInstance) {
      console.error('WeightNode: No current instance found');
      return;
    }
    
    try {
      chartStore.removeNode(flowId, id);
      toast.success('Node deleted successfully');
    } catch (error) {
      console.error('WeightNode: Error deleting node:', error);
      toast.error('Failed to delete node');
    }
  }, [id, flowId, chartStore]);

  const handleWeightChange = useCallback((value: string) => {
    const weight = parseFloat(value) || 1;
    data.weight = weight;
  }, [data]);

  return (
    <NodeWrapper
      title="Weight"
      selected={selected}
      onDelete={handleDelete}
      handles={{ top: true, bottom: true }}
      headerClassName="bg-amber-50/50"
    >
      <div className="p-4 space-y-4">
        <div className="flex items-center gap-4">
          <Input
            type="number"
            value={data.weight || 0}
            onChange={(e) => handleWeightChange(e.target.value)}
            placeholder="Enter weight..."
            className="h-9"
          />
        </div>
      </div>
    </NodeWrapper>
  );
});

export const FunctionNode = memo(({ id, data, selected }: NodeProps<FunctionNodeData>) => {
  const { chartStore } = useStores();
  const params = useParams();
  const flowId = params.flowId as string;

  const handleDelete = useCallback(() => {
    console.log('FunctionNode: Attempting to delete node', { id, instanceId: flowId });
    if (!flowId) {
      console.error('FunctionNode: No flow ID found');
      return;
    }
    
    const currentInstance = chartStore.getCurrentChartInstance();
    if (!currentInstance) {
      console.error('FunctionNode: No current instance found');
      return;
    }
    
    try {
      chartStore.removeNode(flowId, id);
      console.log('FunctionNode: Node deletion result:', currentInstance);
      console.log('FunctionNode: Current nodes after deletion:', chartStore.getCurrentChartInstance()?.nodes);
      toast.success('Node deleted successfully');
    } catch (error) {
      console.error('FunctionNode: Error deleting node:', error);
      toast.error('Failed to delete node');
    }
  }, [id, flowId, chartStore]);

  const [nodeData, setNodeData] = useState<FunctionNodeData>({
    instanceId: id,
    label: data?.label || "Function Node",
    nodeType: 'functionNode',
    steps: data?.steps || [],
    handles: data?.handles || []
  });

  const [showStepModal, setShowStepModal] = useState(false);

  const handleAddStep = useCallback((step: FunctionNodeData['steps'][0]) => {
    const newNodeData = {
      ...nodeData,
      steps: [...nodeData.steps, step],
      handles: [...nodeData.handles, step.id]
    };
    setNodeData(newNodeData);
    chartStore.updateNode(flowId, id, newNodeData);
  }, [nodeData, flowId, id, chartStore]);

  const handleRemoveStep = useCallback((stepId: string) => {
    const newNodeData = {
      ...nodeData,
      steps: nodeData.steps.filter(step => step.id !== stepId),
      handles: nodeData.handles.filter(handle => handle !== stepId)
    };
    setNodeData(newNodeData);
    chartStore.updateNode(flowId, id, newNodeData);
  }, [nodeData, flowId, id, chartStore]);

  const handleLabelChange = useCallback((newLabel: string) => {
    const newNodeData = {
      ...nodeData,
      label: newLabel
    };
    setNodeData(newNodeData);
    chartStore.updateNode(flowId, id, newNodeData);
  }, [nodeData, flowId, id, chartStore]);

  return (
    <NodeWrapper
      title="Function"
      selected={selected}
      onDelete={handleDelete}
      handles={{ top: true, bottom: true }}
    >
      <div className="p-4 space-y-4">
        <Input
          value={nodeData.label}
          onChange={(e) => handleLabelChange(e.target.value)}
          placeholder="Enter function name..."
          className="h-9"
        />
        
        <div className="space-y-2">
          {nodeData.steps.map((step, index) => (
            <div key={step.id} className="flex items-center justify-between bg-gray-100 p-2 rounded">
              <span>{step.type === 'operation' ? 'Operation' : 'Condition'} {index + 1}</span>
              <div className="flex gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleRemoveStep(step.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
                <Handle
                  type="source"
                  position={Position.Bottom}
                  id={step.id}
                  style={{ bottom: -10 }}
                />
              </div>
            </div>
          ))}
        </div>

        <Button
          variant="outline"
          size="sm"
          className="w-full"
          onClick={() => setShowStepModal(true)}
        >
          Add Step
        </Button>

        {showStepModal && (
          <Dialog open={showStepModal} onOpenChange={setShowStepModal}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add Function Step</DialogTitle>
              </DialogHeader>
              <Tabs defaultValue="operation">
                <TabsList>
                  <TabsTrigger value="operation">Operation</TabsTrigger>
                  <TabsTrigger value="condition">Condition</TabsTrigger>
                </TabsList>
                <TabsContent value="operation">
                  <OperationForm
                    onSubmit={(data) => {
                      handleAddStep({
                        id: nanoid(),
                        type: 'operation',
                        operation: data
                      });
                      setShowStepModal(false);
                    }}
                  />
                </TabsContent>
                <TabsContent value="condition">
                  <ConditionForm
                    onSubmit={(data) => {
                      handleAddStep({
                        id: nanoid(),
                        type: 'condition',
                        condition: data
                      });
                      setShowStepModal(false);
                    }}
                  />
                </TabsContent>
              </Tabs>
            </DialogContent>
          </Dialog>
        )}
      </div>
    </NodeWrapper>
  );
});

FunctionNode.displayName = 'FunctionNode';

interface OperationFormProps {
  onSubmit: (data: FunctionNodeData['steps'][0]['operation']) => void;
}

const OperationForm = ({ onSubmit }: OperationFormProps) => {
  const [type, setType] = useState<'addition' | 'subtraction' | 'multiplication' | 'division'>('addition');
  const [targetVariable, setTargetVariable] = useState('');
  const [value, setValue] = useState<number>(0);

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit({ type, targetVariable, value });
      }}
      className="space-y-4"
    >
      <div className="space-y-2">
        <Label>Operation Type</Label>
        <Select value={type} onValueChange={(value: any) => setType(value)}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="addition">Addition</SelectItem>
            <SelectItem value="subtraction">Subtraction</SelectItem>
            <SelectItem value="multiplication">Multiplication</SelectItem>
            <SelectItem value="division">Division</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label>Target Variable</Label>
        <Input
          value={targetVariable}
          onChange={(e) => setTargetVariable(e.target.value)}
          placeholder="Enter variable name..."
        />
      </div>

      <div className="space-y-2">
        <Label>Value</Label>
        <Input
          type="number"
          value={value}
          onChange={(e) => setValue(Number(e.target.value))}
        />
      </div>

      <Button type="submit" className="w-full">Add Operation</Button>
    </form>
  );
};

interface ConditionFormProps {
  onSubmit: (data: FunctionNodeData['steps'][0]['condition']) => void;
}

const ConditionForm = ({ onSubmit }: ConditionFormProps) => {
  const [variable, setVariable] = useState('');
  const [operator, setOperator] = useState<'>' | '<' | '>=' | '<=' | '==' | '!='>('==');
  const [value, setValue] = useState<number>(0);

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit({
          variable,
          operator,
          value,
          trueHandle: nanoid(),
          falseHandle: nanoid()
        });
      }}
      className="space-y-4"
    >
      <div className="space-y-2">
        <Label>Variable</Label>
        <Input
          value={variable}
          onChange={(e) => setVariable(e.target.value)}
          placeholder="Enter variable name..."
        />
      </div>

      <div className="space-y-2">
        <Label>Operator</Label>
        <Select value={operator} onValueChange={(value: any) => setOperator(value)}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value=">">Greater than</SelectItem>
            <SelectItem value="<">Less than</SelectItem>
            <SelectItem value=">=">Greater than or equal</SelectItem>
            <SelectItem value="<=">Less than or equal</SelectItem>
            <SelectItem value="==">Equal</SelectItem>
            <SelectItem value="!=">Not equal</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label>Value</Label>
        <Input
          type="number"
          value={value}
          onChange={(e) => setValue(Number(e.target.value))}
        />
      </div>

      <Button type="submit" className="w-full">Add Condition</Button>
    </form>
  );
};

// Export the collection of node types
export const NODE_TYPES = {
  startNode: StartNode,
  endNode: EndNode,
  singleChoice: SingleChoiceNode,
  multipleChoice: MultipleChoiceNode,
  yesNo: YesNoNode,
  weight: WeightNode,
  function: FunctionNode,
};

// Node registration information for the sidebar
export const NODE_INFO = [
  {
    type: 'startNode',
    label: 'Start Node',
    icon: 'Flag',
    description: 'Beginning of the flow'
  },
  {
    type: 'endNode',
    label: 'End Node',
    icon: 'XCircle',
    description: 'End of the flow or redirect'
  },
  {
    type: 'weight',
    label: 'Weight Node',
    icon: 'Scale',
    description: 'Apply weight to scores'
  },
  {
    type: 'singleChoice',
    label: 'Single Choice',
    icon: 'CircleDot',
    description: 'Single option selection'
  },
  {
    type: 'multipleChoice',
    label: 'Multiple Choice',
    icon: 'List',
    description: 'Multiple option selection'
  },
  {
    type: 'yesNo',
    label: 'Yes/No Question',
    icon: 'Check',
    description: 'Binary choice question'
  },
  {
    type: 'function',
    label: 'Function Node',
    icon: 'FunctionSquare',
    description: 'Variable operations and logic'
  }
];

// Export utility functions
export function getNodeStyle(type: string, selected: boolean) {
  const baseStyles = {
    padding: '10px',
    borderRadius: '8px',
    border: `2px solid ${selected ? '#3b82f6' : '#e5e7eb'}`,
    background: '#ffffff',
    transition: 'all 0.2s ease-in-out',
    boxShadow: selected ? '0 4px 6px -1px rgba(0, 0, 0, 0.1)' : 'none'
  };

  return baseStyles;
}

export function getHandleStyle(type: string) {
  return {
    width: '12px',
    height: '12px',
    borderRadius: '50%',
    border: '2px solid white',
    background: '#3b82f6',
    transition: 'all 0.2s ease-in-out'
  };
}