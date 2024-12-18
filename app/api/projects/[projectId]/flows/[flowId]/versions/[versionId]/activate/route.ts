import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/options';
import prisma from '@/lib/prisma';

export async function POST(
  req: Request,
  { params }: { params: { projectId: string; flowId: string; versionId: string } }
) {
  const { projectId, flowId, versionId } = params;
  
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get the version to activate
    const version = await prisma.version.findUnique({
      where: { id: versionId },
      include: {
        flow: {
          include: {
            project: {
              include: {
                collaborators: {
                  where: {
                    userId: session.user.id,
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!version) {
      return NextResponse.json({ error: "Version not found" }, { status: 404 });
    }

    // Check if user has permission to activate versions
    const canActivate = version.flow.userId === session.user.id || 
      version.flow.project.collaborators.some(c => 
        ['OWNER', 'ADMIN', 'EDITOR'].includes(c.role)
      );

    if (!canActivate) {
      return NextResponse.json({ error: "Permission denied" }, { status: 403 });
    }

    // Update the flow with the version's content
    const updatedFlow = await prisma.chartInstance.update({
      where: { id: flowId },
      data: {
        content: JSON.stringify(version.content),
        version: version.version,
      },
    });

    // Create audit log
    await prisma.auditLog.create({
      data: {
        action: 'VERSION_ACTIVATED',
        entityType: 'FLOW',
        entityId: flowId,
        userId: session.user.id,
        projectId: version.flow.projectId,
        metadata: {
          versionId: version.id,
          version: version.version,
          name: version.name,
        },
      },
    });

    return NextResponse.json({ 
      success: true,
      version,
      flow: updatedFlow
    });
  } catch (error) {
    console.error('Error activating version:', error);
    return NextResponse.json(
      { error: "Failed to activate version" },
      { status: 500 }
    );
  }
} 