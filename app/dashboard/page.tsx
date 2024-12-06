"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import { Plus } from "lucide-react";

export default function DashboardPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [projects, setProjects] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      const response = await fetch('/api/projects');
      if (!response.ok) throw new Error('Failed to fetch projects');
      const data = await response.json();
      setProjects(data);
    } catch (error) {
      toast.error('Failed to load projects');
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateProject = async () => {
    if (!session?.user?.email || isCreating) return;

    try {
      setIsCreating(true);
      const response = await fetch('/api/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: 'New Project',
          description: '',
          color: '#3B82F6',
        }),
      });

      if (!response.ok) throw new Error('Failed to create project');
      
      const project = await response.json();
      await fetchProjects();
      router.push(`/dashboard/projects/${project.id}`);
    } catch (error) {
      toast.error('Failed to create project');
      console.error(error);
    } finally {
      setIsCreating(false);
    }
  };

  if (!session) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-4rem)]">
        <p>Please sign in to view your projects</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold">Projects</h1>
        <button
          onClick={handleCreateProject}
          disabled={isCreating}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
        >
          <Plus className="h-5 w-5" />
          {isCreating ? 'Creating...' : 'New Project'}
        </button>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
        </div>
      ) : projects.length === 0 ? (
        <div className="text-center py-16">
          <h3 className="text-lg font-medium text-gray-900 mb-2">No projects found</h3>
          <p className="text-gray-600">Create your first project to get started</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((project: any) => (
            <a
              key={project.id}
              href={`/dashboard/projects/${project.id}`}
              className="block p-6 bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow"
            >
              <div className="h-2 rounded-t-xl mb-4" style={{ backgroundColor: project.color }} />
              <h3 className="text-lg font-semibold text-gray-900">{project.name}</h3>
              {project.description && (
                <p className="mt-2 text-sm text-gray-600">{project.description}</p>
              )}
            </a>
          ))}
        </div>
      )}
    </div>
  );
}