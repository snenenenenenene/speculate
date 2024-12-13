// components/nodes/index.tsx
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { cn } from '@/lib/utils';
import { useRootStore } from '@/stores/rootStore';
import { NodeProps } from '@/types/nodes';
import Image from '@tiptap/extension-image';
import { useEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import {
  ArrowRight,
  Check,
  CircleDot,
  Eye,
  Flag,
  FunctionSquare,
  List,
  Settings2,
  XCircle
} from 'lucide-react';
import { useParams } from 'next/navigation';
import { memo, useCallback, useEffect, useMemo, useState } from 'react';
import { Handle, Position, useReactFlow } from 'reactflow';
import { toast } from 'sonner';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog';
import { ImageUpload } from '../ui/image-upload';
import { Input } from '../ui/input';
import { RichTextEditor } from '../ui/rich-text-editor';
import { NodeWrapper } from './base/NodeWrapper';
import { FunctionNodeDialog } from './function/FunctionNodeDialog';
import { MultipleChoiceDialog } from './function/MultipleChoiceNodeDialog';
import { SingleChoiceDialog } from './function/SingleChoiceDialog';
import { VisualNodePreview } from './VisualNodePreview';

export const StartNode = memo(({ id, data, selected }: NodeProps<StartNodeData>) => {
  const { removeNode, updateNode } = useRootStore();
  const [showDialog, setShowDialog] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
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
    content: data.welcomeMessage || '',
    onUpdate: ({ editor }) => {
      handleUpdateNode({ welcomeMessage: editor.getHTML() });
    }
  });

  const handleDelete = useCallback(() => {
    if (!flowId) return;
    removeNode(flowId, id);
    toast.success('Node deleted');
  }, [removeNode, id, flowId]);

  const handleUpdateNode = useCallback((updates: Partial<StartNodeData>) => {
    const newData = {
      ...data,
      ...updates,
    };
    updateNode(flowId, id, newData);
  }, [data, updateNode, flowId, id]);

  const handleImageUpload = useCallback(async (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const base64 = e.target?.result as string;
      handleUpdateNode({
        images: [
          ...(data.images || []),
          {
            url: base64,
            alt: file.name,
            position: 'top'
          }
        ]
      });
    };
    reader.readAsDataURL(file);
  }, [handleUpdateNode, data.images]);

  return (
    <>
      <NodeWrapper
        title="Start"
        selected={selected}
        id={id}
        onDelete={handleDelete}
        headerClassName="bg-blue-50/80 border-blue-100"
        headerIcon={<Flag className="h-4 w-4 text-blue-500" />}
        headerActions={
          <>
            {data.isVisual && (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setShowPreview(true)}
                className="h-6 w-6"
              >
                <Eye className="h-4 w-4" />
              </Button>
            )}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setShowDialog(true)}
              className="h-6 w-6"
            >
              <Settings2 className="h-4 w-4" />
            </Button>
          </>
        }
        handles={{ 
          top: false,
          right: false,
          bottom: true,
          left: false 
        }}
      >
        <div className="p-4 space-y-4">
          {data.isVisual ? (
            <>
              {data.images?.[0] && (
                <img 
                  src={data.images[0].url}
                  alt={data.images[0].alt}
                  className="w-full rounded-lg object-cover"
                />
              )}
              <div 
                className="prose prose-sm"
                dangerouslySetInnerHTML={{ __html: data.welcomeMessage || '' }}
              />
            </>
          ) : (
            <div className="text-sm text-muted-foreground text-center">
              Configure welcome message in settings
            </div>
          )}
        </div>
      </NodeWrapper>

      {/* Settings Dialog */}
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Start Node Settings</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Switch
                checked={data.isVisual}
                onCheckedChange={(checked) => handleUpdateNode({ isVisual: checked })}
              />
              <Label>Show welcome message</Label>
            </div>

            {data.isVisual && (
              <>
                <div className="space-y-2">
                  <Label>Welcome Message</Label>
                  <div className="border rounded-lg p-4">
                    <RichTextEditor editor={editor} />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Image (Optional)</Label>
                  <ImageUpload onUpload={handleImageUpload} />
                </div>

                <div className="space-y-2">
                  <Label>Layout</Label>
                  <Select
                    value={data.style?.layout || 'default'}
                    onValueChange={(value) => handleUpdateNode({
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
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Preview Dialog */}
      <VisualNodePreview
        open={showPreview}
        onOpenChange={setShowPreview}
        data={data}
        type="start"
      />
    </>
  );
});

export const EndNode = memo(({ id, data, selected }: NodeProps<EndNodeData>) => {
  const { removeNode, updateNode } = useRootStore();
  const [showDialog, setShowDialog] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const params = useParams();
  const flowId = params.flowId as string;

  const editor = useEditor({
    extensions: [StarterKit, Image],
    content: data.exitMessage || '',
    onUpdate: ({ editor }) => {
      handleUpdateNode({ exitMessage: editor.getHTML() });
    }
  });

  const handleDelete = useCallback(() => {
    if (!flowId) return;
    removeNode(flowId, id);
    toast.success('Node deleted');
  }, [removeNode, id, flowId]);

  const handleUpdateNode = useCallback((updates: Partial<EndNodeData>) => {
    const newData = {
      ...data,
      ...updates,
    };
    updateNode(flowId, id, newData);
  }, [data, updateNode, flowId, id]);

  return (
    <>
      <NodeWrapper
        title="End"
        selected={selected}
        id={id}
        onDelete={handleDelete}
        headerClassName="bg-red-50/80 border-red-100"
        headerIcon={<XCircle className="h-4 w-4 text-red-500" />}
        headerActions={
          <>
            {data.isVisual && (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setShowPreview(true)}
                className="h-6 w-6"
              >
                <Eye className="h-4 w-4" />
              </Button>
            )}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setShowDialog(true)}
              className="h-6 w-6"
            >
              <Settings2 className="h-4 w-4" />
            </Button>
          </>
        }
        handles={{ 
          top: true,
          right: false,
          bottom: false,
          left: false 
        }}
      >
        <div className="p-4 space-y-4">
          {data.redirectFlow ? (
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <ArrowRight className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">Redirecting to:</span>
              </div>
              <Badge variant="secondary" className="text-xs">
                {data.redirectFlow.name}
              </Badge>
            </div>
          ) : data.isVisual ? (
            <>
              {data.images?.[0] && (
                <img 
                  src={data.images[0].url}
                  alt={data.images[0].alt}
                  className="w-full rounded-lg object-cover"
                />
              )}
              <div 
                className="prose prose-sm"
                dangerouslySetInnerHTML={{ __html: data.exitMessage || '' }}
              />
            </>
          ) : (
            <div className="text-sm text-muted-foreground text-center">
              Terminal end point
            </div>
          )}
        </div>
      </NodeWrapper>

      {/* Settings Dialog */}
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>End Node Settings</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Show exit message</Label>
                <p className="text-sm text-muted-foreground">
                  Display a message when the flow ends
                </p>
              </div>
              <Switch
                checked={data.isVisual}
                onCheckedChange={(checked) => handleUpdateNode({ isVisual: checked })}
              />
            </div>

            <Separator />

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Redirect to another flow</Label>
                <p className="text-sm text-muted-foreground">
                  Continue to a different flow
                </p>
              </div>
              <Switch
                checked={!!data.redirectFlow}
                onCheckedChange={(checked) => {
                  if (!checked) {
                    handleUpdateNode({ redirectFlow: undefined });
                  }
                }}
              />
            </div>

            {data.redirectFlow && (
              <div className="space-y-2">
                <Label>Select Flow</Label>
                <Select
                  value={data.redirectFlow.id}
                  onValueChange={(value) => {
                    // You'd need to implement getFlowById
                    const flow = getFlowById(value);
                    if (flow) {
                      handleUpdateNode({
                        redirectFlow: {
                          id: flow.id,
                          name: flow.name
                        }
                      });
                    }
                  }}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {flows.map(flow => (
                      <SelectItem key={flow.id} value={flow.id}>
                        {flow.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {data.isVisual && !data.redirectFlow && (
              <>
                <div className="space-y-2">
                  <Label>Exit Message</Label>
                  <div className="border rounded-lg p-4">
                    <RichTextEditor editor={editor} />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Image (Optional)</Label>
                  <ImageUpload onUpload={handleImageUpload} />
                </div>

                <div className="space-y-2">
                  <Label>Layout</Label>
                  <Select
                    value={data.style?.layout || 'default'}
                    onValueChange={(value) => handleUpdateNode({
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
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Preview Dialog */}
      <VisualNodePreview
        open={showPreview}
        onOpenChange={setShowPreview}
        data={data}
        type="end"
      />
    </>
  );
});

export const MultipleChoiceNode = memo(({ id, data, selected }: NodeProps<MultipleChoiceNodeData>) => {
  const { removeNode, updateNode, selections, setSelection } = useRootStore();
  const [showDialog, setShowDialog] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const params = useParams();
  const flowId = params.flowId as string;
  const currentSelection = selections[id]?.optionIds || [];

  const editor = useEditor({
    extensions: [
      StarterKit,
      Image.configure({
        inline: true,
        allowBase64: true,
      })
    ],
    content: data.content || '',
    onUpdate: ({ editor }) => {
      handleUpdateNode({ content: editor.getHTML() });
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

  const handleSelectionChange = useCallback((optionIds: string[]) => {
    if (data.maxSelections && optionIds.length > data.maxSelections) {
      toast.error(`Maximum ${data.maxSelections} selections allowed`);
      return;
    }
    if (data.minSelections && optionIds.length < data.minSelections) {
      toast.error(`Minimum ${data.minSelections} selections required`);
      return;
    }

    setSelection(id, {
      optionIds,
      timestamp: Date.now()
    });
  }, [id, data.maxSelections, data.minSelections, setSelection]);

  const handleImageUpload = useCallback(async (file: File, type: 'content' | 'option', optionId?: string) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const base64 = e.target?.result as string;
      if (type === 'content') {
        handleUpdateNode({
          images: [
            ...(data.images || []),
            {
              url: base64,
              alt: file.name,
              position: 'top'
            }
          ]
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

  return (
    <>
      <NodeWrapper
        title="Multiple Choice"
        selected={selected}
        id={id}
        onDelete={handleDelete}
        headerClassName="bg-indigo-50/80 border-indigo-100"
        headerIcon={<List className="h-4 w-4 text-indigo-500" />}
        headerActions={
          <>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setShowPreview(true)}
              className="h-6 w-6"
            >
              <Eye className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setShowDialog(true)}
              className="h-6 w-6"
            >
              <Settings2 className="h-4 w-4" />
            </Button>
          </>
        }
        handles={{ 
          top: true,
          right: false,
          bottom: true,
          left: false 
        }}
      >
        <div className="p-4">
          <div className="space-y-4">
            {data.images?.filter(img => img.position === 'top').map((image, i) => (
              <img 
                key={i}
                src={image.url} 
                alt={image.alt}
                className="w-full rounded-lg object-cover" 
              />
            ))}

            {data.title && (
              <h3 className="font-medium">{data.title}</h3>
            )}

            <div 
              className="prose prose-sm"
              dangerouslySetInnerHTML={{ __html: data.content || '' }}
            />

            {data.description && (
              <p className="text-sm text-muted-foreground">{data.description}</p>
            )}

            <div className={cn(
              "grid gap-2",
              data.style?.layout === 'grid' 
                ? `grid-cols-${data.style.columns || 2}` 
                : 'grid-cols-1'
            )}>
              {data.options.map((option) => (
                <div 
                  key={option.id}
                  className={cn(
                    "border rounded-lg p-2 flex items-center gap-2 cursor-pointer transition-colors",
                    currentSelection.includes(option.id) && 
                      "border-primary-500 bg-primary-50/50"
                  )}
                  onClick={() => {
                    const newSelection = data.maxSelections === 1 
                      ? [option.id]  // Single selection mode
                      : currentSelection.includes(option.id)
                        ? currentSelection.filter(id => id !== option.id)  // Remove selection
                        : [...currentSelection, option.id];  // Add selection
                    handleSelectionChange(newSelection);
                  }}
                >
                  {option.metadata?.image?.url && data.style?.showImages && (
                    <img 
                      src={option.metadata.image.url} 
                      alt={option.metadata.image.alt}
                      className="w-12 h-12 rounded object-cover" 
                    />
                  )}
                  <span className={cn(
                    "text-sm",
                    currentSelection.includes(option.id) && "text-primary-600 font-medium"
                  )}>
                    {option.label}
                  </span>
                </div>
              ))}
            </div>

            {(data.minSelections || data.maxSelections) && (
              <p className="text-xs text-muted-foreground">
                {data.minSelections && `Min: ${data.minSelections} `}
                {data.maxSelections && `Max: ${data.maxSelections}`} selections
              </p>
            )}
          </div>
        </div>
      </NodeWrapper>

      <MultipleChoiceDialog 
        open={showDialog}
        onOpenChange={setShowDialog}
        data={data}
        onUpdate={handleUpdateNode}
        editor={editor}
        onImageUpload={handleImageUpload}
      />

      <VisualNodePreview
        open={showPreview}
        onOpenChange={setShowPreview}
        data={data}
        type="multiple"
        renderOptions={() => (
          <div className={cn(
            "grid gap-2",
            data.style?.layout === 'grid' 
              ? `grid-cols-${data.style.columns || 2}` 
              : 'grid-cols-1'
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
        )}
      />
    </>
  );
});

export const SingleChoiceNode = memo(({ id, data, selected }: NodeProps<SingleChoiceNodeData>) => {
  const { removeNode, updateNode, selections, setSelection } = useRootStore();
  const [showDialog, setShowDialog] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const params = useParams();
  const flowId = params.flowId as string;
  const currentSelection = selections[id]?.optionIds[0] || null;

  const editor = useEditor({
    extensions: [StarterKit, Image],
    content: data.content || '',
    onUpdate: ({ editor }) => {
      handleUpdateNode({ content: editor.getHTML() });
    }
  });

  const handleDelete = useCallback(() => {
    if (!flowId) return;
    removeNode(flowId, id);
    toast.success('Node deleted');
  }, [removeNode, id, flowId]);

  const handleUpdateNode = useCallback((updates: Partial<SingleChoiceNodeData>) => {
    const newData = {
      ...data,
      ...updates,
    };
    updateNode(flowId, id, newData);
  }, [data, updateNode, flowId, id]);

  const handleSelectionChange = useCallback((optionId: string) => {
    setSelection(id, {
      optionIds: [optionId],
      timestamp: Date.now()
    });
  }, [id, setSelection]);

  return (
    <>
      <NodeWrapper
        title="Single Choice"
        selected={selected}
        id={id}
        onDelete={handleDelete}
        headerClassName="bg-purple-50/80 border-purple-100"
        headerIcon={<CircleDot className="h-4 w-4 text-purple-500" />}
        headerActions={
          <>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setShowPreview(true)}
              className="h-6 w-6"
            >
              <Eye className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setShowDialog(true)}
              className="h-6 w-6"
            >
              <Settings2 className="h-4 w-4" />
            </Button>
          </>
        }
        handles={{ 
          top: true,
          right: false,
          bottom: true,
          left: false 
        }}
      >
        <div className="p-4">
          <div className="space-y-4">
            {data.images?.filter(img => img.position === 'top').map((image, i) => (
              <img 
                key={i}
                src={image.url} 
                alt={image.alt}
                className="w-full rounded-lg object-cover" 
              />
            ))}

            {data.title && (
              <h3 className="font-medium">{data.title}</h3>
            )}

            <div 
              className="prose prose-sm"
              dangerouslySetInnerHTML={{ __html: data.content || '' }}
            />

            {data.description && (
              <p className="text-sm text-muted-foreground">{data.description}</p>
            )}

            <div className="space-y-2">
              {data.options.map((option) => (
                <div 
                  key={option.id}
                  className={cn(
                    "border rounded-lg p-2 flex items-center gap-2 cursor-pointer transition-colors",
                    currentSelection === option.id && 
                      "border-primary-500 bg-primary-50/50"
                  )}
                  onClick={() => handleSelectionChange(option.id)}
                >
                  {option.metadata?.image?.url && data.style?.showImages && (
                    <img 
                      src={option.metadata.image.url} 
                      alt={option.metadata.image.alt}
                      className="w-12 h-12 rounded object-cover" 
                    />
                  )}
                  <span className={cn(
                    "text-sm",
                    currentSelection === option.id && "text-primary-600 font-medium"
                  )}>
                    {option.label}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </NodeWrapper>

      <SingleChoiceDialog 
        open={showDialog}
        onOpenChange={setShowDialog}
        data={data}
        onUpdate={handleUpdateNode}
        editor={editor}
        onImageUpload={handleImageUpload}
      />

      <VisualNodePreview
        open={showPreview}
        onOpenChange={setShowPreview}
        data={data}
        type="single"
        renderOptions={() => (
          <div className="space-y-2">
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
        )}
      />
    </>
  );
});

export const YesNoNode = memo(({ id, data, selected }: NodeProps<YesNoNodeData>) => {
  const { removeNode, updateNode, selections, setSelection } = useRootStore();
  const [showDialog, setShowDialog] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const params = useParams();
  const flowId = params.flowId as string;
  const currentSelection = selections[id]?.optionIds[0] || null;

  const editor = useEditor({
    extensions: [StarterKit, Image],
    content: data.content || '',
    onUpdate: ({ editor }) => {
      handleUpdateNode({ content: editor.getHTML() });
    }
  });

  const handleDelete = useCallback(() => {
    if (!flowId) return;
    removeNode(flowId, id);
    toast.success('Node deleted');
  }, [removeNode, id, flowId]);

  const handleUpdateNode = useCallback((updates: Partial<YesNoNodeData>) => {
    const newData = {
      ...data,
      ...updates,
    };
    updateNode(flowId, id, newData);
  }, [data, updateNode, flowId, id]);

  return (
    <>
      <NodeWrapper
        title="Yes/No Question"
        selected={selected}
        id={id}
        onDelete={handleDelete}
        headerClassName="bg-green-50/80 border-green-100"
        headerIcon={<Check className="h-4 w-4 text-green-500" />}
        headerActions={
          <>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setShowPreview(true)}
              className="h-6 w-6"
              >
              <Eye className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setShowDialog(true)}
              className="h-6 w-6"
            >
              <Settings2 className="h-4 w-4" />
            </Button>
          </>
        }
        handles={{ 
          top: true,
          right: false,
          bottom: false,
          left: false 
        }}
      >
        <div className="p-4">
          <div className="space-y-4">
            {data.images?.filter(img => img.position === 'top').map((image, i) => (
              <img 
                key={i}
                src={image.url} 
                alt={image.alt}
                className="w-full rounded-lg object-cover" 
              />
            ))}

            {data.title && (
              <h3 className="font-medium">{data.title}</h3>
            )}

            <div 
              className="prose prose-sm"
              dangerouslySetInnerHTML={{ __html: data.content || '' }}
            />

            {data.description && (
              <p className="text-sm text-muted-foreground">{data.description}</p>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div 
                className={cn(
                  "border rounded-lg p-3 flex items-center justify-center cursor-pointer transition-colors",
                  currentSelection === 'yes' && "border-primary-500 bg-primary-50/50"
                )}
                onClick={() => setSelection(id, {
                  optionIds: ['yes'],
                  timestamp: Date.now()
                })}
              >
                <span className={cn(
                  "text-sm font-medium",
                  currentSelection === 'yes' && "text-primary-600"
                )}>
                  {data.yesLabel || 'Yes'}
                </span>
              </div>

              <div 
                className={cn(
                  "border rounded-lg p-3 flex items-center justify-center cursor-pointer transition-colors",
                  currentSelection === 'no' && "border-primary-500 bg-primary-50/50"
                )}
                onClick={() => setSelection(id, {
                  optionIds: ['no'],
                  timestamp: Date.now()
                })}
              >
                <span className={cn(
                  "text-sm font-medium",
                  currentSelection === 'no' && "text-primary-600"
                )}>
                  {data.noLabel || 'No'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </NodeWrapper>

      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Yes/No Question Settings</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 overflow-scroll h-[30rem]">
            <div className="space-y-2">
              <Label>Title</Label>
              <Input
                value={data.title || ''}
                onChange={(e) => handleUpdateNode({ title: e.target.value })}
                placeholder="Enter question title..."
              />
            </div>

            <div className="space-y-2">
              <Label>Question</Label>
              <div className="border rounded-lg p-4">
                <RichTextEditor editor={editor} />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Description (Optional)</Label>
              <Input
                value={data.description || ''}
                onChange={(e) => handleUpdateNode({ description: e.target.value })}
                placeholder="Add additional context..."
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Yes Label</Label>
                <Input
                  value={data.yesLabel || ''}
                  onChange={(e) => handleUpdateNode({ yesLabel: e.target.value })}
                  placeholder="Yes"
                />
              </div>

              <div className="space-y-2">
                <Label>No Label</Label>
                <Input
                  value={data.noLabel || ''}
                  onChange={(e) => handleUpdateNode({ noLabel: e.target.value })}
                  placeholder="No"
                />
              </div>

              <div className="space-y-2">
                <Label>Yes Value</Label>
                <Input
                  value={data.yesValue || ''}
                  onChange={(e) => handleUpdateNode({ yesValue: e.target.value })}
                  placeholder="1"
                />
              </div>

              <div className="space-y-2">
                <Label>No Value</Label>
                <Input
                  value={data.noValue || ''}
                  onChange={(e) => handleUpdateNode({ noValue: e.target.value })}
                  placeholder="0"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Image (Optional)</Label>
              <ImageUpload onUpload={(file) => handleImageUpload(file, 'content')} />
            </div>

            <div className="space-y-2">
              <Label>Layout</Label>
              <Select
                value={data.style?.layout || 'default'}
                onValueChange={(value) => handleUpdateNode({
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
          </div>
        </DialogContent>
      </Dialog>

      <VisualNodePreview
        open={showPreview}
        onOpenChange={setShowPreview}
        data={data}
        type="yesno"
        renderOptions={() => (
          <div className="grid grid-cols-2 gap-4">
            <div className="border rounded-lg p-3 flex items-center justify-center">
              <span className="text-sm font-medium">{data.yesLabel || 'Yes'}</span>
            </div>
            <div className="border rounded-lg p-3 flex items-center justify-center">
              <span className="text-sm font-medium">{data.noLabel || 'No'}</span>
            </div>
          </div>
        )}
      />
    </>
  );
});

// Re-export node types for use in the flow editor
export const nodeTypes = {
  startNode: StartNode,
  endNode: EndNode,
  multipleChoice: MultipleChoiceNode,
  singleChoice: SingleChoiceNode,
  yesNo: YesNoNode,
};

export const FunctionNode = memo(({ id, data, selected }: NodeProps<FunctionNodeData>) => {
  const { removeNode, updateNode, selections, variables } = useRootStore();
  const [showDialog, setShowDialog] = useState(false);
  const params = useParams();
  const flowId = params.flowId as string;
  const reactFlowInstance = useReactFlow();
  
  // Get connected source node (MultipleChoice) if any
  const getSourceNode = useCallback(() => {
    const edges = reactFlowInstance.getEdges().filter(e => e.target === id);
    if (edges.length > 0) {
      const sourceNode = reactFlowInstance.getNode(edges[0].source);
      if (sourceNode?.type === 'multipleChoice') {
        return sourceNode;
      }
    }
    return null;
  }, [id, reactFlowInstance]);

  const sourceNode = getSourceNode();
  const selection = sourceNode ? selections[sourceNode.id] : undefined;

  const handleDelete = useCallback(() => {
    if (!flowId) return;
    removeNode(flowId, id);
    toast.success('Node deleted');
  }, [removeNode, id, flowId]);

  // Effect for source node updates
  useEffect(() => {
    if (sourceNode && sourceNode.id !== data.sourceNodeId) {
      updateNode(flowId, id, {
        ...data,
        sourceNodeId: sourceNode.id,
        sourceNodeType: sourceNode.type
      });
    }
  }, [sourceNode, data, updateNode, flowId, id]);

  // Evaluate conditions based on selections and variables
  const evaluateCondition = useCallback((condition: FunctionBlock['condition']) => {
    if (!condition) return false;

    // Handle variable conditions
    if (condition.type === 'variable') {
      const variableValue = variables[condition.variable || ''];
      if (variableValue === undefined) return false;

      switch (condition.operator) {
        case '>=': return variableValue >= condition.value;
        case '<=': return variableValue <= condition.value;
        case '==': return variableValue === condition.value;
        case '!=': return variableValue !== condition.value;
        case '>': return variableValue > condition.value;
        case '<': return variableValue < condition.value;
        default: return false;
      }
    }

    // Handle selection conditions
    if (condition.type === 'selection' && selection) {
      const selectedIds = selection.optionIds;

      switch (condition.operator) {
        case 'allSelected':
          return condition.selectedOptions?.every(opt => selectedIds.includes(opt)) ?? false;
        case 'anySelected':
          return condition.selectedOptions?.some(opt => selectedIds.includes(opt)) ?? false;
        case 'noneSelected':
          return condition.selectedOptions?.every(opt => !selectedIds.includes(opt)) ?? false;
        default:
          return false;
      }
    }

    return false;
  }, [variables, selection]);

  // Get active handle based on conditions
  const getActiveHandle = useCallback(() => {
    const evaluateBlocks = (blocks: FunctionBlock[]): string | null => {
      for (const block of blocks) {
        if (block.type === 'if') {
          if (evaluateCondition(block.condition)) {
            if (block.blocks) {
              const nestedHandle = evaluateBlocks(block.blocks);
              if (nestedHandle) return nestedHandle;
            }
          } else {
            const elseBlock = block.blocks?.find(b => b.type === 'else');
            if (elseBlock?.blocks) {
              const elseHandle = evaluateBlocks(elseBlock.blocks);
              if (elseHandle) return elseHandle;
            }
          }
        } else if (block.type === 'operation') {
          // Process operation and continue
          if (block.blocks) {
            const nextHandle = evaluateBlocks(block.blocks);
            if (nextHandle) return nextHandle;
          }
        } else if (block.type === 'return' && block.handle) {
          return block.handle;
        }
      }
      return null;
    };

    return evaluateBlocks(data.blocks || []);
  }, [data.blocks, evaluateCondition]);

  // Get all unique handles from blocks
  const getUniqueHandles = useCallback((blocks: FunctionBlock[]): string[] => {
    const handles = new Set<string>();
    
    const findHandles = (block: FunctionBlock) => {
      if (block.type === 'return' && block.handle) {
        handles.add(block.handle);
      }
      if (block.blocks) {
        block.blocks.forEach(findHandles);
      }
    };

    blocks.forEach(findHandles);
    return Array.from(handles);
  }, []);

  const handles = useMemo(() => getUniqueHandles(data.blocks || []), [data.blocks, getUniqueHandles]);
  const activeHandle = getActiveHandle();

  // Render logic sequence preview
  const renderSequencePreview = useCallback((blocks: FunctionBlock[], depth = 0) => {
    return blocks.map((block) => {
      const indent = depth * 12;
      return (
        <div key={block.id} style={{ marginLeft: `${indent}px` }}>
          <div className={cn(
            "text-sm",
            evaluateCondition(block.condition) ? "text-primary-600" : "text-muted-foreground"
          )}>
            {block.type === 'if' && (
              <div>
                {block.condition?.type === 'variable' ? (
                  <>if {block.condition.variable} {block.condition.operator} {block.condition.value}</>
                ) : block.condition?.type === 'selection' ? (
                  <>
                    if {block.condition.operator === 'allSelected' ? 'all of' : 
                        block.condition.operator === 'anySelected' ? 'any of' : 
                        'none of'} (
                    {block.condition.selectedOptions?.map(optId => {
                      const option = sourceNode?.data.options.find(o => o.id === optId);
                      return option?.label || optId;
                    }).join(', ')}) selected
                  </>
                ) : null}
              </div>
            )}
            {block.type === 'else' && <div>else</div>}
            {block.type === 'operation' && block.operation && (
              <div>
                {block.operation.type} {block.operation.value} to {block.operation.targetVariable}
              </div>
            )}
            {block.type === 'return' && (
              <div className={cn(
                "flex items-center gap-2",
                block.handle === activeHandle && "text-primary-600"
              )}>
                <span>return to {block.handle}</span>
                <div className={cn(
                  "h-2 w-2 rounded-full",
                  block.handle === activeHandle ? "bg-primary-500" : "bg-gray-200"
                )} />
              </div>
            )}
          </div>
          {block.blocks && renderSequencePreview(block.blocks, depth + 1)}
        </div>
      );
    });
  }, [evaluateCondition, sourceNode, activeHandle]);

  return (
    <>
      <NodeWrapper
        title="Function"
        selected={selected}
        id={id}
        onDelete={handleDelete}
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
        handles={{ 
          top: true,
          right: false,
          bottom: false,
          left: false 
        }}
        customHandles={
          <>
            {handles.map((handle, index) => (
              <Handle
                key={handle}
                type="source"
                position={Position.Right}
                id={handle}
                className={cn(
                  "w-2 h-2 !border-2",
                  handle === activeHandle ? "!bg-primary-500" : "!bg-white"
                )}
                style={{
                  top: `${(index * 40) + 40}px`,
                  right: '-10px'
                }}
              />
            ))}
          </>
        }
      >
        <div className="p-4 relative min-h-[100px]">
          {data.blocks && data.blocks.length > 0 ? (
            renderSequencePreview(data.blocks || [])
          ) : (
            <div className="absolute inset-0 flex items-center justify-center text-sm text-muted-foreground">
              Click settings to add function logic
            </div>
          )}
        </div>
      </NodeWrapper>

      <FunctionNodeDialog
        open={showDialog}
        onOpenChange={setShowDialog}
        onUpdateLogic={(blocks) => {
          updateNode(flowId, id, { ...data, blocks });
        }}
        sourceNode={sourceNode}
        variables={variables}
        blocks={data.blocks || []}
      />
    </>
  );
});