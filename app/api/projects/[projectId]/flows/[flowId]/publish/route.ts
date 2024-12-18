// app/api/flows/[flowId]/publish/route.ts
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
  context: { params: { projectId: string; flowId: string } }
) {
  const session = await getServerSession(authOptions);
  const user = session?.user as SessionUser;

  if (!user?.id || !user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const params = await Promise.resolve(context.params);
  const { projectId, flowId } = params;

  // Get the flow first to get its current content
  const flow = await prisma.chartInstance.findUnique({
    where: { id: flowId },
  });

  if (!flow) {
    return NextResponse.json({ error: "Flow not found" }, { status: 404 });
  }

  const { versionName, description, autoActivate } = await req.json();

  console.log('Publishing flow:', { projectId, flowId, versionName, autoActivate });

  // Get the latest version number
  const latestVersion = await prisma.version.findFirst({
    where: { flowId },
    orderBy: { version: 'desc' },
  });

  const nextVersion = (latestVersion?.version || 0) + 1;

  // Create new version using the flow's current content
  const newVersion = await prisma.version.create({
    data: {
      name: versionName || `Version ${nextVersion}`,
      version: nextVersion,
      content: flow.content,
      flow: {
        connect: {
          id: flowId
        }
      },
      user: {
        connect: {
          id: user.id
        }
      },
      metadata: {
        description,
      } as Prisma.JsonObject,
    },
  });

  // If autoActivate is true, set this version as active
  if (autoActivate) {
    await prisma.chartInstance.update({
      where: { id: flowId },
      data: {
        isPublished: true,
        publishedAt: new Date(),
        version: nextVersion,
        activeVersionId: newVersion.id,
      },
    });

    // Create audit log for activation
    await prisma.auditLog.create({
      data: {
        action: AuditAction.PUBLISHED,
        entityType: 'FLOW',
        entityId: flowId,
        userId: user.id,
        projectId,
        metadata: {
          versionId: newVersion.id,
          versionNumber: newVersion.version,
          versionName: newVersion.name,
          isActive: true,
        } as Prisma.JsonObject,
      },
    });
  }

  // Create audit log for publish
  await prisma.auditLog.create({
    data: {
      action: AuditAction.PUBLISHED,
      entityType: 'FLOW',
      entityId: flowId,
      userId: user.id,
      projectId,
      metadata: {
        versionId: newVersion.id,
        versionNumber: newVersion.version,
        versionName: newVersion.name,
      } as Prisma.JsonObject,
    },
  });

  // Get the updated flow
  const updatedFlow = await prisma.chartInstance.findUnique({
    where: { id: flowId },
    include: {
      versions: {
        orderBy: { version: 'desc' },
      },
    },
  });

  return NextResponse.json({ 
    success: true,
    version: newVersion,
    flow: updatedFlow,
  });
}

export async function DELETE(
  req: Request,
  context: { params: { projectId: string; flowId: string } }
) {
  const params = await Promise.resolve(context.params);
  const { projectId, flowId } = params;
  
  console.log('Unpublishing flow:', { projectId, flowId });
  
  const session = await getServerSession(authOptions);
  const user = session?.user as SessionUser;

  if (!user?.id || !user?.email) {
    console.log('Unauthorized: No session or email');
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  console.log('Updating flow to unpublish');
  const flow = await prisma.chartInstance.update({
    where: { id: flowId },
    data: {
      isPublished: false,
      publishedAt: null,
      activeVersionId: null,
    },
  });
  console.log('Flow unpublished:', { 
    flowId: flow.id,
    isPublished: flow.isPublished 
  });

  // Create audit log
  console.log('Creating audit log for unpublish');
  await prisma.auditLog.create({
    data: {
      action: 'UNPUBLISHED' as AuditAction,
      entityType: 'FLOW',
      entityId: flowId,
      userId: user.id,
      projectId: flow.projectId,
      metadata: {} as Prisma.JsonObject,
    },
  });
  console.log('Created audit log for unpublish');

  return NextResponse.json({ success: true });
}