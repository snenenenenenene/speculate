import { authOptions } from '@/app/api/auth/[...nextauth]/options';
import prisma from '@/lib/prisma';
import { ProjectShareSettings } from '@/types';
import bcrypt from 'bcryptjs';
import { nanoid } from 'nanoid';
import { getServerSession } from 'next-auth';
import { NextResponse } from 'next/server';
import { NextRequest } from "next/server";

export async function GET(
  req: Request,
  { params }: { params: { projectId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get project shares
    const shares = await prisma.projectShare.findMany({
      where: {
        projectId: params.projectId,
        project: {
          OR: [
            { userId: session.user.id },
            {
              collaborators: {
                some: {
                  userId: session.user.id,
                  role: { in: ['OWNER', 'ADMIN'] }
                }
              }
            }
          ]
        }
      },
      include: {
        user: {
          select: {
            name: true,
            email: true,
          },
        },
      },
    });

    return NextResponse.json({ shares });
  } catch (error) {
    console.error('Error fetching project shares:', error);
    return NextResponse.json(
      { error: "Failed to fetch shares" },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ projectId: string }> }
): Promise<Response> {
  try {
    const { projectId } = await params;
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const body = await request.json();
    const { enabled } = body;

    const settings = await req.json() as Partial<ProjectShareSettings>;
    const shareId = nanoid();

    // Hash password if provided
    let hashedPassword = null;
    if (settings.password) {
      hashedPassword = await bcrypt.hash(settings.password, 10);
    }

    // Create share record
    const share = await prisma.projectShare.create({
      data: {
        projectId: params.projectId,
        createdBy: session.user.id,
        shareId,
        password: hashedPassword,
        settings: {
          ...settings,
          shareId,
        },
      },
      include: {
        user: {
          select: {
            name: true,
            email: true,
          },
        },
      },
    });

    // Update project share settings
    await prisma.project.update({
      where: { id: params.projectId },
      data: {
        shareSettings: {
          ...settings,
          shareId,
        },
      },
    });

    // Create audit log
    await prisma.auditLog.create({
      data: {
        action: 'PROJECT_SHARED',
        entityType: 'project',
        entityId: params.projectId,
        userId: session.user.id,
        projectId: params.projectId,
        metadata: {
          shareId,
          settings,
        },
      },
    });

    const shareUrl = `${process.env.NEXT_PUBLIC_APP_URL}/share/project/${shareId}`;
    
    return NextResponse.json({
      share,
      shareUrl,
    });
  } catch (error) {
    console.error('Error sharing project:', error);
    return NextResponse.json(
      { error: "Failed to share project" },
      { status: 500 }
    );
  }
}

// Update share settings
export async function PATCH(
  req: Request,
  { params }: { params: { projectId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { shareId, settings } = await req.json();

    // Verify permission to update share
    const share = await prisma.projectShare.findFirst({
      where: {
        id: shareId,
        projectId: params.projectId,
        project: {
          OR: [
            { userId: session.user.id },
            {
              collaborators: {
                some: {
                  userId: session.user.id,
                  role: { in: ['OWNER', 'ADMIN'] }
                }
              }
            }
          ]
        }
      },
    });

    if (!share) {
      return NextResponse.json(
        { error: "Share not found or permission denied" },
        { status: 404 }
      );
    }

    // Update password if changed
    let hashedPassword = share.password;
    if (settings.password) {
      hashedPassword = await bcrypt.hash(settings.password, 10);
    }

    // Update share
    const updatedShare = await prisma.projectShare.update({
      where: { id: shareId },
      data: {
        settings: settings,
        password: hashedPassword,
      },
      include: {
        user: {
          select: {
            name: true,
            email: true,
          },
        },
      },
    });

    return NextResponse.json({ share: updatedShare });
  } catch (error) {
    console.error('Error updating project share:', error);
    return NextResponse.json(
      { error: "Failed to update share" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: { projectId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const shareId = searchParams.get('shareId');

    if (!shareId) {
      return NextResponse.json(
        { error: "Share ID is required" },
        { status: 400 }
      );
    }

    // Verify permission to delete share
    const share = await prisma.projectShare.findFirst({
      where: {
        id: shareId,
        projectId: params.projectId,
        project: {
          OR: [
            { userId: session.user.id },
            {
              collaborators: {
                some: {
                  userId: session.user.id,
                  role: { in: ['OWNER', 'ADMIN'] }
                }
              }
            }
          ]
        }
      },
    });

    if (!share) {
      return NextResponse.json(
        { error: "Share not found or permission denied" },
        { status: 404 }
      );
    }

    // Delete share
    await prisma.projectShare.delete({
      where: { id: shareId },
    });

    // Create audit log
    await prisma.auditLog.create({
      data: {
        action: 'PROJECT_SHARE_REVOKED',
        entityType: 'project',
        entityId: params.projectId,
        userId: session.user.id,
        projectId: params.projectId,
        metadata: {
          shareId,
        },
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting project share:', error);
    return NextResponse.json(
      { error: "Failed to delete share" },
      { status: 500 }
    );
  }
}