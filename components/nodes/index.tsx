/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
// components/nodes/index.tsx
import { memo, useCallback, useState, useEffect, useMemo } from 'react';
import { Handle, Position } from 'reactflow';
import { useParams } from 'next/navigation';
import { nanoid } from 'nanoid';
import { toast } from 'sonner';
import { useRootStore } from '@/stores/rootStore';
import { NodeProps } from '@/types/nodes';
import { 
  StartNodeData, 
  EndNodeData, 
  SingleChoiceNodeData, 
  MultipleChoiceNodeData,
  YesNoNodeData,
  WeightNodeData,
  FunctionNodeData,
  FunctionStep,
  InputNodeData,
  MatrixNodeData
} from '@/types/nodes';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { NodeWrapper } from './base/NodeWrapper';
import { FunctionNodeDialog } from './function/FunctionNodeDialog';
import { Editor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Image from '@tiptap/extension-image';
import { useEditor } from '@tiptap/react';

import { 
  Trash2,
  Input as InputIcon,
  Text,
  CheckSquare,
  SplitSquareHorizontal,
  Scale,
  Settings2,
  Wrench as FunctionSquare,
  XCircle,
  CircleDot,
  Flag,
  List
} from 'lucide-react';
import { InputType } from 'zlib';
import { MultipleChoiceDialog } from './function/MultipleChoiceNodeDialog';
import { cn } from '@/lib/utils';

type OperationType = 'addition' | 'subtraction' | 'multiplication' | 'division';

export const StartNode = memo(({ id, data, selected }: NodeProps<StartNodeData>) => {
  const { removeNode, updateNode } = useRootStore();
  const params = useParams();
  const flowId = params.flowId as string;

  const handleDelete = useCallback(() => {
    if (!flowId) {
      console.error('StartNode: No flow ID found');
      return;
    }
    
    try {
      removeNode(flowId, id);
      toast.success('Node deleted successfully');
    } catch (error) {
      console.error('StartNode: Error deleting node:', error);
      toast.error('Failed to delete node');
    }
  }, [id, flowId]);

  const handleAddVariable = useCallback(() => {
    const newVariable = { name: '', value: '' };
    const newData = {
      ...data,
      variables: [...(data.variables || []), newVariable]
    };
    updateNode(flowId, id, newData);
  }, [data, flowId, id]);

  const handleRemoveVariable = useCallback((index: number) => {
    const newData = {
      ...data,
      variables: data.variables?.filter((_, i) => i !== index)
    };
    updateNode(flowId, id, newData);
  }, [data, flowId, id]);

  return (
    <NodeWrapper
      title="Start"
      selected={selected}
      onDelete={handleDelete}
      handles={{ bottom: true }}
      headerClassName="bg-blue-50 border-blue-100"
      headerIcon={<Flag className="h-4 w-4 text-blue-500" />}
    >
      <div className="p-4 space-y-4">
        <div className="space-y-2">
          <Label>Welcome Message</Label>
          <Input
            value={data.message || ''}
            onChange={(e) => updateNode(flowId, id, { ...data, message: e.target.value })}
            placeholder="Enter welcome message..."
            className="h-9"
          />
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label>Initial Variables</Label>
            <Button
              variant="outline"
              size="sm"
              onClick={handleAddVariable}
              className="h-7 px-2"
            >
              Add Variable
            </Button>
          </div>
          
          {data.variables?.map((variable, index) => (
            <div key={index} className="flex items-center gap-2">
              <Input
                value={variable.name}
                onChange={(e) => {
                  const newVariables = [...(data.variables || [])];
                  newVariables[index] = { ...variable, name: e.target.value };
                  updateNode(flowId, id, { ...data, variables: newVariables });
                }}
                placeholder="Variable name"
                className="h-9"
              />
              <Input
                value={variable.value}
                onChange={(e) => {
                  const newVariables = [...(data.variables || [])];
                  newVariables[index] = { ...variable, value: e.target.value };
                  updateNode(flowId, id, { ...data, variables: newVariables });
                }}
                placeholder="Initial value"
                className="h-9"
              />
              <Button
                variant="ghost"
                size="icon"
                onClick={() => handleRemoveVariable(index)}
                className="h-9 w-9 p-0"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
      </div>
    </NodeWrapper>
  );
});

export const EndNode = memo(({ id, data, selected }: NodeProps<EndNodeData>) => {
  const { removeNode, updateNode } = useRootStore();
  const params = useParams();
  const flowId = params.flowId as string;

  const handleDelete = useCallback(() => {
    if (!flowId) {
      console.error('EndNode: No flow ID found');
      return;
    }
    
    try {
      removeNode(flowId, id);
      toast.success('Node deleted successfully');
    } catch (error) {
      console.error('EndNode: Error deleting node:', error);
      toast.error('Failed to delete node');
    }
  }, [id, flowId]);

  return (
    <NodeWrapper
      title="End"
      selected={selected}
      onDelete={handleDelete}
      handles={{ top: true }}
      headerClassName="bg-red-50 border-red-100"
      headerIcon={<XCircle className="h-4 w-4 text-red-500" />}
    >
      <div className="p-4 space-y-4">
        <div className="space-y-2">
          <Label>End Type</Label>
          <Select
            value={data.endType || 'terminal'}
            onValueChange={(value) => updateNode(flowId, id, { ...data, endType: value as 'terminal' | 'redirect' })}
          >
            <SelectTrigger className="h-9">
              <SelectValue placeholder="Select end type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="terminal">Terminal</SelectItem>
              <SelectItem value="redirect">Redirect</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>Completion Message</Label>
          <Input
            value={data.message || ''}
            onChange={(e) => updateNode(flowId, id, { ...data, message: e.target.value })}
            placeholder="Enter completion message..."
            className="h-9"
          />
        </div>

        {data.endType === 'redirect' && (
          <>
            <div className="space-y-2">
              <Label>Redirect Flow</Label>
              <Select
                value={data.redirectFlow}
                onValueChange={(value) => updateNode(flowId, id, { ...data, redirectFlow: value })}
              >
                <SelectTrigger className="h-9">
                  <SelectValue placeholder="Select flow" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="flow1">Flow 1</SelectItem>
                  <SelectItem value="flow2">Flow 2</SelectItem>
                  <SelectItem value="flow3">Flow 3</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>Variable Mapping</Label>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    const newVariableMap = { ...data.variableMap, '': '' };
                    updateNode(flowId, id, { ...data, variableMap: newVariableMap });
                  }}
                  className="h-7 px-2"
                >
                  Add Mapping
                </Button>
              </div>
              
              {data.variableMap && Object.entries(data.variableMap).map(([fromVar, toVar], index) => (
                <div key={index} className="flex items-center gap-2">
                  <Input
                    value={fromVar}
                    onChange={(e) => {
                      const newVariableMap = { ...data.variableMap };
                      const value = newVariableMap[fromVar];
                      delete newVariableMap[fromVar];
                      newVariableMap[e.target.value] = value;
                      updateNode(flowId, id, { ...data, variableMap: newVariableMap });
                    }}
                    placeholder="From variable"
                    className="h-9"
                  />
                  <Input
                    value={toVar}
                    onChange={(e) => {
                      const newVariableMap = { ...data.variableMap, [fromVar]: e.target.value };
                      updateNode(flowId, id, { ...data, variableMap: newVariableMap });
                    }}
                    placeholder="To variable"
                    className="h-9"
                  />
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => {
                      const newVariableMap = { ...data.variableMap };
                      delete newVariableMap[fromVar];
                      updateNode(flowId, id, { ...data, variableMap: newVariableMap });
                    }}
                    className="h-9 w-9 p-0"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </NodeWrapper>
  );
});

export const SingleChoiceNode = memo(({ id, data, selected }: NodeProps<SingleChoiceNodeData>) => {
  const { removeNode, updateNode } = useRootStore();
  const params = useParams();
  const flowId = params.flowId as string;
  const DEFAULT_QUESTION = "Select one of the following options:";

  const handleDelete = useCallback(() => {
    console.log('SingleChoiceNode: Attempting to delete node', { id, instanceId: flowId });
    if (!flowId) {
      console.error('SingleChoiceNode: No flow ID found');
      return;
    }
    
    try {
      removeNode(flowId, id);
      toast.success('Node deleted successfully');
    } catch (error) {
      console.error('SingleChoiceNode: Error deleting node:', error);
      toast.error('Failed to delete node');
    }
  }, [id, flowId]);

  const handleAddOption = useCallback(() => {
    const newOption = { 
      id: nanoid(), 
      label: '', 
      nextNodeId: null,
      weight: 0,
      variableName: '',
      value: ''
    };
    const newData = {
      ...data,
      options: [...(data.options || []), newOption]
    };
    updateNode(flowId, id, newData);
  }, [data, flowId, id]);

  const handleRemoveOption = useCallback((optionId: string) => {
    const newData = {
      ...data,
      options: data.options?.filter(opt => opt.id !== optionId) || []
    };
    updateNode(flowId, id, newData);
  }, [data, flowId, id]);

  return (
    <NodeWrapper
      title="Single Choice"
      selected={selected}
      onDelete={handleDelete}
      handles={{ top: true }}
      headerClassName="bg-purple-50 border-purple-100"
      headerIcon={<CircleDot className="h-4 w-4 text-purple-500" />}
    >
      <div className="p-4 space-y-4">
        <div className="space-y-2">
          <Label>Question</Label>
          <Input
            value={data.question || DEFAULT_QUESTION}
            onChange={(e) => updateNode(flowId, id, { ...data, question: e.target.value })}
            placeholder="Enter your question..."
            className="h-9"
          />
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label>Options</Label>
            <Button
              variant="outline"
              size="sm"
              onClick={handleAddOption}
              className="h-7 px-2"
            >
              Add Option
            </Button>
          </div>
          
          {data.options?.map((option, index) => (
            <div key={option.id} className="relative space-y-2 p-3 bg-muted/30 rounded-md">
              <div className="flex items-center gap-2">
                <Input
                  value={option.label}
                  onChange={(e) => {
                    const newOptions = [...data.options];
                    newOptions[index] = { ...option, label: e.target.value };
                    updateNode(flowId, id, { ...data, options: newOptions });
                  }}
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

              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <Label className="text-xs">Weight</Label>
                  <Input
                    type="number"
                    value={option.weight || 0}
                    onChange={(e) => {
                      const newOptions = [...data.options];
                      newOptions[index] = { ...option, weight: Number(e.target.value) };
                      updateNode(flowId, id, { ...data, options: newOptions });
                    }}
                    className="h-8"
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Variable Name</Label>
                  <Input
                    value={option.variableName || ''}
                    onChange={(e) => {
                      const newOptions = [...data.options];
                      newOptions[index] = { ...option, variableName: e.target.value };
                      updateNode(flowId, id, { ...data, options: newOptions });
                    }}
                    className="h-8"
                  />
                </div>
              </div>

              <Handle
                type="source"
                position={Position.Right}
                id={option.id}
                className="w-3 h-3 border-2 !bg-background"
              />
            </div>
          ))}
        </div>
      </div>
    </NodeWrapper>
  );
});

interface Option {
  id: string;
  label: string;
  value: string;
  metadata?: {
    image?: {
      url: string;
      alt: string;
    };
  };
}

interface MultipleChoiceNodeData {
  question: string;
  description?: string;
  options: Option[];
  minSelections?: number;
  maxSelections?: number;
  style?: {
    layout: 'grid' | 'list';
    columns?: number;
    showImages?: boolean;
  };
  metadata?: {
    image?: {
      url: string;
      alt: string;
      position: 'top' | 'bottom' | 'background';
    };
  };
}

export const MultipleChoiceNode = memo(({ id, data, selected }: NodeProps<MultipleChoiceNodeData>) => {
  const { removeNode, updateNode } = useRootStore();
  const [showDialog, setShowDialog] = useState(false);
  const params = useParams();
  const flowId = params.flowId as string;

  const editor = useEditor({
    extensions: [
      StarterKit,
      Image.configure({
        inline: true,
        allowBase64: true,
      })
    ],
    content: data.question || '',
    onUpdate: ({ editor }) => {
      const content = editor.getHTML();
      handleUpdateNode({ question: content });
    }
  });

  const handleDelete = useCallback(() => {
    if (!flowId) return;
    removeNode(flowId, id);
    toast.success('Node deleted');
  }, [removeNode, id, flowId]);

  const handleUpdateNode = useCallback((updates: Partial<MultipleChoiceNodeData>) => {
    const newData = {
      ...data,
      ...updates,
    };
    updateNode(flowId, id, newData);
  }, [data, updateNode, flowId, id]);

  const handleImageUpload = useCallback(async (file: File, type: 'question' | 'option', optionId?: string) => {
    // In a real implementation, you'd upload to your storage service
    // For now, we'll use base64
    const reader = new FileReader();
    reader.onload = (e) => {
      const base64 = e.target?.result as string;
      if (type === 'question') {
        handleUpdateNode({
          metadata: {
            ...data.metadata,
            image: {
              url: base64,
              alt: file.name,
              position: 'top'
            }
          }
        });
      } else if (type === 'option' && optionId) {
        const newOptions = data.options.map(opt => 
          opt.id === optionId ? {
            ...opt,
            metadata: {
              ...opt.metadata,
              image: {
                url: base64,
                alt: file.name
              }
            }
          } : opt
        );
        handleUpdateNode({ options: newOptions });
      }
    };
    reader.readAsDataURL(file);
  }, [data, handleUpdateNode]);

  // Preview component for the node display
  const NodePreview = () => (
    <div className="space-y-4">
      {data.metadata?.image?.position === 'top' && data.metadata.image.url && (
        <img 
          src={data.metadata.image.url} 
          alt={data.metadata.image.alt}
          className="w-full rounded-lg" 
        />
      )}

      <div 
        className="prose prose-sm"
        dangerouslySetInnerHTML={{ __html: data.question }}
      />

      {data.description && (
        <p className="text-sm text-muted-foreground">{data.description}</p>
      )}

      <div className={cn(
        "grid gap-2",
        data.style?.layout === 'grid' ? `grid-cols-${data.style.columns || 2}` : 'grid-cols-1'
      )}>
        {data.options.map((option) => (
          <div 
            key={option.id}
            className="border rounded-lg p-2 flex items-center gap-2"
          >
            {option.metadata?.image?.url && data.style?.showImages && (
              <img 
                src={option.metadata.image.url} 
                alt={option.metadata.image.alt}
                className="w-12 h-12 rounded object-cover" 
              />
            )}
            <span className="text-sm">{option.label}</span>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <>
      <NodeWrapper
        title="Multiple Choice"
        selected={selected}
        onDelete={handleDelete}
        headerClassName="bg-indigo-50/80 border-indigo-100"
        headerIcon={<List className="h-4 w-4 text-indigo-500" />}
        headerActions={
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setShowDialog(true)}
            className="h-6 w-6 hover:bg-indigo-100/80"
          >
            <Settings2 className="h-4 w-4 text-indigo-500" />
          </Button>
        }
      >
        <div className="p-4">
          <NodePreview />
        </div>

        {/* Input Handle */}
        <Handle
          type="target"
          position={Position.Top}
          className="w-2 h-2 !border-2 !bg-white"
        />

        {/* Output Handle */}
        <Handle
          type="source"
          position={Position.Bottom}
          className="w-2 h-2 !border-2 !bg-white"
        />
      </NodeWrapper>

      <MultipleChoiceDialog 
        open={showDialog}
        onOpenChange={setShowDialog}
        data={data}
        onUpdate={handleUpdateNode}
        editor={editor}
        onImageUpload={handleImageUpload}
      />
    </>
  );
});

MultipleChoiceNode.displayName = 'MultipleChoiceNode';

export const YesNoNode = memo(({ id, data, selected }: NodeProps<YesNoNodeData>) => {
  const { removeNode, updateNode } = useRootStore();
  const params = useParams();
  const flowId = params.flowId as string;
  const DEFAULT_QUESTION = "Do you agree?";

  const handleDelete = useCallback(() => {
    console.log('YesNoNode: Attempting to delete node', { id, instanceId: flowId });
    if (!flowId) {
      console.error('YesNoNode: No flow ID found');
      return;
    }
    
    try {
      removeNode(flowId, id);
      toast.success('Node deleted successfully');
    } catch (error) {
      console.error('YesNoNode: Error deleting node:', error);
      toast.error('Failed to delete node');
    }
  }, [id, flowId]);

  return (
    <NodeWrapper
      title="Yes/No Question"
      selected={selected}
      onDelete={handleDelete}
      handles={{ top: true }}
      headerClassName="bg-green-50 border-green-100"
      headerIcon={<SplitSquareHorizontal className="h-4 w-4 text-green-500" />}
    >
      <div className="p-4 space-y-4">
        <div className="space-y-2">
          <Label>Question</Label>
          <Input
            value={data.question || DEFAULT_QUESTION}
            onChange={(e) => updateNode(flowId, id, { ...data, question: e.target.value })}
            placeholder="Enter your question..."
            className="h-9"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2 relative">
            <Label>Yes Option</Label>
            <div className="space-y-2 p-3 bg-muted/30 rounded-md">
              <div className="space-y-1">
                <Label className="text-xs">Label</Label>
                <Input
                  value={data.yesLabel || 'Yes'}
                  onChange={(e) => updateNode(flowId, id, { ...data, yesLabel: e.target.value })}
                  className="h-8"
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Value</Label>
                <Input
                  value={data.yesValue || '1'}
                  onChange={(e) => updateNode(flowId, id, { ...data, yesValue: e.target.value })}
                  className="h-8"
                />
              </div>
              <Handle
                type="source"
                position={Position.Right}
                id="yes"
                className="w-3 h-3 border-2 !bg-background"
              />
            </div>
          </div>

          <div className="space-y-2 relative">
            <Label>No Option</Label>
            <div className="space-y-2 p-3 bg-muted/30 rounded-md">
              <div className="space-y-1">
                <Label className="text-xs">Label</Label>
                <Input
                  value={data.noLabel || 'No'}
                  onChange={(e) => updateNode(flowId, id, { ...data, noLabel: e.target.value })}
                  className="h-8"
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Value</Label>
                <Input
                  value={data.noValue || '0'}
                  onChange={(e) => updateNode(flowId, id, { ...data, noValue: e.target.value })}
                  className="h-8"
                />
              </div>
              <Handle
                type="source"
                position={Position.Right}
                id="no"
                className="w-3 h-3 border-2 !bg-background"
              />
            </div>
          </div>
        </div>
      </div>
    </NodeWrapper>
  );
});

export const WeightNode = memo(({ id, data, selected }: NodeProps<WeightNodeData>) => {
  const { removeNode, updateNode } = useRootStore();
  const params = useParams();
  const flowId = params.flowId as string;

  const handleDelete = useCallback(() => {
    if (!flowId) {
      console.error('WeightNode: No flow ID found');
      return;
    }
    
    try {
      removeNode(flowId, id);
      toast.success('Node deleted successfully');
    } catch (error) {
      console.error('WeightNode: Error deleting node:', error);
      toast.error('Failed to delete node');
    }
  }, [id, flowId]);

  return (
    <NodeWrapper
      title="Weight"
      selected={selected}
      onDelete={handleDelete}
      handles={{ top: true, bottom: true }}
      headerClassName="bg-amber-50 border-amber-100"
      headerIcon={<Scale className="h-4 w-4 text-amber-500" />}
    >
      <div className="p-4 space-y-4">
        <div className="space-y-2">
          <Label>Weight Value</Label>
          <Input
            type="number"
            value={data.weight || 0}
            onChange={(e) => updateNode(flowId, id, { ...data, weight: Number(e.target.value) })}
            placeholder="Enter weight value..."
            className="h-9"
          />
        </div>

        <div className="space-y-2">
          <Label>Operation</Label>
          <Select
            value={data.operation || 'multiply'}
            onValueChange={(value) => updateNode(flowId, id, { ...data, operation: value as 'multiply' | 'add' })}
          >
            <SelectTrigger className="h-9">
              <SelectValue placeholder="Select operation" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="multiply">Multiply</SelectItem>
              <SelectItem value="add">Add</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>Target Variable</Label>
          <Input
            value={data.targetVariable || ''}
            onChange={(e) => updateNode(flowId, id, { ...data, targetVariable: e.target.value })}
            placeholder="Enter target variable name..."
            className="h-9"
          />
        </div>
      </div>
    </NodeWrapper>
  );
});


export const FunctionNode = memo(({ id, data, selected }: NodeProps<FunctionNodeData>) => {
  const { removeNode, updateNode } = useRootStore();
  const [showDialog, setShowDialog] = useState(false);
  const [variables, setVariables] = useState<{ name: string; value: string; scope: 'local' | 'global' }[]>([]);
  const params = useParams();
  const flowId = params.flowId as string;
  const projectId = params.projectId as string;

  // Get all unique handles from the blocks
  const getUniqueHandles = (blocks: any[]): string[] => {
    const handles = new Set<string>();
    
    const findHandles = (block: any) => {
      if (block.type === 'return' && block.handle) {
        handles.add(block.handle);
      }
      if (block.blocks) {
        block.blocks.forEach(findHandles);
      }
    };

    blocks.forEach(findHandles);
    return Array.from(handles);
  };

  // Validate that all paths end with return
  const validateReturns = (blocks: any[]): boolean => {
    const checkBlocksForReturn = (blocks: any[]): boolean => {
      if (!blocks || blocks.length === 0) return false;

      for (const block of blocks) {
        // If it's a return block, this path is valid
        if (block.type === 'return') return true;
        
        // If it's an if block, both if and else paths must have returns
        if (block.type === 'if') {
          const hasIfReturn = block.blocks ? checkBlocksForReturn(block.blocks) : false;
          // Look for else block
          const elseBlock = block.blocks?.find(b => b.type === 'else');
          const hasElseReturn = elseBlock?.blocks ? checkBlocksForReturn(elseBlock.blocks) : false;
          
          if (!hasIfReturn || !hasElseReturn) return false;
        }
        
        // If it's an else block, check its contents
        if (block.type === 'else' && block.blocks) {
          if (!checkBlocksForReturn(block.blocks)) return false;
        }
        
        // For operation blocks, continue checking
        if (block.type === 'operation' && block.blocks) {
          if (checkBlocksForReturn(block.blocks)) return true;
        }
      }
      
      // Check if the last block in the sequence is a return
      return blocks[blocks.length - 1]?.type === 'return';
    };

    return checkBlocksForReturn(blocks);
  };

  // Fetch variables
  useEffect(() => {
    const fetchVariables = async () => {
      try {
        const [projectResponse, flowResponse] = await Promise.all([
          fetch(`/api/projects/${projectId}`),
          fetch(`/api/projects/${projectId}/flows/${flowId}`)
        ]);

        const projectData = await projectResponse.json();
        const flowData = await flowResponse.json();
        
        const globalVars = (projectData.project?.variables || []).map((v: any) => ({
          ...v,
          scope: 'global' as const
        }));

        let localVars: any[] = [];
        if (flowData.flow?.content) {
          try {
            const content = JSON.parse(flowData.flow.content);
            localVars = (content.variables || []).map((v: any) => ({
              ...v,
              scope: 'local' as const
            }));
          } catch (err) {
            console.error('Error parsing flow content:', err);
          }
        }

        setVariables([...globalVars, ...localVars]);
      } catch (error) {
        console.error('Error fetching variables:', error);
        toast.error('Failed to load variables');
      }
    };

    fetchVariables();
  }, [projectId, flowId]);

  const handleDelete = useCallback(() => {
    if (!flowId) return;
    removeNode(flowId, id);
    toast.success('Node deleted');
  }, [removeNode, id, flowId]);

  const handleUpdateLogic = useCallback((blocks: any[]) => {
    // Validate returns before updating
    if (!validateReturns(blocks)) {
      toast.error('All paths must end with a return statement');
      return;
    }

    const newData = {
      ...data,
      blocks: blocks,
    };
    updateNode(flowId, id, newData);
    toast.success('Function logic updated');
    setShowDialog(false);
  }, [data, updateNode, flowId, id]);

  // Get all handles for rendering
  const handles = data.blocks ? getUniqueHandles(data.blocks) : [];

  // Render sequence preview
  const renderSequencePreview = (blocks: any[], depth = 0) => {
    return blocks.map((block, index) => {
      const indent = depth * 12;
      return (
        <div key={block.id} style={{ marginLeft: `${indent}px` }}>
          <div className="text-sm text-muted-foreground">
            {block.type === 'if' && (
              <div>
                if {block.condition?.variable} {block.condition?.operator} {block.condition?.value}
              </div>
            )}
            {block.type === 'else' && <div>else</div>}
            {block.type === 'operation' && (
              <div>
                {block.operation?.type} {block.operation?.value} to {block.operation?.targetVariable}
              </div>
            )}
            {block.type === 'return' && (
              <div>return to {block.handle}</div>
            )}
          </div>
          {block.blocks && renderSequencePreview(block.blocks, depth + 1)}
        </div>
      );
    });
  };

  return (
    <>
      <NodeWrapper
        title="Function"
        selected={selected}
        onDelete={handleDelete}
        handles={{ top: true }}
        headerClassName="bg-blue-50/80 border-blue-100"
        headerIcon={<FunctionSquare className="h-4 w-4 text-blue-500" />}
        headerActions={
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setShowDialog(true)}
            className="h-6 w-6 hover:bg-blue-100/80"
          >
            <Settings2 className="h-4 w-4 text-blue-500" />
          </Button>
        }
      >
        <div className="p-4 relative min-h-[100px]">
          <div className="flex gap-8">
            {/* Left side - Sequence preview */}
            <div className="flex-1">
              {data.blocks && data.blocks.length > 0 ? (
                <div className="space-y-2 text-sm">
                  {renderSequencePreview(data.blocks)}
                </div>
              ) : (
                <div className="absolute inset-0 flex items-center justify-center text-sm text-muted-foreground">
                  Click settings to add function logic
                </div>
              )}
            </div>
            
            {/* Right side - Handles */}
            {handles.length > 0 && (
              <div className="w-24 flex flex-col gap-2 justify-start">
                {handles.map((handle, index) => (
                  <div key={handle} className="relative">
                    <div className="text-xs text-muted-foreground mb-1">{handle}</div>
                    <Handle
                      type="source"
                      position={Position.Right}
                      id={handle}
                      className="w-3 h-3 !right-0"
                    />
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </NodeWrapper>

      <FunctionNodeDialog
        open={showDialog}
        onOpenChange={setShowDialog}
        onUpdateLogic={handleUpdateLogic}
        variables={variables}
        blocks={data.blocks || []}
      />
    </>
  );
});

FunctionNode.displayName = 'FunctionNode';

export const InputNode = memo(({ id, data, selected }: NodeProps<InputNodeData>) => {
  const { removeNode, updateNode } = useRootStore();
  const params = useParams();
  const flowId = params.flowId as string;

  const handleDelete = useCallback(() => {
    if (!flowId) {
      console.error('InputNode: No flow ID found');
      return;
    }
    
    try {
      removeNode(flowId, id);
      toast.success('Node deleted successfully');
    } catch (error) {
      console.error('InputNode: Error deleting node:', error);
      toast.error('Failed to delete node');
    }
  }, [id, flowId]);

  const handleInputTypeChange = useCallback((value: InputType) => {
    const newData = {
      ...data,
      inputType: value,
      validation: value === 'email' ? [{ type: 'email', message: 'Please enter a valid email' }] :
                 value === 'phone' ? [{ type: 'phone', message: 'Please enter a valid phone number' }] :
                 data.validation
    };
    updateNode(flowId, id, newData);
  }, [data, flowId, id]);

  const handleValidationChange = useCallback((rules: ValidationRule[]) => {
    const newData = { ...data, validation: rules };
    updateNode(flowId, id, newData);
  }, [data, flowId, id]);

  return (
    <NodeWrapper
      title="Input"
      selected={selected}
      onDelete={handleDelete}
      handles={{ top: true, bottom: true }}
    >
      <div className="p-4 space-y-4">
        <div className="space-y-2">
          <Label>Label</Label>
          <Input
            value={data.label}
            onChange={(e) => updateNode(flowId, id, { ...data, label: e.target.value })}
            placeholder="Enter field label..."
            className="h-9"
          />
        </div>

        <div className="space-y-2">
          <Label>Input Type</Label>
          <Select value={data.inputType} onValueChange={handleInputTypeChange}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="text">Text</SelectItem>
              <SelectItem value="textarea">Long Text</SelectItem>
              <SelectItem value="email">Email</SelectItem>
              <SelectItem value="number">Number</SelectItem>
              <SelectItem value="phone">Phone</SelectItem>
              <SelectItem value="date">Date</SelectItem>
              <SelectItem value="file">File Upload</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>Variable Name</Label>
          <Input
            value={data.variableName}
            onChange={(e) => updateNode(flowId, id, { ...data, variableName: e.target.value })}
            placeholder="Enter variable name..."
            className="h-9"
          />
        </div>

        {data.inputType !== 'file' && (
          <div className="space-y-2">
            <Label>Placeholder</Label>
            <Input
              value={data.placeholder}
              onChange={(e) => updateNode(flowId, id, { ...data, placeholder: e.target.value })}
              placeholder="Enter placeholder text..."
              className="h-9"
            />
          </div>
        )}
      </div>
    </NodeWrapper>
  );
});

InputNode.displayName = 'InputNode';

export const MatrixNode = memo(({ id, data, selected }: NodeProps<MatrixNodeData>) => {
  const { removeNode, updateNode } = useRootStore();
  const params = useParams();
  const flowId = params.flowId as string;

  const handleDelete = useCallback(() => {
    if (!flowId) {
      console.error('MatrixNode: No flow ID found');
      return;
    }
    
    try {
      removeNode(flowId, id);
      toast.success('Node deleted successfully');
    } catch (error) {
      console.error('MatrixNode: Error deleting node:', error);
      toast.error('Failed to delete node');
    }
  }, [id, flowId]);

  const handleAddRow = useCallback(() => {
    const newRow = {
      id: nanoid(),
      question: '',
      variableName: `row_${nanoid(6)}`
    };
    const newData = {
      ...data,
      rows: [...data.rows, newRow]
    };
    updateNode(flowId, id, newData);
  }, [data, flowId, id]);

  const handleAddColumn = useCallback(() => {
    const newColumn = {
      id: nanoid(),
      label: '',
      value: data.columns.length + 1
    };
    const newData = {
      ...data,
      columns: [...data.columns, newColumn]
    };
    updateNode(flowId, id, newData);
  }, [data, flowId, id]);

  const handleRemoveRow = useCallback((rowId: string) => {
    const newData = {
      ...data,
      rows: data.rows.filter(row => row.id !== rowId)
    };
    updateNode(flowId, id, newData);
  }, [data, flowId, id]);

  const handleRemoveColumn = useCallback((columnId: string) => {
    const newData = {
      ...data,
      columns: data.columns.filter(col => col.id !== columnId)
    };
    updateNode(flowId, id, newData);
  }, [data, flowId, id]);

  return (
    <NodeWrapper
      title="Matrix"
      selected={selected}
      onDelete={handleDelete}
      handles={{ top: true, bottom: true }}
    >
      <div className="p-4 space-y-4">
        <div className="space-y-2">
          <Label>Title</Label>
          <Input
            value={data.title}
            onChange={(e) => updateNode(flowId, id, { ...data, title: e.target.value })}
            placeholder="Enter matrix title..."
            className="h-9"
          />
        </div>

        <div className="space-y-2">
          <Label>Cell Type</Label>
          <Select 
            value={data.cellType} 
            onValueChange={(value: 'radio' | 'checkbox') => 
              updateNode(flowId, id, { ...data, cellType: value })
            }
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="radio">Single Choice (Radio)</SelectItem>
              <SelectItem value="checkbox">Multiple Choice (Checkbox)</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <Label>Rows (Questions)</Label>
            <Button
              variant="outline"
              size="sm"
              onClick={handleAddRow}
            >
              Add Row
            </Button>
          </div>
          {data.rows.map((row, index) => (
            <div key={row.id} className="flex items-center gap-2">
              <Input
                value={row.question}
                onChange={(e) => {
                  const newRows = [...data.rows];
                  newRows[index] = { ...row, question: e.target.value };
                  updateNode(flowId, id, { ...data, rows: newRows });
                }}
                placeholder={`Question ${index + 1}`}
                className="h-9"
              />
              <Input
                value={row.variableName}
                onChange={(e) => {
                  const newRows = [...data.rows];
                  newRows[index] = { ...row, variableName: e.target.value };
                  updateNode(flowId, id, { ...data, rows: newRows });
                }}
                placeholder="Variable name"
                className="h-9 w-32"
              />
              <Button
                variant="ghost"
                size="icon"
                onClick={() => handleRemoveRow(row.id)}
                className="h-9 w-9 p-0"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>

        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <Label>Columns (Scale)</Label>
            <Button
              variant="outline"
              size="sm"
              onClick={handleAddColumn}
            >
              Add Column
            </Button>
          </div>
          {data.columns.map((column, index) => (
            <div key={column.id} className="flex items-center gap-2">
              <Input
                value={column.label}
                onChange={(e) => {
                  const newColumns = [...data.columns];
                  newColumns[index] = { ...column, label: e.target.value };
                  updateNode(flowId, id, { ...data, columns: newColumns });
                }}
                placeholder={`Option ${index + 1}`}
                className="h-9"
              />
              <Input
                type="number"
                value={column.value}
                onChange={(e) => {
                  const newColumns = [...data.columns];
                  newColumns[index] = { ...column, value: Number(e.target.value) };
                  updateNode(flowId, id, { ...data, columns: newColumns });
                }}
                placeholder="Value"
                className="h-9 w-24"
              />
              <Button
                variant="ghost"
                size="icon"
                onClick={() => handleRemoveColumn(column.id)}
                className="h-9 w-9 p-0"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
      </div>
    </NodeWrapper>
  );
});

MatrixNode.displayName = 'MatrixNode';

// Export the nodeTypes mapping
export const nodeTypes = {
  startNode: StartNode,
  endNode: EndNode,
  singleChoice: SingleChoiceNode,
  multipleChoice: MultipleChoiceNode,
  yesNo: YesNoNode,
  weight: WeightNode,
  function: FunctionNode,
  input: InputNode,
  matrix: MatrixNode,
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
  },
  {
    type: 'input',
    label: 'Input Node',
    icon: 'Pencil',
    description: 'User input field'
  },
  {
    type: 'matrix',
    label: 'Matrix Node',
    icon: 'Grid',
    description: 'Matrix question'
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