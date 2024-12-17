// app/api/flows/[flowId]/publish/route.ts
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/options';
import prisma from '@/lib/prisma';

export async function POST(
  req: Request,
  context: { params: { projectId: string; flowId: string } }
) {
  const { projectId, flowId } = await Promise.resolve(context.params);
  
  console.log('Publishing flow:', { projectId, flowId });
  
  try {
    const session = await getServerSession(authOptions);
    console.log('Session:', { 
      userId: session?.user?.id,
      email: session?.user?.email,
      name: session?.user?.name 
    });

    if (!session?.user?.email) {
      console.log('Unauthorized: No session or email');
      return new Response(JSON.stringify({ error: "Unauthorized" }), { 
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Default empty settings object since we don't need request body
    const settings = {
      publishedAt: new Date(),
      isLatest: true,
      author: {
        id: session.user.id,
        name: session.user.name,
      },
    };
    console.log('Publish settings:', settings);

    // Get flow and check permissions
    const flow = await prisma.chartInstance.findUnique({
      where: { id: flowId },
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
    });
    console.log('Found flow:', { 
      flowId: flow?.id,
      userId: flow?.userId,
      projectId: flow?.projectId,
      version: flow?.version,
      collaborators: flow?.project?.collaborators 
    });

    if (!flow) {
      console.log('Flow not found:', flowId);
      return new Response(JSON.stringify({ error: "Flow not found" }), { 
        status: 404,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Check if user has permission to publish
    const canPublish = flow.userId === session.user.id || 
      flow.project.collaborators.some(c => 
        ['OWNER', 'ADMIN', 'EDITOR'].includes(c.role)
      );
    console.log('Publish permission check:', { 
      canPublish,
      flowUserId: flow.userId,
      sessionUserId: session.user.id,
      collaboratorRoles: flow.project.collaborators.map(c => c.role)
    });

    if (!canPublish) {
      console.log('Permission denied for user:', session.user.id);
      return new Response(JSON.stringify({ error: "Permission denied" }), { 
        status: 403,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Create new version
    console.log('Creating new version with content length:', flow.content?.length);
    const version = await prisma.version.create({
      data: {
        flowId: flowId,
        version: flow.version + 1,
        content: flow.content,
        metadata: settings,
        createdBy: session.user.id,
        publishedAt: new Date(),
      },
    });
    console.log('Created version:', { 
      versionId: version.id,
      version: version.version,
      flowId: version.flowId 
    });

    // Update flow publish settings
    console.log('Updating flow publish settings');
    const updatedFlow = await prisma.chartInstance.update({
      where: { id: flowId },
      data: {
        version: flow.version + 1,
        isPublished: true,
        publishedAt: new Date(),
        publishSettings: settings,
      },
    });
    console.log('Updated flow:', { 
      flowId: updatedFlow.id,
      version: updatedFlow.version,
      isPublished: updatedFlow.isPublished,
      publishedAt: updatedFlow.publishedAt 
    });

    // Create audit log
    console.log('Creating audit log');
    await prisma.auditLog.create({
      data: {
        action: 'FLOW_PUBLISHED',
        entityType: 'FLOW',
        entityId: flowId,
        userId: session.user.id,
        projectId: flow.projectId,
        metadata: {
          version: version.version,
          settings,
        },
      },
    });
    console.log('Created audit log');

    return new Response(JSON.stringify({ 
      version,
      flow: updatedFlow,
    }), { 
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Error publishing flow:', error);
    console.error('Error details:', {
      name: error.name,
      message: error.message,
      stack: error.stack,
    });
    return new Response(JSON.stringify({ error: "Failed to publish flow" }), { 
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
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
    if (!session?.user?.email) {
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
        publishSettings: null,
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
        action: 'FLOW_UNPUBLISHED',
        entityType: 'FLOW',
        entityId: flowId,
        userId: session.user.id,
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
    console.error('Error details:', {
      name: error.name,
      message: error.message,
      stack: error.stack,
    });
    return new Response(JSON.stringify({ error: "Failed to unpublish flow" }), { 
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}