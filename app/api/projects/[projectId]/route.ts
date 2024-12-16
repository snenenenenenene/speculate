import { authOptions } from "@/app/api/auth/[...nextauth]/options";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

export async function GET(req: Request, { params }: { params: { projectId: string } }) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get project with all necessary data
    const project = await prisma.project.findFirst({
      where: {
        id: params.projectId,
        OR: [
          { userId: session.user.id },
          {
            collaborators: {
              some: {
                userId: session.user.id
              }
            }
          }
        ]
      },
      include: {
        _count: {
          select: {
            charts: true,
            collaborators: true
          }
        },
        collaborators: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                image: true
              }
            }
          }
        }
      }
    });

    if (!project) {
      return NextResponse.json(
        { error: "Project not found" },
        { status: 404 }
      );
    }

    // Get flows for this project
    const flows = await prisma.chartInstance.findMany({
      where: {
        projectId: params.projectId,
        OR: [
          { userId: session.user.id },
          {
            project: {
              collaborators: {
                some: {
                  userId: session.user.id
                }
              }
            }
          }
        ]
      },
      select: {
        id: true,
        name: true,
        content: true,
        isPublished: true,
        version: true,
        updatedAt: true,
        variables: true
      }
    });

    return NextResponse.json({
      project: {
        ...project,
        flows
      }
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

    const body = await req.json();
    const { name, description, variables } = body;

    const updateData: any = {
      updatedAt: new Date()
    };

    if (name !== undefined) updateData.name = name;
    if (description !== undefined) updateData.description = description;
    if (variables !== undefined) updateData.variables = variables;

    const project = await prisma.project.update({
      where: {
        id: params.projectId,
        OR: [
          { userId: session.user.id },
          {
            collaborators: {
              some: {
                userId: session.user.id,
                role: { in: ['OWNER', 'ADMIN'] }
              }
            }
          }
        ]
      },
      data: updateData,
      include: {
        _count: {
          select: {
            charts: true,
            collaborators: true
          }
        }
      }
    });

    return NextResponse.json({ project });
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

    // Check if user has permission to delete
    const project = await prisma.project.findFirst({
      where: {
        id: params.projectId,
        OR: [
          { userId: session.user.id },
          {
            collaborators: {
              some: {
                userId: session.user.id,
                role: 'OWNER'
              }
            }
          }
        ]
      }
    });

    if (!project) {
      return NextResponse.json(
        { error: "Project not found or insufficient permissions" },
        { status: 404 }
      );
    }

    // Delete associated data
    await prisma.$transaction([
      // Delete collaborators
      prisma.projectCollaborator.deleteMany({
        where: { projectId: params.projectId }
      }),
      // Delete charts/flows
      prisma.chartInstance.deleteMany({
        where: { projectId: params.projectId }
      }),
      // Delete the project
      prisma.project.delete({
        where: { id: params.projectId }
      })
    ]);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting project:", error);
    return NextResponse.json(
      { error: "Failed to delete project" },
      { status: 500 }
    );
  }
}