// app/api/flows/[flowId]/publish/route.ts
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/options';
import prisma from '@/lib/prisma';
import { AuditAction } from '@prisma/client';

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
  const { projectId, flowId } = context.params;
  
  try {
    console.log('POST /api/projects/[projectId]/flows/[flowId]/publish - Start', { projectId, flowId });
    
    const session = await getServerSession(authOptions);
    const user = session?.user as SessionUser | undefined;

    console.log('Session:', { 
      userId: user?.id,
      email: user?.email,
      name: user?.name 
    });

    if (!user?.id || !user?.email) {
      console.log('Unauthorized: No session or email');
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get version metadata from request body
    const versionData = await req.json();
    console.log('Version data:', versionData);

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

    console.log('Found flow:', { 
      flowId: flow?.id,
      userId: flow?.userId,
      projectId: flow?.projectId,
      version: flow?.version,
      collaborators: flow?.project?.collaborators 
    });

    if (!flow) {
      console.log('Flow not found');
      return NextResponse.json({ error: "Flow not found" }, { status: 404 });
    }

    // Check if user has permission to publish
    const canPublish = flow.userId === user.id || 
      flow.project?.collaborators.some(c => 
        ['OWNER', 'ADMIN', 'EDITOR'].includes(c.role)
      );

    console.log('Publish permission check:', {
      canPublish,
      isOwner: flow.userId === user.id,
      collaboratorRoles: flow.project?.collaborators.map(c => c.role)
    });

    if (!canPublish) {
      console.log('Permission denied');
      return NextResponse.json({ error: "Permission denied" }, { status: 403 });
    }

    // Create version metadata
    const metadata = {
      name: versionData.name || `Version ${flow.version + 1}`,
      description: versionData.description || '',
      changelog: versionData.changelog || [],
      publishedAt: new Date(),
      author: {
        id: user.id,
        name: user.name,
      },
    };

    console.log('Creating version with metadata:', metadata);

    // Create new version
    const version = await prisma.version.create({
      data: {
        flowId: flowId,
        version: flow.version + 1,
        name: metadata.name,
        content: flow.content,
        metadata,
        createdBy: user.id,
        publishedAt: new Date(),
      },
    });

    console.log('Created version:', { 
      versionId: version.id,
      version: version.version,
      flowId: version.flowId 
    });

    // Update flow publish settings
    const updatedFlow = await prisma.chartInstance.update({
      where: { id: flowId },
      data: {
        version: flow.version + 1,
        isPublished: true,
        publishedAt: new Date(),
      },
    });

    console.log('Updated flow:', { 
      flowId: updatedFlow.id,
      version: updatedFlow.version,
      isPublished: updatedFlow.isPublished,
      publishedAt: updatedFlow.publishedAt 
    });

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
        },
      },
    });

    console.log('Created audit log');

    return NextResponse.json({ 
      success: true,
      version,
      flow: updatedFlow,
    });

  } catch (error) {
    console.error('Error publishing flow:', error);
    console.error('Error details:', error instanceof Error ? {
      name: error.name,
      message: error.message,
      stack: error.stack,
    } : 'Unknown error');

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
  const { projectId, flowId } = await Promise.resolve(context.params);
  
  console.log('Unpublishing flow:', { projectId, flowId });
  
  try {
    const session = await getServerSession(authOptions);
    const user = session?.user as SessionUser | undefined;

    if (!user?.id || !user?.email) {
      console.log('Unauthorized: No session or email');
      return new Response(JSON.stringify({ error: "Unauthorized" }), { 
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      });
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
      },
    });
    console.log('Created audit log for unpublish');

    return new Response(JSON.stringify({ success: true }), { 
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Error unpublishing flow:', error);
    console.error('Error details:', error instanceof Error ? {
      name: error.name,
      message: error.message,
      stack: error.stack,
    } : 'Unknown error');
    return new Response(JSON.stringify({ error: "Failed to unpublish flow" }), { 
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}