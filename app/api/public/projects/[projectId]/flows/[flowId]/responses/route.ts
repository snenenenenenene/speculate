import { type NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const pathParts = url.pathname.split('/');
    const projectId = pathParts[3]; // /api/public/projects/[projectId]/flows/[flowId]/responses
    const flowId = pathParts[5];

    // Verify project is public
    const project = await prisma.project.findFirst({
      where: {
        id: projectId,
        isPublic: true,
      },
    });

    if (!project) {
      return NextResponse.json(
        { error: "Project not found or not public" },
        { status: 404 }
      );
    }

    // Get flow responses
    const responses = await prisma.questionnaireResponse.findMany({
      where: {
        flowId,
        flow: {
          projectId,
        },
      },
      orderBy: {
        startedAt: 'desc',
      },
      include: {
        user: {
          select: {
            name: true,
            email: true,
          },
        },
      },
    });

    return NextResponse.json({ responses });
  } catch (error) {
    console.error("[PUBLIC_FLOW_RESPONSES_GET]", error);
    return NextResponse.json(
      { error: "Failed to fetch flow responses" },
      { status: 500 }
    );
  }
} 