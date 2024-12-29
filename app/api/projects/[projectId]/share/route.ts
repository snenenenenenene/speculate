import { type NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/options";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { nanoid } from "nanoid";
import { type AuditAction, type Prisma } from "@prisma/client";

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const projectId = url.pathname.split('/')[3]; // /api/projects/[projectId]/share

    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    // Get project shares
    const shares = await prisma.projectShare.findMany({
      where: {
        projectId,
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
    console.error("[PROJECT_SHARES_GET]", error);
    return NextResponse.json(
      { error: "Failed to fetch shares" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const url = new URL(req.url);
    const projectId = url.pathname.split('/')[3]; // /api/projects/[projectId]/share

    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const body = await req.json();
    const { password, settings } = body;
    const shareId = nanoid();

    // Hash password if provided
    let hashedPassword = null;
    if (password) {
      hashedPassword = await bcrypt.hash(password, 10);
    }

    // Create share record
    const share = await prisma.projectShare.create({
      data: {
        projectId,
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

    // Create audit log
    await prisma.auditLog.create({
      data: {
        action: 'SHARE_CREATED' as AuditAction,
        entityType: 'PROJECT',
        entityId: projectId,
        userId: session.user.id,
        projectId,
        metadata: {
          shareId,
          settings,
        } as Prisma.JsonObject,
      },
    });

    const shareUrl = `${process.env.NEXT_PUBLIC_APP_URL}/share/project/${shareId}`;
    
    return NextResponse.json({
      share,
      shareUrl,
    });
  } catch (error) {
    console.error("[PROJECT_SHARE_POST]", error);
    return NextResponse.json(
      { error: "Failed to share project" },
      { status: 500 }
    );
  }
}

export async function PATCH(req: Request) {
  try {
    const url = new URL(req.url);
    const projectId = url.pathname.split('/')[3]; // /api/projects/[projectId]/share

    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const body = await req.json();
    const { shareId, settings } = body;

    // Verify permission to update share
    const share = await prisma.projectShare.findFirst({
      where: {
        id: shareId,
        projectId,
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
        settings,
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
    console.error("[PROJECT_SHARE_PATCH]", error);
    return NextResponse.json(
      { error: "Failed to update share" },
      { status: 500 }
    );
  }
}

export async function DELETE(req: Request) {
  try {
    const url = new URL(req.url);
    const projectId = url.pathname.split('/')[3]; // /api/projects/[projectId]/share
    const searchParams = new URL(req.url).searchParams;
    const shareId = searchParams.get('shareId');

    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

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
        projectId,
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
        action: 'SHARE_DELETED' as AuditAction,
        entityType: 'PROJECT',
        entityId: projectId,
        userId: session.user.id,
        projectId,
        metadata: {
          shareId,
        } as Prisma.JsonObject,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[PROJECT_SHARE_DELETE]", error);
    return NextResponse.json(
      { error: "Failed to delete share" },
      { status: 500 }
    );
  }
}