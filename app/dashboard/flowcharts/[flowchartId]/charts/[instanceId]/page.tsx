"use client";

import { useStores } from "@/hooks/useStores";
import { generateChart } from "@/lib/ai-service";
import { useRouter } from "next/navigation";
import React, { useCallback, useEffect, useState } from "react";
import { Toaster, toast } from "react-hot-toast";
import ReactFlow, {
  Background, BackgroundVariant,
  Connection, ConnectionLineType,
  useReactFlow
} from "reactflow";

// Keep your existing createNewNode and EditableEdge functions...
// [Previous node creation and edge handling code remains the same]

const DashboardInstancePage = ({ params }) => {
  const { chartStore, utilityStore } = useStores() as any;
  const router = useRouter();
  const { project } = useReactFlow();
  const [loadingAI, setLoadingAI] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const resolvedParams = React.use(params);
  const instanceId = decodeURIComponent((resolvedParams as any).instanceId);
  const flowchartId = decodeURIComponent((resolvedParams as any).flowchartId);

  // Load initial data
  useEffect(() => {
    const loadData = async () => {
      if (chartStore.chartInstances.length === 0) {
        setIsLoading(true);
        try {
          const savedData = await utilityStore.loadSavedData();
          if (savedData && Array.isArray(savedData)) {
            chartStore.setChartInstances(savedData);
          }
        } catch (error) {
          console.error('Error loading data:', error);
          toast.error("Failed to load chart data");
        } finally {
          setIsLoading(false);
        }
      }
    };

    loadData();
  }, [chartStore, utilityStore]);

  // Save changes to server
  const saveToServer = useCallback(
    async (updatedChart: any) => {
      try {
        const response = await fetch(
          `/api/flowcharts/${flowchartId}/charts/${instanceId}`,
          {
            method: "PATCH",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              content: {
                nodes: updatedChart.nodes || [],
                edges: updatedChart.edges || []
              }
            }),
          }
        );

        if (!response.ok) {
          throw new Error("Failed to save changes");
        }
      } catch (error) {
        console.error("Error saving changes:", error);
        toast.error("Failed to save changes");
      }
    },
    [flowchartId, instanceId]
  );

  const onNodesChange = useCallback(
    (changes) => {
      if (chartStore.getChartInstance(instanceId)) {
        chartStore.updateNodes(instanceId, changes);
        const updatedInstance = chartStore.getChartInstance(instanceId);
        saveToServer(updatedInstance);
      }
    },
    [chartStore, instanceId, saveToServer]
  );

  const onEdgesChange = useCallback(
    (changes) => {
      if (chartStore.getChartInstance(instanceId)) {
        chartStore.updateEdges(instanceId, changes);
        const updatedInstance = chartStore.getChartInstance(instanceId);
        saveToServer(updatedInstance);
      }
    },
    [chartStore, instanceId, saveToServer]
  );

  const onConnect = useCallback(
    (connection: Connection) => {
      if (chartStore.getChartInstance(instanceId)) {
        chartStore.addEdge(instanceId, {
          ...connection,
          type: 'editableEdge',
          id: `edge-${Math.random().toString(36).substr(2, 9)}`
        });
        const updatedInstance = chartStore.getChartInstance(instanceId);
        saveToServer(updatedInstance);
      }
    },
    [chartStore, instanceId, saveToServer]
  );

  const handleGenerateAI = async (description: string) => {
    setLoadingAI(true);
    try {
      const chart = await generateChart(description);
      return chart;
    } catch (error) {
      toast.error("Failed to generate chart");
      throw error;
    } finally {
      setLoadingAI(false);
    }
  };

  const onDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault();
      const type = event.dataTransfer.getData("application/reactflow");
      const position = project({ x: event.clientX, y: event.clientY });
      const newNode = createNewNode(type, position, instanceId);

      if (newNode) {
        chartStore.addNode(instanceId, newNode);
        const updatedInstance = chartStore.getChartInstance(instanceId);
        saveToServer(updatedInstance);
      }
    },
    [project, chartStore, instanceId, saveToServer]
  );

  const onDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = "move";
  }, []);

  const currentInstance = chartStore.getChartInstance(instanceId);

  if (!currentInstance) {
    return (
      <div className="flex h-full items-center justify-center">
        <p className="text-lg text-red-600">Chart not found</p>
      </div>
    );
  }

  return (
    <div className="h-full">
      <ReactFlow
        onDrop={onDrop}
        onDragOver={onDragOver}
        nodes={currentInstance.nodes || []}
        edges={currentInstance.edges || []}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        connectionLineType={ConnectionLineType.SmoothStep}
        fitView
        defaultViewport={{ x: 0, y: 0, zoom: 1 }}
      >
        <Background variant={BackgroundVariant.Dots} />
      </ReactFlow>
      <Toaster />
    </div>
  );
};

export default DashboardInstancePage;