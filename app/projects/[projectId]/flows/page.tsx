"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function FlowsPage() {
  const router = useRouter();
  const params = useParams();
  const { projectId } = params;
  const [showForm, setShowForm] = useState(false);
  const [flowName, setFlowName] = useState("");

  useEffect(() => {
    const fetchAndRedirect = async () => {
      try {
        const response = await fetch(`/api/projects/${projectId}/flows`);
        const data = await response.json();
        
        if (response.ok && data.flows && data.flows.length > 0) {
          router.push(`/projects/${projectId}/flows/${data.flows[0].id}`);
        } else {
          setShowForm(true);
        }
      } catch (error) {
        console.error("Error fetching flows:", error);
      }
    };

    fetchAndRedirect();
  }, [projectId, router]);

  const handleCreateFlow = async () => {
    try {
      const response = await fetch(`/api/projects/${projectId}/flows`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name: flowName }),
      });

      if (response.ok) {
        const data = await response.json();
        router.push(`/projects/${projectId}/flows/${data.flow.id}`);
      }
    } catch (error) {
      console.error("Error creating flow:", error);
    }
  };

  if (!showForm) {
    return null;
  }

  return (
    <div className="flex h-screen w-full items-center justify-center bg-background p-4">
      <div className="w-full px-4">
        <div className="text-center">
          <h2 className="mt-6 text-3xl font-bold tracking-tight">Create Your First Flow</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            No flows found in this project. Create your first flow to get started.
          </p>
        </div>
        <div className="mt-8 space-y-6">
          <div>
            <Input
              value={flowName}
              onChange={(e) => setFlowName(e.target.value)}
              placeholder="Enter flow name"
              className="block w-full"
            />
          </div>
          <div>
            <Button 
              onClick={handleCreateFlow} 
              disabled={!flowName.trim()}
              className="w-full"
            >
              Create Flow
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}