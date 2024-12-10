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

    const body = await req.json();
    console.log('Received body:', body);  // Debug log

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
        content: body.content,  // Use the content field directly
        updatedAt: new Date()
      }
    });

    console.log('Updated flow:', flow);  // Debug log
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

    const { name, color, onePageMode, content } = await req.json();
    const updateData: any = {};

    // Only include fields that exist in the schema
    if (name !== undefined) updateData.name = name;
    if (color !== undefined) updateData.color = color;
    if (onePageMode !== undefined) updateData.onePageMode = onePageMode;
    if (content !== undefined) updateData.content = content;

    try {
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
          ...updateData,
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