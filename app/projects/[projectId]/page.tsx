// app/projects/[projectId]/page.tsx
"use client";

import { LoadingSpinner } from "@/components/ui/base";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { ArrowRight, Boxes, FileText, KeyRound, Plus, Settings, Users } from "lucide-react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "react-hot-toast";

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

export default function ProjectOverviewPage() {
  const params = useParams();
  const router = useRouter();
  const projectId = params.projectId as string;
  const [project, setProject] = useState<ProjectData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchProject = async () => {
      try {
        const response = await fetch(`/api/projects/${projectId}`);
        const data = await response.json();
        setProject(data.project);
      } catch (error) {
        console.error("Error fetching project:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProject();
  }, [projectId]);

  const handleCreateFlow = () => {
    router.push(`/projects/${projectId}/flows/new`);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <LoadingSpinner className="h-6 w-6 text-primary-600" />
      </div>
    );
  }

  if (!project) {
    return (
      <div className="text-center py-12">
        <h3 className="text-lg font-semibold text-base-800">Project not found</h3>
        <p className="mt-2 text-base-600">The project you're looking for doesn't exist or you don't have access to it.</p>
      </div>
    );
  }

  const stats = [
    {
      name: 'Total Flows',
      value: project._count.charts,
      icon: FileText,
    },
    {
      name: 'API Status',
      value: project.apiKey ? 'Active' : 'Inactive',
      status: project.apiKey ? 'active' : 'inactive',
      icon: KeyRound,
    },
    {
      name: 'Created',
      value: new Date(project.createdAt).toLocaleDateString(),
      icon: Settings,
    },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="bg-white rounded-xl border border-base-200 p-6">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold text-base-900">{project.name}</h1>
            {project.description && (
              <p className="mt-2 text-base-600">{project.description}</p>
            )}
          </div>
          <button
            onClick={() => {/* Open project settings */}}
            className="p-2 text-base-400 hover:text-base-600 hover:bg-base-50 rounded-lg transition-colors"
          >
            <Settings className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {stats.map((stat) => (
          <div
            key={stat.name}
            className="bg-white rounded-xl border border-base-200 p-6"
          >
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-lg bg-base-50">
                <stat.icon className="h-5 w-5 text-base-600" />
              </div>
              <div>
                <p className="text-sm text-base-600">{stat.name}</p>
                <p className="mt-1 text-xl font-semibold text-base-900">
                  {stat.value}
                  {'status' in stat && (
                    <span className={cn(
                      "ml-2 text-sm px-2 py-0.5 rounded-full",
                      stat.status === 'active' ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                    )}>
                      {stat.status}
                    </span>
                  )}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Flow Management Box */}
      <div className="bg-white rounded-xl border border-base-200 p-8">
        {project._count.charts === 0 ? (
          <div className="text-center py-12">
            <Boxes className="mx-auto h-12 w-12 text-base-400" />
            <h3 className="mt-4 text-lg font-medium text-base-900">No flows created yet</h3>
            <p className="mt-1 text-base-600">Start by creating your first flow</p>
            <button
              onClick={handleCreateFlow}
              className={cn(
                "mt-6 inline-flex items-center gap-2 px-6 py-3",
                "bg-primary-600 text-white rounded-lg",
                "hover:bg-primary-700 transition-colors"
              )}
            >
              <Plus className="h-5 w-5" />
              Create Flow
            </button>
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="relative group"
          >
            <Link
              href={`/projects/${projectId}/flows`}
              className={cn(
                "block w-full p-8 rounded-xl text-center",
                "border-2 border-dashed border-base-200",
                "hover:border-primary-200 hover:bg-primary-50/50",
                "transition-all duration-200"
              )}
            >
              <FileText className="mx-auto h-12 w-12 text-primary-600" />
              <h3 className="mt-4 text-lg font-medium text-base-900">
                {project._count.charts} {project._count.charts === 1 ? 'Flow' : 'Flows'} Created
              </h3>
              <p className="mt-2 text-base-600">
                Click to manage your flows
              </p>
              <div className={cn(
                "mt-4 inline-flex items-center gap-2 text-primary-600",
                "font-medium"
              )}>
                Open Flow Editor
                <ArrowRight className="h-4 w-4" />
              </div>
            </Link>
          </motion.div>
        )}
      </div>
    </div>
  );
}