import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useState } from "react";
import { Switch } from "@/components/ui/switch";

interface PublishDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onPublish: (settings: any) => Promise<void>;
  projectId: string;
  flowId: string;
  currentVersion: number;
}

export function PublishDialog({
  open,
  onOpenChange,
  onPublish,
  projectId,
  flowId,
  currentVersion,
}: PublishDialogProps) {
  const [versionName, setVersionName] = useState(`Version ${currentVersion + 1}`);
  const [description, setDescription] = useState("");
  const [autoActivate, setAutoActivate] = useState(true);

  const handlePublish = async () => {
    await onPublish({
      versionName,
      description,
      autoActivate,
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Publish Flow</DialogTitle>
          <DialogDescription>
            Create a new version of this flow that can be used in the questionnaire.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="name">Version Name</Label>
            <Input
              id="name"
              value={versionName}
              onChange={(e) => setVersionName(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Description (optional)</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="What changed in this version?"
            />
          </div>
          <div className="flex items-center justify-between">
            <Label htmlFor="auto-activate">Set as active version</Label>
            <Switch
              id="auto-activate"
              checked={autoActivate}
              onCheckedChange={setAutoActivate}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handlePublish}>
            Publish
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}