import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ShareSettings } from "@/types";
import { Copy, Globe, Link, Mail, Shield } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

interface ShareDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onShare: (settings: Partial<ShareSettings>) => Promise<string>;
  currentSettings?: Partial<ShareSettings>;
}

export function ShareDialog({
  open,
  onOpenChange,
  onShare,
  currentSettings
}: ShareDialogProps) {
  const [settings, setSettings] = useState<Partial<ShareSettings>>(currentSettings || {
    isPublic: false,
    requiresSignin: true,
    allowedDomains: [],
    allowComments: false,
  });
  const [shareUrl, setShareUrl] = useState<string>("");
  const [isSharing, setIsSharing] = useState(false);

  const handleShare = async () => {
    try {
      setIsSharing(true);
      const url = await onShare(settings);
      setShareUrl(url);
      toast.success('Share settings updated');
    } catch (error) {
      toast.error('Failed to update share settings');
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
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Share Flow</DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="link" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="link">Share Link</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>

          <div className="mt-4 space-y-4">
            <div className="space-y-4">
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
            </div>

            {shareUrl ? (
              <div className="space-y-2">
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
                className="w-full"
                disabled={isSharing}
              >
                <Link className="mr-2 h-4 w-4" />
                Generate Share Link
              </Button>
            )}
          </div>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}