import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ProjectShareSettings } from "@/types";
import { ChartInstance } from "@prisma/client";
import {
	Copy,
	Globe,
	Link,
	Lock,
	Mail,
	Shield
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

interface ProjectShareDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onShare: (settings: Partial<ProjectShareSettings>) => Promise<string>;
  currentSettings?: Partial<ProjectShareSettings>;
  flows: ChartInstance[];
}

export function ProjectShareDialog({
  open,
  onOpenChange,
  onShare,
  currentSettings,
  flows,
}: ProjectShareDialogProps) {
  const [settings, setSettings] = useState<Partial<ProjectShareSettings>>(
    currentSettings || {
      isPublic: false,
      requiresSignin: true,
      allowedDomains: [],
      allowComments: false,
      accessLevel: 'view',
      flows: flows.map(f => ({ id: f.id, visible: true, accessLevel: 'view' })),
    }
  );
  const [shareUrl, setShareUrl] = useState<string>("");
  const [isSharing, setIsSharing] = useState(false);
  const [password, setPassword] = useState("");

  const handleShare = async () => {
    try {
      setIsSharing(true);
      const url = await onShare({
        ...settings,
        password: password || undefined,
      });
      setShareUrl(url);
      toast.success('Project shared successfully');
    } catch (error) {
      toast.error('Failed to share project');
    } finally {
      setIsSharing(false);
    }
  };

  const copyShareUrl = () => {
    navigator.clipboard.writeText(shareUrl);
    toast.success('Share URL copied to clipboard');
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Share Project</DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="general">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="general">General</TabsTrigger>
            <TabsTrigger value="flows">Flows</TabsTrigger>
            <TabsTrigger value="security">Security</TabsTrigger>
          </TabsList>

          <TabsContent value="general" className="space-y-4 mt-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <Globe className="h-4 w-4" />
                  <Label>Public access</Label>
                </div>
                <p className="text-sm text-muted-foreground">
                  Anyone with the link can view
                </p>
              </div>
              <Switch
                checked={settings.isPublic}
                onCheckedChange={(checked) => 
                  setSettings(prev => ({ ...prev, isPublic: checked }))
                }
              />
            </div>

            {!settings.isPublic && (
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <Shield className="h-4 w-4" />
                    <Label>Require sign in</Label>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Users must be signed in to view
                  </p>
                </div>
                <Switch
                  checked={settings.requiresSignin}
                  onCheckedChange={(checked) => 
                    setSettings(prev => ({ ...prev, requiresSignin: checked }))
                  }
                />
              </div>
            )}

            <div className="space-y-2">
              <Label>Access Level</Label>
              <Select
                value={settings.accessLevel}
                onValueChange={(value: 'view' | 'edit' | 'comment') => 
                  setSettings(prev => ({ ...prev, accessLevel: value }))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="view">View only</SelectItem>
                  <SelectItem value="comment">Can comment</SelectItem>
                  <SelectItem value="edit">Can edit</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                What shared users can do with the project
              </p>
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4" />
                  <Label>Allow comments</Label>
                </div>
                <p className="text-sm text-muted-foreground">
                  Viewers can leave comments
                </p>
              </div>
              <Switch
                checked={settings.allowComments}
                onCheckedChange={(checked) => 
                  setSettings(prev => ({ ...prev, allowComments: checked }))
                }
              />
            </div>
          </TabsContent>

          <TabsContent value="flows" className="mt-4">
            <ScrollArea className="h-[300px] rounded-md border p-4">
              <div className="space-y-4">
                {settings.flows?.map((flowSettings) => {
                  const flow = flows.find(f => f.id === flowSettings.id);
                  if (!flow) return null;

                  return (
                    <div key={flow.id} className="flex items-start gap-4">
                      <Switch
                        checked={flowSettings.visible}
                        onCheckedChange={(checked) => 
                          setSettings(prev => ({
                            ...prev,
                            flows: prev.flows?.map(f => 
                              f.id === flow.id ? { ...f, visible: checked } : f
                            )
                          }))
                        }
                      />
                      <div className="flex-1">
                        <p className="font-medium">{flow.name}</p>
                        {flowSettings.visible && (
                          <div className="mt-2">
                            <Select
                              value={flowSettings.accessLevel || settings.accessLevel}
                              onValueChange={(value: 'view' | 'edit' | 'comment') => 
                                setSettings(prev => ({
                                  ...prev,
                                  flows: prev.flows?.map(f => 
                                    f.id === flow.id ? { ...f, accessLevel: value } : f
                                  )
                                }))
                              }
                            >
                              <SelectTrigger className="w-[120px]">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="view">View only</SelectItem>
                                <SelectItem value="comment">Can comment</SelectItem>
                                <SelectItem value="edit">Can edit</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </ScrollArea>
          </TabsContent>

          <TabsContent value="security" className="space-y-4 mt-4">
            {!settings.isPublic && !settings.requiresSignin && (
              <div className="space-y-2">
                <Label>Allowed Email Domains</Label>
                <div className="flex gap-2">
                  <Input
                    placeholder="e.g. company.com"
                    value={settings.allowedDomains?.join(", ") || ""}
                    onChange={(e) => 
                      setSettings(prev => ({
                        ...prev,
                        allowedDomains: e.target.value.split(",").map(d => d.trim())
                      }))
                    }
                  />
                </div>
                <p className="text-xs text-muted-foreground">
                  Comma-separated list of allowed domains
                </p>
              </div>
            )}

            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Lock className="h-4 w-4" />
                <Label>Password Protection</Label>
              </div>
              <Input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Leave empty for no password"
              />
              <p className="text-xs text-muted-foreground">
                Require a password to access the project
              </p>
            </div>

            {settings.expiresAt && (
              <div className="space-y-2">
                <Label>Expiration</Label>
                <Input
                  type="datetime-local"
                  value={settings.expiresAt.toISOString().slice(0, 16)}
                  onChange={(e) => 
                    setSettings(prev => ({
                      ...prev,
                      expiresAt: new Date(e.target.value)
                    }))
                  }
                />
                <p className="text-xs text-muted-foreground">
                  When the share link will expire
                </p>
              </div>
            )}
          </TabsContent>
        </Tabs>

        {shareUrl ? (
          <div className="space-y-2 mt-4">
            <Label>Share URL</Label>
            <div className="flex gap-2">
              <Input value={shareUrl} readOnly />
              <Button size="icon" variant="outline" onClick={copyShareUrl}>
                <Copy className="h-4 w-4" />
              </Button>
            </div>
          </div>
        ) : (
          <Button 
            onClick={handleShare}
            className="w-full mt-4"
            disabled={isSharing}
          >
            <Link className="mr-2 h-4 w-4" />
            {isSharing ? 'Generating Share Link...' : 'Generate Share Link'}
          </Button>
        )}
      </DialogContent>
    </Dialog>
  );
}