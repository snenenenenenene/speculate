import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/options";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { ProjectRole } from "@prisma/client";

export async function GET(
  req: Request,
  { params }: { params: { projectId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const projectId = params.projectId;

    // Get project with organization and collaborators
    const project = await prisma.project.findUnique({
      where: { id: projectId },
      include: {
        organization: {
          include: {
            members: {
              include: {
                user: {
                  select: {
                    id: true,
                    name: true,
                    email: true,
                    image: true,
                  },
                },
              },
            },
          },
        },
        collaborators: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                image: true,
              },
            },
          },
        },
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
          },
        },
      },
    });

    if (!project) {
      return new NextResponse("Project not found", { status: 404 });
    }

    // Check if user has access to the project
    const hasAccess = project.userId === session.user.id ||
      project.collaborators.some(c => c.userId === session.user.id) ||
      project.organization?.members.some(m => m.userId === session.user.id);

    if (!hasAccess) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    // Format collaborators list
    const collaborators = [
      // Project owner
      {
        id: project.user.id,
        name: project.user.name,
        email: project.user.email,
        image: project.user.image,
        role: "OWNER" as const,
        type: "project" as const,
      },
      // Organization members (if project belongs to an organization)
      ...(project.organization?.members.map(member => ({
        id: member.user.id,
        name: member.user.name,
        email: member.user.email,
        image: member.user.image,
        role: member.role.toUpperCase() as "OWNER" | "ADMIN" | "EDITOR" | "VIEWER",
        type: "organization" as const,
      })) || []),
      // Direct project collaborators
      ...project.collaborators.map(collab => ({
        id: collab.user.id,
        name: collab.user.name,
        email: collab.user.email,
        image: collab.user.image,
        role: collab.role as "OWNER" | "ADMIN" | "EDITOR" | "VIEWER",
        type: "project" as const,
      })),
    ];

    return NextResponse.json({ collaborators });
  } catch (error) {
    console.error("[COLLABORATORS_GET]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

export async function POST(
  req: Request,
  { params }: { params: { projectId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const projectId = params.projectId;
    const { email, role = "VIEWER" } = await req.json();

    if (!email) {
      return new NextResponse("Email is required", { status: 400 });
    }

    if (!["VIEWER", "EDITOR", "ADMIN"].includes(role)) {
      return new NextResponse("Invalid role", { status: 400 });
    }

    // Check if user has permission to manage collaborators
    const project = await prisma.project.findUnique({
      where: { id: projectId },
      include: {
        collaborators: true,
        organization: {
          include: {
            members: true,
          },
        },
      },
    });

    if (!project) {
      return new NextResponse("Project not found", { status: 404 });
    }

    const isOwner = project.userId === session.user.id;
    const isOrgAdmin = project.organization?.members.some(
      m => m.userId === session.user.id && ["OWNER", "ADMIN"].includes(m.role)
    );

    if (!isOwner && !isOrgAdmin) {
      return new NextResponse("Not authorized to manage collaborators", { status: 403 });
    }

    // Find user to add
    const user = await prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
      },
    });

    if (!user) {
      return new NextResponse("User not found", { status: 404 });
    }

    // Check if user is already a collaborator
    const existingCollaborator = project.collaborators.find(c => c.userId === user.id);
    if (existingCollaborator) {
      return new NextResponse("User is already a collaborator", { status: 400 });
    }

    // Add collaborator
    const collaborator = await prisma.projectCollaborator.create({
      data: {
        projectId,
        userId: user.id,
        role: role as ProjectRole,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
          },
        },
      },
    });

    return NextResponse.json({
      id: collaborator.user.id,
      name: collaborator.user.name,
      email: collaborator.user.email,
      image: collaborator.user.image,
      role: collaborator.role,
      type: "project" as const,
    });
  } catch (error) {
    console.error("[COLLABORATORS_POST]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

export async function PUT(
  req: Request,
  { params }: { params: { projectId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const projectId = params.projectId;
    const { userId, role } = await req.json();

    if (!userId || !role) {
      return new NextResponse("User ID and role are required", { status: 400 });
    }

    if (!["VIEWER", "EDITOR", "ADMIN"].includes(role)) {
      return new NextResponse("Invalid role", { status: 400 });
    }

    // Check if user has permission to manage collaborators
    const project = await prisma.project.findUnique({
      where: { id: projectId },
      include: {
        organization: {
          include: {
            members: true,
          },
        },
      },
    });

    if (!project) {
      return new NextResponse("Project not found", { status: 404 });
    }

    const isOwner = project.userId === session.user.id;
    const isOrgAdmin = project.organization?.members.some(
      m => m.userId === session.user.id && ["OWNER", "ADMIN"].includes(m.role)
    );

    if (!isOwner && !isOrgAdmin) {
      return new NextResponse("Not authorized to manage collaborators", { status: 403 });
    }

    // Cannot change owner's role
    if (project.userId === userId) {
      return new NextResponse("Cannot change owner's role", { status: 403 });
    }

    // Update collaborator role
    const collaborator = await prisma.projectCollaborator.update({
      where: {
        projectId_userId: {
          projectId,
          userId,
        },
      },
      data: { role: role as ProjectRole },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
          },
        },
      },
    });

    return NextResponse.json({
      id: collaborator.user.id,
      name: collaborator.user.name,
      email: collaborator.user.email,
      image: collaborator.user.image,
      role: collaborator.role,
      type: "project" as const,
    });
  } catch (error) {
    console.error("[COLLABORATORS_PUT]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: { projectId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const projectId = params.projectId;
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");

    if (!userId) {
      return new NextResponse("User ID is required", { status: 400 });
    }

    // Check if user has permission to manage collaborators
    const project = await prisma.project.findUnique({
      where: { id: projectId },
      include: {
        organization: {
          include: {
            members: true,
          },
        },
      },
    });

    if (!project) {
      return new NextResponse("Project not found", { status: 404 });
    }

    const isOwner = project.userId === session.user.id;
    const isOrgAdmin = project.organization?.members.some(
      m => m.userId === session.user.id && ["OWNER", "ADMIN"].includes(m.role)
    );

    if (!isOwner && !isOrgAdmin) {
      return new NextResponse("Not authorized to manage collaborators", { status: 403 });
    }

    // Cannot remove owner
    if (project.userId === userId) {
      return new NextResponse("Cannot remove project owner", { status: 403 });
    }

    await prisma.projectCollaborator.delete({
      where: {
        projectId_userId: {
          projectId,
          userId,
        },
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[COLLABORATORS_DELETE]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}