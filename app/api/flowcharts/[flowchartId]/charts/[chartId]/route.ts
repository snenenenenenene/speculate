import { authOptions } from "@/app/api/auth/[...nextauth]/options";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
// app/api/flowcharts/[flowchartId]/charts/[chartId]/route.ts
export async function GET(
  req: Request,
  { params }: { params: { flowchartId: string; chartId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const chart = await prisma.chart.findUnique({
      where: {
        id: params.chartId,
        flowchart: {
          id: params.flowchartId,
          user: {
            email: session.user.email,
          },
        },
      },
      include: {
        flowchart: {
          include: { user: true },
        },
      },
    });

    if (!chart) {
      return new NextResponse("Chart not found", { status: 404 });
    }

    return NextResponse.json(chart);
  } catch (error) {
    console.error("Error:", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

export async function PATCH(
  req: Request,
  { params }: { params: { flowchartId: string; chartId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { content } = await req.json();

    const chart = await prisma.chart.findUnique({
      where: {
        id: params.chartId,
        flowchart: {
          id: params.flowchartId,
          user: {
            email: session.user.email,
          },
        },
      },
    });

    if (!chart) {
      return new NextResponse("Chart not found", { status: 404 });
    }

    const updatedChart = await prisma.chart.update({
      where: { id: params.chartId },
      data: { content },
    });

    return NextResponse.json(updatedChart);
  } catch (error) {
    console.error("Error:", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
