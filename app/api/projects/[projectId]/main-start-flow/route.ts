import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/options";
import { prisma } from "@/lib/prisma";

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ projectId: string }> }
): Promise<Response> {
  try {
    const { projectId } = await params;
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const body = await request.json();
    const { flowId } = body;

    if (!flowId) {
      return NextResponse.json(
        { error: "Flow ID is required" },
        { status: 400 }
      );
    }

    // Update project's main start flow
    const project = await prisma.project.update({
      where: { id: projectId },
      data: {
        mainStartFlowId: flowId,
      },
    });

    return NextResponse.json(project);
  } catch (error) {
    console.error("[MAIN_START_FLOW_PUT]", error);
    return NextResponse.json(
      { error: "Failed to update main start flow" },
      { status: 500 }
    );
  }
} 