import { type NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

interface FlowContent {
  nodes: any[];
  [key: string]: any;
}

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const pathParts = url.pathname.split('/');
    const projectId = pathParts[3]; // /api/public/projects/[projectId]/flows/[flowId]
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

    // Get flow
    const flow = await prisma.chartInstance.findFirst({
      where: {
        id: flowId,
        projectId,
        isPublished: true,
      },
      select: {
        id: true,
        name: true,
        content: true,
        version: true,
        color: true,
        onePageMode: true,
        isPublished: true,
        publishedAt: true,
        updatedAt: true,
        variables: true,
        activeVersion: {
          select: {
            id: true,
            version: true,
            content: true,
          }
        }
      },
    });

    if (!flow) {
      return NextResponse.json(
        { error: "Flow not found or not published" },
        { status: 404 }
      );
    }

    // Parse content to get nodes
    let nodes: any[] = [];
    try {
      const content = flow.activeVersion?.content || flow.content;
      if (typeof content === 'string') {
        const parsedContent = JSON.parse(content) as FlowContent;
        nodes = parsedContent.nodes || [];
      } else if (content && typeof content === 'object') {
        const parsedContent = content as FlowContent;
        nodes = parsedContent.nodes || [];
      }
    } catch (e) {
      console.error("[PUBLIC_FLOW_CONTENT_PARSE]", e);
    }

    return NextResponse.json({
      flow: {
        ...flow,
        nodes,
        // If there's an active version, use its content
        content: flow.activeVersion?.content || flow.content
      }
    });
  } catch (error) {
    console.error("[PUBLIC_FLOW_GET]", error);
    return NextResponse.json(
      { error: "Failed to fetch flow" },
      { status: 500 }
    );
  }
} 