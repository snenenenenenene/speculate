"use client";

import CollaboratorsModal from "@/components/projects/CollaboratorsModal";
// import {
//   AlertDialog,
//   AlertDialogAction,
//   AlertDialogCancel,
//   AlertDialogContent,
//   AlertDialogDescription,
//   AlertDialogFooter,
//   AlertDialogHeader,
//   AlertDialogTitle,
// } from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import {
  BarChart2,
  Clock,
  CodeSquare,
  Copy,
  FileText,
  Loader2,
  Plus,
  RefreshCw,
  Settings,
  Share2,
  Trash2,
  Users2
} from "lucide-react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";

interface Project {
  id: string;
  name: string;
  description: string | null;
  apiKey: string | null;
  variables: any[];
  createdAt: string;
  updatedAt: string;
  _count: {
    charts: number;
    collaborators: number;
  };
}

interface Flow {
  id: string;
  name: string;
  description?: string;
  content: string;
  isPublished: boolean;
  version: number;
  updatedAt: string;
  variables: any[];
}

interface ShareSettings {
  isPublic: boolean;
  requiresSignin: boolean;
  allowedDomains: string[];
  allowComments: boolean;
  accessLevel: 'view' | 'edit' | 'comment';
  password?: string;
}

export default function ProjectPage() {
  const router = useRouter();
  const params = useParams();
  const [project, setProject] = useState<Project | null>(null);
  const [flows, setFlows] = useState<Flow[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCollaboratorsOpen, setIsCollaboratorsOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isShareDialogOpen, setIsShareDialogOpen] = useState(false);
  const [shareUrl, setShareUrl] = useState<string>("");
  const [isSharing, setIsSharing] = useState(false);
  const [shareSettings, setShareSettings] = useState<ShareSettings>({
    isPublic: false,
    requiresSignin: true,
    allowedDomains: [],
    allowComments: false,
    accessLevel: 'view'
  });

  // Settings Modal States
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
  });

  useEffect(() => {
    const fetchProject = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/projects/${params.projectId}`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch project');
        }

        const data = await response.json();
        setProject(data.project);
        setFlows(data.project.flows || []);
        setFormData({
          name: data.project.name,
          description: data.project.description || "",
        });
      } catch (error) {
        console.error('Error fetching project:', error);
        toast.error('Failed to load project data');
      } finally {
        setLoading(false);
      }
    };

    if (params.projectId) {
      fetchProject();
    }
  }, [params.projectId]);

  const handleShare = async () => {
    try {
      setIsSharing(true);
      
      const response = await fetch(`/api/projects/${project?.id}/share`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(shareSettings),
      });

      if (!response.ok) {
        throw new Error('Failed to share project');
      }
      
      const data = await response.json();
      setShareUrl(data.shareUrl);
      toast.success('Project shared successfully');
    } catch (error) {
      toast.error('Failed to share project');
      console.error('Error sharing project:', error);
    } finally {
      setIsSharing(false);
    }
  };

  const handleSaveSettings = async () => {
    try {
      setIsSaving(true);
      const response = await fetch(`/api/projects/${params.projectId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!response.ok) throw new Error("Failed to update project");

      toast.success("Project settings updated");
      setIsSettingsOpen(false);
      router.refresh();
    } catch (error) {
      toast.error("Failed to update project");
    } finally {
      setIsSaving(false);
    }
  };

  const handleRegenerateApiKey = async () => {
    try {
      const response = await fetch(`/api/projects/${project?.id}/apiKey`, {
        method: "POST",
      });

      if (!response.ok) throw new Error("Failed to regenerate API key");

      const data = await response.json();
      toast.success("API key regenerated");
      router.refresh();
    } catch (error) {
      toast.error("Failed to regenerate API key");
    }
  };

  const handleDeleteProject = async () => {
    try {
      setIsDeleting(true);
      const response = await fetch(`/api/projects/${project?.id}`, {
        method: "DELETE",
      });

      if (!response.ok) throw new Error("Failed to delete project");

      toast.success("Project deleted");
      router.push("/projects");
    } catch (error) {
      toast.error("Failed to delete project");
    } finally {
      setIsDeleting(false);
      setShowDeleteDialog(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <h2 className="text-2xl font-bold">Project not found</h2>
          <p className="text-muted-foreground">
            This project may have been deleted or you don't have access to it.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 space-y-8 p-8 pt-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{project.name}</h1>
          <p className="text-muted-foreground">{project.description}</p>
        </div>
        <div className="flex items-center gap-4">
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => setIsCollaboratorsOpen(true)}
            className="gap-2"
          >
            <Users2 className="h-4 w-4" />
            Manage Team
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => setIsShareDialogOpen(true)}
            className="gap-2"
          >
            <Share2 className="h-4 w-4" />
            Share
          </Button>
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => setIsSettingsOpen(true)}
            className="gap-2"
          >
            <Settings className="h-4 w-4" />
            Settings
          </Button>
          <Button size="sm" asChild>
            <Link href={`/projects/${project.id}/flows`}>
              <BarChart2 className="h-4 w-4 mr-2" />
              Open Editor
            </Link>
          </Button>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Flows</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{project._count?.charts || 0}</div>
            {flows?.length > 0 && (
              <div className="flex items-center gap-2">
                <Badge variant="secondary">
                  {flows.filter(f => f.isPublished).length} Published
                </Badge>
                <Badge variant="outline">
                  {flows.filter(f => !f.isPublished).length} Drafts
                </Badge>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Team Members</CardTitle>
            <Users2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{project._count?.collaborators || 1}</div>
            <p className="text-xs text-muted-foreground">
              Active collaborators
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Last Activity</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {new Date(project.updatedAt).toLocaleDateString()}
            </div>
            <p className="text-xs text-muted-foreground">
              Last modified
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Variables</CardTitle>
            <CodeSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{project.variables?.length || 0}</div>
            <p className="text-xs text-muted-foreground">
              Global project variables
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Flows Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {flows.map((flow) => (
          <Link
            key={flow.id}
            href={`/projects/${project.id}/flows/${flow.id}`}
            className="block"
          >
            <Card className="hover:shadow-md transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">{flow.name}</CardTitle>
                {flow.isPublished ? (
                  <Badge>Published</Badge>
                ) : (
                  <Badge variant="outline">Draft</Badge>
                )}
              </CardHeader>
              <CardContent>
                {flow.description && (
                  <p className="text-sm text-muted-foreground mb-2">
                    {flow.description}
                  </p>
                )}
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <FileText className="h-4 w-4" />
                    <span>v{flow.version}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    <span>
                      Updated {new Date(flow.updatedAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      {/* Modals */}
      <CollaboratorsModal
        projectId={project.id}
        isOpen={isCollaboratorsOpen}
        onClose={() => setIsCollaboratorsOpen(false)}
      />

      {/* Settings Modal */}
      <Dialog open={isSettingsOpen} onOpenChange={setIsSettingsOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Project Settings</DialogTitle>
          </DialogHeader>

          <Tabs defaultValue="general" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="general">General</TabsTrigger>
              <TabsTrigger value="api">API</TabsTrigger>
              <TabsTrigger value="variables">Variables</TabsTrigger>
            </TabsList>

            <TabsContent value="general" className="space-y-4">
              <div className="space-y-4 pt-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Project Name</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) =>
                      setFormData({ ...formData, description: e.target.value })
                    }
                  />
                </div>
                <Button onClick={handleSaveSettings} disabled={isSaving}>
                {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Save Changes
                </Button>

                <Separator className="my-4" />

                <div className="space-y-2">
                  <Label className="text-destructive">Danger Zone</Label>
                  <Button
                    variant="destructive"
                    className="w-full"
                    onClick={() => setShowDeleteDialog(true)}
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Delete Project
                  </Button>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="api" className="space-y-4">
              <div className="space-y-4 pt-4">
                <div className="space-y-2">
                  <Label>API Key</Label>
                  <div className="flex items-center gap-2">
                    <Input
                      value={project.apiKey || "No API key generated"}
                      readOnly
                    />
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => {
                        if (project.apiKey) {
                          navigator.clipboard.writeText(project.apiKey);
                          toast.success("API key copied to clipboard");
                        }
                      }}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                    <Button size="icon" onClick={handleRegenerateApiKey}>
                      <RefreshCw className="h-4 w-4" />
                    </Button>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Use this key to authenticate API requests to your project.
                  </p>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="variables" className="space-y-4">
              <div className="space-y-4 pt-4">
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  Add Variable
                </Button>

                <div className="rounded-md border">
                  {project.variables?.length > 0 ? (
                    <div className="divide-y">
                      {project.variables.map((variable: any, index: number) => (
                        <div
                          key={index}
                          className="flex items-center justify-between p-4"
                        >
                          <div>
                            <p className="font-medium">{variable.name}</p>
                            <p className="text-sm text-muted-foreground">
                              {variable.value}
                            </p>
                          </div>
                          <Button variant="ghost" size="icon">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="p-4 text-center text-sm text-muted-foreground">
                      No variables defined
                    </div>
                  )}
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </DialogContent>
      </Dialog>

      {/* Share Dialog */}
      <Dialog open={isShareDialogOpen} onOpenChange={setIsShareDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Share Project</DialogTitle>
            <DialogDescription>
              Configure how you want to share this project
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <Label>Public access</Label>
                </div>
                <p className="text-sm text-muted-foreground">
                  Anyone with the link can view
                </p>
              </div>
              <Switch
                checked={shareSettings.isPublic}
                onCheckedChange={(checked) => 
                  setShareSettings(prev => ({ ...prev, isPublic: checked }))
                }
              />
            </div>

            <div className="space-y-2">
              <Label>Access Level</Label>
              <Select
                value={shareSettings.accessLevel}
                onValueChange={(value: 'view' | 'edit' | 'comment') => 
                  setShareSettings(prev => ({ ...prev, accessLevel: value }))
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
            </div>

            {shareUrl ? (
              <div className="space-y-2">
                <Label>Share URL</Label>
                <div className="flex gap-2">
                  <Input value={shareUrl} readOnly />
                  <Button 
                    size="icon" 
                    variant="outline" 
                    onClick={() => {
                      navigator.clipboard.writeText(shareUrl);
                      toast.success("Share link copied to clipboard");
                    }}
                  >
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
                {isSharing ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Generating Link...
                  </>
                ) : (
                  <>
                    Share Project
                  </>
                )}
              </Button>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Are you absolutely sure?</DialogTitle>
            <DialogDescription>
              This action cannot be undone. This will permanently delete your
              project and remove all associated data.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button>Cancel</Button>
            <Button
              onClick={handleDeleteProject}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Delete Project
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}