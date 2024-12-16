import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import prisma from "@/lib/prisma";
import { authOptions } from "@/app/api/auth/[...nextauth]/options";

export async function GET(
  request: Request,
  { params }: { params: { projectId: string } }
) {
  try {
    // Get the current session
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    // Get the project and verify access
    const project = await prisma.project.findUnique({
      where: { id: params.projectId },
      select: { userId: true }
    });

    if (!project) {
      return new NextResponse("Project not found", { status: 404 });
    }

    // Get the owner's data
    const owner = await prisma.user.findUnique({
      where: { id: project.userId },
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
      }
    });

    if (!owner) {
      return new NextResponse("Owner not found", { status: 404 });
    }

    return NextResponse.json({ user: owner });
  } catch (error) {
    console.error("[PROJECT_OWNER_GET]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
} 