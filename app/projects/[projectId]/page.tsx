"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Copy,
  FileJson,
  GitBranch,
  GitCommitHorizontal,
  Globe2,
  History,
  Key,
  LayoutDashboard,
  List,
  Loader2,
  Settings,
  Share2,
  Shield,
  Users2,
  Variable
} from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";

interface Flow {
  id: string;
  name: string;
  isPublished: boolean;
  version: number;
  updatedAt: string;
  variables: any[];
}

interface Project {
  id: string;
  name: string;
  description: string;
  apiKey: string | null;
  variables: any[];
  createdAt: string;
  updatedAt: string;
  _count: {
    charts: number;
  };
}

interface ProjectStats {
  totalFlows: number;
  publishedFlows: number;
  draftFlows: number;
  totalVersions: number;
  latestVersion: number;
  totalVariables: number;
  apiUsage: {
    total: number;
    lastWeek: number;
  };
}

interface ShareSettings {
  isPublic: boolean;
  requiresSignin: boolean;
  allowedDomains: string[];
  allowComments: boolean;
  accessLevel: 'view' | 'edit' | 'comment';
}

export default function ProjectPage() {
  const params = useParams();
  const [project, setProject] = useState<Project | null>(null);
  const [flows, setFlows] = useState<Flow[]>([]);
  const [stats, setStats] = useState<ProjectStats>({
    totalFlows: 0,
    publishedFlows: 0,
    draftFlows: 0,
    totalVersions: 0,
    latestVersion: 0,
    totalVariables: 0,
    apiUsage: {
      total: 0,
      lastWeek: 0
    }
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isShareDialogOpen, setIsShareDialogOpen] = useState(false);
  const [shareUrl, setShareUrl] = useState<string>("");
  const [isSharing, setIsSharing] = useState(false);
  const [shareSettings, setShareSettings] = useState<Partial<ShareSettings>>({
    isPublic: false,
    requiresSignin: true,
    allowedDomains: [],
    allowComments: false,
    accessLevel: 'view'
  });

  useEffect(() => {
    const fetchProject = async () => {
      try {
        const [projectResponse, flowsResponse] = await Promise.all([
          fetch(`/api/projects/${params.projectId}`),
          fetch(`/api/projects/${params.projectId}/flows`)
        ]);

        if (!projectResponse.ok || !flowsResponse.ok) {
          throw new Error('Failed to fetch project data');
        }

        const projectData = await projectResponse.json();
        const flowsData = await flowsResponse.json();

        setProject(projectData.project);
        setFlows(flowsData.flows);

        // Calculate stats
        const publishedFlows = flowsData.flows.filter((f: Flow) => f.isPublished);
        setStats({
          totalFlows: flowsData.flows.length,
          publishedFlows: publishedFlows.length,
          draftFlows: flowsData.flows.length - publishedFlows.length,
          totalVersions: flowsData.flows.reduce((acc: number, flow: Flow) => acc + flow.version, 0),
          latestVersion: Math.max(...flowsData.flows.map((f: Flow) => f.version)),
          totalVariables: projectData.project.variables?.length || 0,
          apiUsage: {
            total: 1250, // Example data - replace with real API usage stats
            lastWeek: 250
          }
        });
      } catch (error) {
        console.error('Error fetching project:', error);
        toast.error('Failed to load project data');
      } finally {
        setIsLoading(false);
      }
    };

    fetchProject();
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

      if (!response.ok) throw new Error('Failed to share project');
      
      const data = await response.json();
      setShareUrl(data.shareUrl);
      toast.success('Share settings updated');
    } catch (error) {
      toast.error('Failed to share project');
      console.error('Error sharing project:', error);
    } finally {
      setIsSharing(false);
    }
  };

  const copyShareUrl = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      toast.success('Share link copied to clipboard');
    } catch (error) {
      toast.error('Failed to copy share link');
    }
  };

  if (isLoading) {
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
          <p className="text-muted-foreground">This project may have been deleted or you don't have access to it.</p>
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
            onClick={() => setIsShareDialogOpen(true)}
            className="gap-2"
          >
            <Share2 className="h-4 w-4" />
            Share
          </Button>
          <Button variant="outline" size="sm" asChild>
            <Link href={`/projects/${project.id}/settings`}>
              <Settings className="h-4 w-4 mr-2" />
              Settings
            </Link>
          </Button>
          <Button size="sm" asChild>
            <Link href={`/projects/${project.id}/flows`}>
              <LayoutDashboard className="h-4 w-4 mr-2" />
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
            <FileJson className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalFlows}</div>
            <div className="flex items-center gap-2">
              <Badge variant="secondary">{stats.publishedFlows} Published</Badge>
              <Badge variant="outline">{stats.draftFlows} Drafts</Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Latest Version</CardTitle>
            <GitBranch className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">v{stats.latestVersion}</div>
            <p className="text-xs text-muted-foreground">
              Total versions: {stats.totalVersions}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">API Usage</CardTitle>
            <Globe2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.apiUsage.total}</div>
            <p className="text-xs text-muted-foreground">
              +{stats.apiUsage.lastWeek} this week
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Variables</CardTitle>
            <Variable className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalVariables}</div>
            <p className="text-xs text-muted-foreground">
              Global project variables
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs defaultValue="flows" className="space-y-4">
        <TabsList>
          <TabsTrigger value="flows" className="gap-2">
            <List className="h-4 w-4" />
            Flows
          </TabsTrigger>
          <TabsTrigger value="activity" className="gap-2">
            <History className="h-4 w-4" />
            Activity
          </TabsTrigger>
          <TabsTrigger value="versions" className="gap-2">
            <GitCommitHorizontal className="h-4 w-4" />
            Versions
          </TabsTrigger>
          <TabsTrigger value="api" className="gap-2">
            <Key className="h-4 w-4" />
            API
          </TabsTrigger>
        </TabsList>

        {/* Flows Tab */}
        <TabsContent value="flows" className="space-y-4">
          <div className="grid gap-4 grid-cols-3">
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
                    <p className="text-xs text-muted-foreground">
                      Version {flow.version} • Updated {new Date(flow.updatedAt).toLocaleDateString()}
                    </p>
                    <div className="mt-2 flex items-center gap-2 text-xs text-muted-foreground">
                      <Variable className="h-3 w-3" />
                      <span>{flow.variables?.length || 0} variables</span>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </TabsContent>

        {/* Activity Tab */}
        <TabsContent value="activity">
          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[400px]">
                {/* Example activity items - replace with real data */}
                {[...Array(10)].map((_, i) => (
                  <div key={i} className="flex items-center gap-4 py-3">
                    <div className="flex-shrink-0">
                      <Users2 className="h-5 w-5 text-muted-foreground" />
                    </div>
                    <div className="flex-1 space-y-1">
                      <p className="text-sm">
                        Flow "Main Flow" was published
                        <span className="text-muted-foreground"> • 2h ago</span>
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Version 2.1.0 released with 3 new nodes
                      </p>
                    </div>
                  </div>
                ))}
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Versions Tab */}
        <TabsContent value="versions">
          <Card>
            <CardHeader>
              <CardTitle>Version History</CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[400px]">
                {/* Example version history - replace with real data */}
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="flex items-center gap-4 py-3">
                    <Badge variant="outline">v2.{5-i}.0</Badge>
                    <div className="flex-1 space-y-1">
                      <p className="text-sm font-medium">Major update with new validation rules</p>
                      <p className="text-xs text-muted-foreground">
                        Published on {new Date().toLocaleDateString()}
                      </p>
                    </div>
                    <Button variant="ghost" size="sm">
                      View Changes
                    </Button>
                  </div>
                  ))}
                  </ScrollArea>
                </CardContent>
              </Card>
            </TabsContent>
    
            {/* API Tab */}
            <TabsContent value="api">
              <Card>
                <CardHeader>
                  <CardTitle>API Configuration</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="font-medium">API Key</div>
                    <code className="relative rounded bg-muted px-[0.3rem] py-[0.2rem] font-mono text-sm">
                      {project.apiKey || 'No API key generated'}
                    </code>
                  </div>
                  <div className="space-y-2">
                    <div className="font-medium">Usage</div>
                    <div className="text-sm text-muted-foreground">
                      <p>Endpoint: <code className="text-primary">https://api.speculate.dev/v1/{project.id}</code></p>
                      <p className="mt-1">Rate limit: 1000 requests per hour</p>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="font-medium">Documentation</div>
                    <p className="text-sm text-muted-foreground">
                      View the API documentation to learn how to integrate with your flows.
                    </p>
                    <Button variant="outline" size="sm">View Documentation</Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
    
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
                      <Globe2 className="h-4 w-4" />
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
    
                {!shareSettings.isPublic && (
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
                      checked={shareSettings.requiresSignin}
                      onCheckedChange={(checked) => 
                        setShareSettings(prev => ({ ...prev, requiresSignin: checked }))
                      }
                    />
                  </div>
                )}
    
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
                        onClick={copyShareUrl}
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ) : (
                  <Button
                    className="w-full"
                    onClick={handleShare}
                    disabled={isSharing}
                  >
                    {isSharing ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Generating Link...
                      </>
                    ) : (
                      <>
                        <Key className="mr-2 h-4 w-4" />
                        Generate Share Link
                      </>
                    )}
                  </Button>
                )}
              </div>
            </DialogContent>
          </Dialog>
        </div>
      );
    }