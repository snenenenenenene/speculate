import { authOptions } from "@/app/api/auth/[...nextauth]/options";
import prisma from "@/lib/prisma"; // Changed this line to use default import
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

// GET - List collaborators
export async function GET(
  req: Request,
  { params }: { params: { projectId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

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
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    return NextResponse.json({
      collaborators: project.collaborators
    });
  } catch (error) {
    console.error("Error fetching collaborators:", error);
    return NextResponse.json(
      { error: "Failed to fetch collaborators" },
      { status: 500 }
    );
  }
}

// POST - Add collaborator
export async function POST(
  req: Request,
  { params }: { params: { projectId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { email } = await req.json();

    // Find existing user
    const user = await prisma.user.findUnique({
      where: { email }
    });

    if (!user) {
      return NextResponse.json(
        { error: "User not found. They need to sign up first." },
        { status: 404 }
      );
    }

    // Check if already a collaborator
    const existingCollaborator = await prisma.projectCollaborator.findFirst({
      where: {
        projectId: params.projectId,
        userId: user.id
      }
    });

    if (existingCollaborator) {
      return NextResponse.json(
        { error: "User is already a collaborator" },
        { status: 400 }
      );
    }

    // Add as collaborator
    const collaborator = await prisma.projectCollaborator.create({
      data: {
        project: {
          connect: { id: params.projectId }
        },
        user: {
          connect: { id: user.id }
        }
      },
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
    });

    return NextResponse.json({ collaborator });
  } catch (error) {
    console.error("Error adding collaborator:", error);
    return NextResponse.json(
      { error: "Failed to add collaborator" },
      { status: 500 }
    );
  }
}

// DELETE - Remove collaborator
export async function DELETE(
  req: Request,
  { params }: { params: { projectId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const collaboratorId = searchParams.get('collaboratorId');

    if (!collaboratorId) {
      return NextResponse.json(
        { error: "Collaborator ID is required" },
        { status: 400 }
      );
    }

    await prisma.projectCollaborator.delete({
      where: {
        id: collaboratorId,
        projectId: params.projectId
      }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error removing collaborator:", error);
    return NextResponse.json(
      { error: "Failed to remove collaborator" },
      { status: 500 }
    );
  }
}