import React, { useCallback, useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  ChevronRight, 
  Plus, 
  X, 
  ArrowRight, 
  GitBranch,
  CornerRightDown,
  AlertCircle
} from 'lucide-react';
import { toast } from 'sonner';
import { Checkbox } from '@/components/ui/checkbox';

interface Variable {
  name: string;
  value: string;
  scope: 'local' | 'global';
}

interface Handle {
  id: string;
  name: string;
  description?: string;
}

type BlockType = 'if' | 'else' | 'operation' | 'return';

interface Block {
  id: string;
  type: BlockType;
  parentId?: string;
  condition?: {
    variable: string;
    operator: string;
    value: string;
  };
  operation?: {
    type: 'add' | 'subtract' | 'multiply' | 'divide';
    value: string;
    targetVariable: string;
  };
  handle?: string;
  blocks?: Block[];
}

interface FunctionNodeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUpdateLogic: (blocks: Block[]) => void;
  variables: Variable[];
  blocks: Block[];
}

// FunctionNodeDialog.tsx
export function FunctionNodeDialog({
  open,
  onOpenChange,
  onUpdateLogic,
  sourceNode,
  variables,
  blocks = []
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUpdateLogic: (blocks: FunctionBlock[]) => void;
  sourceNode: Node | null;
  variables: Record<string, any>;
  blocks: FunctionBlock[];
}) {
  const [activeTab, setActiveTab] = useState('sequence');
  const [blockSequence, setBlockSequence] = useState<FunctionBlock[]>(blocks);
  const [selectedBlockId, setSelectedBlockId] = useState<string | null>(null);
  const [newBlock, setNewBlock] = useState<Partial<FunctionBlock>>({
    type: 'if',
    condition: {
      type: 'variable',
      variable: '',
      operator: '>=',
      value: ''
    }
  });

  useEffect(() => {
    if (open) {
      setBlockSequence(blocks);
      setSelectedBlockId(null);
      setNewBlock({
        type: 'if',
        condition: {
          type: 'variable',
          variable: '',
          operator: '>=',
          value: ''
        }
      });
    }
  }, [open, blocks]);

  const addBlock = useCallback((parentId?: string) => {
    const block: FunctionBlock = {
      id: crypto.randomUUID(),
      ...newBlock as FunctionBlock
    };

    setBlockSequence(currentBlocks => {
      const updateBlocksRecursively = (blocks: FunctionBlock[]): FunctionBlock[] => {
        return blocks.map(existingBlock => {
          if (existingBlock.id === parentId) {
            return {
              ...existingBlock,
              blocks: [...(existingBlock.blocks || []), block]
            };
          }
          if (existingBlock.blocks) {
            return {
              ...existingBlock,
              blocks: updateBlocksRecursively(existingBlock.blocks)
            };
          }
          return existingBlock;
        });
      };

      if (parentId) {
        return updateBlocksRecursively(currentBlocks);
      }
      return [...currentBlocks, block];
    });

    setNewBlock({
      type: 'if',
      condition: {
        type: 'variable',
        variable: '',
        operator: '>=',
        value: ''
      }
    });
    setSelectedBlockId(null);
    toast.success('Block added');
  }, [newBlock]);

  const removeBlock = useCallback((blockId: string) => {
    setBlockSequence(blocks => {
      const removeFromArray = (blocks: FunctionBlock[]): FunctionBlock[] => {
        return blocks.filter(block => {
          if (block.id === blockId) return false;
          if (block.blocks) {
            block.blocks = removeFromArray(block.blocks);
          }
          return true;
        });
      };
      return removeFromArray([...blocks]);
    });
    toast.success('Block removed');
  }, []);

  const renderConditionInputs = () => {
    if (!newBlock.condition) return null;

    if (newBlock.condition.type === 'variable') {
      return (
        <div className="space-y-4">
          <div>
            <Label>Variable</Label>
            <Select
              value={newBlock.condition.variable}
              onValueChange={(value) => setNewBlock(prev => ({
                ...prev,
                condition: {
                  ...prev.condition,
                  variable: value
                }
              }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select variable" />
              </SelectTrigger>
              <SelectContent>
                {Object.keys(variables).map(varName => (
                  <SelectItem key={varName} value={varName}>
                    {varName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>Operator</Label>
            <Select
              value={newBlock.condition.operator}
              onValueChange={(value: any) => setNewBlock(prev => ({
                ...prev,
                condition: {
                  ...prev.condition,
                  operator: value
                }
              }))}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value=">=">Greater than or equal (≥)</SelectItem>
                <SelectItem value="<=">Less than or equal (≤)</SelectItem>
                <SelectItem value="==">Equal (=)</SelectItem>
                <SelectItem value="!=">Not equal (≠)</SelectItem>
                <SelectItem value=">">Greater than (&gt;)</SelectItem>
                <SelectItem value="<">Less than (&lt;)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>Value</Label>
            <Input
              value={newBlock.condition.value}
              onChange={(e) => setNewBlock(prev => ({
                ...prev,
                condition: {
                  ...prev.condition,
                  value: e.target.value
                }
              }))}
              placeholder="Enter value"
            />
          </div>
        </div>
      );
    }

    if (newBlock.condition.type === 'selection' && sourceNode?.type === 'multipleChoice') {
      return (
        <div className="space-y-4">
          <div>
            <Label>Selection Operator</Label>
            <Select
              value={newBlock.condition.operator}
              onValueChange={(value: any) => setNewBlock(prev => ({
                ...prev,
                condition: {
                  ...prev.condition,
                  operator: value
                }
              }))}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="allSelected">All Selected</SelectItem>
                <SelectItem value="anySelected">Any Selected</SelectItem>
                <SelectItem value="noneSelected">None Selected</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Options</Label>
            {(sourceNode.data as MultipleChoiceNodeData).options.map(option => (
              <div key={option.id} className="flex items-center gap-2">
                <Checkbox
                  checked={newBlock.condition?.selectedOptions?.includes(option.id)}
                  onCheckedChange={(checked) => {
                    setNewBlock(prev => ({
                      ...prev,
                      condition: {
                        ...prev.condition,
                        selectedOptions: checked
                          ? [...(prev.condition?.selectedOptions || []), option.id]
                          : prev.condition?.selectedOptions?.filter(id => id !== option.id) || []
                      }
                    }));
                  }}
                />
                <span>{option.label}</span>
              </div>
            ))}
          </div>
        </div>
      );
    }

    return null;
  };

  const renderOperationInputs = () => {
    if (newBlock.type !== 'operation') return null;

    return (
      <div className="space-y-4">
        <div>
          <Label>Operation Type</Label>
          <Select
            value={newBlock.operation?.type || 'add'}
            onValueChange={(value: any) => setNewBlock(prev => ({
              ...prev,
              operation: {
                ...prev.operation,
                type: value
              }
            }))}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="add">Add</SelectItem>
              <SelectItem value="subtract">Subtract</SelectItem>
              <SelectItem value="multiply">Multiply</SelectItem>
              <SelectItem value="divide">Divide</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label>Value</Label>
          <Input
            value={newBlock.operation?.value || ''}
            onChange={(e) => setNewBlock(prev => ({
              ...prev,
              operation: {
                ...prev.operation,
                value: e.target.value
              }
            }))}
            placeholder="Enter value"
          />
        </div>

        <div>
          <Label>Target Variable</Label>
          <Select
            value={newBlock.operation?.targetVariable || ''}
            onValueChange={(value) => setNewBlock(prev => ({
              ...prev,
              operation: {
                ...prev.operation,
                targetVariable: value
              }
            }))}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select target variable" />
            </SelectTrigger>
            <SelectContent>
              {Object.keys(variables).map(varName => (
                <SelectItem key={varName} value={varName}>
                  {varName}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
    );
  };

  const renderBlock = (block: FunctionBlock, depth = 0) => {
    const blockStyle = {
      marginLeft: `${depth * 20}px`,
      borderLeft: depth > 0 ? '2px solid #e5e7eb' : 'none',
      paddingLeft: depth > 0 ? '12px' : '0'
    };

    return (
      <div key={block.id} className="relative" style={blockStyle}>
        <Card className="p-3 mb-2 group">
          <div className="flex items-center gap-2">
            {block.type === 'if' && <GitBranch className="h-4 w-4 text-blue-500" />}
            {block.type === 'else' && <CornerRightDown className="h-4 w-4 text-yellow-500" />}
            {block.type === 'operation' && <ArrowRight className="h-4 w-4 text-green-500" />}
            {block.type === 'return' && <ChevronRight className="h-4 w-4 text-purple-500" />}

            <div className="flex-1">
              {block.type === 'if' && block.condition && (
                <div className="text-sm">
                  {block.condition.type === 'variable' ? (
                    <>
                      if {block.condition.variable} {block.condition.operator} {block.condition.value}
                    </>
                  ) : (
                    <>
                      if {block.condition.operator === 'allSelected' ? 'all of' : 
                          block.condition.operator === 'anySelected' ? 'any of' : 
                          'none of'} (
                      {block.condition.selectedOptions?.map(optId => {
                        const option = sourceNode?.data.options.find(o => o.id === optId);
                        return option?.label || optId;
                      }).join(', ')}) selected
                    </>
                  )}
                </div>
              )}

              {block.type === 'else' && (
                <span className="text-sm font-medium">else</span>
              )}

              {block.type === 'operation' && block.operation && (
                <div className="text-sm">
                  {block.operation.type} {block.operation.value} to {block.operation.targetVariable}
                </div>
              )}

              {block.type === 'return' && (
                <span className="text-sm">return to {block.handle}</span>
              )}
            </div>

            <Button
              variant="ghost"
              size="icon"
              onClick={() => removeBlock(block.id)}
              className="opacity-0 group-hover:opacity-100"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </Card>

        {block.blocks && block.blocks.map(childBlock => renderBlock(childBlock, depth + 1))}

        {(block.type === 'if' || block.type === 'else' || block.type === 'operation') && (
          <Button
            variant="ghost"
            size="sm"
            className="ml-4 mt-1 text-xs"
            onClick={() => setSelectedBlockId(block.id)}
          >
            <Plus className="h-3 w-3 mr-1" />
            Add nested block
          </Button>
        )}
      </div>
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle>Function Logic Builder</DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-2 gap-6">
          {/* Left Panel - Build Logic */}
          <div className="space-y-4">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Block Type</Label>
                <Select
                  value={newBlock.type}
                  onValueChange={(value: FunctionBlock['type']) => {
                    const updatedBlock: Partial<FunctionBlock> = { type: value };
                    
                    if (value === 'if') {
                      updatedBlock.condition = sourceNode?.type === 'multipleChoice'
                        ? {
                            type: 'selection',
                            operator: 'allSelected',
                            selectedOptions: []
                          }
                        : {
                            type: 'variable',
                            variable: '',
                            operator: '>=',
                            value: ''
                          };
                    } else if (value === 'operation') {
                      updatedBlock.operation = {
                        type: 'add',
                        value: '',
                        targetVariable: ''
                      };
                    } else if (value === 'return') {
                      updatedBlock.handle = '';
                    }

                    setNewBlock(updatedBlock);
                  }}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="if">If Condition</SelectItem>
                    <SelectItem value="else">Else Block</SelectItem>
                    <SelectItem value="operation">Operation</SelectItem>
                    <SelectItem value="return">Return</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {newBlock.type === 'if' && (
                <div className="space-y-2">
                  <Label>Condition Type</Label>
                  <Select
                    value={newBlock.condition?.type || 'variable'}
                    onValueChange={(value: 'variable' | 'selection') => {
                      const condition = value === 'variable'
                        ? {
                            type: 'variable' as const,
                            variable: '',
                            operator: '>=',
                            value: ''
                          }
                        : {
                            type: 'selection' as const,
                            operator: 'allSelected',
                            selectedOptions: []
                          };
                      setNewBlock(prev => ({
                        ...prev,
                        condition
                      }));
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="variable">Variable</SelectItem>
                      {sourceNode?.type === 'multipleChoice' && (
                        <SelectItem value="selection">Selection</SelectItem>
                      )}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {newBlock.type === 'if' && renderConditionInputs()}
              {newBlock.type === 'operation' && renderOperationInputs()}

              {newBlock.type === 'return' && (
                <div className="space-y-2">
                  <Label>Return Handle</Label>
                  <Input
                    value={newBlock.handle || ''}
                    onChange={(e) => setNewBlock(prev => ({
                      ...prev,
                      handle: e.target.value
                    }))}
                    placeholder="Enter handle name..."
                  />
                </div>
              )}

              <Button
                onClick={() => addBlock(selectedBlockId || undefined)}
                className="w-full"
                disabled={
                  (newBlock.type === 'if' && (!newBlock.condition?.variable && !newBlock.condition?.selectedOptions?.length)) ||
                  (newBlock.type === 'operation' && (!newBlock.operation?.value || !newBlock.operation?.targetVariable)) ||
                  (newBlock.type === 'return' && !newBlock.handle)
                }
              >
                Add Block{selectedBlockId ? ' (Nested)' : ''}
              </Button>

              {selectedBlockId && (
                <Button
                  variant="ghost"
                  className="w-full"
                  onClick={() => setSelectedBlockId(null)}
                >
                  Cancel Nesting
                </Button>
              )}
            </div>
          </div>

          {/* Right Panel - Sequence View */}
          <div className="border-l pl-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label className="text-lg font-semibold">Sequence</Label>
                {blockSequence.length > 0 && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onUpdateLogic(blockSequence)}
                  >
                    Apply Changes
                  </Button>
                )}
              </div>

              <div className="space-y-1">
                {blockSequence.length === 0 ? (
                  <div className="flex flex-col items-center justify-center p-8 border-2 border-dashed rounded-lg">
                    <AlertCircle className="h-8 w-8 text-muted-foreground mb-2" />
                    <p className="text-sm text-muted-foreground text-center">
                      Start building your sequence by adding blocks from the left panel
                    </p>
                  </div>
                ) : (
                  blockSequence.map(block => renderBlock(block))
                )}
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}