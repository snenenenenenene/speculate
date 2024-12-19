"use client";

import CollaboratorsModal from "@/components/projects/CollaboratorsModal";
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
  Activity,
  Box,
  ChevronRight,
  Home
} from "lucide-react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState, useRef } from "react";
import { toast } from "sonner";
import { APITestRequest, APIUsageStats, APILog, AccessLog } from "@/types/api";
import { PublishDialog } from "@/components/flow/PublishDialog";
import { cn } from "@/lib/utils";
import { ProjectVersionsDialog } from "@/components/projects/ProjectVersionsDialog";
import SettingsModal from "@/components/projects/SettingsModal";
import { FlowAnalytics } from '@/components/flow/FlowAnalytics';
import { formatDistanceToNow } from "date-fns";

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

interface SideNavItem {
  icon: React.ElementType;
  label: string;
  value: string;
  badge?: number;
}

const sideNavItems: SideNavItem[] = [
  { icon: Home, label: "Overview", value: "overview" },
  { icon: FileText, label: "Flows", value: "flows", badge: 0 },
  { icon: Activity, label: "Analytics", value: "analytics" },
  { icon: History, label: "Activity", value: "activity" },
  { icon: GitCommitHorizontal, label: "Versions", value: "versions" },
  { icon: Key, label: "API", value: "api" },
];

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
  const [isPublishDialogOpen, setIsPublishDialogOpen] = useState(false);
  const [isPublishFlowDialogOpen, setIsPublishFlowDialogOpen] = useState(false);
  const [selectedFlowId, setSelectedFlowId] = useState<string | null>(null);
  const [isVersionsDialogOpen, setIsVersionsDialogOpen] = useState(false);
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const [isLoadingActivity, setIsLoadingActivity] = useState(false);

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

  const [activeSection, setActiveSection] = useState("overview");

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

  const handleRegenerateApiKey = async () => {
    try {
      const response = await fetch(`/api/projects/${project?.id}/apiKey`, {
        method: "POST",
      });

      if (!response.ok) throw new Error("Failed to regenerate API key");

      const data = await response.json();
      setProject(prev => prev ? { ...prev, apiKey: data.apiKey } : null);
      toast.success("API key regenerated");
      router.refresh();
    } catch (error) {
      console.error('Error regenerating API key:', error);
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
      console.error('Error deleting project:', error);
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
      case 'FLOW_NODE_ADDED':
        return `added a ${log.metadata?.nodeType} node to flow`;
      case 'FLOW_NODE_REMOVED':
        return `removed a ${log.metadata?.nodeType} node from flow`;
      case 'FLOW_NODE_UPDATED':
        return `updated a ${log.metadata?.nodeType} node in flow`;
      case 'FLOW_EDGE_ADDED':
        return `added a connection in flow`;
      case 'FLOW_EDGE_REMOVED':
        return `removed a connection from flow`;
      case 'FLOW_SETTINGS_UPDATED':
        return `updated flow settings`;
      case 'FLOW_VARIABLE_ADDED':
        return `added variable "${log.metadata?.variable?.name}" to flow`;
      case 'FLOW_VARIABLE_UPDATED':
        return `updated variable "${log.metadata?.variable?.name}" in flow`;
      case 'FLOW_VARIABLE_REMOVED':
        return `removed a variable from flow`;
      default:
        return `performed action ${log.action} on ${entityType}`;
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
      case 'FLOW_NODE_ADDED':
      case 'FLOW_NODE_REMOVED':
      case 'FLOW_NODE_UPDATED':
        return <Box className="h-4 w-4" />;
      case 'FLOW_EDGE_ADDED':
      case 'FLOW_EDGE_REMOVED':
        return <GitBranch className="h-4 w-4" />;
      case 'FLOW_SETTINGS_UPDATED':
        return <Settings className="h-4 w-4" />;
      case 'FLOW_VARIABLE_ADDED':
      case 'FLOW_VARIABLE_UPDATED':
      case 'FLOW_VARIABLE_REMOVED':
        return <Variable className="h-4 w-4" />;
      default:
        return <Activity className="h-4 w-4" />;
    }
  };

  const handleOpenSettings = () => {
    if (!project) return;
    setFormData({
      name: project.name,
      description: project.description || "",
    });
    setIsSettingsOpen(true);
  };

  // Update side nav badges
  useEffect(() => {
    if (flows.length > 0) {
      sideNavItems[1].badge = flows.length;
    }
  }, [flows]);

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
    <div className="flex h-[calc(100vh-4rem)]">
      {/* Side Navigation */}
      <div className="w-64 border-r bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="flex h-full flex-col">
          <div className="space-y-4 py-4">
            <div className="px-3 py-2">
              <h2 className="mb-2 px-4 text-lg font-semibold tracking-tight">
                {project?.name}
              </h2>
              <div className="space-y-1">
                {sideNavItems.map((item) => (
                  <button
                    key={item.value}
                    onClick={() => setActiveSection(item.value)}
                    className={cn(
                      "w-full flex items-center justify-between rounded-md px-4 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground",
                      activeSection === item.value
                        ? "bg-accent text-accent-foreground"
                        : "transparent"
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <item.icon className="h-4 w-4" />
                      {item.label}
                    </div>
                    {item.badge ? (
                      <span className="ml-auto text-xs text-muted-foreground">
                        {item.badge}
                      </span>
                    ) : null}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        <div className="h-full px-8 py-6">
          {/* Header Actions */}
          <div className="mb-8 flex items-center justify-between">
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Link href="/projects" className="hover:text-foreground">
                  Projects
                </Link>
                <ChevronRight className="h-4 w-4" />
                <span className="text-foreground">{project?.name}</span>
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
                onClick={handleOpenSettings}
              >
                <Settings className="h-4 w-4 mr-2" />
                Settings
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsPublishDialogOpen(true)}
              >
                <Globe2 className="h-4 w-4 mr-2" />
                Publish
              </Button>
              <Button
                variant="outline"
                size="sm"
                asChild
              >
                <Link href={`/q/${project?.id}`} target="_blank">
                  <Play className="h-4 w-4 mr-2" />
                  Preview
                </Link>
              </Button>
              <Button size="sm" asChild>
                <Link href={`/projects/${project?.id}/flows`}>
                  <LayoutDashboard className="h-4 w-4 mr-2" />
                  Open Editor
                </Link>
              </Button>
            </div>
          </div>

          {/* Dynamic Content Based on Active Section */}
          {activeSection === "overview" && (
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Overview</CardTitle>
                  <CardDescription>
                    Get a quick overview of your project
                  </CardDescription>
                </CardHeader>
                <CardContent>
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
                </CardContent>
              </Card>
            </div>
          )}

          {activeSection === "flows" && (
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
          )}

          {activeSection === "analytics" && (
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Flow Analytics</CardTitle>
                  <CardDescription>View analytics for all published flows</CardDescription>
                </CardHeader>
                <CardContent>
                  <FlowAnalytics projectId={params.projectId as string} />
                </CardContent>
              </Card>
            </div>
          )}

          {activeSection === "activity" && (
            <Card>
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
                <CardDescription>
                  Track all changes and updates to your project
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[400px]">
                  <div className="space-y-4">
                    {auditLogs.map((log) => {
                      // Skip duplicate consecutive entries
                      if (log.id > 0 && 
                          log.action === auditLogs[log.id - 1].action && 
                          log.userId === auditLogs[log.id - 1].userId &&
                          log.flowId === auditLogs[log.id - 1].flowId &&
                          Math.abs(new Date(log.createdAt).getTime() - new Date(auditLogs[log.id - 1].createdAt).getTime()) < 60000) {
                        return null;
                      }

                      return (
                        <div key={log.id} className="flex items-center gap-4">
                          <Avatar className="h-8 w-8">
                            {log.user?.image ? (
                              <AvatarImage src={log.user.image} alt={log.user.name || ''} />
                            ) : (
                              <AvatarFallback>
                                {log.user?.name?.charAt(0).toUpperCase() || '?'}
                              </AvatarFallback>
                            )}
                          </Avatar>
                          <div className="flex-1 space-y-1">
                            <p className="text-sm">
                              <span className="font-medium">{log.user?.name}</span>{' '}
                              {log.action === 'published' ? 'published' : 'updated'}{' '}
                              <span className="font-medium">flow "{log.flow?.name}"</span>
                            </p>
                            <div className="flex items-center gap-2">
                              <Badge variant="secondary" className="text-xs">
                                {log.action}
                              </Badge>
                              <span className="text-xs text-muted-foreground">
                                {formatDistanceToNow(new Date(log.createdAt), { addSuffix: true })}
                              </span>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          )}

          {activeSection === "versions" && (
            <Card>
              <CardHeader>
                <CardTitle>Flow Versions</CardTitle>
                <CardDescription>
                  Manage and track versions of your flows
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {flows.map((flow) => (
                    <div key={flow.id} className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="text-lg font-semibold">{flow.name}</h3>
                          <p className="text-sm text-muted-foreground">
                            Current version: v{flow.version}
                          </p>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setSelectedFlowId(flow.id);
                            setIsVersionsDialogOpen(true);
                          }}
                        >
                          <History className="h-4 w-4 mr-2" />
                          View History
                        </Button>
                      </div>
                      {flow.versions && flow.versions.length > 0 ? (
                        <div className="space-y-2">
                          {flow.versions.slice(0, 3).map((version) => (
                            <div
                              key={version.id}
                              className="flex items-center justify-between p-4 border rounded-lg"
                            >
                              <div className="space-y-1">
                                <div className="flex items-center gap-2">
                                  <span className="font-medium">v{version.version}</span>
                                  {version.name && (
                                    <Badge variant="outline">{version.name}</Badge>
                                  )}
                                  {flow.activeVersionId === version.id && (
                                    <Badge variant="secondary">Active</Badge>
                                  )}
                                </div>
                                <p className="text-sm text-muted-foreground">
                                  Published {new Date(version.publishedAt || version.createdAt).toLocaleString()}
                                </p>
                              </div>
                              <div className="flex items-center gap-2">
                                {flow.activeVersionId !== version.id && (
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleSetActiveVersion(flow.id, version.id)}
                                  >
                                    <CheckCircle2 className="h-4 w-4 mr-2" />
                                    Set Active
                                  </Button>
                                )}
                              </div>
                            </div>
                          ))}
                          {flow.versions.length > 3 && (
                            <Button
                              variant="link"
                              className="text-sm"
                              onClick={() => {
                                setSelectedFlowId(flow.id);
                                setIsVersionsDialogOpen(true);
                              }}
                            >
                              View all {flow.versions.length} versions
                            </Button>
                          )}
                        </div>
                      ) : (
                        <div className="text-center py-6 text-muted-foreground">
                          No versions published yet
                        </div>
                      )}
                      <Separator />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {activeSection === "api" && (
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
          )}
        </div>
      </div>

      <CollaboratorsModal
        projectId={project?.id}
        isOpen={isCollaboratorsOpen}
        onClose={() => setIsCollaboratorsOpen(false)}
      />

      <ProjectPublishDialog
        open={isPublishDialogOpen}
        onOpenChange={setIsPublishDialogOpen}
        onPublish={handlePublish}
        currentVersion={project?.version || 0}
      />

      <PublishDialog
        open={isPublishFlowDialogOpen}
        onOpenChange={setIsPublishFlowDialogOpen}
        onPublish={handlePublishFlow}
        currentVersion={flows.find(f => f.id === selectedFlowId)?.version || 0}
      />

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

      <ProjectVersionsDialog
        open={isVersionsDialogOpen}
        onOpenChange={setIsVersionsDialogOpen}
        flows={flows}
        onActivateVersion={handleSetActiveVersion}
      />

      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        projectId={params.projectId as string}
        initialData={project ? {
          name: project.name,
          color: project.color || "#18181b",
          onePageMode: project.onePageMode || false,
          variables: [],
          globalVariables: project.variables as Variable[],
          mainStartFlowId: project.mainStartFlowId || null,
          flows: flows.map(flow => ({
            id: flow.id,
            name: flow.name,
            content: flow.content
          }))
        } : null}
      />
    </div>
  );
}