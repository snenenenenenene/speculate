"use client";

import { Dialog } from "@/components/ui/Dialog";
import { LoadingSpinner } from "@/components/ui/base";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { ArrowRight, Boxes, FolderPlus, Key, Plus, Settings } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "react-hot-toast";

interface Project {
  id: string;
  name: string;
  description: string;
  createdAt: string;
  apiKey: string | null;
  _count?: {
    charts: number;
  }
}

export default function ProjectsPage() {
  const router = useRouter();
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [newProjectName, setNewProjectName] = useState("");
  const [newProjectDescription, setNewProjectDescription] = useState("");
  const [isCreating, setIsCreating] = useState(false);

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      const response = await fetch("/api/projects");
      const data = await response.json();
      if (response.ok) {
        setProjects(data.projects);
      } else {
        throw new Error(data.error);
      }
    } catch (error) {
      toast.error("Failed to load projects");
      console.error("Error loading projects:", error);
    } finally {
      setIsLoading(false);
    }
  };

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
          name: newProjectName,
          description: newProjectDescription,
        }),
      });

      const data = await response.json();
      if (response.ok) {
        toast.success("Project created successfully");
        setIsCreateModalOpen(false);
        setNewProjectName("");
        setNewProjectDescription("");
        await fetchProjects();
        router.push(`/projects/${data.project.id}`);
      } else {
        throw new Error(data.error);
      }
    } catch (error) {
      toast.error("Failed to create project");
      console.error("Error creating project:", error);
    } finally {
      setIsCreating(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner className="h-8 w-8 text-primary-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-base-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-2xl font-bold text-base-900">Projects</h1>
            <p className="mt-1 text-base-600">
              Manage your projects and their associated flows
            </p>
          </div>
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className={cn(
              "inline-flex items-center gap-2 px-4 py-2 rounded-lg",
              "bg-primary-600 text-white",
              "hover:bg-primary-700 transition-colors",
              "font-medium text-sm"
            )}
          >
            <Plus className="h-4 w-4" />
            New Project
          </button>
        </div>

        {/* Projects Grid */}
        {projects.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-xl border border-base-200">
            <Boxes className="mx-auto h-12 w-12 text-base-400" />
            <h3 className="mt-4 text-lg font-medium text-base-900">No projects yet</h3>
            <p className="mt-1 text-base-600">Get started by creating your first project</p>
            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="mt-6 inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary-600 text-white hover:bg-primary-700 transition-colors text-sm font-medium"
            >
              <FolderPlus className="h-4 w-4" />
              Create Project
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.map((project) => (
              <motion.div
                key={project.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className={cn(
                  "bg-white rounded-xl border border-base-200",
                  "hover:border-primary-200 transition-all",
                  "group"
                )}
              >
                <div className="p-6">
                  <h3 className="font-semibold text-base-900 group-hover:text-primary-600 transition-colors">
                    {project.name}
                  </h3>
                  {project.description && (
                    <p className="mt-1 text-sm text-base-600">{project.description}</p>
                  )}
                  <div className="mt-4 flex items-center gap-4 text-sm text-base-500">
                    <div className="flex items-center gap-1.5">
                      <Key className="h-4 w-4" />
                      <span>{project.apiKey ? "API Enabled" : "No API Key"}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Settings className="h-4 w-4" />
                      <span>{project._count?.charts || 0} Flows</span>
                    </div>
                  </div>
                  <div className="mt-6 flex items-center justify-between">
                    <span className="text-xs text-base-500">
                      Created {new Date(project.createdAt).toLocaleDateString()}
                    </span>
                    <Link
                      href={`/projects/${project.id}`}
                      className="inline-flex items-center gap-1 text-sm font-medium text-primary-600 hover:text-primary-700"
                    >
                      Open Project
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {/* Create Project Modal */}
        <Dialog open={isCreateModalOpen} onClose={() => setIsCreateModalOpen(false)}>
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full">
            <div className="p-6">
              <h2 className="text-lg font-semibold text-base-900 mb-4">Create New Project</h2>
              <div className="space-y-4">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-base-700 mb-1">
                    Project Name
                  </label>
                  <input
                    type="text"
                    id="name"
                    value={newProjectName}
                    onChange={(e) => setNewProjectName(e.target.value)}
                    placeholder="My Project"
                    className={cn(
                      "w-full px-3 py-2 text-base-900 rounded-lg",
                      "border border-base-300",
                      "focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500",
                      "placeholder:text-base-400"
                    )}
                  />
                </div>
                <div>
                  <label htmlFor="description" className="block text-sm font-medium text-base-700 mb-1">
                    Description (Optional)
                  </label>
                  <textarea
                    id="description"
                    value={newProjectDescription}
                    onChange={(e) => setNewProjectDescription(e.target.value)}
                    placeholder="Project description..."
                    rows={3}
                    className={cn(
                      "w-full px-3 py-2 text-base-900 rounded-lg",
                      "border border-base-300",
                      "focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500",
                      "placeholder:text-base-400",
                      "resize-none"
                    )}
                  />
                </div>
              </div>
            </div>
            <div className="border-t border-base-200 px-6 py-4 bg-base-50 rounded-b-xl flex justify-end gap-3">
              <button
                onClick={() => setIsCreateModalOpen(false)}
                className="px-4 py-2 text-sm font-medium text-base-700 hover:text-base-800"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateProject}
                disabled={isCreating || !newProjectName.trim()}
                className={cn(
                  "px-4 py-2 rounded-lg text-sm font-medium",
                  "bg-primary-600 text-white",
                  "hover:bg-primary-700 transition-colors",
                  "disabled:opacity-50 disabled:cursor-not-allowed",
                  "flex items-center gap-2"
                )}
              >
                {isCreating ? (
                  <>
                    <LoadingSpinner className="h-4 w-4" />
                    Creating...
                  </>
                ) : (
                  <>
                    <Plus className="h-4 w-4" />
                    Create Project
                  </>
                )}
              </button>
            </div>
          </div>
        </Dialog>
      </div>
    </div>
  );
}