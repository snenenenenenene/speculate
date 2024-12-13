import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import { MultipleChoiceNodeData } from "@/types/nodes";
import { Editor, EditorContent } from "@tiptap/react";
import { ImagePlus, GripVertical, Trash2 } from "lucide-react";
import { useState } from "react";

interface MultipleChoiceDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    data: MultipleChoiceNodeData;
    onUpdate: (updates: Partial<MultipleChoiceNodeData>) => void;
    editor: Editor | null;
    onImageUpload: (file: File, type: 'question' | 'option', optionId?: string) => void;
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
  
    // Editor menu component
    const EditorMenu = () => (
      <div className="border-b border-t p-2 flex items-center gap-2">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => editor?.chain().focus().toggleBold().run()}
          className={cn(editor?.isActive('bold') && 'bg-muted')}
        >
          Bold
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => editor?.chain().focus().toggleItalic().run()}
          className={cn(editor?.isActive('italic') && 'bg-muted')}
        >
          Italic
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => editor?.chain().focus().toggleBulletList().run()}
          className={cn(editor?.isActive('bulletList') && 'bg-muted')}
        >
          List
        </Button>
        <label className="cursor-pointer">
          <input
            type="file"
            className="hidden"
            accept="image/*"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) onImageUpload(file, 'question');
            }}
          />
          <Button variant="ghost" size="sm" type="button">
            <ImagePlus className="h-4 w-4 mr-2" />
            Add Image
          </Button>
        </label>
      </div>
    );
  
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
              <div className="space-y-4">
                <div>
                  <Label>Question</Label>
                  <EditorMenu />
                  <EditorContent editor={editor} className="prose prose-sm min-h-[100px] p-4 border rounded-lg" />
                </div>
  
                <div className="space-y-2">
                  <Label>Description (Optional)</Label>
                  <Input
                    value={data.description || ''}
                    onChange={(e) => onUpdate({ description: e.target.value })}
                    placeholder="Add additional context..."
                  />
                </div>
  
                <div className="space-y-2">
                  <Label>Selection Limits</Label>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-xs">Minimum</Label>
                      <Input
                        type="number"
                        value={data.minSelections || 0}
                        onChange={(e) => onUpdate({ minSelections: Number(e.target.value) })}
                        min={0}
                        max={data.options.length}
                      />
                    </div>
                    <div>
                      <Label className="text-xs">Maximum</Label>
                      <Input
                        type="number"
                        value={data.maxSelections || data.options.length}
                        onChange={(e) => onUpdate({ maxSelections: Number(e.target.value) })}
                        min={1}
                        max={data.options.length}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>
  
            <TabsContent value="options" className="space-y-4">
              <div className="space-y-4">
                {data.options.map((option, index) => (
                  <Card key={option.id} className="p-4">
                    <div className="flex items-start gap-4">
                      <GripVertical className="h-5 w-5 text-muted-foreground mt-1" />
                      <div className="flex-1 space-y-4">
                        <div className="space-y-2">
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
  
                        <div className="space-y-2">
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
                          <div className="space-y-2">
                            <Label>Image</Label>
                            <div className="flex items-center gap-2">
                              {option.metadata?.image?.url ? (
                                <div className="relative w-16 h-16">
                                  <img
                                    src={option.metadata.image.url}
                                    alt={option.metadata.image.alt}
                                    className="w-full h-full object-cover rounded"
                                  />
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="absolute top-0 right-0 h-6 w-6 bg-white/90 hover:bg-white"
                                    onClick={() => {
                                      const newOptions = [...data.options];
                                      delete newOptions[index].metadata?.image;
                                      onUpdate({ options: newOptions });
                                    }}
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </div>
                              ) : (
                                <label className="cursor-pointer">
                                  <input
                                    type="file"
                                    className="hidden"
                                    accept="image/*"
                                    onChange={(e) => {
                                      const file = e.target.files?.[0];
                                      d(file, 'option', option.id);
                                    }}
                                  />
                                  <Button variant="outline" size="sm">
                                    <ImagePlus className="h-4 w-4 mr-2" />
                                    Add Image
                                  </Button>
                                </label>
                              )}
                            </div>
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
                    const newOption: Option = {
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
              </div>
            </TabsContent>
  
            <TabsContent value="style" className="space-y-4">
              <div className="space-y-4">
                <div className="space-y-2">
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
                  <div className="space-y-2">
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
  
                {data.metadata?.image?.url && (
                  <div className="space-y-2">
                    <Label>Question Image Position</Label>
                    <Select
                      value={data.metadata.image.position || 'top'}
                      onValueChange={(value: 'top' | 'bottom' | 'background') =>
                        onUpdate({
                          metadata: {
                            ...data.metadata,
                            image: {
                              ...data.metadata.image,
                              position: value
                            }
                          }
                        })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="top">Top</SelectItem>
                        <SelectItem value="bottom">Bottom</SelectItem>
                        <SelectItem value="background">Background</SelectItem>
                      </SelectContent>
                    </Select>
  
                    <div className="relative w-full h-40">
                      <img
                        src={data.metadata.image.url}
                        alt={data.metadata.image.alt}
                        className="w-full h-full object-cover rounded"
                      />
                      <Button
                        variant="ghost"
                        size="icon"
                        className="absolute top-2 right-2 h-8 w-8 bg-white/90 hover:bg-white"
                        onClick={() => {
                          const newMetadata = { ...data.metadata };
                          delete newMetadata.image;
                          onUpdate({ metadata: newMetadata });
                        }}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </DialogContent>
      </Dialog>
    );
  }