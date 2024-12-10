// app/api/projects/[projectId]/route.ts
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "../../auth/[...nextauth]/options";

export async function GET(req: Request, { params }: { params: { projectId: string } }) {
  try {
    // Simulated database response
    const project = {
      id: params.projectId,
      name: "Example Project",
      description: "This is an example project description.",
      _count: {
        charts: 15
      }
    };

    // Simulated flows data
    const flows = [
      { id: `${params.projectId}_flow1` },
      { id: `${params.projectId}_flow2` }
    ];

    return NextResponse.json({ 
      project,
      flows
    });
  } catch (error) {
    console.error("Error fetching project:", error);
    return NextResponse.json(
      { error: "Failed to fetch project" },
      { status: 500 }
    );
  }
}

export async function PATCH(req: Request, { params }: { params: { projectId: string } }) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { name, description } = await req.json();

    const project = await prisma.project.updateMany({
      where: {
        id: params.projectId,
        user: {
          email: session.user.email
        }
      },
      data: {
        name,
        description
      }
    });

    if (project.count === 0) {
      return NextResponse.json(
        { error: "Project not found" },
        { status: 404 }
      );
    }

    const updatedProject = await prisma.project.findUnique({
      where: {
        id: params.projectId
      },
      include: {
        _count: {
          select: {
            charts: true
          }
        }
      }
    });

    return NextResponse.json({ project: updatedProject });
  } catch (error) {
    console.error("Error updating project:", error);
    return NextResponse.json(
      { error: "Failed to update project" },
      { status: 500 }
    );
  }
}

export async function DELETE(req: Request, { params }: { params: { projectId: string } }) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Delete associated charts first
    await prisma.chartInstance.deleteMany({
      where: {
        projectId: params.projectId,
        user: {
          email: session.user.email
        }
      }
    });

    // Then delete the project
    const project = await prisma.project.deleteMany({
      where: {
        id: params.projectId,
        user: {
          email: session.user.email
        }
      }
    });

    if (project.count === 0) {
      return NextResponse.json(
        { error: "Project not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting project:", error);
    return NextResponse.json(
      { error: "Failed to delete project" },
      { status: 500 }
    );
  }
}