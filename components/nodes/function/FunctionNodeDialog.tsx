import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card } from "@/components/ui/card";
import { GripVertical, Plus, X } from 'lucide-react';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';

interface FunctionNodeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAddStep: (step: any) => void;
  steps: any[];
  onUpdateSteps: (steps: any[]) => void;
  variables: string[];
}

export function FunctionNodeDialog({
  open,
  onOpenChange,
  onAddStep,
  steps,
  onUpdateSteps,
  variables = []
}: FunctionNodeDialogProps) {
  const [activeTab, setActiveTab] = useState('conditions');
  const [condition, setCondition] = useState({
    variable: '',
    operator: '>=',
    value: '',
    handle: ''
  });
  const [calculation, setCalculation] = useState({
    operation: 'add',
    value: '',
    targetVariable: '',
    handle: ''
  });

  const handleAddStep = () => {
    const newStep = activeTab === 'conditions' ? {
      type: 'condition',
      ...condition
    } : {
      type: 'calculation',
      ...calculation
    };
    onAddStep(newStep);
    // Reset form
    if (activeTab === 'conditions') {
      setCondition({ variable: '', operator: '>=', value: '', handle: '' });
    } else {
      setCalculation({ operation: 'add', value: '', targetVariable: '', handle: '' });
    }
  };

  const handleDragEnd = (result: any) => {
    if (!result.destination) return;
    const items = Array.from(steps);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);
    onUpdateSteps(items);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle>Add Function Logic</DialogTitle>
        </DialogHeader>
        <div className="grid grid-cols-2 gap-6">
          {/* Left Panel - Build Logic */}
          <div className="space-y-4">
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="w-full">
                <TabsTrigger value="conditions" className="flex-1">Conditions</TabsTrigger>
                <TabsTrigger value="calculations" className="flex-1">Calculations</TabsTrigger>
              </TabsList>

              <TabsContent value="conditions" className="space-y-4">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Variable</Label>
                    <Select
                      value={condition.variable}
                      onValueChange={(value) => setCondition({ ...condition, variable: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select variable" />
                      </SelectTrigger>
                      <SelectContent>
                        {variables.map((variable) => (
                          <SelectItem key={variable} value={variable}>
                            {variable}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Operator</Label>
                    <Select
                      value={condition.operator}
                      onValueChange={(value) => setCondition({ ...condition, operator: value })}
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
                      type="text"
                      value={condition.value}
                      onChange={(e) => setCondition({ ...condition, value: e.target.value })}
                      placeholder="Enter value"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Handle Label</Label>
                    <Input
                      type="text"
                      value={condition.handle}
                      onChange={(e) => setCondition({ ...condition, handle: e.target.value })}
                      placeholder="e.g., Success, Failure"
                    />
                  </div>

                  <div className="p-3 bg-muted rounded-md">
                    <Label className="text-sm text-muted-foreground">Preview</Label>
                    <p className="mt-1 font-mono text-sm">
                      if {condition.variable} {condition.operator} {condition.value}
                    </p>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="calculations" className="space-y-4">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Operation</Label>
                    <Select
                      value={calculation.operation}
                      onValueChange={(value) => setCalculation({ ...calculation, operation: value })}
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
                      type="text"
                      value={calculation.value}
                      onChange={(e) => setCalculation({ ...calculation, value: e.target.value })}
                      placeholder="Enter value"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Target Variable</Label>
                    <Select
                      value={calculation.targetVariable}
                      onValueChange={(value) => setCalculation({ ...calculation, targetVariable: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select target variable" />
                      </SelectTrigger>
                      <SelectContent>
                        {variables.map((variable) => (
                          <SelectItem key={variable} value={variable}>
                            {variable}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="p-3 bg-muted rounded-md">
                    <Label className="text-sm text-muted-foreground">Preview</Label>
                    <p className="mt-1 font-mono text-sm">
                      {calculation.operation} {calculation.value} to {calculation.targetVariable}
                    </p>
                  </div>
                </div>
              </TabsContent>
            </Tabs>

            <Button onClick={handleAddStep} className="w-full">
              Add to Sequence
            </Button>
          </div>

          {/* Right Panel - Sequence View */}
          <div className="border-l pl-6">
            <div className="space-y-2">
              <Label className="text-lg font-semibold">Sequence</Label>
              <DragDropContext onDragEnd={handleDragEnd}>
                <Droppable droppableId="steps">
                  {(provided) => (
                    <div
                      {...provided.droppableProps}
                      ref={provided.innerRef}
                      className="space-y-2"
                    >
                      {steps.map((step, index) => (
                        <Draggable key={index} draggableId={`step-${index}`} index={index}>
                          {(provided) => (
                            <Card
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              className="p-3 relative group"
                            >
                              <div className="flex items-center space-x-3">
                                <div {...provided.dragHandleProps}>
                                  <GripVertical className="h-5 w-5 text-muted-foreground" />
                                </div>
                                <div className="flex-1">
                                  {step.type === 'condition' ? (
                                    <p className="text-sm">
                                      if {step.variable} {step.operator} {step.value}
                                      {step.handle && <span className="ml-2 text-muted-foreground">→ {step.handle}</span>}
                                    </p>
                                  ) : (
                                    <p className="text-sm">
                                      {step.operation} {step.value} to {step.targetVariable}
                                      {step.handle && <span className="ml-2 text-muted-foreground">→ {step.handle}</span>}
                                    </p>
                                  )}
                                </div>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => {
                                    const newSteps = [...steps];
                                    newSteps.splice(index, 1);
                                    onUpdateSteps(newSteps);
                                  }}
                                  className="opacity-0 group-hover:opacity-100"
                                >
                                  <X className="h-4 w-4" />
                                </Button>
                              </div>
                            </Card>
                          )}
                        </Draggable>
                      ))}
                      {provided.placeholder}
                    </div>
                  )}
                </Droppable>
              </DragDropContext>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
