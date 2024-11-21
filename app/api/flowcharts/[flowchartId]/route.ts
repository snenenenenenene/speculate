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

    const flowchartId = context.params?.flowchartId;
    console.log("API Route - Fetching flowchart:", flowchartId);

    const flowchart = await prisma.flowchart.findUnique({
      where: {
        id: flowchartId,
        userId: session.user.id,
      },
      include: {
        charts: true,
      },
    });

    if (!flowchart) {
      return NextResponse.json(
        { error: "Flowchart not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(flowchart);
  } catch (error) {
    console.error("API Route - Error:", error);
    return NextResponse.json(
      { error: "Failed to fetch flowchart" },
      { status: 500 }
    );
  }
}
