import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Clock, History, Play, GitBranch } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface Version {
  id: string;
  version: number;
  name?: string;
  content: any;
  metadata: {
    changelog?: string[];
    description?: string;
    notes?: string;
  };
  createdAt: string;
  publishedAt?: string;
  createdBy: {
    id: string;
    name: string;
    email: string;
  };
}

interface Flow {
  id: string;
  name: string;
  version: number;
  isPublished: boolean;
  activeVersionId?: string;
  versions?: Version[];
}

interface ProjectVersionsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  flows: Flow[];
  onActivateVersion: (flowId: string, versionId: string) => Promise<void>;
}

export function ProjectVersionsDialog({
  open,
  onOpenChange,
  flows,
  onActivateVersion,
}: ProjectVersionsDialogProps) {
  const [loading, setLoading] = useState(false);
  const [activating, setActivating] = useState<string | null>(null);

  const handleActivate = async (flowId: string, versionId: string) => {
    try {
      setActivating(versionId);
      await onActivateVersion(flowId, versionId);
      toast.success('Version activated successfully');
    } catch (error) {
      toast.error('Failed to activate version');
    } finally {
      setActivating(null);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[800px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <History className="h-5 w-5" />
            Project Versions
          </DialogTitle>
        </DialogHeader>

        <ScrollArea className="h-[600px] pr-4">
          <div className="space-y-8">
            {flows.map(flow => flow.versions && flow.versions.length > 0 && (
              <div key={flow.id} className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <GitBranch className="h-4 w-4 text-muted-foreground" />
                    <h3 className="text-lg font-semibold">{flow.name}</h3>
                  </div>
                  <Badge variant={flow.isPublished ? "default" : "secondary"}>
                    {flow.isPublished ? "Published" : "Draft"}
                  </Badge>
                </div>
                
                {flow.versions.map((version) => (
                  <div key={version.id} 
                    className={cn(
                      "flex items-center gap-4 p-4 rounded-lg border",
                      flow.activeVersionId === version.id && "bg-muted/50"
                    )}
                  >
                    <div className="flex items-center gap-2">
                      <div className={cn(
                        "w-2 h-2 rounded-full",
                        flow.activeVersionId === version.id ? "bg-green-500" : "bg-muted"
                      )} />
                      <Badge variant="outline">v{version.version}</Badge>
                    </div>
                    <div className="flex-1 space-y-1">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-medium">
                          {version.name || `Version ${version.version}`}
                        </p>
                        {flow.activeVersionId === version.id && (
                          <Badge variant="secondary" className="text-xs">Active</Badge>
                        )}
                      </div>
                      {version.metadata?.description && (
                        <p className="text-sm text-muted-foreground">
                          {version.metadata.description}
                        </p>
                      )}
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Clock className="h-3 w-3" />
                        <span>
                          Published on {new Date(version.createdAt).toLocaleDateString()} by {version.createdBy.name}
                        </span>
                      </div>
                      {version.metadata?.changelog && version.metadata.changelog.length > 0 && (
                        <div className="mt-2">
                          <p className="text-xs font-medium text-muted-foreground mb-1">Changes:</p>
                          <ul className="text-xs text-muted-foreground list-disc list-inside">
                            {version.metadata.changelog.map((change, index) => (
                              <li key={index}>{change}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      {flow.activeVersionId !== version.id && (
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleActivate(flow.id, version.id)}
                          disabled={activating === version.id}
                        >
                          {activating === version.id ? (
                            <>
                              <Clock className="h-4 w-4 mr-1 animate-spin" />
                              Activating...
                            </>
                          ) : (
                            <>
                              <Play className="h-4 w-4 mr-1" />
                              Activate
                            </>
                          )}
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ))}

            {!flows.some(f => f.versions && f.versions.length > 0) && (
              <div className="flex flex-col items-center justify-center h-[400px] text-center">
                <GitBranch className="h-8 w-8 text-muted-foreground mb-4" />
                <p className="text-lg font-medium">No versions yet</p>
                <p className="text-sm text-muted-foreground">
                  Publish your flows to create versions
                </p>
              </div>
            )}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
} 