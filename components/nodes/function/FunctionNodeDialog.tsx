// FunctionNodeDialog.tsx
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  ArrowRight,
  ChevronRight,
  CornerRightDown,
  Wrench as Function,
  GitBranch,
  ListChecks,
  Plus,
  Undo2,
  Variable,
  X
} from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";

interface FunctionNodeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUpdateLogic: (blocks: FunctionBlock[]) => void;
  sourceNode: Node | null;
  variables: Record<string, any>;
  blocks: FunctionBlock[];
}

export function FunctionNodeDialog({
  open,
  onOpenChange,
  onUpdateLogic,
  sourceNode,
  variables,
  blocks = []
}: FunctionNodeDialogProps) {
  const [activeTab, setActiveTab] = useState('build');
  const [blockSequence, setBlockSequence] = useState<FunctionBlock[]>(blocks);
  const [selectedBlockId, setSelectedBlockId] = useState<string | null>(null);
  const [handles, setHandles] = useState<string[]>([]);
  const [newHandle, setNewHandle] = useState('');
  const [history, setHistory] = useState<FunctionBlock[][]>([]);
  
  const [newBlock, setNewBlock] = useState<Partial<FunctionBlock>>({
    type: 'if',
    condition: {
      type: 'variable',
      variable: '',
      operator: '>=',
      value: ''
    }
  });

  // Reset state when dialog opens
  useEffect(() => {
    if (open) {
      setBlockSequence(blocks);
      setSelectedBlockId(null);
      setHistory([blocks]);
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

  // Handle undoing changes
  const handleUndo = () => {
    if (history.length > 1) {
      const newHistory = [...history];
      const previousState = newHistory[newHistory.length - 2];
      newHistory.pop();
      setHistory(newHistory);
      setBlockSequence(previousState);
    }
  };

  // Save state to history
  const saveToHistory = useCallback((newBlocks: FunctionBlock[]) => {
    setHistory(prev => [...prev, newBlocks]);
  }, []);

  const addHandle = useCallback(() => {
    if (!newHandle.trim()) {
      toast.error('Handle name is required');
      return;
    }
    if (handles.includes(newHandle)) {
      toast.error('Handle already exists');
      return;
    }
    setHandles(prev => [...prev, newHandle]);
    setNewHandle('');
    toast.success('Handle added');
  }, [newHandle, handles]);

  const addBlock = useCallback((parentId?: string) => {
    if (newBlock.type === 'return' && !handles.includes(newBlock.handle || '')) {
      toast.error('Invalid handle selected');
      return;
    }

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

      const newBlocks = parentId 
        ? updateBlocksRecursively(currentBlocks)
        : [...currentBlocks, block];
      
      saveToHistory(newBlocks);
      return newBlocks;
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
  }, [newBlock, handles, saveToHistory]);

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
      const newBlocks = removeFromArray([...blocks]);
      saveToHistory(newBlocks);
      return newBlocks;
    });
    toast.success('Block removed');
  }, [saveToHistory]);

  const renderBlock = useCallback((block: FunctionBlock, depth = 0) => {
    const blockStyle = {
      marginLeft: `${depth * 20}px`,
      borderLeft: depth > 0 ? '2px solid #e5e7eb' : 'none',
      paddingLeft: depth > 0 ? '12px' : '0'
    };

    return (
      <div key={block.id} className="relative" style={blockStyle}>
        <Card className="p-3 mb-2 group hover:shadow-md transition-shadow">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-md bg-muted">
              {block.type === 'if' && <GitBranch className="h-4 w-4 text-blue-500" />}
              {block.type === 'else' && <CornerRightDown className="h-4 w-4 text-yellow-500" />}
              {block.type === 'operation' && <ArrowRight className="h-4 w-4 text-green-500" />}
              {block.type === 'return' && <ChevronRight className="h-4 w-4 text-purple-500" />}
            </div>

            <div className="flex-1">
              {block.type === 'if' && block.condition && (
                <div className="text-sm space-y-1">
                  <div className="font-medium text-muted-foreground">If Condition</div>
                  {block.condition.type === 'variable' ? (
                    <div className="flex items-center gap-2 text-sm">
                      <Badge variant="outline" className="bg-blue-50">
                        {block.condition.variable}
                      </Badge>
                      <span>{block.condition.operator}</span>
                      <Badge variant="outline" className="bg-blue-50">
                        {block.condition.value}
                      </Badge>
                    </div>
                  ) : (
                    <div className="flex flex-wrap items-center gap-2">
                      <span>{block.condition.operator === 'allSelected' ? 'All of' :
                            block.condition.operator === 'anySelected' ? 'Any of' :
                            'None of'}</span>
                      {block.condition.selectedOptions?.map(optId => {
                        const option = sourceNode?.data.options.find(o => o.id === optId);
                        return (
                          <Badge key={optId} variant="outline" className="bg-purple-50">
                            {option?.label || optId}
                          </Badge>
                        );
                      })}
                      <span>selected</span>
                    </div>
                  )}
                </div>
              )}

              {block.type === 'else' && (
                <span className="text-sm font-medium">Else Block</span>
              )}

              {block.type === 'operation' && block.operation && (
                <div className="text-sm space-y-1">
                  <div className="font-medium text-muted-foreground">Operation</div>
                  <div className="flex items-center gap-2">
                    <span>{block.operation.type}</span>
                    <Badge variant="outline" className="bg-green-50">
                      {block.operation.value}
                    </Badge>
                    <span>to</span>
                    <Badge variant="outline" className="bg-green-50">
                      {block.operation.targetVariable}
                    </Badge>
                  </div>
                </div>
              )}

              {block.type === 'return' && (
                <div className="text-sm space-y-1">
                  <div className="font-medium text-muted-foreground">Return</div>
                  <Badge variant="outline" className="bg-purple-50">
                    {block.handle}
                  </Badge>
                </div>
              )}
            </div>

            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => removeBlock(block.id)}
                    className="opacity-0 group-hover:opacity-100"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Remove block</TooltipContent>
              </Tooltip>
            </TooltipProvider>
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
  }, [removeBlock, sourceNode?.data.options]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Function className="h-5 w-5" />
            Function Logic Builder
          </DialogTitle>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1">
          <div className="flex items-center justify-between mb-4">
            <TabsList>
              <TabsTrigger value="build" className="flex items-center gap-2">
                <GitBranch className="h-4 w-4" />
                Build Logic
              </TabsTrigger>
              <TabsTrigger value="handles" className="flex items-center gap-2">
                <ListChecks className="h-4 w-4" />
                Manage Handles
              </TabsTrigger>
            </TabsList>

            <div className="flex items-center gap-2">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleUndo}
                      disabled={history.length <= 1}
                    >
                      <Undo2 className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Undo last change</TooltipContent>
                </Tooltip>
              </TooltipProvider>

              <Button
                size="sm"
                onClick={() => onUpdateLogic(blockSequence)}
                disabled={blockSequence.length === 0}
              >
                Apply Changes
              </Button>
            </div>
          </div>

          <TabsContent value="handles" className="mt-0 flex-1">
            <Card className="p-4">
              <div className="space-y-4">
                <div className="flex items-end gap-2">
                  <div className="flex-1 space-y-2">
                    <Label>Handle Name</Label>
                    <Input
                      value={newHandle}
                      onChange={(e) => setNewHandle(e.target.value)}
                      placeholder="Enter handle name..."
                    />
                  </div>
                  <Button onClick={addHandle} disabled={!newHandle.trim()}>
                    Add Handle
                  </Button>
                </div>

                <Separator />

                <div className="space-y-2">
                  <Label>Current Handles</Label>
                  {handles.length === 0 ? (
                    <div className="text-sm text-muted-foreground py-4 text-center">
                      No handles added yet. Add some handles to create return points.
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 gap-2">
                      {handles.map(handle => (
                        <Card key={handle} className="p-2 flex items-center justify-between">
                          <span className="text-sm">{handle}</span>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setHandles(prev => prev.filter(h => h !== handle))}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </Card>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="build" className="mt-0 flex-1">
            <div className="grid grid-cols-5 gap-4 h-[600px]">
              {/* Left Panel - Block Builder */}
              <Card className="col-span-2 p-4 space-y-4 overflow-y-auto">
                <Accordion type="single" collapsible defaultValue="blockType">
                  <AccordionItem
                  value="blockType">
                  <AccordionTrigger>Block Type</AccordionTrigger>
                  <AccordionContent>
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
                        <SelectValue placeholder="Select block type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="if">
                          <div className="flex items-center gap-2">
                            <GitBranch className="h-4 w-4" />
                            If Condition
                          </div>
                        </SelectItem>
                        <SelectItem value="else">
                          <div className="flex items-center gap-2">
                            <CornerRightDown className="h-4 w-4" />
                            Else Block
                          </div>
                        </SelectItem>
                        <SelectItem value="operation">
                          <div className="flex items-center gap-2">
                            <ArrowRight className="h-4 w-4" />
                            Operation
                          </div>
                        </SelectItem>
                        <SelectItem value="return">
                          <div className="flex items-center gap-2">
                            <ChevronRight className="h-4 w-4" />
                            Return
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </AccordionContent>
                </AccordionItem>

                {newBlock.type === 'if' && (
                  <AccordionItem value="condition">
                    <AccordionTrigger>Condition Settings</AccordionTrigger>
                    <AccordionContent className="space-y-4">
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
                            <SelectValue placeholder="Select condition type" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="variable">
                              <div className="flex items-center gap-2">
                                <Variable className="h-4 w-4" />
                                Variable Condition
                              </div>
                            </SelectItem>
                            {sourceNode?.type === 'multipleChoice' && (
                              <SelectItem value="selection">
                                <div className="flex items-center gap-2">
                                  <ListChecks className="h-4 w-4" />
                                  Selection Condition
                                </div>
                              </SelectItem>
                            )}
                          </SelectContent>
                        </Select>
                      </div>

                      {newBlock.condition?.type === 'variable' ? (
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
                                    <div className="flex items-center justify-between w-full">
                                      <span>{varName}</span>
                                      <Badge variant="outline" className="ml-2">
                                        {typeof variables[varName]}
                                      </Badge>
                                    </div>
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
                              placeholder="Enter comparison value"
                            />
                          </div>
                        </div>
                      ) : newBlock.condition?.type === 'selection' && sourceNode?.type === 'multipleChoice' ? (
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
                            <Card className="p-2">
                              <ScrollArea className="h-[200px]">
                                {(sourceNode.data as MultipleChoiceNodeData).options.map(option => (
                                  <div key={option.id} className="flex items-center gap-2 p-2 hover:bg-secondary/20 rounded">
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
                                    <span className="text-sm">{option.label}</span>
                                  </div>
                                ))}
                              </ScrollArea>
                            </Card>
                          </div>
                        </div>
                      ) : null}
                    </AccordionContent>
                  </AccordionItem>
                )}

                {newBlock.type === 'operation' && (
                  <AccordionItem value="operation">
                    <AccordionTrigger>Operation Settings</AccordionTrigger>
                    <AccordionContent className="space-y-4">
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
                          placeholder="Enter operation value"
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
                                <div className="flex items-center justify-between w-full">
                                  <span>{varName}</span>
                                  <Badge variant="outline" className="ml-2">
                                    {typeof variables[varName]}
                                  </Badge>
                                </div>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                )}

                {newBlock.type === 'return' && (
                  <AccordionItem value="return">
                    <AccordionTrigger>Return Settings</AccordionTrigger>
                    <AccordionContent>
                      <div className="space-y-2">
                        <Label>Return Handle</Label>
                        <Select
                          value={newBlock.handle || ''}
                          onValueChange={(value) => setNewBlock(prev => ({
                            ...prev,
                            handle: value
                          }))}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select handle" />
                          </SelectTrigger>
                          <SelectContent>
                            {handles.map((handle) => (
                              <SelectItem key={handle} value={handle}>
                                {handle}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                )}
              </Accordion>

              <Separator />

              <div className="flex items-center gap-2">
                <Button
                  onClick={() => addBlock(selectedBlockId || undefined)}
                  className="flex-1"
                  disabled={
                    (newBlock.type === 'if' && (!newBlock.condition?.variable && !newBlock.condition?.selectedOptions?.length)) ||
                    (newBlock.type === 'operation' && (!newBlock.operation?.value || !newBlock.operation?.targetVariable)) ||
                    (newBlock.type === 'return' && !newBlock.handle)
                  }
                >
                  Add {selectedBlockId ? 'Nested ' : ''}Block
                </Button>

                {selectedBlockId && (
                  <Button
                    variant="outline"
                    onClick={() => setSelectedBlockId(null)}
                  >
                    Cancel Nesting
                  </Button>
                )}
              </div>
            </Card>

            {/* Right Panel - Sequence View */}
            <Card className="col-span-3 p-4">
              <ScrollArea className="h-[550px] pr-4">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label className="text-lg font-semibold">Logic Sequence</Label>
                  </div>

                  <div className="space-y-1">
                    {blockSequence.length === 0 ? (
                      <div className="flex flex-col items-center justify-center p-8 border-2 border-dashed rounded-lg">
                        <GitBranch className="h-8 w-8 text-muted-foreground mb-2" />
                        <p className="text-sm text-muted-foreground text-center">
                          Start building your sequence by adding blocks from the left panel
                        </p>
                      </div>
                    ) : (
                      blockSequence.map(block => renderBlock(block))
                    )}
                  </div>
                </div>
              </ScrollArea>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </DialogContent>
  </Dialog>
);
}