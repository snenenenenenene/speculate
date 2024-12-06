"use client";

import { useSession } from "next-auth/react";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "react-hot-toast";

export default function ProjectPage() {
  const { data: session } = useSession();
  const params = useParams();
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!params.projectId) return;
    fetchProject();
  }, [params.projectId]);

  const fetchProject = async () => {
    try {
      const response = await fetch(`/api/projects/${params.projectId}`);
      if (!response.ok) throw new Error('Failed to fetch project');
      const data = await response.json();
      setProject(data);
    } catch (error) {
      toast.error('Failed to load project');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  if (!session) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-4rem)]">
        <p>Please sign in to view this project</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-4rem)]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
      </div>
    );
  }

  if (!project) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-4rem)]">
        <p>Project not found</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold">{project.name}</h1>
        {project.description && (
          <p className="mt-2 text-gray-600">{project.description}</p>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {project.flows?.map((flow: any) => (
          <a
            key={flow.id}
            href={`/dashboard/projects/${project.id}/flows/${flow.id}`}
            className="block p-6 bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow"
          >
            <h3 className="text-lg font-semibold text-gray-900">{flow.name || 'Untitled Flow'}</h3>
            {flow.description && (
              <p className="mt-2 text-sm text-gray-600">{flow.description}</p>
            )}
          </a>
        ))}
      </div>

      {(!project.flows || project.flows.length === 0) && (
        <div className="text-center py-16">
          <h3 className="text-lg font-medium text-gray-900 mb-2">No flows found</h3>
          <p className="text-gray-600">Create your first flow to get started</p>
        </div>
      )}
    </div>
  );
}