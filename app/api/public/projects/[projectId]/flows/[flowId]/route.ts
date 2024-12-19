import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  request: Request,
  context: { params: { projectId: string; flowId: string } }
) {
  const { projectId, flowId } = context.params;

  try {
    const flow = await prisma.chartInstance.findUnique({
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
        { error: 'Flow not found or not published' },
        { status: 404 }
      );
    }

    // Parse content to get nodes
    let nodes: any[] = [];
    try {
      const content = flow.activeVersion?.content || flow.content;
      if (typeof content === 'string') {
        const parsedContent = JSON.parse(content);
        nodes = parsedContent.nodes || [];
      } else {
        nodes = content.nodes || [];
      }
    } catch (e) {
      console.error('Error parsing flow content:', e);
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
    console.error('Error fetching flow:', error);
    return NextResponse.json(
      { error: 'Failed to fetch flow' },
      { status: 500 }
    );
  }
} 