import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    if (!body?.projectId) {
      return NextResponse.json({ 
        error: "Missing required projectId" 
      }, { status: 400 });
    }

    // Create chart instance directly
    const charts = await Promise.all(body.content.map(async (chart: any) => {
      return prisma.chartInstance.create({
        data: {
          name: chart.name || "New Chart",
          content: JSON.stringify({
            nodes: chart.nodes || [],
            edges: chart.edges || [],
            variables: chart.variables || []
          }),
          color: chart.color || "#80B500",
          onePageMode: chart.onePageMode || false,
          projectId: body.projectId,
          variables: chart.variables || []
        }
      });
    }));

    return NextResponse.json({ charts });
  } catch (error) {
    console.error("Error creating charts:", error);
    return NextResponse.json(
      { error: "Failed to create charts" },
      { status: 500 }
    );
  }
}
