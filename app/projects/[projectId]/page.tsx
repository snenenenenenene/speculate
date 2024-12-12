"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { GitBranch, Users2, ArrowRight, ArrowLeft } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState, use } from "react";
import Link from "next/link";
import { useStores } from "@/stores/use-stores";

interface ProjectData {
  id: string;
  name: string;
  description: string;
  createdAt: string;
  apiKey: string | null;
  _count: {
    charts: number;
  }
}

interface Flow {
  id: string;
  name: string;
  createdAt: string;
}

export default function ProjectPage({
  params,
}: {
  params: { projectId: string };
}) {
  const projectId = use(params).projectId as string;
  const router = useRouter();
  const [project, setProject] = useState<ProjectData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [flows, setFlows] = useState<Flow[]>([]);
  const { chartStore } = useStores();

  useEffect(() => {
    const fetchProject = async () => {
      try {
        const response = await fetch(`/api/projects/${projectId}`);
        const data = await response.json();
        setProject(data.project);
        
        // Set current project in chartStore
        chartStore.setCurrentProject(data.project);
        
        // Fetch flows
        const flowsResponse = await fetch(`/api/projects/${projectId}/flows`);
        const flowsData = await flowsResponse.json();
        setFlows(flowsData.flows);
        
        // Update chartStore with the fetched flows
        if (flowsData.flows && Array.isArray(flowsData.flows)) {
          chartStore.setFlows(flowsData.flows);
          if (flowsData.flows.length > 0) {
            chartStore.setCurrentDashboardTab(flowsData.flows[0].id);
          }
        }
      } catch (error) {
        console.error("Error fetching project:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProject();
  }, [projectId]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="h-6 w-6 animate-spin" />
      </div>
    );
  }

  if (!project) {
    return (
      <Card className="mx-auto max-w-lg">
        <div className="text-center py-12">
          <h3 className="text-lg font-semibold text-base-800">Project not found</h3>
          <p className="mt-2 text-base-600">The project you're looking for doesn't exist or you don't have access to it.</p>
        </div>
      </Card>
    );
  }

  return (
    <div className="h-full flex flex-col">
      <div className="flex-1 min-h-0">
        <div className="space-y-8 p-8">
          {/* Project Header */}
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-2xl font-semibold tracking-tight">{project.name}</h1>
              <p className="text-sm text-muted-foreground mt-1">
                {project.description}
              </p>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Users2 className="h-4 w-4" />
                <span>3 collaborators</span>
              </div>
              <Button variant="outline" size="sm">
                <GitBranch className="mr-2 h-4 w-4" />
                main
              </Button>
            </div>
          </div>

          {/* Project Stats with Flow Access */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card className="p-4">
              <h3 className="text-sm font-medium">Total Charts</h3>
              <p className="text-2xl font-semibold mt-2">{project?._count?.charts || 0}</p>
              <p className="text-sm text-muted-foreground mt-1">+3 this week</p>
            </Card>
            <Card className="p-4">
              <h3 className="text-sm font-medium">Active Users</h3>
              <p className="text-2xl font-semibold mt-2">12</p>
              <p className="text-sm text-muted-foreground mt-1">+2 this month</p>
            </Card>
            <Card className="p-4">
              <h3 className="text-sm font-medium">API Usage</h3>
              <p className="text-2xl font-semibold mt-2">1.2k</p>
              <p className="text-sm text-muted-foreground mt-1">Requests this week</p>
            </Card>
            <Link 
              href={flows?.length > 0 ? `/projects/${projectId}/flows/${flows[0].id}` : `/projects/${projectId}/flows`}
              className="block"
            >
              <Card className="p-4 h-full hover:bg-muted/50 transition-colors cursor-pointer group">
                <div className="h-full flex flex-col">
                  <h3 className="text-sm font-medium">Flow Editor</h3>
                  <div className="flex-1 flex items-center justify-between mt-2">
                    <p className="text-sm text-muted-foreground">
                      {flows?.length > 0 ? 'Open latest flow' : 'Create new flow'}
                    </p>
                    <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-foreground transition-colors" />
                  </div>
                </div>
              </Card>
            </Link>
          </div>

          {/* Recent Activity */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-medium">Recent Activity</h2>
              <Badge variant="outline">Last 7 days</Badge>
            </div>
            <ScrollArea className="h-[400px]">
              <div className="space-y-4">
                {[
                  "New collaborator added",
                  "API key generated",
                  "Project settings updated",
                  "New chart created",
                  "Collaborator removed",
                  "Project description updated",
                  "API key rotated",
                  "New chart template added"
                ].map((activity, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <div className="w-2 h-2 rounded-full bg-muted-foreground/30 mt-2" />
                    <div>
                      <p className="text-sm">
                        {activity}
                        <span className="text-muted-foreground"> • {2 * (i + 1)}h ago</span>
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </div>
        </div>
      </div>
      <div className="h-16 border-t bg-background flex-shrink-0">
        <div className="flex h-full items-center px-4">
          <Button
            variant="ghost"
            size="sm"
            asChild
            className="gap-2"
          >
            <Link href="/projects">
              <ArrowLeft className="h-4 w-4" />
              Back to Projects
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}