/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
// components/nodes/index.tsx
import { useStores } from '@/hooks/useStores';
import { cn } from '@/lib/utils';
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
  Plus,
  Scale,
  Settings,
  Square,
  Trash2,
  XCircle
} from 'lucide-react';
import { memo, useCallback, useEffect, useMemo, useState } from 'react';
import { Handle, NodeProps, Position } from 'reactflow';
import { NodeWrapper } from './base/NodeWrapper';
import { Modal } from './base/modal';

export const StartNode = memo(({ id, data, selected }: NodeProps) => {
  const { chartStore } = useStores();

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
  const { chartStore } = useStores();
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

// Continuing from previous implementation...

export const SingleChoiceNode = memo(({ id, data, selected }: NodeProps<SingleChoiceNodeData>) => {
  const { chartStore } = useStores();
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
  const { chartStore } = useStores();
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
  }, [chartStore, data.instanceId, id]);

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
  const { chartStore } = useStores();
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
      handles={false}
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
  const { chartStore } = useStores();

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
      handles={false}
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
  const { chartStore, variableStore, utilityStore } = useStores();
  const [nodeData, setNodeData] = useState({
    label: data?.label || "Function Node",
    variableScope: data?.variableScope || "local",
    selectedVariable: data?.selectedVariable || "",
    sequences: data?.sequences || [],
    handles: data?.handles || ["default"]
  });

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentOperation, setCurrentOperation] = useState("");
  const [currentValue, setCurrentValue] = useState<number | string>("");
  const [currentCondition, setCurrentCondition] = useState("");
  const [currentConditionValue, setCurrentConditionValue] = useState<number | string>("");

  const currentTab = utilityStore.currentTab;
  const currentInstance = chartStore.getChartInstance(currentTab);

  useEffect(() => {
    Object.assign(data, nodeData);
  }, [data, nodeData]);

  const filteredVariables = useMemo(() => {
    if (nodeData.variableScope === "global") {
      return variableStore.variables.global || [];
    } else {
      return currentInstance?.variables || [];
    }
  }, [variableStore.variables, currentInstance, nodeData.variableScope]);

  const updateNodeData = useCallback((updater: (prev: typeof nodeData) => typeof nodeData) => {
    setNodeData((prevData) => {
      const newData = updater(prevData);
      return newData;
    });
  }, []);

  const handleSelectVariable = (variableName: string) => {
    updateNodeData((prev) => ({ ...prev, selectedVariable: variableName }));
  };

  const addOperation = (parentIndex: number | null = null) => {
    if (currentOperation && currentValue !== "" && nodeData.selectedVariable) {
      const newOperation = {
        type: currentOperation,
        value: Number(currentValue),
        variable: nodeData.selectedVariable
      };

      updateNodeData((prev) => {
        const newSequences = [...prev.sequences];
        if (parentIndex !== null) {
          newSequences[parentIndex].children.push(newOperation);
        } else {
          newSequences.push(newOperation);
        }
        return { ...prev, sequences: newSequences };
      });

      setCurrentOperation("");
      setCurrentValue("");
    }
  };

  const addRule = () => {
    if (currentCondition && currentConditionValue !== "" && nodeData.selectedVariable) {
      const newRule = {
        type: "if",
        condition: currentCondition,
        value: Number(currentConditionValue),
        variable: nodeData.selectedVariable,
        handleId: "default",
        children: []
      };

      updateNodeData((prev) => ({
        ...prev,
        sequences: [...prev.sequences, newRule],
      }));

      setCurrentCondition("");
      setCurrentConditionValue("");
    }
  };

  const addElse = (ifIndex: number) => {
    updateNodeData((prev) => {
      const newSequences = [...prev.sequences];
      const ifBlock = newSequences[ifIndex];

      if (!ifBlock.children.find((child) => child.type === "else")) {
        ifBlock.children.push({
          type: "else",
          variable: nodeData.selectedVariable,
          handleId: "default",
          children: []
        });
      }

      return { ...prev, sequences: newSequences };
    });
  };

  const updateHandleForBlock = (parentIndex: number, handleId: string, blockType = "if") => {
    updateNodeData((prev) => {
      const newSequences = [...prev.sequences];
      const block = newSequences[parentIndex].children.find(
        (child) => child.type === blockType
      );

      if (block) {
        block.handleId = handleId;
      } else {
        newSequences[parentIndex].handleId = handleId;
      }

      return { ...prev, sequences: newSequences };
    });
  };

  const addHandleToNode = () => {
    const newHandleId = `handle-${nodeData.handles.length}`;
    updateNodeData((prev) => ({
      ...prev,
      handles: [...prev.handles, newHandleId],
    }));
  };

  const removeHandle = (handleId: string) => {
    updateNodeData((prev) => ({
      ...prev,
      handles: prev.handles.filter((id) => id !== handleId),
      sequences: prev.sequences.filter((seq) => seq.handleId !== handleId),
    }));
  };

  const removeSequence = (index: number, parentIndex: number | null = null) => {
    updateNodeData((prev) => {
      const newSequences = [...prev.sequences];
      if (parentIndex !== null) {
        newSequences[parentIndex].children = newSequences[parentIndex].children.filter(
          (_, i) => i !== index
        );
      } else {
        newSequences.splice(index, 1);
      }
      return { ...prev, sequences: newSequences };
    });
  };

  const renderIndentedSequences = (sequences: any[], level = 0, parentIndex: number | null = null) => {
    return sequences.map((seq, index) => {
      const isIndented = seq.type !== "else" && level > 0;
      const indentClass = isIndented ? "ml-8" : "";

      return (
        <motion.div
          key={index}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className={`flex flex-col ${indentClass}`}
        >
          <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
            <span className="text-sm font-medium">
              {seq.type === "if"
                ? `If ${seq.variable} is ${seq.condition} ${seq.value}`
                : seq.type === "else"
                  ? `Else`
                  : `${seq.type.charAt(0).toUpperCase() + seq.type.slice(1)} ${seq.value} to ${seq.variable}`}
            </span>
            <button
              className="p-1 hover:bg-gray-200 rounded-md text-gray-500 hover:text-red-500 transition-colors"
              onClick={() => removeSequence(index, parentIndex)}
            >
              <Trash2 size={16} />
            </button>
          </div>

          {(seq.type === "if" || seq.type === "else") && (
            <div className="mt-2 space-y-2 pl-4">
              <div className="flex items-center gap-2">
                <label className="text-xs font-medium text-gray-600">Output Handle:</label>
                <select
                  className="flex-1 px-3 py-1.5 text-sm bg-white border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={seq.handleId}
                  onChange={(e) => updateHandleForBlock(
                    parentIndex !== null ? parentIndex : index,
                    e.target.value,
                    seq.type
                  )}
                >
                  {nodeData.handles.map((handleId) => (
                    <option key={handleId} value={handleId}>{handleId}</option>
                  ))}
                </select>
              </div>

              {(seq.type === "if" || seq.type === "else") && (
                <>
                  {renderIndentedSequences(
                    seq.children,
                    level + 1,
                    parentIndex !== null ? parentIndex : index
                  )}
                  {seq.type === "if" && !seq.children.find(child => child.type === "else") && (
                    <button
                      className="mt-2 px-3 py-1.5 text-sm text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-md transition-colors"
                      onClick={() => addElse(parentIndex !== null ? parentIndex : index)}
                    >
                      + Add Else Condition
                    </button>
                  )}
                </>
              )}
            </div>
          )}
        </motion.div>
      );
    });
  };

  const handleDelete = useCallback(() => {
    if (window.confirm('Are you sure you want to delete this node?')) {
      chartStore.removeNode(data.instanceId, id);
    }
  }, [chartStore, data.instanceId, id]);

  return (
    <NodeWrapper
      title="Function"
      selected={selected}
      onDelete={handleDelete}
      handles={false}
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
          onChange={(e) => updateNodeData(prev => ({ ...prev, label: e.target.value }))}
          className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500"
          placeholder="Function Name"
        />

        <button
          onClick={() => setIsModalOpen(true)}
          className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-violet-50 hover:bg-violet-100 text-violet-700 rounded-lg transition-colors"
        >
          <Settings className="h-4 w-4" />
          Configure Function
        </button>

        <div className="space-y-2">
          {nodeData.handles.map((handleId) => (
            <div
              key={handleId}
              className="relative flex items-center justify-between bg-gray-50 p-2 rounded-lg group"
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

              <div className="flex items-center gap-2">
                {handleId !== 'default' && (
                  <button
                    onClick={() => removeHandle(handleId)}
                    className="p-1 hover:bg-gray-200 rounded-md text-gray-500 hover:text-red-500 transition-colors"
                  >
                    <Trash2 size={16} />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Function Configuration Modal */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
        <div className="p-6 space-y-6">
          <div className="flex items-center justify-between border-b border-gray-200 pb-4">
            <h3 className="text-lg font-bold text-gray-900">Configure Function</h3>
            <button
              onClick={() => setIsModalOpen(false)}
              className="p-1 hover:bg-gray-100 rounded-md"
            >
              <XCircle className="h-5 w-5 text-gray-500" />
            </button>
          </div>

          {/* Scope Selection */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Variable Scope</label>
            <div className="flex gap-2">
              <button
                className={cn(
                  "flex-1 px-4 py-2 text-sm font-medium rounded-lg transition-colors",
                  nodeData.variableScope === "local"
                    ? "bg-blue-50 text-blue-700 border-2 border-blue-200"
                    : "bg-gray-50 text-gray-600 border-2 border-gray-200 hover:bg-gray-100"
                )}
                onClick={() => updateNodeData(prev => ({ ...prev, variableScope: "local" }))}
              >
                Local
              </button>
              <button
                className={cn(
                  "flex-1 px-4 py-2 text-sm font-medium rounded-lg transition-colors",
                  nodeData.variableScope === "global"
                    ? "bg-purple-50 text-purple-700 border-2 border-purple-200"
                    : "bg-gray-50 text-gray-600 border-2 border-gray-200 hover:bg-gray-100"
                )}
                onClick={() => updateNodeData(prev => ({ ...prev, variableScope: "global" }))}
              >
                Global
              </button>
            </div>
          </div>

          {/* Variable Selection */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">
              Select {nodeData.variableScope.charAt(0).toUpperCase() + nodeData.variableScope.slice(1)} Variable
            </label>
            <select
              value={nodeData.selectedVariable}
              onChange={(e) => handleSelectVariable(e.target.value)}
              className="w-full px-3 py-2 text-sm bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select a variable</option>
              {filteredVariables.map((variable: any, index: number) => (
                <option key={index} value={variable.name}>
                  {variable.name}
                </option>
              ))}
            </select>
          </div>

          {/* Operations Section */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-medium text-gray-700">Operations</h4>
              <div className="flex items-center gap-2">
                <select
                  value={currentOperation}
                  onChange={(e) => setCurrentOperation(e.target.value)}
                  className="px-3 py-1.5 text-sm bg-white border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select Operation</option>
                  <option value="addition">Add</option>
                  <option value="subtraction">Subtract</option>
                  <option value="multiplication">Multiply</option>
                  <option value="division">Divide</option>
                </select>
                <input
                  type="number"
                  value={currentValue}
                  onChange={(e) => setCurrentValue(e.target.value)}
                  className="px-3 py-1.5 text-sm bg-white border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Value"
                />
                <button
                  onClick={() => addOperation()}
                  className="px-3 py-1.5 text-sm bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
                >
                  Add
                </button>
              </div>
            </div>

            {/* Conditional Rules */}
            <div className="space-y-2">
              <h4 className="text-sm font-medium text-gray-700">Conditional Rules</h4>
              <div className="flex items-center gap-2">
                <select
                  value={currentCondition}
                  onChange={(e) => setCurrentCondition(e.target.value)}
                  className="px-3 py-1.5 text-sm bg-white border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select Condition</option>
                  <option value=">">Greater than</option>
                  <option value="<">Less than</option>
                  <option value="==">Equal to</option>
                </select>
                <input
                  type="number"
                  value={currentConditionValue}
                  onChange={(e) => setCurrentConditionValue(e.target.value)}
                  className="px-3 py-1.5 text-sm bg-white border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Value"
                />
                <button
                  onClick={addRule}
                  className="px-3 py-1.5 text-sm bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
                >
                  Add Rule
                </button>
              </div>
            </div>

            {/* Handles Section */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-medium text-gray-700">Handles</h4>
                <button
                  onClick={addHandleToNode}
                  className="px-3 py-1.5 text-sm bg-green-500 text-white rounded-md hover:bg-green-600 transition-colors"
                >
                  Add Handle
                </button>
              </div>
              <div className="space-y-2">
                {nodeData.handles.map((handleId) => (
                  <div key={handleId} className="flex items-center justify-between bg-gray-50 p-2 rounded-lg group">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full border-2 border-white bg-violet-500" />
                      <span className="text-sm text-gray-600">{handleId}</span>
                    </div>

                    <div className="flex items-center gap-2">
                      {handleId !== 'default' && (
                        <button
                          onClick={() => removeHandle(handleId)}
                          className="p-1 hover:bg-gray-200 rounded-md text-gray-500 hover:text-red-500 transition-colors"
                        >
                          <Trash2 size={16} />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Sequences */}
            <div className="space-y-2">
              <h4 className="text-sm font-medium text-gray-700">Sequences</h4>
              <div className="space-y-2 bg-gray-50 p-4 rounded-lg">
                {renderIndentedSequences(nodeData.sequences)}
              </div>
            </div>
          </div>
        </div>
      </Modal>
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