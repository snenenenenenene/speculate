import React, { useState } from 'react';
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

export function FunctionNodeDialog({
  open,
  onOpenChange,
  onUpdateLogic,
  variables = [],
  blocks = []
}: FunctionNodeDialogProps) {
  const [activeTab, setActiveTab] = useState('sequence');
  const [handles, setHandles] = useState<Handle[]>([]);
  const [newHandle, setNewHandle] = useState({ name: '', description: '' });
  const [blockSequence, setBlockSequence] = useState<Block[]>(blocks);
  const [selectedBlockId, setSelectedBlockId] = useState<string | null>(null);

  const [newBlock, setNewBlock] = useState<Partial<Block>>({
    type: 'if',
    condition: {
      variable: '',
      operator: '>=',
      value: ''
    }
  });

  const addHandle = () => {
    if (newHandle.name) {
      const handle: Handle = {
        id: crypto.randomUUID(),
        name: newHandle.name,
        description: newHandle.description
      };
      setHandles([...handles, handle]);
      setNewHandle({ name: '', description: '' });
      toast.success('Handle added');
    }
  };

  const addBlock = (parentId?: string) => {
    const block: Block = {
      id: crypto.randomUUID(),
      ...newBlock as Block,
      parentId
    };

    setBlockSequence(currentBlocks => {
      const updateBlocksRecursively = (blocks: Block[]): Block[] => {
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

    // Reset form and selected block
    setNewBlock({
      type: 'if',
      condition: {
        variable: '',
        operator: '>=',
        value: ''
      }
    });
    setSelectedBlockId(null);
    toast.success('Block added');
  };

  const removeBlock = (id: string) => {
    setBlockSequence(blocks => {
      const removeFromArray = (blocks: Block[]): Block[] => {
        return blocks.filter(block => {
          if (block.id === id) return false;
          if (block.blocks) {
            block.blocks = removeFromArray(block.blocks);
          }
          return true;
        });
      };
      return removeFromArray([...blocks]);
    });
    toast.success('Block removed');
  };

  const findBlockById = (blocks: Block[], id: string): Block | null => {
    for (const block of blocks) {
      if (block.id === id) return block;
      if (block.blocks) {
        const found = findBlockById(block.blocks, id);
        if (found) return found;
      }
    }
    return null;
  };

  const renderBlock = (block: Block, depth = 0) => {
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
                <div className="flex items-center gap-1">
                  <span className="text-sm font-medium">if</span>
                  <span className="text-sm">{block.condition.variable}</span>
                  <span className="text-sm">{block.condition.operator}</span>
                  <span className="text-sm">{block.condition.value}</span>
                </div>
              )}

              {block.type === 'else' && (
                <span className="text-sm font-medium">else</span>
              )}

              {block.type === 'operation' && block.operation && (
                <div className="flex items-center gap-1">
                  <span className="text-sm">{block.operation.type}</span>
                  <span className="text-sm">{block.operation.value}</span>
                  <span className="text-sm">to</span>
                  <span className="text-sm">{block.operation.targetVariable}</span>
                </div>
              )}

              {block.type === 'return' && block.handle && (
                <div className="flex items-center gap-1">
                  <span className="text-sm font-medium">return to</span>
                  <Badge variant="outline">{block.handle}</Badge>
                </div>
              )}
            </div>

            <Button
              variant="ghost"
              size="icon"
              className="opacity-0 group-hover:opacity-100"
              onClick={() => removeBlock(block.id)}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </Card>

        {block.blocks && block.blocks.map(childBlock => renderBlock(childBlock, depth + 1))}

        {(block.type === 'if' || block.type === 'else') && (
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
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="sequence">Build Sequence</TabsTrigger>
                <TabsTrigger value="handles">Handles</TabsTrigger>
              </TabsList>

              <TabsContent value="handles" className="space-y-4">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Handle Name</Label>
                    <Input
                      value={newHandle.name}
                      onChange={(e) => setNewHandle({ ...newHandle, name: e.target.value })}
                      placeholder="e.g., Success, Failure"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Description (Optional)</Label>
                    <Input
                      value={newHandle.description}
                      onChange={(e) => setNewHandle({ ...newHandle, description: e.target.value })}
                      placeholder="Handle description..."
                    />
                  </div>

                  <Button 
                    onClick={addHandle}
                    disabled={!newHandle.name}
                    className="w-full"
                  >
                    Add Handle
                  </Button>

                  <div className="space-y-2">
                    {handles.map(handle => (
                      <Card key={handle.id} className="p-2">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium">{handle.name}</p>
                            {handle.description && (
                              <p className="text-sm text-muted-foreground">{handle.description}</p>
                            )}
                          </div>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setHandles(handles.filter(h => h.id !== handle.id))}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      </Card>
                    ))}
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="sequence" className="space-y-4">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Block Type</Label>
                    <Select
                      value={newBlock.type}
                      onValueChange={(value: BlockType) => {
                        setNewBlock({
                          type: value,
                          ...(value === 'if' ? {
                            condition: { variable: '', operator: '>=', value: '' }
                          } : value === 'operation' ? {
                            operation: { type: 'add', value: '', targetVariable: '' }
                          } : value === 'return' ? {
                            handle: ''
                          } : {})
                        });
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
                    <>
                      <div className="space-y-2">
                        <Label>Variable</Label>
                        <Select
                          value={newBlock.condition?.variable || ''}
                          onValueChange={(value) => setNewBlock({
                            ...newBlock,
                            condition: { ...newBlock.condition!, variable: value }
                          })}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select variable" />
                          </SelectTrigger>
                          <SelectContent>
                            {variables.map((variable) => (
                              <SelectItem 
                                key={variable.name} 
                                value={variable.name}
                              >
                                <div className="flex items-center justify-between w-full">
                                  <span>{variable.name}</span>
                                  <Badge 
                                    variant={variable.scope === 'local' ? 'secondary' : 'outline'}
                                    className="ml-2"
                                  >
                                    {variable.scope}
                                  </Badge>
                                </div>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label>Operator</Label>
                        <Select
                          value={newBlock.condition?.operator || '>='}
                          onValueChange={(value) => setNewBlock({
                            ...newBlock,
                            condition: { ...newBlock.condition!, operator: value }
                          })}
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

                      <div className="space-y-2">
                        <Label>Value</Label>
                        <Input
                          value={newBlock.condition?.value || ''}
                          onChange={(e) => setNewBlock({
                            ...newBlock,
                            condition: { ...newBlock.condition!, value: e.target.value }
                          })}
                          placeholder="Enter value"
                        />
                      </div>
                    </>
                  )}

                  {newBlock.type === 'operation' && (
                    <>
                      <div className="space-y-2">
                        <Label>Operation Type</Label>
                        <Select
                          value={newBlock.operation?.type || 'add'}
                          onValueChange={(value: any) => setNewBlock({
                            ...newBlock,
                            operation: { ...newBlock.operation!, type: value }
                          })}
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

                      <div className="space-y-2">
                        <Label>Value</Label>
                        <Input
                          value={newBlock.operation?.value || ''}
                          onChange={(e) => setNewBlock({
                            ...newBlock,
                            operation: { ...newBlock.operation!, value: e.target.value }
                          })}
                          placeholder="Enter value"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label>Target Variable</Label>
                        <Select
                          value={newBlock.operation?.targetVariable || ''}
                          onValueChange={(value) => setNewBlock({
                            ...newBlock,
                            operation: { ...newBlock.operation!, targetVariable: value }
                          })}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select target variable" />
                          </SelectTrigger>
                          <SelectContent>
                            {variables.map((variable) => (
                              <SelectItem 
                                key={variable.name} 
                                value={variable.name}
                              >
                                <div className="flex items-center justify-between w-full">
                                  <span>{variable.name}</span>
                                  <Badge 
                                    variant={variable.scope === 'local' ? 'secondary' : 'outline'}
                                    className="ml-2"
                                  >
                                    {variable.scope}
                                  </Badge>
                                </div>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </>
                  )}

                  {newBlock.type === 'return' && (
                    <div className="space-y-2">
                      <Label>Return Handle</Label>
                      <Select
                        value={newBlock.handle || ''}
                        onValueChange={(value) => setNewBlock({
                          ...newBlock,
                          handle: value
                        })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select handle" />
                        </SelectTrigger>
                        <SelectContent>
                          {handles.map((handle) => (
                            <SelectItem key={handle.id} value={handle.name}>
                              {handle.name}
                              {handle.description && (
                                <span className="text-muted-foreground ml-2">
                                  ({handle.description})
                                </span>
                              )}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}

                  <Button
                    onClick={() => addBlock(selectedBlockId || undefined)}
                    className="w-full"
                    disabled={
                      (newBlock.type === 'if' && (!newBlock.condition?.variable || !newBlock.condition?.value)) ||
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
              </TabsContent>
            </Tabs>
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