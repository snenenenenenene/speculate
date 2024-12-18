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
  try {
    const params = await Promise.resolve(context.params);
    const { projectId, flowId } = params;
    
    console.log('POST /api/projects/[projectId]/flows/[flowId]/publish - Start', { projectId, flowId });
    
    const session = await getServerSession(authOptions);
    const user = session?.user as SessionUser;

    if (!user?.id || !user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get version metadata and content from request body
    const body = await req.json();
    console.log('Request body:', body);

    const { name, description, changelog, content } = body;
    console.log('Version data:', { name, description, changelog });
    console.log('Flow content:', content);

    if (!content) {
      return NextResponse.json({ error: "Flow content is required" }, { status: 400 });
    }

    // Get flow and check permissions
    const flow = await prisma.chartInstance.findUnique({
      where: { id: flowId },
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
    });

    if (!flow) {
      return NextResponse.json({ error: "Flow not found" }, { status: 404 });
    }

    // Get the latest version number for this flow
    const latestVersion = await prisma.version.findFirst({
      where: { flowId },
      orderBy: { version: 'desc' },
      select: { version: true },
    });

    const nextVersion = (latestVersion?.version || 0) + 1;
    console.log('Next version number:', nextVersion);

    // Check if user has permission to publish
    const canPublish = flow.userId === user.id || 
      flow.project?.collaborators.some(c => 
        ['OWNER', 'ADMIN', 'EDITOR'].includes(c.role)
      );

    if (!canPublish) {
      return NextResponse.json({ error: "Permission denied" }, { status: 403 });
    }

    // Create metadata object
    const metadata = {
      name: name || `Version ${nextVersion}`,
      description: description || '',
      changelog: changelog || [],
      publishedAt: new Date().toISOString(),
      author: {
        id: user.id,
        name: user.name || null,
      },
    };

    console.log('Creating version with metadata:', JSON.stringify(metadata, null, 2));

    // Create new version
    const version = await prisma.version.create({
      data: {
        flowId: flowId,
        version: nextVersion,
        name: metadata.name,
        content: content as Prisma.JsonObject,
        metadata: metadata as Prisma.JsonObject,
        createdBy: user.id,
        publishedAt: new Date(),
      },
    });

    console.log('Created version:', version);

    // Update flow publish settings
    const updatedFlow = await prisma.chartInstance.update({
      where: { id: flowId },
      data: {
        version: nextVersion,
        isPublished: true,
        publishedAt: new Date(),
        content: JSON.stringify(content),
      },
    });

    console.log('Updated flow:', updatedFlow);

    // Create audit log
    await prisma.auditLog.create({
      data: {
        action: 'PUBLISHED' as AuditAction,
        entityType: 'FLOW',
        entityId: flowId,
        userId: user.id,
        projectId: flow.projectId,
        metadata: {
          version: version.version,
          name: version.name,
          description: metadata.description,
          changelog: metadata.changelog,
        } as Prisma.JsonObject,
      },
    });

    return NextResponse.json({ 
      success: true,
      version,
      flow: updatedFlow,
    });
  } catch (error) {
    if (error instanceof Error) {
      console.log('Error publishing flow:', error.message);
      return NextResponse.json(
        { error: "Failed to publish flow", details: error.message },
        { status: 500 }
      );
    }
    console.log('Unknown error publishing flow');
    return NextResponse.json(
      { error: "Failed to publish flow", details: 'Unknown error' },
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