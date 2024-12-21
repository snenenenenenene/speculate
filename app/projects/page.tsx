"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { ArrowRight, Boxes, Plus, Search, Loader2, BarChart2, Clock, FileText, Users2, Building2, User } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface Project {
  id: string;
  name: string;
  description: string;
  _count: {
    charts: number;
    collaborators?: number;
  };
  updatedAt: string;
  status?: "active" | "archived";
  lastActivity?: string;
  version?: string;
  organizationId?: string;
}

const PERSONAL_VALUE = "personal" as const;

export default function ProjectsPage() {
  const router = useRouter();
  const [projects, setProjects] = useState<Project[]>([]);
  const [organizations, setOrganizations] = useState<any[]>([]);
  const [selectedOrgId, setSelectedOrgId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [newProjectName, setNewProjectName] = useState("");
  const [newProjectDescription, setNewProjectDescription] = useState("");
  const [isCreating, setIsCreating] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [projectsRes, orgsRes] = await Promise.all([
          fetch("/api/projects"),
          fetch("/api/organizations"),
        ]);
        
        if (!projectsRes.ok || !orgsRes.ok) throw new Error("Failed to fetch data");
        
        const [projectsData, orgsData] = await Promise.all([
          projectsRes.json(),
          orgsRes.json(),
        ]);

        setProjects(projectsData.projects || []);
        setOrganizations(orgsData.organizations || []);
      } catch (error) {
        console.error("Error loading data:", error);
        toast.error("Failed to load data");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleCreateProject = async () => {
    if (!newProjectName.trim()) {
      toast.error("Project name is required");
      return;
    }

    setIsCreating(true);
    try {
      const response = await fetch("/api/projects", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: newProjectName.trim(),
          description: newProjectDescription.trim(),
          organizationId: selectedOrgId === PERSONAL_VALUE ? null : selectedOrgId,
        }),
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || "Failed to create project");
      }

      toast.success("Project created successfully");
      setIsCreateModalOpen(false);
      setNewProjectName("");
      setNewProjectDescription("");
      
      // Refresh the projects list before navigating
      const projectsRes = await fetch("/api/projects");
      const projectsData = await projectsRes.json();
      setProjects(projectsData.projects || []);

      router.push(`/projects/${data.id}`);
    } catch (error) {
      console.error("Error creating project:", error);
      toast.error("Failed to create project");
    } finally {
      setIsCreating(false);
    }
  };

  const filteredProjects = projects?.filter(project => {
    const matchesSearch = (
      project.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      project.description?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const matchesOrg = selectedOrgId === PERSONAL_VALUE
      ? !project.organizationId
      : project.organizationId === selectedOrgId;

    return matchesSearch && matchesOrg;
  }) || [];

  return (
    <div className="container mx-auto px-4 py-8 md:py-20 max-w-7xl">
      <div className="w-full">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Projects</h1>
            <p className="text-muted-foreground">
              Create and manage your projects
            </p>
          </div>
          <Button onClick={() => setIsCreateModalOpen(true)}>
            <Plus className="mr-2 h-4 w-4" aria-hidden="true" />
            New Project
          </Button>
        </div>

        <div className="mt-8 space-y-4">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
            <div className="relative flex-1">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" aria-hidden="true" />
              <Input
                placeholder="Search projects..."
                className="pl-8"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                aria-label="Search projects"
              />
            </div>
            <Select
              value={selectedOrgId || ""}
              onValueChange={(value) => setSelectedOrgId(value || null)}
            >
              <SelectTrigger className="w-full sm:w-[200px]" aria-label="Select workspace">
                <SelectValue placeholder="Select Workspace" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={PERSONAL_VALUE}>
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4" aria-hidden="true" />
                    <span>Personal</span>
                  </div>
                </SelectItem>
                {organizations.map((org) => (
                  <SelectItem key={org.id} value={org.id || PERSONAL_VALUE}>
                    <div className="flex items-center gap-2">
                      <Building2 className="h-4 w-4" aria-hidden="true" />
                      <span>{org.name}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <ScrollArea className="mt-8 rounded-lg border">
          {loading ? (
            <div className="space-y-4 p-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="p-4 border rounded-lg">
                  <div className="space-y-3">
                    <Skeleton className="h-5 w-1/4" />
                    <Skeleton className="h-4 w-3/4" />
                    <div className="flex gap-4">
                      <Skeleton className="h-4 w-[100px]" />
                      <Skeleton className="h-4 w-[100px]" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : filteredProjects.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-lg border border-dashed p-8 md:p-12">
              <Boxes className="h-12 w-12 text-muted-foreground" aria-hidden="true" />
              <h2 className="mt-4 text-lg font-medium">No projects found</h2>
              <p className="text-sm text-muted-foreground mt-1">
                {searchQuery
                  ? "Try adjusting your search query"
                  : "Get started by creating your first project"}
              </p>
              {!searchQuery && (
                <Button
                  onClick={() => setIsCreateModalOpen(true)}
                  variant="outline"
                  className="mt-6"
                >
                  <Plus className="mr-2 h-4 w-4" aria-hidden="true" />
                  Create Project
                </Button>
              )}
            </div>
          ) : (
            <div className="divide-y">
              {filteredProjects.map((project) => (
                <Link
                  key={project.id}
                  href={`/projects/${project.id}`}
                  className={cn(
                    "block p-4 md:p-6",
                    "hover:bg-muted/50 transition-colors",
                    "group focus:outline-none focus:ring-2 focus:ring-primary"
                  )}
                >
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <h2 className="font-semibold text-lg group-hover:text-primary">
                          {project.name}
                        </h2>
                        {project.status && (
                          <Badge variant={project.status === "active" ? "default" : "secondary"}>
                            {project.status}
                          </Badge>
                        )}
                        {project.version && (
                          <Badge variant="outline" className="text-xs">
                            v{project.version}
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground line-clamp-1">
                        {project.description}
                      </p>
                    </div>
                    <ArrowRight className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" aria-hidden="true" />
                  </div>

                  <div className="mt-4 flex flex-wrap gap-4 md:gap-6 text-sm text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <FileText className="h-4 w-4" aria-hidden="true" />
                      <span>{project._count.charts} {project._count.charts === 1 ? 'flow' : 'flows'}</span>
                    </div>
                    {project._count.collaborators !== undefined && (
                      <div className="flex items-center gap-2">
                        <Users2 className="h-4 w-4" aria-hidden="true" />
                        <span>{project._count.collaborators} {project._count.collaborators === 1 ? 'collaborator' : 'collaborators'}</span>
                      </div>
                    )}
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4" aria-hidden="true" />
                      <span>Updated {new Date(project.updatedAt).toLocaleDateString()}</span>
                    </div>
                    {project.lastActivity && (
                      <div className="flex items-center gap-2">
                        <BarChart2 className="h-4 w-4" aria-hidden="true" />
                        <span>Last activity {new Date(project.lastActivity).toLocaleDateString()}</span>
                      </div>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          )}
        </ScrollArea>
      </div>

      <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Project</DialogTitle>
            <DialogDescription>
              Create a new project to start building your flows.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label htmlFor="name" className="text-sm font-medium">
                Name
              </label>
              <Input
                id="name"
                value={newProjectName}
                onChange={(e) => setNewProjectName(e.target.value)}
                placeholder="My Awesome Project"
              />
            </div>
            <div>
              <label htmlFor="description" className="text-sm font-medium">
                Description
              </label>
              <Input
                id="description"
                value={newProjectDescription}
                onChange={(e) => setNewProjectDescription(e.target.value)}
                placeholder="A brief description of your project"
              />
            </div>
            <div>
              <label htmlFor="organization" className="text-sm font-medium">
                Workspace
              </label>
              <Select
                value={selectedOrgId || ""}
                onValueChange={(value) => setSelectedOrgId(value || null)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select Workspace" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={PERSONAL_VALUE}>
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4" />
                      <span>Personal</span>
                    </div>
                  </SelectItem>
                  {organizations.map((org) => (
                    <SelectItem key={org.id} value={org.id || PERSONAL_VALUE}>
                      <div className="flex items-center gap-2">
                        <Building2 className="h-4 w-4" />
                        <span>{org.name}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsCreateModalOpen(false)}
              disabled={isCreating}
            >
              Cancel
            </Button>
            <Button
              onClick={handleCreateProject}
              disabled={isCreating}
            >
              {isCreating ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating...
                </>
              ) : (
                <>
                  <Plus className="mr-2 h-4 w-4" />
                  Create Project
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}