// app/projects/[projectId]/page.tsx
"use client";

import { LoadingSpinner } from "@/components/ui/base";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { ArrowRight, Boxes, FileText, Key, Plus, Settings } from "lucide-react";
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

export default function ProjectPage() {
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
        
        if (response.ok) {
          setProject(data.project);
          
          // If project has charts, redirect to editor with first chart
          // Otherwise, go to editor to create new flow
          router.push(`/projects/${projectId}/flows/new`);
        }
      } catch (error) {
        console.error("Error fetching project:", error);
        toast.error("Failed to load project");
      } finally {
        setIsLoading(false);
      }
    };

    fetchProject();
  }, [projectId, router]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <LoadingSpinner className="h-6 w-6 text-primary-600" />
      </div>
    );
  }

  // You could return null here since we'll redirect anyway
  return null;
}