import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(
  req: Request,
  { params }: { params: { projectId: string } }
) {
  try {
    // Get API key from Authorization header
    const authHeader = req.headers.get('authorization');
    const apiKey = authHeader?.replace('Bearer ', '');

    if (!apiKey) {
      return NextResponse.json(
        { error: "Missing API key" },
        { status: 401 }
      );
    }

    // Find project and verify API key
    const project = await prisma.project.findFirst({
      where: {
        id: params.projectId,
        apiKey,
        isPublic: true
      },
      include: {
        _count: {
          select: {
            charts: true,
            collaborators: true
          }
        }
      }
    });

    if (!project) {
      return NextResponse.json(
        { error: "Project not found or unauthorized" },
        { status: 404 }
      );
    }

    // Get all published flows for this project
    const flows = await prisma.chartInstance.findMany({
      where: {
        projectId: params.projectId,
        isPublished: true
      },
      select: {
        id: true,
        name: true,
        content: true,
        version: true,
        updatedAt: true,
        publishedAt: true,
        variables: true,
        isPublished: true,
        color: true,
        onePageMode: true
      }
    });

    // Transform the response
    const response = {
      id: project.id,
      name: project.name,
      description: project.description,
      isPublic: project.isPublic,
      updatedAt: project.updatedAt,
      stats: {
        flows: project._count.charts,
        collaborators: project._count.collaborators
      },
      flows: flows.map(flow => {
        // Parse the content string into a JSON object
        let parsedContent;
        try {
          parsedContent = JSON.parse(flow.content);
        } catch (err) {
          console.error('Error parsing flow content:', err);
          parsedContent = { nodes: [], edges: [], viewport: { x: 0, y: 0, zoom: 1 } };
        }

        return {
          id: flow.id,
          name: flow.name,
          content: parsedContent,
          version: flow.version,
          updatedAt: flow.updatedAt,
          publishedAt: flow.publishedAt,
          variables: flow.variables,
          isPublished: flow.isPublished,
          color: flow.color,
          onePageMode: flow.onePageMode
        };
      })
    };

    return NextResponse.json({ project: response });
  } catch (error) {
    console.error("Error fetching project:", error);
    return NextResponse.json(
      { error: "Failed to fetch project" },
      { status: 500 }
    );
  }
} 