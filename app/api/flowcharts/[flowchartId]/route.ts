import { authOptions } from "@/app/api/auth/[...nextauth]/options";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

// Get specific flowchart
export async function GET(
  req: Request,
  { params }: { params: { flowchartId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const flowchart = await prisma.flowchart.findUnique({
      where: { id: params.flowchartId },
      include: { user: true },
    });

    if (!flowchart) {
      return new NextResponse("Flowchart not found", { status: 404 });
    }

    // Only allow access if the user owns the flowchart or it's published
    if (flowchart.user.email !== session.user.email && !flowchart.isPublished) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    return NextResponse.json(flowchart);
  } catch (error) {
    console.error("Error fetching flowchart:", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

// Update flowchart
export async function PATCH(
  req: Request,
  { params }: { params: { instanceId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const json = await req.json();
    const { name, color, content, isPublished, onePageMode } = json;

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return new NextResponse("User not found", { status: 404 });
    }

    // Verify ownership
    const existingFlowchart = await prisma.flowchart.findFirst({
      where: {
        id: params.instanceId,
        userId: user.id,
      },
    });

    if (!existingFlowchart) {
      return new NextResponse("Unauthorized or not found", { status: 404 });
    }

    const updatedFlowchart = await prisma.flowchart.update({
      where: { id: params.instanceId },
      data: {
        name: name !== undefined ? name : undefined,
        color: color !== undefined ? color : undefined,
        content: content !== undefined ? content : undefined,
        isPublished: isPublished !== undefined ? isPublished : undefined,
        onePageMode: onePageMode !== undefined ? onePageMode : undefined,
        version: { increment: 1 },
      },
    });

    return NextResponse.json(updatedFlowchart);
  } catch (error) {
    console.error("Error updating flowchart:", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

// Delete flowchart
export async function DELETE(
  req: Request,
  { params }: { params: { instanceId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return new NextResponse("User not found", { status: 404 });
    }

    // Verify ownership
    const existingFlowchart = await prisma.flowchart.findFirst({
      where: {
        id: params.instanceId,
        userId: user.id,
      },
    });

    if (!existingFlowchart) {
      return new NextResponse("Unauthorized or not found", { status: 404 });
    }

    await prisma.flowchart.delete({
      where: { id: params.instanceId },
    });

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error("Error deleting flowchart:", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
