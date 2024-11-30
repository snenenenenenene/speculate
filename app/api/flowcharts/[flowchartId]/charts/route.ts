// app/api/flowcharts/[flowchartId]/charts/route.ts
import { authOptions } from "@/app/api/auth/[...nextauth]/options";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

export async function POST(
  request: Request,
  { params }: { params: { flowchartId: string } }
) {
  const flowchartId = await params.flowchartId;
  console.log("Creating chart for flowchart:", flowchartId);

  try {
    const session = await getServerSession(authOptions);
    console.log("Session:", session);

    if (!session?.user?.email) {
      return NextResponse.json(
        { error: "Unauthorized - No valid session" },
        { status: 401 }
      );
    }

    const body = await request.json();
    console.log("Request body:", body);

    // First verify flowchart ownership
    const flowchart = await prisma.flowchart.findUnique({
      where: {
        id: flowchartId,
        userId: session.user.id,
      },
    });

    console.log("Found flowchart:", flowchart);

    if (!flowchart) {
      return NextResponse.json(
        { error: `Flowchart not found or unauthorized (ID: ${flowchartId})` },
        { status: 404 }
      );
    }

    // Create default content if none provided
    const defaultContent = JSON.stringify({
      nodes: [
        {
          id: "start-node",
          type: "startNode",
          position: { x: 250, y: 50 },
          data: {
            label: "Start",
            instanceId: flowchartId,
            options: [{ label: "DEFAULT", nextNodeId: "end-node" }],
          },
        },
        {
          id: "end-node",
          type: "endNode",
          position: { x: 250, y: 200 },
          data: {
            label: "End",
            instanceId: flowchartId,
            endType: "end",
            redirectTab: "",
          },
        },
      ],
      edges: [
        {
          id: "edge-1",
          source: "start-node",
          target: "end-node",
          type: "smoothstep",
        },
      ],
    });

    // Create the chart
    const chart = await prisma.chart.create({
      data: {
        name: body.name || "New Chart",
        content: body.content || defaultContent,
        color: flowchart.color,
        flowchartId: flowchartId,
        isPublished: false,
        version: 1,
        onePageMode: false,
      },
    });

    console.log("Created chart:", chart);
    return NextResponse.json(chart);
  } catch (error: any) {
    console.error("Detailed error in chart creation:", {
      error: error,
      message: error.message,
      stack: error.stack,
    });

    return NextResponse.json(
      {
        error: "Failed to create chart",
        details: error.message,
        code: error?.code,
      },
      { status: 500 }
    );
  }
}
