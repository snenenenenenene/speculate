import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/options';
import prisma from '@/lib/prisma';
import { AuditAction, Prisma } from '@prisma/client';

interface SessionUser {
  id: string;
  name?: string | null;
  email?: string | null;
  image?: string | null;
}

export async function POST(
  req: Request,
  context: { params: { projectId: string; flowId: string; versionId: string } }
) {
  const params = await Promise.resolve(context.params);
  const { projectId, flowId, versionId } = params;
  
  console.log('Activating version:', { projectId, flowId, versionId });
  
  const session = await getServerSession(authOptions);
  const user = session?.user as SessionUser;

  if (!user?.id || !user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Get version and check if it exists
  const version = await prisma.version.findUnique({
    where: { id: versionId },
    include: {
      flow: {
        include: {
          project: {
            include: {
              collaborators: {
                where: {
                  userId: user.id,
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

  // Check if user has permission
  const canActivate = version.flow.userId === user.id || 
    version.flow.project?.collaborators.some(c => 
      ['OWNER', 'ADMIN', 'EDITOR'].includes(c.role)
    );

  if (!canActivate) {
    return NextResponse.json({ error: "Permission denied" }, { status: 403 });
  }

  // Update flow with version content
  const updatedFlow = await prisma.chartInstance.update({
    where: { id: flowId },
    data: {
      content: typeof version.content === 'string' ? version.content : JSON.stringify(version.content),
      activeVersionId: versionId,
    },
  });

  // Create audit log
  await prisma.auditLog.create({
    data: {
      action: AuditAction.PUBLISHED,
      entityType: 'FLOW',
      entityId: flowId,
      userId: user.id,
      projectId: version.flow.projectId,
      metadata: {
        versionId: version.id,
        versionNumber: version.version,
        versionName: version.name,
      } as Prisma.JsonObject,
    },
  });

  return NextResponse.json({ 
    success: true,
    version,
    flow: updatedFlow,
  });
} 