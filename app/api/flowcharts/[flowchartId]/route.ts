import { authOptions } from "@/app/api/auth/[...nextauth]/options";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  req: NextRequest,
  { params }: { params: { flowchartId: string } }
) {
  const flowchartId = await params.flowchartId;
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const flowchart = await prisma.flowchart.findUnique({
      where: {
        id: flowchartId,
        userId: session.user.id,
      },
      include: {
        charts: {
          orderBy: {
            createdAt: "asc",
          },
          select: {
            id: true,
            name: true,
            content: true,
            updatedAt: true,
            isPublished: true,
            flowchartId: true,
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

export async function PATCH(
  req: NextRequest,
  { params }: { params: { flowchartId: string } }
) {
  const flowchartId = await params.flowchartId;
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();

    const flowchart = await prisma.flowchart.update({
      where: {
        id: flowchartId,
        userId: session.user.id,
      },
      data: {
        name: body.name,
        color: body.color,
        isPublished: body.isPublished,
        onePageMode: body.onePageMode,
      },
    });

    return NextResponse.json(flowchart);
  } catch (error) {
    console.error("API Route - Error:", error);
    return NextResponse.json(
      { error: "Failed to update flowchart" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { flowchartId: string } }
) {
  const flowchartId = await params.flowchartId;
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    await prisma.flowchart.delete({
      where: {
        id: flowchartId,
        userId: session.user.id,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("API Route - Error:", error);
    return NextResponse.json(
      { error: "Failed to delete flowchart" },
      { status: 500 }
    );
  }
}
