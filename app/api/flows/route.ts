import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "../auth/[...nextauth]/options";

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const body = await request.json();
    
    if (!body?.projectId) {
      return NextResponse.json({ 
        error: "Missing required projectId" 
      }, { status: 400 });
    }

    // Verify project exists and belongs to user
    const project = await prisma.project.findFirst({
      where: {
        id: body.projectId,
        userId: user.id,
      },
    });

    if (!project) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    // Create flow with default chart instance
    const flow = await prisma.flow.create({
      data: {
        name: body.name || "Main Flow",
        description: body.description || "Initial flow",
        project: {
          connect: {
            id: body.projectId
          }
        },
        user: {
          connect: {
            id: user.id
          }
        },
        chartInstances: {
          create: {
            id: body.chartInstances?.[0]?.id || "default",
            name: body.chartInstances?.[0]?.name || "Default Instance",
            nodes: "[]",
            edges: "[]",
            color: body.chartInstances?.[0]?.color || "#3B82F6",
            onePageMode: body.chartInstances?.[0]?.onePageMode || false,
            publishedVersions: "[]",
            variables: "[]"
          }
        }
      },
      include: {
        chartInstances: true
      }
    });

    // Update project with the new flow
    await prisma.project.update({
      where: { id: project.id },
      data: { flowId: flow.id }
    });

    return NextResponse.json(flow);
  } catch (error: any) {
    console.error("Error creating flow:", error);
    return NextResponse.json({ 
      error: error instanceof Error ? error.message : "Failed to create flow" 
    }, { status: 500 });
  }
}
