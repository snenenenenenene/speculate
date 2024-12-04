// app/api/load-chart/route.ts
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";
import { authOptions } from "../auth/[...nextauth]/options";

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const projectId = searchParams.get('projectId');

    if (!projectId) {
      return NextResponse.json({ error: "Project ID is required" }, { status: 400 });
    }

    // Find all flows for this project
    const flows = await prisma.flow.findMany({
      where: {
        projectId: projectId,
      },
      orderBy: {
        updatedAt: 'desc',
      },
    });

    if (!flows || flows.length === 0) {
      return NextResponse.json({
        success: true,
        content: [],
      });
    }

    // Transform the flows to the expected format
    const transformedFlows = flows.map(flow => {
      // If content is stored as a string, parse it, otherwise use as is
      const flowContent = typeof flow.content === 'string' 
        ? JSON.parse(flow.content)
        : flow.content;

      return {
        id: flow.id,
        name: flowContent.name || flow.name,
        nodes: flowContent.nodes || [],
        edges: flowContent.edges || [],
        color: flowContent.color || flow.color,
        onePageMode: flowContent.onePageMode || flow.onePageMode,
        publishedVersions: flowContent.publishedVersions || [],
        variables: flowContent.variables || [],
      };
    });

    return NextResponse.json({
      success: true,
      content: transformedFlows,
    });
  } catch (error) {
    console.error("Error loading chart:", error);
    return NextResponse.json(
      { error: "Failed to load chart" },
      { status: 500 }
    );
  }
}