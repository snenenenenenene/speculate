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
  request: Request,
  context: { params: { projectId: string } }
): Promise<NextResponse> {
  console.log('POST /api/projects/[projectId]/publish - Start', { context });
  
  const projectId = context.params.projectId;
  console.log('Project ID:', projectId);
  
  if (!projectId) {
    console.log('No project ID provided');
    return NextResponse.json(
      { error: "Project ID is required" },
      { status: 400 }
    );
  }

  try {
    console.log('Getting session...');
    const session = await getServerSession(authOptions);
    const user = session?.user as SessionUser | undefined;
    
    console.log('Session:', { 
      email: user?.email,
      userId: user?.id 
    });

    if (!user?.email || !user?.id) {
      console.log('Unauthorized - No valid session');
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Get project and check permissions
    console.log('Fetching project...', { projectId });
    const project = await prisma.project.findUnique({
      where: { id: projectId },
      include: {
        collaborators: {
          where: {
            userId: user.id,
          },
        },
      },
    });
    console.log('Project found:', { 
      found: !!project,
      userId: project?.userId,
      collaboratorsCount: project?.collaborators?.length 
    });

    if (!project) {
      console.log('Project not found');
      return NextResponse.json(
        { error: "Project not found" },
        { status: 404 }
      );
    }

    // Check if user has permission to publish
    const canPublish = project.userId === user.id || 
      project.collaborators.some(c => 
        ['OWNER', 'ADMIN', 'EDITOR'].includes(c.role)
      );
    console.log('Publish permission check:', { 
      canPublish,
      isOwner: project.userId === user.id,
      collaboratorRoles: project.collaborators.map(c => c.role)
    });

    if (!canPublish) {
      console.log('Permission denied');
      return NextResponse.json(
        { error: "Permission denied" },
        { status: 403 }
      );
    }

    // Update project to be public and ensure it has an API key
    console.log('Updating project...');
    const updatedProject = await prisma.project.update({
      where: { id: projectId },
      data: {
        isPublic: true,
        apiKey: project.apiKey || `pk_${Math.random().toString(36).substring(2)}${Date.now()}`
      },
    });
    console.log('Project updated:', { 
      id: updatedProject.id,
      isPublic: updatedProject.isPublic,
      hasApiKey: !!updatedProject.apiKey
    });

    // Create audit log
    console.log('Creating audit log...');
    const metadata: Prisma.JsonObject = {
      isPublic: true,
      hasApiKey: !!updatedProject.apiKey
    };

    await prisma.auditLog.create({
      data: {
        action: 'PUBLISHED',
        entityType: 'project',
        entityId: projectId,
        userId: user.id,
        projectId: projectId,
        metadata
      },
    });
    console.log('Audit log created');

    console.log('Sending success response');
    return NextResponse.json({
      success: true,
      project: {
        id: updatedProject.id,
        isPublic: updatedProject.isPublic,
        apiKey: updatedProject.apiKey
      }
    });

  } catch (error: any) {
    console.error('Error publishing project:', {
      error: error.message,
      stack: error.stack,
      name: error.name
    });
    return NextResponse.json(
      { 
        success: false,
        error: error?.message || "Failed to publish project"
      },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { projectId: string } }
) {
  console.log('DELETE /api/projects/[projectId]/publish - Start', { params });
  
  const projectId = params.projectId;
  console.log('Project ID:', projectId);
  
  if (!projectId) {
    console.log('No project ID provided');
    return NextResponse.json(
      { error: "Project ID is required" },
      { status: 400 }
    );
  }

  try {
    console.log('Getting session...');
    const session = await getServerSession(authOptions);
    const user = session?.user as SessionUser | undefined;
    
    console.log('Session:', {
      email: user?.email,
      userId: user?.id
    });

    if (!user?.email || !user?.id) {
      console.log('Unauthorized - No valid session');
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    console.log('Updating project...');
    const project = await prisma.project.update({
      where: { id: projectId },
      data: {
        isPublic: false
      },
    });
    console.log('Project unpublished:', {
      id: project.id,
      isPublic: project.isPublic
    });

    // Create audit log
    console.log('Creating audit log...');
    const metadata: Prisma.JsonObject = {
      isPublic: false
    };

    await prisma.auditLog.create({
      data: {
        action: 'UNPUBLISHED',
        entityType: 'project',
        entityId: projectId,
        userId: user.id,
        projectId: projectId,
        metadata
      },
    });
    console.log('Audit log created');

    console.log('Sending success response');
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error unpublishing project:', {
      error: error.message,
      stack: error.stack,
      name: error.name
    });
    return NextResponse.json(
      { 
        success: false,
        error: error?.message || "Failed to unpublish project"
      },
      { status: 500 }
    );
  }
} 