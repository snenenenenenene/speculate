import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "../../../../auth/[...nextauth]/options";

export async function GET(
  req: Request,
  { params }: { params: { projectId: string; flowId: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const flow = await prisma.chartInstance.findFirst({
      where: {
        id: params.flowId,
        projectId: params.projectId,
        user: {
          email: session.user.email
        }
      }
    });

    if (!flow) {
      return NextResponse.json(
        { error: "Flow not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ flow });
  } catch (error) {
    console.error("Error fetching flow:", error);
    return NextResponse.json(
      { error: "Failed to fetch flow" },
      { status: 500 }
    );
  }
}

export async function PUT(
  req: Request,
  { params }: { params: { projectId: string; flowId: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { nodes, edges } = await req.json();

    // Update the flow
    const flow = await prisma.chartInstance.update({
      where: {
        id: params.flowId,
        projectId: params.projectId,
        user: {
          email: session.user.email
        }
      },
      data: {
        content: JSON.stringify({ nodes, edges }),
        updatedAt: new Date()
      }
    });

    return NextResponse.json({ flow });
  } catch (error) {
    console.error("Error saving flow:", error);
    return NextResponse.json(
      { error: "Failed to save flow" },
      { status: 500 }
    );
  }
}

export async function PATCH(
  req: Request,
  { params }: { params: { projectId: string; flowId: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { content, name } = await req.json();

    if (!content) {
      return NextResponse.json(
        { error: "No content provided" },
        { status: 400 }
      );
    }

    // Update the flow
    const flow = await prisma.chartInstance.update({
      where: {
        id: params.flowId,
        projectId: params.projectId,
        user: {
          email: session.user.email
        }
      },
      data: {
        content,
        name,
        updatedAt: new Date()
      }
    });

    return NextResponse.json({ flow });
  } catch (error) {
    console.error("Error updating flow:", error);
    return NextResponse.json(
      { error: "Failed to update flow" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: { projectId: string; flowId: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await prisma.chartInstance.delete({
      where: {
        id: params.flowId,
        projectId: params.projectId,
        user: {
          email: session.user.email
        }
      }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting flow:", error);
    return NextResponse.json(
      { error: "Failed to delete flow" },
      { status: 500 }
    );
  }
}