import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/options';
import { nanoid } from 'nanoid';

export async function POST(
  request: Request,
  { params }: { params: { projectId: string; flowId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    const { responses, path, weights, metadata } = await request.json();
    
    // Get the flow to verify it exists and get its version
    const flow = await prisma.chartInstance.findUnique({
      where: {
        id: params.flowId,
        projectId: params.projectId,
        isPublished: true,
      },
      select: {
        id: true,
        version: true,
      },
    });

    if (!flow) {
      return NextResponse.json(
        { error: 'Flow not found or not published' },
        { status: 404 }
      );
    }

    // Create the response
    const response = await prisma.questionnaireResponse.create({
      data: {
        flowId: flow.id,
        version: flow.version,
        userId: session?.user?.id,
        sessionId: nanoid(),
        responses,
        path,
        weights,
        metadata,
        completedAt: new Date(),
      },
    });

    // Update analytics
    await updateAnalytics(flow.id, flow.version, {
      responses,
      path,
      weights,
      startTime: metadata?.startTime,
      endTime: Date.now(),
    });

    return NextResponse.json({ success: true, responseId: response.id });
  } catch (error) {
    console.error('Error saving response:', error);
    return NextResponse.json(
      { error: 'Failed to save response' },
      { status: 500 }
    );
  }
}

export async function GET(
  request: Request,
  { params }: { params: { projectId: string; flowId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    const searchParams = new URL(request.url).searchParams;
    const version = searchParams.get('version');

    // Check if user has access to the project
    const project = await prisma.project.findFirst({
      where: {
        id: params.projectId,
        OR: [
          { userId: session?.user?.id },
          {
            collaborators: {
              some: {
                userId: session?.user?.id,
              },
            },
          },
        ],
      },
    });

    if (!project && !session?.user?.role?.includes('ADMIN')) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get responses with optional version filter
    const responses = await prisma.questionnaireResponse.findMany({
      where: {
        flowId: params.flowId,
        ...(version ? { version: parseInt(version) } : {}),
      },
      orderBy: {
        startedAt: 'desc',
      },
      take: 1000, // Limit to prevent overwhelming response
    });

    // Get analytics
    const analytics = await prisma.questionnaireAnalytics.findFirst({
      where: {
        flowId: params.flowId,
        ...(version ? { version: parseInt(version) } : {}),
      },
    });

    return NextResponse.json({
      responses,
      analytics,
    });
  } catch (error) {
    console.error('Error fetching responses:', error);
    return NextResponse.json(
      { error: 'Failed to fetch responses' },
      { status: 500 }
    );
  }
}

async function updateAnalytics(flowId: string, version: number, data: any) {
  const {
    responses,
    path,
    weights,
    startTime,
    endTime,
  } = data;

  try {
    // Get or create analytics record
    let analytics = await prisma.questionnaireAnalytics.findUnique({
      where: {
        flowId_version: {
          flowId,
          version,
        },
      },
    });

    if (!analytics) {
      analytics = await prisma.questionnaireAnalytics.create({
        data: {
          flowId,
          version,
          totalResponses: 0,
          completionRate: 0,
          averageTime: 0,
          nodeStats: {},
          pathStats: {},
          weightStats: {},
        },
      });
    }

    // Update analytics
    const completionTime = Math.floor((endTime - startTime) / 1000); // in seconds
    const newTotalResponses = analytics.totalResponses + 1;
    const newAverageTime = Math.floor(
      (analytics.averageTime * analytics.totalResponses + completionTime) / newTotalResponses
    );

    // Update node stats
    const nodeStats = { ...analytics.nodeStats as any };
    Object.entries(responses).forEach(([nodeId, response]: [string, any]) => {
      if (!nodeStats[nodeId]) {
        nodeStats[nodeId] = { views: 0, selections: {}, dropouts: 0 };
      }
      nodeStats[nodeId].views++;
      response.optionIds?.forEach((optionId: string) => {
        nodeStats[nodeId].selections[optionId] = (nodeStats[nodeId].selections[optionId] || 0) + 1;
      });
    });

    // Update path stats
    const pathStats = { ...analytics.pathStats as any };
    const pathKey = JSON.stringify(path);
    pathStats[pathKey] = (pathStats[pathKey] || 0) + 1;

    // Update weight stats
    const weightStats = { ...analytics.weightStats as any };
    Object.entries(weights).forEach(([key, value]: [string, any]) => {
      const range = Math.floor(Number(value) / 10) * 10;
      const rangeKey = `${range}-${range + 9}`;
      weightStats[rangeKey] = (weightStats[rangeKey] || 0) + 1;
    });

    // Save updates
    await prisma.questionnaireAnalytics.update({
      where: {
        flowId_version: {
          flowId,
          version,
        },
      },
      data: {
        totalResponses: newTotalResponses,
        averageTime: newAverageTime,
        nodeStats,
        pathStats,
        weightStats,
        completionRate: path.length > 1 ? (analytics.completionRate * analytics.totalResponses + 1) / newTotalResponses : analytics.completionRate,
      },
    });
  } catch (error) {
    console.error('Error updating analytics:', error);
  }
} 