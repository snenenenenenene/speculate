import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { GitBranch, Plus, X } from "lucide-react";
import { toast } from 'react-hot-toast';

interface PublishDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  projectId: string;
  flowId: string;
  currentVersion: number;
  onPublish: (data: {
    name?: string;
    description?: string;
    changelog?: string[];
  }) => Promise<void>;
}

export function PublishDialog({
  open,
  onOpenChange,
  currentVersion,
  onPublish,
}: PublishDialogProps) {
  const [isPublishing, setIsPublishing] = useState(false);
  const [versionName, setVersionName] = useState('');
  const [description, setDescription] = useState('');
  const [changelog, setChangelog] = useState<string[]>([]);
  const [newChange, setNewChange] = useState('');

  const handleAddChange = () => {
    if (newChange.trim()) {
      console.log('Adding changelog entry:', newChange.trim());
      setChangelog([...changelog, newChange.trim()]);
      setNewChange('');
    }
  };

  const handleRemoveChange = (index: number) => {
    console.log('Removing changelog entry at index:', index);
    setChangelog(changelog.filter((_, i) => i !== index));
  };

  const handlePublish = async () => {
    console.log('Starting publish process from dialog...', {
      currentVersion,
      versionName,
      description,
      changelog,
    });

    try {
      setIsPublishing(true);
      const publishData = {
        name: versionName || `Version ${currentVersion + 1}`,
        description: description || '',
        changelog: changelog.length > 0 ? changelog : [],
      };
      console.log('Publishing with data:', publishData);

      await onPublish(publishData);

      // Only reset form and close dialog if publish was successful
      setVersionName('');
      setDescription('');
      setChangelog([]);
      setNewChange('');
      
      console.log('Publish completed successfully');
      onOpenChange(false);
    } catch (error) {
      console.error('Error in publish dialog:', {
        error,
        message: error.message,
        stack: error.stack
      });
      toast.error(error instanceof Error ? error.message : 'Failed to publish flow');
    } finally {
      setIsPublishing(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Publish Flow</DialogTitle>
          <DialogDescription>
            Create a new version of your flow. This will make it available in the published API.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div className="flex items-center gap-4">
            <GitBranch className="h-5 w-5 text-muted-foreground" />
            <div className="flex items-baseline gap-2">
              <span className="text-sm font-medium">Current Version:</span>
              <Badge variant="outline">v{currentVersion}</Badge>
            </div>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="version-name">Version Name</Label>
            <Input
              id="version-name"
              placeholder={`Version ${currentVersion + 1}`}
              value={versionName}
              onChange={(e) => setVersionName(e.target.value)}
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              placeholder="What's new in this version?"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          <div className="grid gap-2">
            <Label>Changelog</Label>
            <div className="flex gap-2">
              <Input
                placeholder="Add a change..."
                value={newChange}
                onChange={(e) => setNewChange(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddChange();
                  }
                }}
              />
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={handleAddChange}
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            {changelog.length > 0 && (
              <ul className="space-y-2 mt-2">
                {changelog.map((change, index) => (
                  <li
                    key={index}
                    className="flex items-center gap-2 text-sm bg-muted/50 rounded-md p-2"
                  >
                    <span className="flex-1">{change}</span>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6"
                      onClick={() => handleRemoveChange(index)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            onClick={handlePublish}
            disabled={isPublishing}
          >
            {isPublishing ? 'Publishing...' : 'Publish'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}