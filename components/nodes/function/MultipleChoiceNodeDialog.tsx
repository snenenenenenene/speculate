import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ImageUpload } from "@/components/ui/image-upload";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MultipleChoiceNodeData } from "@/types/nodes";
import { Editor, EditorContent } from "@tiptap/react";
import { GripVertical, Trash2 } from "lucide-react";
import { useState } from "react";

interface MultipleChoiceDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  data: MultipleChoiceNodeData;
  onUpdate: (updates: Partial<MultipleChoiceNodeData>) => void;
  editor: Editor | null;
  onImageUpload: (file: File, type: 'content' | 'option', optionId?: string) => void;
}

export function MultipleChoiceDialog({
  open,
  onOpenChange,
  data,
  onUpdate,
  editor,
  onImageUpload
}: MultipleChoiceDialogProps) {
  const [activeTab, setActiveTab] = useState('content');

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle>Multiple Choice Configuration</DialogTitle>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="content">Content</TabsTrigger>
            <TabsTrigger value="options">Options</TabsTrigger>
            <TabsTrigger value="style">Style</TabsTrigger>
          </TabsList>

          <TabsContent value="content" className="space-y-4">
            <div>
              <Label>Title</Label>
              <Input
                value={data.title || ''}
                onChange={(e) => onUpdate({ title: e.target.value })}
                placeholder="Enter title..."
              />
            </div>

            <div>
              <Label>Question Content</Label>
              <EditorContent 
                editor={editor} 
                className="border rounded-lg mt-2 p-3 min-h-[100px]"
              />
            </div>

            <div>
              <Label>Description (Optional)</Label>
              <Input
                value={data.description || ''}
                onChange={(e) => onUpdate({ description: e.target.value })}
                placeholder="Add additional context..."
              />
            </div>

            <div>
              <Label>Question Image</Label>
              <ImageUpload 
                onUpload={(file) => onImageUpload(file, 'content')} 
                existingImage={data.images?.[0]?.url}
                onRemove={() => onUpdate({ images: [] })}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Minimum Selections</Label>
                <Input
                  type="number"
                  value={data.minSelections || 0}
                  onChange={(e) => onUpdate({ minSelections: Number(e.target.value) })}
                  min={0}
                  max={data.options.length}
                />
              </div>
              <div>
                <Label>Maximum Selections</Label>
                <Input
                  type="number"
                  value={data.maxSelections || data.options.length}
                  onChange={(e) => onUpdate({ maxSelections: Number(e.target.value) })}
                  min={1}
                  max={data.options.length}
                />
              </div>
            </div>
          </TabsContent>

          <TabsContent value="options" className="space-y-4">
            {data.options.map((option, index) => (
              <Card key={option.id} className="p-4">
                <div className="flex items-start gap-4">
                  <GripVertical className="h-5 w-5 text-muted-foreground mt-1" />
                  <div className="flex-1 space-y-4">
                    <div>
                      <Label>Label</Label>
                      <Input
                        value={option.label}
                        onChange={(e) => {
                          const newOptions = [...data.options];
                          newOptions[index] = { ...option, label: e.target.value };
                          onUpdate({ options: newOptions });
                        }}
                        placeholder="Option label..."
                      />
                    </div>

                    <div>
                      <Label>Value</Label>
                      <Input
                        value={option.value}
                        onChange={(e) => {
                          const newOptions = [...data.options];
                          newOptions[index] = { ...option, value: e.target.value };
                          onUpdate({ options: newOptions });
                        }}
                        placeholder="Option value..."
                      />
                    </div>

                    {data.style?.showImages && (
                      <div>
                        <Label>Option Image</Label>
                        <ImageUpload 
                          onUpload={(file) => onImageUpload(file, 'option', option.id)}
                          existingImage={option.metadata?.image?.url}
                          onRemove={() => {
                            const newOptions = [...data.options];
                            delete newOptions[index].metadata?.image;
                            onUpdate({ options: newOptions });
                          }}
                        />
                      </div>
                    )}
                  </div>

                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => {
                      const newOptions = data.options.filter(o => o.id !== option.id);
                      onUpdate({ options: newOptions });
                    }}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </Card>
            ))}

            <Button
              onClick={() => {
                const newOption = {
                  id: crypto.randomUUID(),
                  label: '',
                  value: ''
                };
                onUpdate({ options: [...data.options, newOption] });
              }}
              className="w-full"
            >
              Add Option
            </Button>
          </TabsContent>

          <TabsContent value="style" className="space-y-4">
            <div>
              <Label>Layout</Label>
              <Select
                value={data.style?.layout || 'list'}
                onValueChange={(value: 'grid' | 'list') => 
                  onUpdate({ 
                    style: { 
                      ...data.style,
                      layout: value
                    }
                  })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="list">List</SelectItem>
                  <SelectItem value="grid">Grid</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {data.style?.layout === 'grid' && (
              <div>
                <Label>Columns</Label>
                <Select
                  value={String(data.style?.columns || 2)}
                  onValueChange={(value) => 
                    onUpdate({ 
                      style: { 
                        ...data.style,
                        columns: Number(value)
                      }
                    })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {[2, 3, 4].map(num => (
                      <SelectItem key={num} value={String(num)}>
                        {num} Columns
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            <div className="flex items-center space-x-2">
              <Switch
                checked={data.style?.showImages || false}
                onCheckedChange={(checked) =>
                  onUpdate({
                    style: {
                      ...data.style,
                      showImages: checked
                    }
                  })
                }
              />
              <Label>Show Images for Options</Label>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}