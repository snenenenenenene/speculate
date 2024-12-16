import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Version } from "@prisma/client";
import { Clock, History, RotateCcw } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

interface VersionHistoryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  flowId: string;
  onRestoreVersion: (versionId: string) => Promise<void>;
  getVersions: (flowId: string) => Promise<Version[]>;
}

export function VersionHistoryDialog({
  open,
  onOpenChange,
  flowId,
  onRestoreVersion,
  getVersions,
}: VersionHistoryDialogProps) {
  const [versions, setVersions] = useState<Version[]>([]);
  const [loading, setLoading] = useState(false);
  const [restoring, setRestoring] = useState(false);

  useEffect(() => {
    if (open) {
      loadVersions();
    }
  }, [open, flowId]);

  const loadVersions = async () => {
    try {
      setLoading(true);
      const data = await getVersions(flowId);
      setVersions(data);
    } catch (error) {
      toast.error('Failed to load versions');
    } finally {
      setLoading(false);
    }
  };

  const handleRestore = async (versionId: string) => {
    try {
      setRestoring(true);
      await onRestoreVersion(versionId);
      toast.success('Version restored successfully');
      onOpenChange(false);
    } catch (error) {
      toast.error('Failed to restore version');
    } finally {
      setRestoring(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <History className="h-5 w-5" />
            Version History
          </DialogTitle>
        </DialogHeader>

        <ScrollArea className="h-[400px] pr-4">
          <div className="space-y-4">
            {loading ? (
              <div className="flex items-center justify-center p-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
              </div>
            ) : versions.length === 0 ? (
<div className="text-center p-8 text-muted-foreground">
                <History className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <p>No versions found</p>
                <p className="text-sm">Publish your flow to create a version</p>
              </div>
            ) : (
              versions.map((version) => (
                <div
                  key={version.id}
                  className="flex items-start gap-4 p-4 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">Version {version.version}</span>
                      {version.publishedAt && (
                        <span className="text-xs text-muted-foreground">
                          Published
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 mt-1 text-sm text-muted-foreground">
                      <Clock className="h-3 w-3" />
                      <span>
                        {new Date(version.createdAt).toLocaleDateString("en-US", {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                          hour: "numeric",
                          minute: "numeric",
                        })}
                      </span>
                    </div>
                    {version.metadata?.changelog && (
                      <p className="mt-2 text-sm">{version.metadata.changelog}</p>
                    )}
                    <div className="mt-2 flex items-center gap-2">
                      <div className="flex -space-x-2">
                        <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center">
                          <span className="text-xs text-primary-foreground">
                            {version.user?.name?.[0] || "U"}
                          </span>
                        </div>
                      </div>
                      <span className="text-xs text-muted-foreground">
                        {version.user?.name || "Unknown user"}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="gap-2"
                      onClick={() => handleRestore(version.id)}
                      disabled={restoring}
                    >
                      <RotateCcw className="h-4 w-4" />
                      Restore
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}