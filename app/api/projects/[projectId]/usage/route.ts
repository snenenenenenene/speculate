import { type NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/options";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const projectId = url.pathname.split('/')[3]; // /api/projects/[projectId]/usage

    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    // Get project to verify access
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
      }
    });

    if (!project) {
      return NextResponse.json(
        { error: "Project not found or permission denied" },
        { status: 404 }
      );
    }

    // Get audit logs for API usage
    const apiLogs = await prisma.auditLog.findMany({
      where: {
        projectId,
        action: {
          in: ['API_KEY_GENERATED', 'API_KEY_REVOKED']
        }
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: 100
    });

    // Get API access logs
    const accessLogs = await prisma.projectShareAccess.findMany({
      where: {
        share: {
          projectId
        }
      },
      orderBy: {
        accessedAt: 'desc'
      },
      take: 100,
      include: {
        user: {
          select: {
            name: true,
            email: true
          }
        }
      }
    });

    // Calculate usage statistics
    const now = new Date();
    const lastWeek = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    const totalAccess = accessLogs.length;
    const lastWeekAccess = accessLogs.filter(log => 
      new Date(log.accessedAt) > lastWeek
    ).length;

    // Get unique users/IPs
    const uniqueUsers = new Set(accessLogs.map(log => 
      log.userId || log.ipAddress
    )).size;

    return NextResponse.json({
      stats: {
        total: totalAccess,
        lastWeek: lastWeekAccess,
        uniqueUsers,
        apiKey: project.apiKey,
        isPublic: project.isPublic
      },
      apiLogs,
      accessLogs
    });
  } catch (error) {
    console.error("[PROJECT_USAGE_GET]", error);
    return NextResponse.json(
      { error: "Failed to fetch project usage" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const url = new URL(req.url);
    const projectId = url.pathname.split('/')[3]; // /api/projects/[projectId]/usage

    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { endpoint, statusCode, duration } = await req.json();

    // Create audit log for API usage
    await prisma.auditLog.create({
      data: {
        action: 'API_KEY_GENERATED',
        entityType: 'API',
        entityId: projectId,
        userId: session.user.id,
        projectId,
        metadata: {
          endpoint,
          statusCode,
          duration
        }
      }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[PROJECT_USAGE_POST]", error);
    return NextResponse.json(
      { error: "Failed to log API usage" },
      { status: 500 }
    );
  }
} 