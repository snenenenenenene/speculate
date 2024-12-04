"use client";

import { useStores } from "@/hooks/useStores";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { Code, FileText, Plus, Settings } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import { toast } from "react-hot-toast";

export default function ProjectPage({ params }: { params: { projectId: string } }) {
  const router = useRouter();
  const { projectStore, utilityStore } = useStores() as any;
  const [loading, setLoading] = useState(true);
  const [isFetching, setIsFetching] = useState(false);

  // Resolve params using React.use
  const resolvedParams = React.use(params);
  const projectId = resolvedParams.projectId;

  useEffect(() => {
    const fetchProject = async () => {
      if (isFetching || (projectStore.currentProject?.id === projectId)) {
        return;
      }

      setIsFetching(true);
      try {
        const response = await fetch(`/api/projects/${projectId}`);
        if (!response.ok) throw new Error('Project not found');
        const project = await response.json();
        projectStore.setCurrentProject(project);
        utilityStore.setProjectId(project.id);
      } catch (error) {
        console.error('Error:', error);
        toast.error("Failed to load project");
        router.push('/dashboard');
      } finally {
        setLoading(false);
        setIsFetching(false);
      }
    };

    fetchProject();
  }, [projectId, projectStore, router, utilityStore, isFetching]);

  const project = projectStore.currentProject;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600" />
      </div>
    );
  }

  if (!project) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Project Header */}
      <header className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">{project.name}</h1>
                {project.description && (
                  <p className="mt-1 text-sm text-gray-500">{project.description}</p>
                )}
              </div>
              <div className="flex items-center gap-4">
                <Link
                  href={`/dashboard/projects/${project.id}/settings`}
                  className={cn(
                    "flex items-center gap-2 px-4 py-2 rounded-lg",
                    "text-gray-700 hover:bg-gray-50",
                    "border border-gray-200",
                    "transition-colors duration-200"
                  )}
                >
                  <Settings className="h-4 w-4" />
                  Settings
                </Link>
              </div>
            </div>

            {/* Project Stats */}
            <div className="mt-6 grid grid-cols-3 gap-6">
              <div className="flex items-center gap-3 bg-gray-50 rounded-lg p-4">
                <FileText className="h-5 w-5 text-gray-400" />
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    {project.flows.length} Flows
                  </p>
                  <p className="text-xs text-gray-500">Total flows in project</p>
                </div>
              </div>

              <div className="flex items-center gap-3 bg-gray-50 rounded-lg p-4">
                <Code className="h-5 w-5 text-gray-400" />
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    {project.apiEnabled ? 'API Enabled' : 'API Disabled'}
                  </p>
                  <p className="text-xs text-gray-500">API status</p>
                </div>
              </div>

              <div className="flex items-center gap-3 bg-gray-50 rounded-lg p-4">
                <div className="flex items-center gap-1">
                  {project.tags.map((tag: string) => (
                    <span
                      key={tag}
                      className="px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-600"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Flows Section */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-lg font-medium text-gray-900">Flows</h2>
          <button
            onClick={() => {
              // Handle new flow creation
              toast.success("Coming soon: New flow creation");
            }}
            className={cn(
              "flex items-center gap-2 px-4 py-2 rounded-lg",
              "bg-primary-600 text-white",
              "hover:bg-primary-700 transition-colors"
            )}
          >
            <Plus className="h-4 w-4" />
            New Flow
          </button>
        </div>

        {project.flows.length === 0 ? (
          <div className="text-center py-12">
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No flows created yet
            </h3>
            <p className="text-gray-500">Create your first flow to get started</p>
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {project.flows.map((flow: any) => (
              <Link
                key={flow.id}
                href={`/dashboard/projects/${project.id}/flows/${flow.id}`}
                className={cn(
                  "group block bg-white rounded-lg shadow-sm border border-gray-200",
                  "hover:shadow-md transition-all duration-200"
                )}
              >
                <div
                  className="h-2 rounded-t-lg"
                  style={{ backgroundColor: flow.color }}
                />
                <div className="p-4">
                  <h3 className="font-medium text-gray-900 group-hover:text-primary-600 transition-colors">
                    {flow.name}
                  </h3>
                  <div className="mt-2 flex items-center gap-4 text-sm text-gray-500">
                    <div className="flex items-center gap-1">
                      <FileText className="h-4 w-4" />
                      <span>Version {flow.version}</span>
                    </div>
                    {flow.isPublished && (
                      <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-700">
                        Published
                      </span>
                    )}
                  </div>
                  <p className="mt-2 text-xs text-gray-400">
                    Last updated {new Date(flow.updatedAt).toLocaleDateString()}
                  </p>
                </div>
              </Link>
            ))}
          </motion.div>
        )}
      </main>
    </div>
  );
}