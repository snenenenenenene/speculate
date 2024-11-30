import { authOptions } from "@/app/api/auth/[...nextauth]/options";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

export async function GET(
  request: Request,
  context: { params: { flowchartId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { params } = context;
    const flowchartId = params?.flowchartId;
    console.log("API Route - Fetching flowchart:", flowchartId);

    const flowchart = await prisma.flowchart.findUnique({
      where: {
        id: flowchartId,
        userId: session.user.id,
      },
      include: {
        charts: {
          select: {
            id: true,
            name: true,
            content: true,
            updatedAt: true,
            isPublished: true,
          },
        },
      },
    });

    if (!flowchart) {
      return NextResponse.json(
        { error: "Flowchart not found" },
        { status: 404 }
      );
    }

    // Parse the content of each chart
    const parsedFlowchart = {
      ...flowchart,
      charts: flowchart.charts.map((chart) => ({
        ...chart,
        content: chart.content
          ? JSON.parse(chart.content)
          : { nodes: [], edges: [] },
      })),
    };

    return NextResponse.json(parsedFlowchart);
  } catch (error) {
    console.error("API Route - Error:", error);
    return NextResponse.json(
      { error: "Failed to fetch flowchart" },
      { status: 500 }
    );
  }
}
