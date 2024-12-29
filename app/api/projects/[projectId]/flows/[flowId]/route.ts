import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/options";
import { prisma } from "@/lib/prisma";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ projectId: string; flowId: string }> }
): Promise<Response> {
  try {
    const { projectId, flowId } = await params;
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const flow = await prisma.chartInstance.findUnique({
      where: { id: flowId },
      include: {
        versions: {
          orderBy: {
            version: 'desc'
          },
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true
              }
            }
          }
        }
      }
    });

    if (!flow) {
      return NextResponse.json(
        { error: "Flow not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(flow);
  } catch (error) {
    console.error("[FLOW_GET]", error);
    return NextResponse.json(
      { error: "Failed to fetch flow" },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ projectId: string; flowId: string }> }
): Promise<Response> {
  try {
    const { projectId, flowId } = await params;
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const body = await request.json();
    const { name, content, variables } = body;

    const flow = await prisma.chartInstance.update({
      where: { id: flowId },
      data: {
        name,
        content,
        variables
      }
    });

    return NextResponse.json(flow);
  } catch (error) {
    console.error("[FLOW_PATCH]", error);
    return NextResponse.json(
      { error: "Failed to update flow" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ projectId: string; flowId: string }> }
): Promise<Response> {
  try {
    const { projectId, flowId } = await params;
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    await prisma.chartInstance.delete({
      where: { id: flowId }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[FLOW_DELETE]", error);
    return NextResponse.json(
      { error: "Failed to delete flow" },
      { status: 500 }
    );
  }
}