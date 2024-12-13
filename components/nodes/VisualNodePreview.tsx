// components/nodes/VisualNodePreview.tsx
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

interface VisualNodePreviewProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  data: VisualNodeData;
  type: 'start' | 'end' | 'multiple' | 'single' | 'yesno';
  renderOptions?: () => React.ReactNode;
}

export function VisualNodePreview({
  open,
  onOpenChange,
  data,
  type,
  renderOptions
}: VisualNodePreviewProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Question Preview</DialogTitle>
        </DialogHeader>
        <ScrollArea className="max-h-[600px] px-1">
          <div className={cn(
            "space-y-6 py-4",
            data.style?.layout === 'centered' && "text-center",
            data.style?.layout === 'wide' && "max-w-none",
            data.style?.theme === 'dark' && "bg-zinc-950 text-white",
            data.style?.theme === 'neutral' && "bg-zinc-100"
          )}>
            {/* Title */}
            {data.title && (
              <h2 className="text-2xl font-bold tracking-tight">
                {data.title}
              </h2>
            )}

            {/* Top Images */}
            {data.images?.filter(img => img.position === 'top').map((image, i) => (
              <img
                key={i}
                src={image.url}
                alt={image.alt}
                className="w-full rounded-lg object-cover"
              />
            ))}

            {/* Description */}
            {data.description && (
              <p className="text-sm text-muted-foreground">
                {data.description}
              </p>
            )}

            {/* Rich Text Content */}
            {data.content && (
              <div
                className="prose prose-sm dark:prose-invert"
                dangerouslySetInnerHTML={{ __html: data.content }}
              />
            )}

            {/* Inline Images */}
            {data.images?.filter(img => img.position === 'inline').map((image, i) => (
              <img
                key={i}
                src={image.url}
                alt={image.alt}
                className="w-full rounded-lg object-cover"
              />
            ))}

            {/* Node-specific Options */}
            {renderOptions && renderOptions()}

            {/* Bottom Images */}
            {data.images?.filter(img => img.position === 'bottom').map((image, i) => (
              <img
                key={i}
                src={image.url}
                alt={image.alt}
                className="w-full rounded-lg object-cover"
              />
            ))}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}