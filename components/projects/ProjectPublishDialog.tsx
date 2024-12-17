import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { BookMarked, GitCommit } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

interface ProjectPublishDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onPublish: () => Promise<void>;
}

export function ProjectPublishDialog({
  open,
  onOpenChange,
  onPublish,
}: ProjectPublishDialogProps) {
  const [publishing, setPublishing] = useState(false);

  const handlePublish = async () => {
    try {
      setPublishing(true);
      await onPublish();
      toast.success('Project published successfully');
      onOpenChange(false);
    } catch (error: any) {
      console.error('Error publishing project:', error);
      toast.error(error?.message || 'Failed to publish project');
    } finally {
      setPublishing(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <GitCommit className="h-5 w-5" />
            Publish Project
          </DialogTitle>
          <DialogDescription>
            Make your project publicly accessible and enable API access.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="rounded-lg border p-4 bg-muted/50">
            <div className="flex items-center gap-2">
              <BookMarked className="h-4 w-4 text-primary" />
              <span className="font-medium">Publishing will:</span>
            </div>
            <ul className="mt-2 space-y-1 text-sm text-muted-foreground">
              <li>• Make the project publicly accessible</li>
              <li>• Enable API access</li>
              <li>• Generate an API key if none exists</li>
            </ul>
          </div>

          <Button
            className="w-full"
            onClick={handlePublish}
            disabled={publishing}
          >
            {publishing ? "Publishing..." : "Publish Project"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
} 