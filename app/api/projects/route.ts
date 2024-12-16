import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "../auth/[...nextauth]/options";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const projects = await prisma.project.findMany({
      where: {
        OR: [
          // Projects owned by the user
          {
            user: {
              email: session.user.email
            }
          },
          // Projects where user is a collaborator
          {
            collaborators: {
              some: {
                user: {
                  email: session.user.email
                }
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
                name: true,
                email: true,
                image: true
              }
            }
          }
        }
      },
      orderBy: {
        updatedAt: 'desc'
      }
    });

    return NextResponse.json({ projects });
  } catch (error) {
    console.error("Error fetching projects:", error);
    return NextResponse.json(
      { error: "Failed to fetch projects" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { name, description } = await req.json();

    if (!name?.trim()) {
      return NextResponse.json(
        { error: "Project name is required" },
        { status: 400 }
      );
    }

    const project = await prisma.project.create({
      data: {
        name,
        description,
        user: {
          connect: {
            email: session.user.email
          }
        },
        // Add the creator as an OWNER collaborator
        collaborators: {
          create: {
            role: 'OWNER',
            user: {
              connect: {
                email: session.user.email
              }
            }
          }
        }
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
                name: true,
                email: true,
                image: true
              }
            }
          }
        }
      }
    });

    return NextResponse.json({ project });
  } catch (error) {
    console.error("Error creating project:", error);
    return NextResponse.json(
      { error: "Failed to create project" },
      { status: 500 }
    );
  }
}