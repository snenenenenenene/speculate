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

  const { projectId, flowId } = context.params;
  const { versionName, description, content, autoActivate } = await req.json();

  console.log('Publishing flow:', { projectId, flowId, versionName, autoActivate });

  try {
    // Get the latest version number
    const latestVersion = await prisma.version.findFirst({
      where: { flowId },
      orderBy: { version: 'desc' },
    });

    const nextVersion = (latestVersion?.version || 0) + 1;

    // Create new version
    const newVersion = await prisma.version.create({
      data: {
        name: versionName || `Version ${nextVersion}`,
        description,
        version: nextVersion,
        content: typeof content === 'string' ? content : JSON.stringify(content),
        flowId,
        userId: user.id,
      },
    });

    // If autoActivate is true, set this version as active
    if (autoActivate) {
      await prisma.chartInstance.update({
        where: { id: flowId },
        data: {
          content: typeof content === 'string' ? content : JSON.stringify(content),
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

    return NextResponse.json({ 
      success: true,
      version: newVersion,
      flow: autoActivate ? await prisma.chartInstance.findUnique({ where: { id: flowId } }) : null,
    });
  } catch (error) {
    console.error('Error publishing flow:', error);
    return NextResponse.json(
      { error: "Failed to publish flow" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: Request,
  context: { params: { projectId: string; flowId: string } }
) {
  try {
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
  } catch (error) {
    console.error('Error unpublishing flow:', error);
    console.error('Error details:', error instanceof Error ? {
      name: error.name,
      message: error.message,
      stack: error.stack,
    } : 'Unknown error');
    return NextResponse.json(
      { error: "Failed to unpublish flow" },
      { status: 500 }
    );
  }
}