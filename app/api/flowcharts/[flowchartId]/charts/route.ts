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
  console.log("Creating chart for flowchart:", flowchartId); // Debug log

  try {
    const session = await getServerSession(authOptions);
    console.log("Session:", session); // Debug log

    if (!session?.user?.email) {
      return NextResponse.json(
        { error: "Unauthorized - No valid session" },
        { status: 401 }
      );
    }

    const body = await request.json();
    console.log("Request body:", body); // Debug log

    // First verify flowchart ownership
    const flowchart = await prisma.flowchart.findUnique({
      where: {
        id: flowchartId,
        userId: session.user.id,
      },
    });

    console.log("Found flowchart:", flowchart); // Debug log

    if (!flowchart) {
      return NextResponse.json(
        { error: `Flowchart not found or unauthorized (ID: ${flowchartId})` },
        { status: 404 }
      );
    }

    // Create the chart
    const chart = await prisma.chart.create({
      data: {
        name: body.name || "New Chart",
        content: "[]",
        color: flowchart.color,
        flowchartId: flowchartId,
        isPublished: false,
        version: 1,
        onePageMode: false,
      },
    });

    console.log("Created chart:", chart); // Debug log

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
