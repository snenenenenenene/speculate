import { type NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const projectId = url.pathname.split('/')[3]; // /api/public/projects/[projectId]/analytics

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

    // Get all responses for the project's flows
    const responses = await prisma.questionnaireResponse.findMany({
      where: {
        flow: {
          projectId,
        },
      },
      include: {
        flow: true,
      },
      orderBy: {
        startedAt: 'desc',
      },
    });

    // Calculate analytics with default values
    const analytics = {
      totalResponses: responses.length,
      completionRate: responses.filter(r => r.completedAt).length / responses.length || 0,
      averageTime: responses.reduce((acc, r) => {
        if (r.completedAt) {
          const duration = new Date(r.completedAt).getTime() - new Date(r.startedAt).getTime();
          return acc + duration;
        }
        return acc;
      }, 0) / responses.filter(r => r.completedAt).length || 0,
      nodeStats: {},
      weightStats: {},
      pathStats: {},
      userStats: responses.map(r => ({
        userId: r.userId,
        startTime: r.startedAt.getTime(),
        endTime: r.completedAt?.getTime() || r.startedAt.getTime(),
        duration: r.completedAt ? new Date(r.completedAt).getTime() - new Date(r.startedAt).getTime() : 0,
        responses: r.responses as Record<string, string[]>,
        weights: r.weights as Record<string, number>,
        score: 0, // Default score
      })),
    };

    // Calculate node and path statistics
    responses.forEach(response => {
      // Process node responses
      const responseData = response.responses as Record<string, any>;
      Object.entries(responseData).forEach(([nodeId, data]) => {
        if (!analytics.nodeStats[nodeId]) {
          analytics.nodeStats[nodeId] = {
            views: 0,
            selections: {},
          };
        }
        analytics.nodeStats[nodeId].views++;

        // Handle different response formats
        if (Array.isArray(data)) {
          // Handle array of selections
          data.forEach(selection => {
            analytics.nodeStats[nodeId].selections[selection] = 
              (analytics.nodeStats[nodeId].selections[selection] || 0) + 1;
          });
        } else if (typeof data === 'string') {
          // Handle single selection
          analytics.nodeStats[nodeId].selections[data] = 
            (analytics.nodeStats[nodeId].selections[data] || 0) + 1;
        } else if (typeof data === 'object' && data !== null) {
          // Handle object format (e.g., {selected: true})
          Object.entries(data).forEach(([key, value]) => {
            if (value === true) {
              analytics.nodeStats[nodeId].selections[key] = 
                (analytics.nodeStats[nodeId].selections[key] || 0) + 1;
            }
          });
        }
      });

      // Process weights if available
      if (response.weights) {
        Object.entries(response.weights as Record<string, number>).forEach(([key, value]) => {
          analytics.weightStats[key] = (analytics.weightStats[key] || 0) + value;
        });
      }

      // Process path if available
      if (response.path) {
        (response.path as string[]).forEach((nodeId, index) => {
          if (index < (response.path as string[]).length - 1) {
            const transition = `${nodeId}->${(response.path as string[])[index + 1]}`;
            analytics.pathStats[transition] = (analytics.pathStats[transition] || 0) + 1;
          }
        });
      }
    });

    return NextResponse.json({ analytics });
  } catch (error) {
    console.error("[PUBLIC_PROJECT_ANALYTICS_GET]", error);
    return NextResponse.json(
      { error: "Failed to fetch project analytics" },
      { status: 500 }
    );
  }
} 