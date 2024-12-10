/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
// components/nodes/index.tsx
import { Handle, Position, NodeProps } from 'reactflow';
import { memo, useCallback, useEffect, useState, useMemo } from 'react';
import { nanoid } from 'nanoid';
import isEqual from 'lodash/isEqual';
import { useStores } from '@/hooks/useStores';
import { NodeWrapper } from './base/NodeWrapper';
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calculator, GitBranch, Plus, Variable, X } from 'lucide-react';
import { FunctionNodeData, MultipleChoiceNodeData, SingleChoiceNodeData, WeightNodeData, YesNoNodeData } from '@/types/nodes';
import { AnimatePresence, motion } from 'framer-motion';
import {
  ArrowRight,
  Check,
  CheckCircle2,
  CircleDot,
  CircleSlashed,
  Flag,
  FunctionSquare,
  List,
  Scale,
  Settings,
  Square,
  Trash2,
  XCircle
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Operation } from '@prisma/client/runtime/library';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/card';

type OperationType = 'addition' | 'subtraction' | 'multiplication' | 'division';

export const StartNode = memo(({ id, data, selected }: NodeProps) => {
  const { chartStore } = useStores() as any;

  const handleDelete = useCallback(() => {
    if (window.confirm('Are you sure you want to delete the start node?')) {
      chartStore.removeNode(data.instanceId, id);
    }
  }, [chartStore, data.instanceId, id]);

  return (
    <NodeWrapper
      title="Start"
      selected={selected}
      onDelete={handleDelete}
      customHandles={
        <Handle
          type="target"
          position={Position.Bottom}
          className="react-flow__handle"
        />
      }
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
StartNode.displayName = 'StartNode';

export const EndNode = memo(({ id, data, selected }: NodeProps) => {
  const { chartStore } = useStores() as any;
  const chartInstances = chartStore.chartInstances;
  const otherInstances = chartInstances.filter(
    instance => instance.id !== data.instanceId
  );

  const [endType, setEndType] = useState(data.endType || 'end');
  const [selectedFlow, setSelectedFlow] = useState(data.redirectTab || '');

  useEffect(() => {
    data.endType = endType;
    data.redirectTab = selectedFlow;
  }, [endType, selectedFlow, data]);

  const handleDelete = useCallback(() => {
    if (window.confirm('Are you sure you want to delete this node?')) {
      chartStore.removeNode(data.instanceId, id);
    }
  }, [chartStore, data.instanceId, id]);

  return (
    <NodeWrapper
      title="End"
      selected={selected}
      onDelete={handleDelete}
      customHandles={
        <Handle
          type="source"
          position={Position.Top}
          className="react-flow__handle"
        />
      }
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
EndNode.displayName = 'EndNode';

export const SingleChoiceNode = memo(({ id, data, selected }: NodeProps<SingleChoiceNodeData>) => {
  const { chartStore } = useStores() as any;
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

  const handleDelete = useCallback(() => {
    if (window.confirm('Are you sure you want to delete this node?')) {
      chartStore.removeNode(data.instanceId, id);
    }
  }, [chartStore, data.instanceId, id]);

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
      customHandles={
        <>
          <Handle
            type="source"
            position={Position.Top}
            className="react-flow__handle"
          />
        </>
      }
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
          <div className="space-y-2">
            {data.options?.map((option, index) => (
              <div key={option.id} className="relative group">
                <div className={cn(
                  "flex items-center gap-2 rounded-md",
                  selected ? "bg-zinc-100" : "bg-zinc-50",
                  "transition-colors duration-200"
                )}>
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
                    className={cn(
                      "h-8 w-8 p-0 opacity-0 group-hover:opacity-100",
                      "transition-opacity duration-200"
                    )}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                  <Handle
                    type="source"
                    position={Position.Right}
                    id={option.id}
                    className={cn(
                      "react-flow__handle opacity-0 group-hover:opacity-100",
                      "transition-all duration-200"
                    )}
                  />
                </div>
              </div>
            ))}
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={handleAddOption}
            className="w-full"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Option
          </Button>
        </div>
      </div>
    </NodeWrapper>
  );
});
SingleChoiceNode.displayName = 'SingleChoiceNode';

export const MultipleChoiceNode = memo(({ id, data, selected }: NodeProps<MultipleChoiceNodeData>) => {
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

  const handleSelectionLimitChange = useCallback((type: 'min' | 'max', value: string) => {
    const numValue = parseInt(value) || 0;
    const maxAllowed = data.options?.length || 0;
    
    if (type === 'min') {
      data.minSelections = Math.min(numValue, maxAllowed);
      // Ensure max is not less than min
      if (data.maxSelections && data.maxSelections < data.minSelections) {
        data.maxSelections = data.minSelections;
      }
    } else {
      data.maxSelections = Math.min(numValue, maxAllowed);
      // Ensure min is not more than max
      if (data.minSelections && data.minSelections > data.maxSelections) {
        data.minSelections = data.maxSelections;
      }
    }
  }, [data]);

  const handleDelete = useCallback(() => {
    if (window.confirm('Are you sure you want to delete this node?')) {
      chartStore.removeNode(data.instanceId, id);
    }
  }, [chartStore, data.instanceId, id]);

  // Initialize options if they don't exist
  useEffect(() => {
    if (!data.options) {
      data.options = [
        { id: nanoid(), label: 'Option 1', nextNodeId: null },
        { id: nanoid(), label: 'Option 2', nextNodeId: null }
      ];
      data.minSelections = 1;
      data.maxSelections = 2;
    }
  }, [data]);

  return (
    <NodeWrapper
      title="Multiple Choice"
      selected={selected}
      onDelete={handleDelete}
      customHandles={
        <>
          <Handle
            type="target"
            position={Position.Top}
            className="react-flow__handle"
          />
          <Handle
            type="source"
            position={Position.Bottom}
            className="react-flow__handle"
          />
        </>
      }
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
          <div className="space-y-2">
            {data.options?.map((option, index) => (
              <div key={option.id} className="relative group">
                <div className={cn(
                  "flex items-center gap-2 rounded-md",
                  selected ? "bg-zinc-100" : "bg-zinc-50",
                  "transition-colors duration-200"
                )}>
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
                    className={cn(
                      "h-8 w-8 p-0 opacity-0 group-hover:opacity-100",
                      "transition-opacity duration-200"
                    )}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={handleAddOption}
            className="w-full"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Option
          </Button>
        </div>

        <div className="flex gap-4">
          <div className="flex-1">
            <div className="space-y-2">
              <Label>Min Selections</Label>
              <Input
                type="number"
                min="0"
                max={data.options?.length || 0}
                value={data.minSelections || ''}
                onChange={(e) => handleSelectionLimitChange('min', e.target.value)}
              />
            </div>
          </div>
          <div className="flex-1">
            <div className="space-y-2">
              <Label>Max Selections</Label>
              <Input
                type="number"
                min={data.minSelections || 0}
                max={data.options?.length || 0}
                value={data.maxSelections || ''}
                onChange={(e) => handleSelectionLimitChange('max', e.target.value)}
              />
            </div>
          </div>
        </div>
      </div>
    </NodeWrapper>
  );
});
MultipleChoiceNode.displayName = 'MultipleChoiceNode';

export const YesNoNode = memo(({ id, data, selected }: NodeProps<YesNoNodeData>) => {
  const { chartStore } = useStores() as any;
  const DEFAULT_QUESTION = "Does your claim meet this requirement?";

  const handleQuestionChange = useCallback((value: string) => {
    data.question = value;
  }, [data]);

  const handleDelete = useCallback(() => {
    if (window.confirm('Are you sure you want to delete this node?')) {
      chartStore.removeNode(data.instanceId, id);
    }
  }, [chartStore, data.instanceId, id]);

  return (
    <NodeWrapper
      title="Yes/No"
      selected={selected}
      onDelete={handleDelete}
      customHandles={
        <>
          <Handle
            type="target"
            position={Position.Top}
            className="react-flow__handle"
          />
        </>
      }
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

        <div className="grid grid-cols-2 gap-4">
          {[
            { label: 'Yes', id: 'yes' },
            { label: 'No', id: 'no' }
          ].map((option) => (
            <div key={option.id} className="relative group">
              <div className={cn(
                "p-3 text-center rounded-lg text-sm font-medium transition-all duration-200",
                selected ? "bg-zinc-100 ring-1 ring-zinc-300" : "bg-zinc-50 ring-1 ring-zinc-200",
                "hover:ring-2 hover:ring-zinc-950/50 hover:bg-white"
              )}>
                {option.label}
                <Handle
                  type="source"
                  position={Position.Bottom}
                  id={option.id}
                  className={cn(
                    "react-flow__handle opacity-0 group-hover:opacity-100",
                    "transition-all duration-200"
                  )}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </NodeWrapper>
  );
});
YesNoNode.displayName = 'YesNoNode';

export const WeightNode = memo(({ id, data, selected }: NodeProps<WeightNodeData>) => {
  const { chartStore } = useStores() as any;

  const handleWeightChange = useCallback((value: string) => {
    const weight = parseFloat(value) || 1;
    chartStore.updateNodeData(data.instanceId, id, {
      ...data,
      weight,
    });
  }, [chartStore, data, id]);

  const handleDelete = useCallback(() => {
    if (window.confirm('Are you sure you want to delete this weight node?')) {
      chartStore.removeNode(data.instanceId, id);
    }
  }, [chartStore, data.instanceId, id]);

  return (
    <NodeWrapper
      title="Weight"
      selected={selected}
      onDelete={handleDelete}
      customHandles={
        <>
          <Handle
            type="target"
            position={Position.Top}
            className="react-flow__handle"
          />
          <Handle
            type="source"
            position={Position.Bottom}
            className="react-flow__handle"
          />
        </>
      }
      headerClassName="bg-amber-50/50"
    >
      <div className="space-y-4">
        <div className="flex items-center gap-4">
          <Scale className="h-5 w-5 text-amber-500" />
          <Input
            type="number"
            value={data.weight}
            onChange={(e) => handleWeightChange(e.target.value)}
            step="0.1"
            min="0"
          />
        </div>

        <div className="text-xs text-gray-500">
          Score will be multiplied by this weight
        </div>
      </div>
    </NodeWrapper>
  );
});
WeightNode.displayName = 'WeightNode';

export const FunctionNode = memo(({ id, data, selected }: NodeProps<FunctionNodeData>) => {
  const { chartStore, variableStore } = useStores() as any;
  const [nodeData, setNodeData] = useState<FunctionNodeData>({
    instanceId: id,
    label: data?.label || "Function Node",
    steps: data?.steps || [],
    handles: data?.handles || ["default"]
  });

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState<{
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
  }>({ type: 'operation' });

  // Get available variables from the current instance
  const variables = useMemo(() => {
    const instance = chartStore.getCurrentChartInstance();
    return instance?.variables || [];
  }, [chartStore]);

  useEffect(() => {
    Object.assign(data, nodeData);
  }, [data, nodeData]);

  const addStep = useCallback(() => {
    if (currentStep.type === 'operation' && currentStep.operation) {
      setNodeData(prev => ({
        ...prev,
        steps: [...prev.steps, { id: nanoid(), ...currentStep }]
      }));
    } else if (currentStep.type === 'condition' && currentStep.condition) {
      setNodeData(prev => ({
        ...prev,
        steps: [...prev.steps, { id: nanoid(), ...currentStep }],
        handles: [...new Set([...prev.handles, currentStep.condition!.trueHandle, currentStep.condition!.falseHandle])]
      }));
    }
    setCurrentStep({ type: 'operation' });
  }, [currentStep]);

  const removeStep = useCallback((stepId: string) => {
    setNodeData(prev => ({
      ...prev,
      steps: prev.steps.filter(step => step.id !== stepId)
    }));
  }, []);

  const renderStep = useCallback((step: typeof nodeData.steps[0], index: number) => {
    return (
      <motion.div
        key={step.id}
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col space-y-2 p-3 bg-gray-50 rounded-lg"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-gray-600">Step {index + 1}:</span>
            {step.type === 'operation' && step.operation && (
              <span className="text-sm">
                {step.operation.type} {step.operation.value} to {step.operation.targetVariable}
              </span>
            )}
            {step.type === 'condition' && step.condition && (
              <span className="text-sm">
                if {step.condition.variable} {step.condition.operator} {step.condition.value}
              </span>
            )}
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => removeStep(step.id)}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
        {step.type === 'condition' && step.condition && (
          <div className="pl-4 space-y-1 text-sm text-gray-500">
            <div>→ True: use {step.condition.trueHandle}</div>
            <div>→ False: use {step.condition.falseHandle}</div>
          </div>
        )}
      </motion.div>
    );
  }, [removeStep]);

  return (
    <NodeWrapper
      title="Function"
      selected={selected}
      onDelete={() => chartStore.removeNode(data.instanceId, id)}
      customHandles={
        <>
          <Handle
            type="target"
            position={Position.Top}
            className="react-flow__handle"
          />
          {data.steps?.map((step, index) => (
            <Handle
              key={step.id}
              type="source"
              position={Position.Right}
              id={step.id}
              className="react-flow__handle"
              style={{ top: `${25 + (index * 30)}%` }}
            />
          ))}
        </>
      }
      headerClassName="bg-violet-50/50"
    >
      <div className="p-4 space-y-4">
        <Input
          value={nodeData.label}
          onChange={(e) => setNodeData(prev => ({ ...prev, label: e.target.value }))}
          placeholder="Function Name"
        />

        <button
          onClick={() => setIsModalOpen(true)}
          className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-violet-50 hover:bg-violet-100 text-violet-700 rounded-lg transition-colors"
        >
          <Settings className="h-4 w-4" />
          Configure Steps
        </button>

        <div className="space-y-2">
          {nodeData.handles.map((handleId) => (
            <div
              key={handleId}
              className="relative flex items-center justify-between bg-gray-50 p-2 rounded-lg"
            >
              <div className="flex items-center gap-2">
                <Handle
                  type="source"
                  position={Position.Bottom}
                  id={handleId}
                  className="w-3 h-3 bg-violet-500 border-2 border-white transition-all duration-200 hover:bg-violet-600 hover:scale-110"
                />
                <span className="text-sm text-gray-600">{handleId}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Configure Function Steps</DialogTitle>
            <DialogDescription>
              Add operations and conditions that will execute in sequence
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6">
            {/* Add Step Section */}
            <div className="space-y-4">
              <div className="flex gap-2">
                <Button
                  variant={currentStep.type === 'operation' ? 'default' : 'outline'}
                  onClick={() => setCurrentStep({ type: 'operation' })}
                >
                  Operation
                </Button>
                <Button
                  variant={currentStep.type === 'condition' ? 'default' : 'outline'}
                  onClick={() => setCurrentStep({ type: 'condition' })}
                >
                  Condition
                </Button>
              </div>

              {currentStep.type === 'operation' && (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Operation Type</Label>
                    <Select
                      value={currentStep.operation?.type}
                      onValueChange={(value: any) => setCurrentStep(prev => ({
                        ...prev,
                        operation: { ...prev.operation, type: value } as any
                      }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select operation" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="addition">Add</SelectItem>
                        <SelectItem value="subtraction">Subtract</SelectItem>
                        <SelectItem value="multiplication">Multiply</SelectItem>
                        <SelectItem value="division">Divide</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Target Variable</Label>
                    <Select
                      value={currentStep.operation?.targetVariable}
                      onValueChange={(value) => setCurrentStep(prev => ({
                        ...prev,
                        operation: { ...prev.operation, targetVariable: value } as any
                      }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select variable" />
                      </SelectTrigger>
                      <SelectContent>
                        {variables.map((variable: any) => (
                          <SelectItem key={variable.name} value={variable.name}>
                            {variable.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Value</Label>
                    <Input
                      type="number"
                      value={currentStep.operation?.value || ''}
                      onChange={(e) => setCurrentStep(prev => ({
                        ...prev,
                        operation: { ...prev.operation, value: parseFloat(e.target.value) } as any
                      }))}
                      placeholder="Enter value"
                    />
                  </div>
                </div>
              )}

              {currentStep.type === 'condition' && (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Variable</Label>
                    <Select
                      value={currentStep.condition?.variable}
                      onValueChange={(value) => setCurrentStep(prev => ({
                        ...prev,
                        condition: { ...prev.condition, variable: value } as any
                      }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select variable" />
                      </SelectTrigger>
                      <SelectContent>
                        {variables.map((variable: any) => (
                          <SelectItem key={variable.name} value={variable.name}>
                            {variable.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Operator</Label>
                    <Select
                      value={currentStep.condition?.operator}
                      onValueChange={(value: any) => setCurrentStep(prev => ({
                        ...prev,
                        condition: { ...prev.condition, operator: value } as any
                      }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select operator" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value=">">Greater than</SelectItem>
                        <SelectItem value="<">Less than</SelectItem>
                        <SelectItem value=">=">Greater than or equal</SelectItem>
                        <SelectItem value="<=">Less than or equal</SelectItem>
                        <SelectItem value="==">Equal to</SelectItem>
                        <SelectItem value="!=">Not equal to</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Value</Label>
                    <Input
                      type="number"
                      value={currentStep.condition?.value || ''}
                      onChange={(e) => setCurrentStep(prev => ({
                        ...prev,
                        condition: { ...prev.condition, value: parseFloat(e.target.value) } as any
                      }))}
                      placeholder="Enter value"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>True Handle</Label>
                      <Input
                        value={currentStep.condition?.trueHandle || ''}
                        onChange={(e) => setCurrentStep(prev => ({
                          ...prev,
                          condition: { ...prev.condition, trueHandle: e.target.value } as any
                        }))}
                        placeholder="e.g., handle1"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>False Handle</Label>
                      <Input
                        value={currentStep.condition?.falseHandle || ''}
                        onChange={(e) => setCurrentStep(prev => ({
                          ...prev,
                          condition: { ...prev.condition, falseHandle: e.target.value } as any
                        }))}
                        placeholder="e.g., handle2"
                      />
                    </div>
                  </div>
                </div>
              )}

              <Button
                className="w-full"
                onClick={addStep}
                disabled={
                  (currentStep.type === 'operation' && (!currentStep.operation?.type || !currentStep.operation?.targetVariable)) ||
                  (currentStep.type === 'condition' && (!currentStep.condition?.variable || !currentStep.condition?.operator))
                }
              >
                Add Step
              </Button>
            </div>

            <Separator />

            {/* Steps List */}
            <div className="space-y-2">
              <Label>Steps (executes in order)</Label>
              <div className="space-y-2">
                {nodeData.steps.map((step, index) => renderStep(step, index))}
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </NodeWrapper>
  );
});

FunctionNode.displayName = 'FunctionNode';

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
    icon: Flag,
    description: 'Beginning of the flow'
  },
  {
    type: 'endNode',
    label: 'End Node',
    icon: XCircle,
    description: 'End of the flow or redirect'
  },
  {
    type: 'weight',
    label: 'Weight Node',
    icon: Scale,
    description: 'Apply weight to scores'
  },
  {
    type: 'singleChoice',
    label: 'Single Choice',
    icon: CircleDot,
    description: 'Single option selection'
  },
  {
    type: 'multipleChoice',
    label: 'Multiple Choice',
    icon: List,
    description: 'Multiple option selection'
  },
  {
    type: 'yesNo',
    label: 'Yes/No Question',
    icon: Check,
    description: 'Binary choice question'
  },
  {
    type: 'function',
    label: 'Function Node',
    icon: FunctionSquare,
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