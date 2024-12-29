import { type NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/options";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const pathParts = url.pathname.split('/');
    const projectId = pathParts[2]; // /api/users/[projectId]/owner

    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    // Get project owner
    const project = await prisma.project.findFirst({
      where: {
        id: projectId,
        OR: [
          { userId: session.user.id },
          {
            collaborators: {
              some: {
                userId: session.user.id,
              }
            }
          }
        ]
      },
      select: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    if (!project) {
      return NextResponse.json(
        { error: "Project not found or permission denied" },
        { status: 404 }
      );
    }

    return NextResponse.json({ owner: project.user });
  } catch (error) {
    console.error("[PROJECT_OWNER_GET]", error);
    return NextResponse.json(
      { error: "Failed to fetch project owner" },
      { status: 500 }
    );
  }
} 