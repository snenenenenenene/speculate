// components/nodes/function/SingleChoiceDialog.tsx
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RichTextEditor } from "@/components/ui/rich-text-editor";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SingleChoiceNodeData } from "@/types/nodes";
import { Editor } from "@tiptap/react";
import { GripVertical, ImagePlus, Trash2 } from "lucide-react";
import { useState } from "react";

interface SingleChoiceDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  data: SingleChoiceNodeData;
  onUpdate: (updates: Partial<SingleChoiceNodeData>) => void;
  editor: Editor | null;
  onImageUpload: (file: File, type: 'content' | 'option', optionId?: string) => void;
}

export function SingleChoiceDialog({
  open,
  onOpenChange,
  data,
  onUpdate,
  editor,
  onImageUpload
}: SingleChoiceDialogProps) {
  const [activeTab, setActiveTab] = useState('content');

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle>Single Choice Configuration</DialogTitle>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <div className="flex items-center justify-between mb-4">
            <TabsList>
              <TabsTrigger value="content" className="flex items-center gap-2">
                Content
              </TabsTrigger>
              <TabsTrigger value="options" className="flex items-center gap-2">
                Options
              </TabsTrigger>
              <TabsTrigger value="style" className="flex items-center gap-2">
                Style
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="content" className="space-y-4">
            <div className="space-y-4">
              <div>
                <Label>Title</Label>
                <Input
                  value={data.title || ''}
                  onChange={(e) => onUpdate({ title: e.target.value })}
                  placeholder="Enter title..."
                />
              </div>

              <div>
                <Label>Question</Label>
                <RichTextEditor editor={editor} />
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
                <Label>Content Images</Label>
                <div className="flex items-center gap-2">
                  <label className="cursor-pointer">
                    <input
                      type="file"
                      className="hidden"
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) onImageUpload(file, 'content');
                      }}
                    />
                    <Button variant="outline" size="sm" type="button">
                      <ImagePlus className="h-4 w-4 mr-2" />
                      Add Image
                    </Button>
                  </label>
                </div>
                {data.images?.map((image, index) => (
                  <div key={index} className="relative mt-2">
                    <img
                      src={image.url}
                      alt={image.alt}
                      className="w-full h-32 object-cover rounded-md"
                    />
                    <Button
                      variant="ghost"
                      size="icon"
                      className="absolute top-2 right-2 bg-white/90 hover:bg-white"
                      onClick={() => {
                        const newImages = [...(data.images || [])];
                        newImages.splice(index, 1);
                        onUpdate({ images: newImages });
                      }}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="options" className="space-y-4">
            <div className="space-y-4">
              {data.options.map((option, index) => (
                <div
                  key={option.id}
                  className="relative space-y-2 p-3 bg-muted/30 rounded-md"
                >
                  <div className="flex items-center gap-2 mb-2">
                    <GripVertical className="h-5 w-5 text-muted-foreground cursor-move" />
                    <div className="flex-1">
                      <Label>Label</Label>
                      <Input
                        value={option.label}
                        onChange={(e) => {
                          const newOptions = [...data.options];
                          newOptions[index] = { ...option, label: e.target.value };
                          onUpdate({ options: newOptions });
                        }}
                        placeholder={`Option ${index + 1}`}
                      />
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => {
                        const newOptions = [...data.options];
                        newOptions.splice(index, 1);
                        onUpdate({ options: newOptions });
                      }}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>

                  {data.style?.showImages && (
                    <div className="space-y-2">
                      <Label>Option Image</Label>
                      {option.metadata?.image?.url ? (
                        <div className="relative w-32">
                          <img
                            src={option.metadata.image.url}
                            alt={option.metadata.image.alt}
                            className="w-full h-24 object-cover rounded"
                          />
                          <Button
                            variant="ghost"
                            size="icon"
                            className="absolute top-1 right-1 h-6 w-6 bg-white/90 hover:bg-white"
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
                              if (file) onImageUpload(file, 'option', option.id);
                            }}
                          />
                          <Button variant="outline" size="sm">
                            <ImagePlus className="h-4 w-4 mr-2" />
                            Add Image
                          </Button>
                        </label>
                      )}
                    </div>
                  )}

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
                </div>
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
              >
                Add Option
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="style" className="space-y-4">
            <div>
              <Label>Layout</Label>
              <Select
                value={data.style?.layout || 'default'}
                onValueChange={(value) => onUpdate({
                  style: { ...data.style, layout: value as any }
                })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="default">Default</SelectItem>
                  <SelectItem value="centered">Centered</SelectItem>
                  <SelectItem value="wide">Wide</SelectItem>
                </SelectContent>
              </Select>
            </div>

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