import { type NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const pathParts = url.pathname.split('/');
    const projectId = pathParts[3]; // /api/public/projects/[projectId]/flows

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

    // Get published flows
    const flows = await prisma.chartInstance.findMany({
      where: {
        projectId,
        isPublished: true,
      },
      select: {
        id: true,
        name: true,
        version: true,
        color: true,
        onePageMode: true,
        isPublished: true,
        publishedAt: true,
        updatedAt: true,
        activeVersion: {
          select: {
            id: true,
            version: true,
          }
        }
      },
      orderBy: {
        updatedAt: 'desc',
      },
    });

    return NextResponse.json({ flows });
  } catch (error) {
    console.error("[PUBLIC_PROJECT_FLOWS_GET]", error);
    return NextResponse.json(
      { error: "Failed to fetch project flows" },
      { status: 500 }
    );
  }
} 