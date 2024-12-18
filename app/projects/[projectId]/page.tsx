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
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card";
import { ProjectPublishDialog } from "@/components/projects/ProjectPublishDialog";
import {
  FileJson,
  GitBranch,
  GitCommitHorizontal,
  Globe2,
  History,
  Key,
  LayoutDashboard,
  List,
  Settings,
  Users2,
  Variable,
  Copy,
  RefreshCw,
  Plus,
  Trash2,
  Share2,
  Loader2,
  Clock,
  FileText,
  CodeSquare,
  Play,
  CheckCircle2,
  Pencil,
  EyeOff,
  UserPlus,
  UserMinus,
  GitCommit,
  Activity
} from "lucide-react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState, useRef } from "react";
import { toast } from "sonner";
import { APITestRequest, APIUsageStats, APILog, AccessLog } from "@/types/api";
import { PublishDialog } from "@/components/flow/PublishDialog";
import { cn } from "@/lib/utils";
import { ProjectVersionsDialog } from "@/components/projects/ProjectVersionsDialog";

interface ShareSettings {
  isPublic: boolean;
  requiresSignin: boolean;
  allowedDomains: string[];
  allowComments: boolean;
  accessLevel: 'view' | 'edit' | 'comment';
}

interface Collaborator {
  id: string;
  projectId: string;
  userId: string;
  role: string;
  createdAt: string;
  updatedAt: string;
  user: {
    id: string;
    name: string;
    email: string;
    image: string;
  };
}

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
  description?: string;
  content: string;
  isPublished: boolean;
  version: number;
  updatedAt: string;
  publishedAt?: string;
  variables: any[];
  versions?: Version[];
  activeVersion?: Version;
  activeVersionId?: string;
}

interface Project {
  id: string;
  name: string;
  description: string;
  apiKey: string | null;
  isPublic: boolean;
  isPublished: boolean;
  publishedAt?: string;
  updatedAt: string;
  activeFlows?: {
    id: string;
    name: string;
    version: number;
  }[];
  _count: {
    charts: number;
    collaborators: number;
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

export default function ProjectPage() {
  const router = useRouter();
  const params = useParams();
  const [project, setProject] = useState<Project | null>(null);
  const [owner, setOwner] = useState<{ name: string; email: string; image: string; } | null>(null);
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
  const [isCollaboratorsOpen, setIsCollaboratorsOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isShareDialogOpen, setIsShareDialogOpen] = useState(false);
  const [isPublishDialogOpen, setIsPublishDialogOpen] = useState(false);
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

  const [apiUsageStats, setApiUsageStats] = useState<APIUsageStats | null>(null);
  const [apiLogs, setApiLogs] = useState<APILog[]>([]);
  const [accessLogs, setAccessLogs] = useState<AccessLog[]>([]);
  const [isLoadingUsage, setIsLoadingUsage] = useState(false);
  const [testRequest, setTestRequest] = useState<APITestRequest>({
    endpoint: '',
    method: 'GET',
    body: '{}'
  });
  const [testResponse, setTestResponse] = useState<string>('');
  const [isTestingApi, setIsTestingApi] = useState(false);
  const [isPublishFlowDialogOpen, setIsPublishFlowDialogOpen] = useState(false);
  const [selectedFlowId, setSelectedFlowId] = useState<string | null>(null);
  const [isVersionsDialogOpen, setIsVersionsDialogOpen] = useState(false);
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const [isLoadingActivity, setIsLoadingActivity] = useState(false);

  useEffect(() => {
    const fetchProject = async () => {
      try {
        setIsLoading(true);
        const [projectResponse, ownerResponse, flowsResponse] = await Promise.all([
          fetch(`/api/projects/${params.projectId}`),
          fetch(`/api/users/${params.projectId}/owner`),
          fetch(`/api/projects/${params.projectId}/flows`)
        ]);

        console.log('Project response status:', projectResponse.status);
        console.log('Flows response status:', flowsResponse.status);

        if (!projectResponse.ok) {
          console.error('Failed to fetch project:', await projectResponse.text());
          throw new Error('Failed to fetch project data');
        }

        if (!flowsResponse.ok) {
          console.error('Failed to fetch flows:', await flowsResponse.text());
          throw new Error('Failed to fetch flows data');
        }

        const projectData = await projectResponse.json();
        const flowsData = await flowsResponse.json();

        console.log('Fetched project data:', projectData);
        console.log('Fetched flows data:', flowsData);
        console.log('Flows with versions:', flowsData.flows.map(f => ({
          id: f.id,
          name: f.name,
          isPublished: f.isPublished,
          version: f.version,
          versionsCount: f.versions?.length || 0,
          versions: f.versions
        })));

        if (!projectData.project) {
          throw new Error('Project data is missing');
        }

        setProject(projectData.project);
        setFlows(flowsData.flows || []);

        if (ownerResponse.ok) {
          const ownerData = await ownerResponse.json();
          setOwner(ownerData.user);
        }

        // Calculate stats
        const publishedFlows = flowsData.flows?.filter((f: Flow) => f.isPublished) || [];
        setStats({
          totalFlows: flowsData.flows?.length || 0,
          publishedFlows: publishedFlows.length,
          draftFlows: (flowsData.flows?.length || 0) - publishedFlows.length,
          totalVersions: flowsData.flows?.reduce((acc: number, flow: Flow) => acc + (flow.versions?.length || 0), 0) || 0,
          latestVersion: Math.max(...(flowsData.flows?.map((f: Flow) => f.version) || [0])),
          totalVariables: projectData.project.variables?.length || 0,
          apiUsage: {
            total: 1250,
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

    if (params.projectId) {
      fetchProject();
    }
  }, [params.projectId]);

  useEffect(() => {
    const fetchActivityLogs = async () => {
      try {
        setIsLoadingActivity(true);
        const response = await fetch(`/api/projects/${params.projectId}/activity`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch activity logs');
        }

        const data = await response.json();
        setAuditLogs(data.auditLogs);
      } catch (error) {
        console.error('Error fetching activity logs:', error);
        toast.error('Failed to load activity logs');
      } finally {
        setIsLoadingActivity(false);
      }
    };

    if (params.projectId) {
      fetchActivityLogs();
    }
  }, [params.projectId]);

  const fetchAPIUsage = async () => {
    try {
      setIsLoadingUsage(true);
      const response = await fetch(`/api/projects/${params.projectId}/usage`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch API usage');
      }

      const data = await response.json();
      setApiUsageStats(data.stats);
      setApiLogs(data.apiLogs);
      setAccessLogs(data.accessLogs);
    } catch (error) {
      console.error('Error fetching API usage:', error);
      toast.error('Failed to load API usage data');
    } finally {
      setIsLoadingUsage(false);
    }
  };

  useEffect(() => {
    if (project?.id) {
      fetchAPIUsage();
    }
  }, [project?.id]);

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

  const handlePublish = async () => {
    try {
      const response = await fetch(`/api/projects/${project?.id}/publish`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data?.error || 'Failed to publish project');
      }

      const data = await response.json();
      
      // Update project with new published state
      if (project && data.project) {
        setProject({
          ...project,
          isPublished: true,
          publishedAt: data.project.publishedAt,
          activeFlows: data.project.activeFlows
        });
      }

      toast.success('Project published successfully');
      router.refresh();
    } catch (error) {
      console.error('Error publishing project:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to publish project');
    }
  };

  const handleTestApi = async () => {
    if (!project?.apiKey) {
      toast.error('No API key available');
      return;
    }

    try {
      setIsTestingApi(true);
      const response = await fetch(`/api/v1/${project.id}`, {
        headers: {
          'Authorization': `Bearer ${project.apiKey}`
        }
      });

      const data = await response.json();
      setTestResponse(JSON.stringify(data, null, 2));
      
      if (!response.ok) {
        toast.error(`API test failed: ${data.error || 'Unknown error'}`);
      } else {
        toast.success('API test successful');
      }
    } catch (error) {
      console.error('Error testing API:', error);
      toast.error('Failed to test API');
      setTestResponse(JSON.stringify({ error: 'Failed to test API' }, null, 2));
    } finally {
      setIsTestingApi(false);
    }
  };

  const handlePublishFlow = async (flowId: string) => {
    try {
      const response = await fetch(`/api/projects/${project?.id}/flows/${flowId}/publish`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data?.error || 'Failed to publish flow');
      }

      const data = await response.json();
      
      // Update flows with new version data
      setFlows(currentFlows => 
        currentFlows.map(flow => 
          flow.id === flowId
            ? {
                ...flow,
                isPublished: true,
                publishedAt: data.flow.publishedAt,
                version: data.flow.version,
                versions: [data.flow.version, ...(flow.versions || [])]
              }
            : flow
        )
      );

      toast.success('Flow published successfully');
    } catch (error) {
      console.error('Error publishing flow:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to publish flow');
    }
  };

  const handleSetActiveVersion = async (flowId: string, versionId: string) => {
    try {
      const response = await fetch(
        `/api/projects/${project?.id}/flows/${flowId}/versions/${versionId}/activate`,
        { method: 'POST' }
      );

      if (!response.ok) {
        throw new Error('Failed to set active version');
      }

      const data = await response.json();
      
      // Update flows with new active version
      setFlows(currentFlows => 
        currentFlows.map(flow => 
          flow.id === flowId
            ? { ...flow, activeVersionId: versionId }
            : flow
        )
      );

      toast.success('Active version updated');
    } catch (error) {
      toast.error('Failed to update active version');
    }
  };

  const getActivityIcon = (action: string) => {
    switch (action) {
      case 'CREATED':
        return <Plus className="h-4 w-4" />;
      case 'UPDATED':
        return <Pencil className="h-4 w-4" />;
      case 'DELETED':
        return <Trash2 className="h-4 w-4" />;
      case 'PUBLISHED':
        return <Globe2 className="h-4 w-4" />;
      case 'UNPUBLISHED':
        return <EyeOff className="h-4 w-4" />;
      case 'COLLABORATOR_ADDED':
        return <UserPlus className="h-4 w-4" />;
      case 'COLLABORATOR_REMOVED':
        return <UserMinus className="h-4 w-4" />;
      case 'VERSION_CREATED':
        return <GitCommit className="h-4 w-4" />;
      case 'API_KEY_GENERATED':
        return <Key className="h-4 w-4" />;
      case 'SHARE_CREATED':
        return <Share2 className="h-4 w-4" />;
      default:
        return <Activity className="h-4 w-4" />;
    }
  };

  const getActivityDescription = (log: any) => {
    const entityType = log.entityType.toLowerCase();
    switch (log.action) {
      case 'CREATED':
        return `created a new ${entityType}`;
      case 'UPDATED':
        return `updated ${entityType} settings`;
      case 'DELETED':
        return `deleted a ${entityType}`;
      case 'PUBLISHED':
        return `published ${entityType} "${log.metadata?.name || ''}"`;
      case 'UNPUBLISHED':
        return `unpublished ${entityType} "${log.metadata?.name || ''}"`;
      case 'COLLABORATOR_ADDED':
        return `added ${log.metadata?.collaborator?.name || 'a user'} as a collaborator`;
      case 'COLLABORATOR_REMOVED':
        return `removed ${log.metadata?.collaborator?.name || 'a user'} from collaborators`;
      case 'VERSION_CREATED':
        return `created version ${log.metadata?.version} of ${entityType} "${log.metadata?.name || ''}"`;
      case 'API_KEY_GENERATED':
        return 'generated a new API key';
      case 'SHARE_CREATED':
        return `created a share link for ${entityType}`;
      default:
        return `performed action ${log.action} on ${entityType}`;
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
          <p className="text-muted-foreground">
            This project may have been deleted or you don't have access to it.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full p-8">
      {/* Header */}
      <div className="flex items-center justify-between border-b pb-4 mb-4">
        <div className="flex items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold">{project?.name}</h1>
            <p className="text-sm text-muted-foreground">
              {project?.description || "No description"}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsCollaboratorsOpen(true)}
          >
            <Users2 className="h-4 w-4 mr-2" />
            Team
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsSettingsOpen(true)}
          >
            <Settings className="h-4 w-4 mr-2" />
            Settings
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsShareDialogOpen(true)}
          >
            <Share2 className="h-4 w-4 mr-2" />
            Share
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsPublishDialogOpen(true)}
          >
            <Globe2 className="h-4 w-4 mr-2" />
            Publish
          </Button>
          <Button size="sm" asChild>
            <Link href={`/projects/${project?.id}/flows`}>
              <LayoutDashboard className="h-4 w-4 mr-2" />
              Open Editor
            </Link>
          </Button>
        </div>
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto pr-4">
        {/* Stats Grid */}
        <div className="grid gap-4 md:grid-cols-4 mb-4">
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

        {/* Main Content */}
        <Tabs defaultValue="flows" className="space-y-4">
          <TabsList className="bg-background sticky top-0 z-10">
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
                      <div className="flex items-center gap-2">
                        {flow.isPublished ? (
                          <div className="flex items-center gap-2">
                            <Badge variant="outline" className="text-xs">
                              {flow.versions?.length || 0} versions
                            </Badge>
                            {flow.activeVersionId && (
                              <Badge variant="secondary" className="text-xs">
                                v{flow.version} active
                              </Badge>
                            )}
                          </div>
                        ) : (
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              setSelectedFlowId(flow.id);
                              setIsPublishFlowDialogOpen(true);
                            }}
                          >
                            <Globe2 className="h-4 w-4 mr-1" />
                            Publish
                          </Button>
                        )}
                      </div>
                    </CardHeader>
                    <CardContent>
                      {flow.description && (
                        <p className="text-sm text-muted-foreground mb-2">
                          {flow.description}
                        </p>
                      )}
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        {flow.isPublished && flow.activeVersionId && (
                          <div className="flex items-center gap-1">
                            <CheckCircle2 className="h-4 w-4 text-primary" />
                            <span>Active</span>
                          </div>
                        )}
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
          </TabsContent>

          {/* Activity Tab */}
          <TabsContent value="activity">
            <Card>
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
                <CardDescription>
                  Track all changes and updates to your project
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[600px] pr-4">
                  {isLoadingActivity ? (
                    <div className="flex items-center justify-center h-40">
                      <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                    </div>
                  ) : auditLogs.length > 0 ? (
                    <div className="space-y-4">
                      {auditLogs.map((log) => (
                        <div key={log.id} className="flex items-start gap-4">
                          <div className="mt-1">
                            <Avatar className="h-8 w-8">
                              <AvatarImage src={log.user.image} />
                              <AvatarFallback>
                                {log.user.name?.charAt(0) || log.user.email?.charAt(0)}
                              </AvatarFallback>
                            </Avatar>
                          </div>
                          <div className="flex-1 space-y-1">
                            <div className="flex items-center gap-2">
                              <p className="text-sm">
                                <span className="font-medium">{log.user.name}</span>
                                {' '}
                                {getActivityDescription(log)}
                              </p>
                              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                <span>•</span>
                                <HoverCard>
                                  <HoverCardTrigger>
                                    <time className="cursor-help">
                                      {new Date(log.createdAt).toLocaleDateString()}
                                    </time>
                                  </HoverCardTrigger>
                                  <HoverCardContent side="top" className="w-auto">
                                    {new Date(log.createdAt).toLocaleString()}
                                  </HoverCardContent>
                                </HoverCard>
                              </div>
                            </div>
                            {log.metadata?.description && (
                              <p className="text-sm text-muted-foreground">
                                {log.metadata.description}
                              </p>
                            )}
                            <div className="flex items-center gap-2">
                              <Badge 
                                variant="outline" 
                                className="text-xs"
                              >
                                <div className="flex items-center gap-1">
                                  {getActivityIcon(log.action)}
                                  <span>{log.action.toLowerCase()}</span>
                                </div>
                              </Badge>
                              <Badge 
                                variant="secondary" 
                                className="text-xs"
                              >
                                {log.entityType.toLowerCase()}
                              </Badge>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center h-40 text-center">
                      <Activity className="h-8 w-8 text-muted-foreground mb-4" />
                      <p className="text-lg font-medium">No activity yet</p>
                      <p className="text-sm text-muted-foreground">
                        Actions and changes will be shown here
                      </p>
                    </div>
                  )}
                </ScrollArea>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Versions Tab */}
          <TabsContent value="versions">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Version History</CardTitle>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsVersionsDialogOpen(true)}
                >
                  <History className="h-4 w-4 mr-2" />
                  Manage Versions
                </Button>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[600px] pr-4">
                  {flows?.some(f => f.versions && f.versions.length > 0) ? (
                    <div className="space-y-8">
                      {flows.map(flow => flow.versions && flow.versions.length > 0 && (
                        <div key={flow.id} className="space-y-4">
                          <div className="flex items-center justify-between">
                            <h3 className="text-lg font-semibold">{flow.name}</h3>
                            <div className="flex items-center gap-2">
                              <Badge variant="outline" className="text-xs">
                                {flow.isPublished ? `${flow.versions?.length || 0} versions` : "Draft"}
                              </Badge>
                              {flow.activeVersionId && (
                                <Badge variant="secondary" className="text-xs">
                                  v{flow.version} active
                                </Badge>
                              )}
                            </div>
                          </div>
                          
                          {/* Show only the latest 3 versions in the tab view */}
                          {flow.versions.slice(0, 3).map((version) => (
                            <div key={version.id} 
                              className={cn(
                                "flex items-center gap-4 p-4 rounded-lg border",
                                flow.activeVersionId === version.id && "bg-muted"
                              )}
                            >
                              <div className="flex items-center gap-3">
                                {flow.activeVersionId === version.id && (
                                  <div className="text-xs text-muted-foreground">
                                    <CheckCircle2 className="h-4 w-4 text-primary" />
                                  </div>
                                )}
                                <Badge variant="outline" className="font-mono">v{version.version}</Badge>
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2">
                                  <p className="text-sm font-medium truncate">
                                    {version.name || `Version ${version.version}`}
                                  </p>
                                </div>
                                {version.metadata?.description && (
                                  <p className="text-sm text-muted-foreground truncate mt-0.5">
                                    {version.metadata.description}
                                  </p>
                                )}
                                <div className="flex items-center gap-2 mt-1">
                                  <p className="text-xs text-muted-foreground">
                                    Published {new Date(version.createdAt).toLocaleDateString()}
                                  </p>
                                  <span className="text-xs text-muted-foreground">•</span>
                                  <p className="text-xs text-muted-foreground">
                                    by {version.createdBy.name}
                                  </p>
                                </div>
                              </div>
                              <div className="flex items-center gap-2 ml-4">
                                {flow.activeVersionId !== version.id && (
                                  <Button 
                                    variant="ghost" 
                                    size="sm"
                                    onClick={() => handleSetActiveVersion(flow.id, version.id)}
                                  >
                                    Set Active
                                  </Button>
                                )}
                              </div>
                            </div>
                          ))}
                          {flow.versions.length > 3 && (
                            <Button
                              variant="ghost"
                              className="w-full text-sm text-muted-foreground mt-2"
                              onClick={() => setIsVersionsDialogOpen(true)}
                            >
                              View {flow.versions.length - 3} more versions
                            </Button>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center h-[400px] text-center">
                      <GitBranch className="h-8 w-8 text-muted-foreground mb-4" />
                      <p className="text-lg font-medium">No versions yet</p>
                      <p className="text-sm text-muted-foreground">
                        Publish your flows to create versions
                      </p>
                    </div>
                  )}
                </ScrollArea>
              </CardContent>
            </Card>
          </TabsContent>

          {/* API Tab */}
          <TabsContent value="api">
            <div className="grid gap-4 grid-cols-1">
              <Card>
                <CardHeader>
                  <CardTitle>API Configuration</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-2">
                    <div className="font-medium">API Key</div>
                    <div className="flex items-center gap-2">
                      <code className="flex-1 relative rounded bg-muted px-[0.3rem] py-[0.2rem] font-mono text-sm">
                        {project.apiKey || 'No API key generated'}
                      </code>
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
                      <Button
                        size="icon"
                        onClick={handleRegenerateApiKey}
                      >
                        <RefreshCw className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="font-medium">Usage Statistics</div>
                    {isLoadingUsage ? (
                      <div className="h-[100px] flex items-center justify-center">
                        <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-primary"></div>
                      </div>
                    ) : (
                      <div className="grid gap-4 grid-cols-3">
                        <Card>
                          <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium">Total Requests</CardTitle>
                          </CardHeader>
                          <CardContent>
                            <div className="text-2xl font-bold">{apiUsageStats?.total || 0}</div>
                            <p className="text-xs text-muted-foreground">
                              All time API requests
                            </p>
                          </CardContent>
                        </Card>

                        <Card>
                          <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium">Recent Activity</CardTitle>
                          </CardHeader>
                          <CardContent>
                            <div className="text-2xl font-bold">{apiUsageStats?.lastWeek || 0}</div>
                            <p className="text-xs text-muted-foreground">
                              Requests in last 7 days
                            </p>
                          </CardContent>
                        </Card>

                        <Card>
                          <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium">Unique Users</CardTitle>
                          </CardHeader>
                          <CardContent>
                            <div className="text-2xl font-bold">{apiUsageStats?.uniqueUsers || 0}</div>
                            <p className="text-xs text-muted-foreground">
                              Distinct API consumers
                            </p>
                          </CardContent>
                        </Card>
                      </div>
                    )}
                  </div>

                  <div className="space-y-2">
                    <div className="font-medium">API Tester</div>
                    <Card>
                      <CardContent className="pt-6">
                        <div className="grid gap-4">
                          <div className="grid gap-2">
                            <Label>Test API Endpoint</Label>
                            <div className="flex gap-2">
                              <code className="flex items-center rounded bg-muted px-[0.3rem] py-[0.2rem] font-mono text-sm">
                                GET /api/v1/{project.id}
                              </code>
                              <Button 
                                onClick={handleTestApi} 
                                disabled={isTestingApi || !project?.apiKey}
                                size="sm"
                              >
                                {isTestingApi ? (
                                  <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                  <Play className="h-4 w-4" />
                                )}
                              </Button>
                            </div>
                          </div>

                          {testResponse && (
                            <div className="grid gap-2">
                              <Label>Response</Label>
                              <ScrollArea className="h-[200px] w-full rounded-md border">
                                <pre className="p-4 text-sm">
                                  {testResponse}
                                </pre>
                              </ScrollArea>
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  <div className="space-y-2">
                    <div className="font-medium">API Documentation</div>
                    <div className="space-y-4">
                      <div>
                        <h4 className="text-sm font-medium mb-2">Base URL</h4>
                        <code className="relative rounded bg-muted px-[0.3rem] py-[0.2rem] font-mono text-sm">
                          /api/v1/{project.id}
                        </code>
                      </div>
                      
                      <div>
                        <h4 className="text-sm font-medium mb-2">Available Endpoints</h4>
                        <div className="space-y-4">
                          <div>
                            <code className="relative rounded bg-muted px-[0.3rem] py-[0.2rem] font-mono text-sm">
                              GET /api/v1/{project.id}
                            </code>
                            <p className="text-sm text-muted-foreground mt-1">
                              Get project data including all flows
                            </p>
                            <div className="mt-2">
                              <p className="text-sm font-medium">Example Response:</p>
                              <pre className="mt-1 p-2 rounded bg-muted text-xs font-mono overflow-x-auto">
{`{
  "project": {
    "id": "project-id",
    "name": "Project Name",
    "description": "Project Description",
    "isPublic": true,
    "updatedAt": "2024-01-01T00:00:00.000Z",
    "stats": {
      "flows": 2,
      "collaborators": 3
    },
    "flows": [
      {
        "id": "flow-id",
        "name": "Flow Name",
        "content": {
          "nodes": [],
          "edges": [],
          "viewport": {
            "x": 0,
            "y": 0,
            "zoom": 1
          }
        },
        "version": 1,
        "updatedAt": "2024-01-01T00:00:00.000Z",
        "publishedAt": "2024-01-01T00:00:00.000Z",
        "variables": [],
        "isPublished": true,
        "color": "#80B500",
        "onePageMode": false
      }
    ]
  }
}`}
                              </pre>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div>
                        <h4 className="text-sm font-medium mb-2">Authentication</h4>
                        <p className="text-sm text-muted-foreground mb-2">
                          Include your API key in the request headers:
                        </p>
                        <code className="block relative rounded bg-muted px-[0.3rem] py-[0.2rem] font-mono text-sm">
                          Authorization: Bearer {project.apiKey || 'your-api-key'}
                        </code>
                      </div>

                      <div>
                        <h4 className="text-sm font-medium mb-2">Rate Limits</h4>
                        <p className="text-sm text-muted-foreground">
                          • 1,000 requests per hour<br />
                          • 10,000 requests per day<br />
                          • Maximum payload size: 5MB
                        </p>
                      </div>

                      <Button variant="outline" size="sm" asChild>
                        <Link href="/docs/api" target="_blank">
                          View Full Documentation
                        </Link>
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="font-medium">Recent Activity</div>
                    <Card>
                      <ScrollArea className="h-[300px]">
                        <div className="p-4 space-y-4">
                          {accessLogs.map((log) => (
                            <div key={log.id} className="flex items-start gap-4 border-b last:border-0 pb-4">
                              <div className="flex-shrink-0">
                                <Globe2 className="h-5 w-5 text-muted-foreground" />
                              </div>
                              <div className="flex-1 space-y-1">
                                <p className="text-sm">
                                  {log.user ? (
                                    <span className="font-medium">{log.user.name}</span>
                                  ) : (
                                    <span className="font-medium">{log.ipAddress}</span>
                                  )}
                                  <span className="text-muted-foreground"> • {new Date(log.accessedAt).toLocaleString()}</span>
                                </p>
                                {log.userAgent && (
                                  <p className="text-xs text-muted-foreground">
                                    {log.userAgent}
                                  </p>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </ScrollArea>
                    </Card>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Modals */}
      <CollaboratorsModal
        projectId={project?.id}
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
                      value={project?.apiKey || "No API key generated"}
                      readOnly
                    />
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => {
                        if (project?.apiKey) {
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
                  {project?.variables?.length > 0 ? (
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

      {/* Publish Dialog */}
      <ProjectPublishDialog
        open={isPublishDialogOpen}
        onOpenChange={setIsPublishDialogOpen}
        onPublish={handlePublish}
        currentVersion={project?.version || 0}
      />

      {/* Publish Flow Dialog */}
      <PublishDialog
        open={isPublishFlowDialogOpen}
        onOpenChange={setIsPublishFlowDialogOpen}
        onPublish={handlePublishFlow}
        currentVersion={flows.find(f => f.id === selectedFlowId)?.version || 0}
      />

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

      {/* Add ProjectVersionsDialog */}
      <ProjectVersionsDialog
        open={isVersionsDialogOpen}
        onOpenChange={setIsVersionsDialogOpen}
        flows={flows}
        onActivateVersion={handleSetActiveVersion}
      />
    </div>
  );
}