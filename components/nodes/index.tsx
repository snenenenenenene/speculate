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
      handles={{ bottom: true }}
      headerClassName="bg-emerald-50/50"
    >
      <div className="p-4 flex items-center justify-center">
        <Flag className="h-8 w-8 text-emerald-500" />
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
  const [redirectTab, setRedirectTab] = useState(data.redirectTab || '');

  useEffect(() => {
    data.endType = endType;
    data.redirectTab = redirectTab;
  }, [endType, redirectTab, data]);

  const handleDelete = useCallback(() => {
    if (window.confirm('Are you sure you want to delete this node?')) {
      chartStore.removeNode(data.instanceId, id);
    }
  }, [chartStore, data.instanceId, id]);

  return (
    <NodeWrapper
      title={endType === 'redirect' ? 'Redirect Flow' : 'End Flow'}
      selected={selected}
      onDelete={handleDelete}
      handles={{ top: true }}
      headerClassName={cn(
        "transition-colors duration-200",
        endType === 'redirect' ? "bg-blue-50" : "bg-red-50"
      )}
    >
      <div className="space-y-4">
        {/* Label Input */}
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">
            Label
          </label>
          <input
            type="text"
            value={data.label || 'End Node'}
            onChange={(e) => data.label = e.target.value}
            className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="End Node"
          />
        </div>

        {/* End Type Selection */}
        <div className="grid grid-cols-2 gap-2">
          {/* End Flow Button */}
          <motion.button
            onClick={() => setEndType('end')}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className={cn(
              "relative flex flex-col items-center gap-2 p-3 rounded-lg transition-all duration-200",
              endType === 'end'
                ? "bg-red-50 border-2 border-red-200 shadow-sm"
                : "border-2 border-gray-100 hover:border-gray-200 hover:bg-gray-50"
            )}
          >
            <Square className={cn(
              "h-6 w-6 transition-colors",
              endType === 'end' ? "text-red-500" : "text-gray-400"
            )} />
            <span className={cn(
              "text-sm font-medium transition-colors",
              endType === 'end' ? "text-red-700" : "text-gray-600"
            )}>
              End Flow
            </span>
            {endType === 'end' && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="absolute -top-2 -right-2"
              >
                <CheckCircle2 className="h-4 w-4 text-red-500" />
              </motion.div>
            )}
          </motion.button>

          {/* Redirect Button */}
          <motion.button
            onClick={() => setEndType('redirect')}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className={cn(
              "relative flex flex-col items-center gap-2 p-3 rounded-lg transition-all duration-200",
              endType === 'redirect'
                ? "bg-blue-50 border-2 border-blue-200 shadow-sm"
                : "border-2 border-gray-100 hover:border-gray-200 hover:bg-gray-50"
            )}
          >
            <ArrowRight className={cn(
              "h-6 w-6 transition-colors",
              endType === 'redirect' ? "text-blue-500" : "text-gray-400"
            )} />
            <span className={cn(
              "text-sm font-medium transition-colors",
              endType === 'redirect' ? "text-blue-700" : "text-gray-600"
            )}>
              Redirect
            </span>
            {endType === 'redirect' && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="absolute -top-2 -right-2"
              >
                <CheckCircle2 className="h-4 w-4 text-blue-500" />
              </motion.div>
            )}
          </motion.button>
        </div>

        {/* Redirect Selection */}
        <AnimatePresence mode="wait">
          {endType === 'redirect' && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden"
            >
              <div className="space-y-2 pt-2">
                <label className="block text-sm font-medium text-gray-700">
                  Redirect To
                </label>
                {otherInstances.length > 0 ? (
                  <select
                    value={redirectTab}
                    onChange={(e) => setRedirectTab(e.target.value)}
                    className={cn(
                      "w-full px-3 py-2 text-sm rounded-lg transition-all duration-200",
                      "border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500",
                      !redirectTab && "text-gray-500"
                    )}
                  >
                    <option value="" disabled>
                      Select a flow...
                    </option>
                    {otherInstances.map(instance => (
                      <option key={instance.id} value={instance.id}>
                        {instance.name}
                      </option>
                    ))}
                  </select>
                ) : (
                  <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg text-sm text-gray-500">
                    <CircleSlashed className="h-4 w-4" />
                    <span>No other flows available</span>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </NodeWrapper>
  );
});
EndNode.displayName = 'EndNode';

export const SingleChoiceNode = memo(({ id, data, selected }: NodeProps<SingleChoiceNodeData>) => {
  const { chartStore } = useStores() as any;
  const DEFAULT_QUESTION = "Select one of the following options:";

  const handleQuestionChange = useCallback((value: string) => {
    chartStore.updateNodeData(data.instanceId, id, {
      ...data,
      question: value || DEFAULT_QUESTION,
    });
  }, [chartStore, data, id]);

  const handleOptionChange = useCallback((optionId: string, value: string) => {
    chartStore.updateNodeData(data.instanceId, id, {
      ...data,
      options: data.options.map(opt =>
        opt.id === optionId ? { ...opt, label: value } : opt
      ),
    });
  }, [chartStore, data, id]);

  const handleAddOption = useCallback(() => {
    chartStore.updateNodeData(data.instanceId, id, {
      ...data,
      options: [
        ...data.options,
        { id: crypto.randomUUID(), label: '', nextNodeId: null }
      ],
    });
  }, [chartStore, data, id]);

  const handleRemoveOption = useCallback((optionId: string) => {
    chartStore.updateNodeData(data.instanceId, id, {
      ...data,
      options: data.options.filter(opt => opt.id !== optionId),
    });
  }, [chartStore, data, id]);

  const handleDelete = useCallback(() => {
    if (window.confirm('Are you sure you want to delete this node?')) {
      chartStore.removeNode(data.instanceId, id);
    }
  }, [chartStore, data.instanceId, id]);

  return (
    <NodeWrapper
      title="Single Choice"
      selected={selected}
      onDelete={handleDelete}
      headerClassName="bg-purple-50/50"
    >
      <div className="space-y-4">
        <Handle
          type="target"
          position={Position.Top}
          className="w-3 h-3 bg-blue-500 border-2 border-white transition-all duration-200 hover:bg-blue-600 hover:scale-110"
        />

        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">
            Question
          </label>
          <input
            type="text"
            value={data.question || DEFAULT_QUESTION}
            onChange={(e) => handleQuestionChange(e.target.value)}
            className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder={DEFAULT_QUESTION}
          />
        </div>

        <div className="space-y-2">
          {data.options.map((option, index) => (
            <div key={option.id} className="relative group">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 flex items-center justify-center bg-gray-100 rounded-full text-xs font-medium text-gray-600">
                  {index + 1}
                </div>
                <input
                  type="text"
                  value={option.label}
                  onChange={(e) => handleOptionChange(option.id, e.target.value)}
                  placeholder={`Option ${index + 1}`}
                  className="flex-1 px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                  onClick={() => handleRemoveOption(option.id)}
                  className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-gray-100 rounded"
                >
                  <Trash2 className="h-4 w-4 text-gray-400 hover:text-red-500" />
                </button>
              </div>
              <Handle
                type="source"
                position={Position.Bottom}
                id={`${option.id}-target`}
                className="w-3 h-3 bg-blue-500 border-2 border-white transition-all duration-200 hover:bg-blue-600 hover:scale-110"
                style={{
                  left: `${((index + 1) / (data.options.length + 1)) * 100}%`,
                }}
              />
            </div>
          ))}
        </div>

        <button
          onClick={handleAddOption}
          className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-gray-50 hover:bg-gray-100 rounded-lg text-sm font-medium text-gray-600 transition-colors"
        >
          <Plus className="h-4 w-4" />
          Add Option
        </button>
      </div>
    </NodeWrapper>
  );
});
SingleChoiceNode.displayName = 'SingleChoiceNode';

export const MultipleChoiceNode = memo(({ id, data, selected }: NodeProps<MultipleChoiceNodeData>) => {
  const { chartStore } = useStores() as any;
  const DEFAULT_QUESTION = "Select all that apply:";

  const handleQuestionChange = useCallback((value: string) => {
    chartStore.updateNodeData(data.instanceId, id, {
      ...data,
      question: value || DEFAULT_QUESTION,
    });
  }, [chartStore, data, id]);

  const handleOptionChange = useCallback((optionId: string, value: string) => {
    chartStore.updateNodeData(data.instanceId, id, {
      ...data,
      options: data.options.map(opt =>
        opt.id === optionId ? { ...opt, label: value } : opt
      ),
    });
  }, [chartStore, data, id]);

  const handleAddOption = useCallback(() => {
    chartStore.updateNodeData(data.instanceId, id, {
      ...data,
      options: [
        ...data.options,
        { id: crypto.randomUUID(), label: '', nextNodeId: null }
      ],
    });
  }, [chartStore, data, id]);

  const handleRemoveOption = useCallback((optionId: string) => {
    chartStore.updateNodeData(data.instanceId, id, {
      ...data,
      options: data.options.filter(opt => opt.id !== optionId),
    });
  }, [chartStore, data, id]);

  const handleSelectionLimitChange = useCallback((type: 'min' | 'max', value: string) => {
    const numValue = parseInt(value) || undefined;
    chartStore.updateNodeData(data.instanceId, id, {
      ...data,
      [type === 'min' ? 'minSelections' : 'maxSelections']: numValue,
    });
  }, [chartStore, data, id]);

  const handleDelete = useCallback(() => {
    if (window.confirm('Are you sure you want to delete this node?')) {
      chartStore.removeNode(data.instanceId, id);
    }
  }, [chartStore, data.instanceId, id]);

  return (
    <NodeWrapper
      title="Multiple Choice"
      selected={selected}
      onDelete={handleDelete}
      headerClassName="bg-indigo-50/50"
    >
      <div className="space-y-4">
        <Handle
          type="target"
          position={Position.Top}
          className="w-3 h-3 bg-blue-500 border-2 border-white transition-all duration-200 hover:bg-blue-600 hover:scale-110"
        />

        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">
            Question
          </label>
          <input
            type="text"
            value={data.question || DEFAULT_QUESTION}
            onChange={(e) => handleQuestionChange(e.target.value)}
            className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder={DEFAULT_QUESTION}
          />
        </div>

        <div className="flex gap-4">
          <div className="flex-1">
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Min Selections
            </label>
            <input
              type="number"
              min="0"
              max={data.options.length}
              value={data.minSelections || ''}
              onChange={(e) => handleSelectionLimitChange('min', e.target.value)}
              className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="flex-1">
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Max Selections
            </label>
            <input
              type="number"
              min={data.minSelections || 0}
              max={data.options.length}
              value={data.maxSelections || ''}
              onChange={(e) => handleSelectionLimitChange('max', e.target.value)}
              className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        <div className="space-y-2">
          {data.options.map((option, index) => (
            <div key={option.id} className="relative group">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 flex items-center justify-center bg-gray-100 rounded text-xs font-medium text-gray-600">
                  <Check className="h-4 w-4" />
                </div>
                <input
                  type="text"
                  value={option.label}
                  onChange={(e) => handleOptionChange(option.id, e.target.value)}
                  placeholder={`Option ${index + 1}`}
                  className="flex-1 px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                  onClick={() => handleRemoveOption(option.id)}
                  className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-gray-100 rounded"
                >
                  <Trash2 className="h-4 w-4 text-gray-400 hover:text-red-500" />
                </button>
              </div>
              <Handle
                type="source"
                position={Position.Bottom}
                id={`${option.id}-target`}
                className="w-3 h-3 bg-blue-500 border-2 border-white transition-all duration-200 hover:bg-blue-600 hover:scale-110"
                style={{
                  left: `${((index + 1) / (data.options.length + 1)) * 100}%`,
                }}
              />
            </div>
          ))}
        </div>

        <button
          onClick={handleAddOption}
          className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-gray-50 hover:bg-gray-100 rounded-lg text-sm font-medium text-gray-600 transition-colors"
        >
          <Plus className="h-4 w-4" />
          Add Option
        </button>
      </div>
    </NodeWrapper>
  );
});
MultipleChoiceNode.displayName = 'MultipleChoiceNode';

export const YesNoNode = memo(({ id, data, selected }: NodeProps<YesNoNodeData>) => {
  const { chartStore } = useStores() as any;
  const DEFAULT_QUESTION = "Does your claim meet this requirement?";

  const handleQuestionChange = useCallback((value: string) => {
    chartStore.updateNodeData(data.instanceId, id, {
      ...data,
      question: value || DEFAULT_QUESTION
    });
  }, [chartStore, data, id]);

  const handleDelete = useCallback(() => {
    if (window.confirm('Are you sure you want to delete this node?')) {
      chartStore.removeNode(data.instanceId, id);
    }
  }, [chartStore, data.instanceId, id]);

  return (
    <NodeWrapper
      title="Yes/No Question"
      selected={selected}
      onDelete={handleDelete}
      headerClassName="bg-emerald-50/50"
    >
      <div className="space-y-4">
        <Handle
          type="target"
          position={Position.Top}
          className="w-3 h-3 bg-blue-500 border-2 border-white transition-all duration-200 hover:bg-blue-600 hover:scale-110"
        />

        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">
            Question
          </label>
          <input
            type="text"
            value={data.question || DEFAULT_QUESTION}
            onChange={(e) => handleQuestionChange(e.target.value)}
            className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder={DEFAULT_QUESTION}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          {[
            { label: 'Yes', id: 'yes', position: Position.Bottom },
            { label: 'No', id: 'no', position: Position.Bottom }
          ].map((option) => (
            <div key={option.id} className="relative">
              <div className={cn(
                "p-2 text-center border rounded-lg bg-gray-50 text-sm font-medium transition-all duration-200",
                selected ? "border-gray-300" : "border-gray-200",
                "hover:border-blue-500 hover:bg-blue-50"
              )}>
                {option.label}
              </div>
              <Handle
                type="source"
                position={option.position}
                id={option.id}
                className={cn(
                  "w-3 h-3 bg-blue-500 border-2 border-white transition-all duration-200 hover:bg-blue-600 hover:scale-110",
                  option.id === 'yes' ? "left-[25%]" : "left-[75%]",
                  "bottom-0 translate-y-1/2"
                )}
              />
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
      headerClassName="bg-amber-50/50"
    >
      <div className="space-y-4">
        <Handle
          type="target"
          position={Position.Top}
          className="w-3 h-3 bg-amber-500 border-2 border-white transition-all duration-200 hover:bg-amber-600 hover:scale-110"
        />

        <div className="flex items-center gap-4">
          <Scale className="h-5 w-5 text-amber-500" />
          <input
            type="number"
            value={data.weight}
            onChange={(e) => handleWeightChange(e.target.value)}
            step="0.1"
            min="0"
            className="flex-1 px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
          />
        </div>

        <div className="text-xs text-gray-500">
          Score will be multiplied by this weight
        </div>

        <Handle
          type="source"
          position={Position.Bottom}
          className="w-3 h-3 bg-amber-500 border-2 border-white transition-all duration-200 hover:bg-amber-600 hover:scale-110"
        />
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
      headerClassName="bg-violet-50/50"
    >
      <div className="p-4 space-y-4">
        <Handle
          type="target"
          position={Position.Top}
          className="w-3 h-3 bg-violet-500 border-2 border-white transition-all duration-200 hover:bg-violet-600 hover:scale-110"
        />

        <input
          type="text"
          value={nodeData.label}
          onChange={(e) => setNodeData(prev => ({ ...prev, label: e.target.value }))}
          className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500"
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