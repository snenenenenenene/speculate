// app/api/flows/[flowId]/publish/route.ts
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/options';
import prisma from '@/lib/prisma';

export async function POST(
  req: Request,
  { params }: { params: { flowId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const settings = await req.json();

    // Get flow and check permissions
    const flow = await prisma.chartInstance.findUnique({
      where: { id: params.flowId },
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

    if (!flow) {
      return NextResponse.json(
        { error: "Flow not found" },
        { status: 404 }
      );
    }

    // Check if user has permission to publish
    const canPublish = flow.userId === session.user.id || 
      flow.project.collaborators.some(c => 
        ['OWNER', 'ADMIN', 'EDITOR'].includes(c.role)
      );

    if (!canPublish) {
      return NextResponse.json(
        { error: "Permission denied" },
        { status: 403 }
      );
    }

    // Create new version
    const version = await prisma.version.create({
      data: {
        flowId: params.flowId,
        version: flow.version + 1,
        content: flow.content,
        metadata: settings,
        createdBy: session.user.id,
        publishedAt: new Date(),
      },
    });

    // Update flow publish settings
    const updatedFlow = await prisma.chartInstance.update({
      where: { id: params.flowId },
      data: {
        version: flow.version + 1,
        isPublished: true,
        publishedAt: new Date(),
        publishSettings: {
          ...//... continuing from previous publish/route.ts
		  publishSettings: {
			...settings,
			version: version.version,
			publishedAt: version.publishedAt,
			isLatest: true,
			author: {
			  id: session.user.id,
			  name: session.user.name,
			},
		  },
		},
	  });
  
	  // Create audit log
	  await prisma.auditLog.create({
		data: {
		  action: 'VERSION_PUBLISHED',
		  entityType: 'flow',
		  entityId: params.flowId,
		  userId: session.user.id,
		  projectId: flow.projectId,
		  metadata: {
			version: version.version,
			settings,
		  },
		},
	  });
  
	  return NextResponse.json({ 
		version,
		flow: updatedFlow,
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
	{ params }: { params: { flowId: string } }
  ) {
	try {
	  const session = await getServerSession(authOptions);
	  if (!session?.user?.email) {
		return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
	  }
  
	  const flow = await prisma.chartInstance.update({
		where: { id: params.flowId },
		data: {
		  isPublished: false,
		  publishedAt: null,
		  publishSettings: null,
		},
	  });
  
	  // Create audit log
	  await prisma.auditLog.create({
		data: {
		  action: 'VERSION_UNPUBLISHED',
		  entityType: 'flow',
		  entityId: params.flowId,
		  userId: session.user.id,
		  projectId: flow.projectId,
		},
	  });
  
	  return NextResponse.json({ success: true });
	} catch (error) {
	  console.error('Error unpublishing flow:', error);
	  return NextResponse.json(
		{ error: "Failed to unpublish flow" },
		{ status: 500 }
	  );
	}
  }