import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { PublishSettings } from "@/types";
import { BookMarked, GitCommit } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

interface PublishDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onPublish: (settings: Partial<PublishSettings>) => Promise<void>;
  currentVersion?: number;
}

export function PublishDialog({
  open,
  onOpenChange,
  onPublish,
  currentVersion = 0,
}: PublishDialogProps) {
  const [name, setName] = useState("");
  const [changelog, setChangelog] = useState("");
  const [publishing, setPublishing] = useState(false);

  const handlePublish = async () => {
    try {
      setPublishing(true);
      await onPublish({
        version: currentVersion + 1,
        changelog,
        name: name || `Version ${currentVersion + 1}`,
      });
      toast.success('Flow published successfully');
      onOpenChange(false);
    } catch (error) {
      toast.error('Failed to publish flow');
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
            Publish Flow
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Version Name (Optional)</Label>
            <Input
              placeholder={`Version ${currentVersion + 1}`}
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label>Changelog</Label>
            <Textarea
              placeholder="Describe your changes..."
              value={changelog}
              onChange={(e) => setChangelog(e.target.value)}
              rows={4}
            />
          </div>

          <div className="rounded-lg border p-4 bg-muted/50">
            <div className="flex items-center gap-2">
              <BookMarked className="h-4 w-4 text-primary" />
              <span className="font-medium">Publishing will:</span>
            </div>
            <ul className="mt-2 space-y-1 text-sm text-muted-foreground">
              <li>• Create a new version</li>
              <li>• Make the flow publicly accessible</li>
              <li>• Generate a shareable link</li>
              <li>• Track version history</li>
            </ul>
          </div>

          <Button
            className="w-full"
            onClick={handlePublish}
            disabled={publishing}
          >
            {publishing ? "Publishing..." : "Publish Flow"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}