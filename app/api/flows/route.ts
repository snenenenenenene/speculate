import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

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
        OR: [
          { userId: user.id },
          {
            collaborators: {
              some: {
                userId: user.id
              }
            }
          }
        ]
      },
    });

    if (!project) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    // Create chart instance directly
    const charts = await Promise.all(body.content.map(async (chart: any) => {
      return prisma.chartInstance.create({
        data: {
          name: chart.name || "New Chart",
          content: JSON.stringify({
            nodes: chart.nodes || [],
            edges: chart.edges || [],
            variables: chart.variables || []
          }),
          color: chart.color || "#80B500",
          onePageMode: chart.onePageMode || false,
          projectId: body.projectId,
          userId: user.id,
          variables: chart.variables || []
        }
      });
    }));

    return NextResponse.json({ charts });
  } catch (error) {
    console.error("Error creating charts:", error);
    return NextResponse.json(
      { error: "Failed to create charts" },
      { status: 500 }
    );
  }
}
