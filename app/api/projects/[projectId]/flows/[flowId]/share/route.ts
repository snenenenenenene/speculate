// app/api/projects/[projectId]/flows/[flowId]/share/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/options";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { nanoid } from "nanoid";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ projectId: string; flowId: string }> }
): Promise<Response> {
  try {
    const { projectId, flowId } = await params;
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    // Get project shares
    const shares = await prisma.projectShare.findMany({
      where: {
        projectId,
        settings: {
          path: ['flowId'],
          equals: flowId
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
    console.error("[FLOW_SHARES_GET]", error);
    return NextResponse.json(
      { error: "Failed to fetch shares" },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ projectId: string; flowId: string }> }
): Promise<Response> {
  try {
    const { projectId, flowId } = await params;
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const body = await request.json();
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
          flowId
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

    const shareUrl = `${process.env.NEXT_PUBLIC_APP_URL}/share/flow/${shareId}`;
    
    return NextResponse.json({
      share,
      shareUrl,
    });
  } catch (error) {
    console.error("[FLOW_SHARE_POST]", error);
    return NextResponse.json(
      { error: "Failed to share flow" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ projectId: string; flowId: string }> }
): Promise<Response> {
  try {
    const { projectId, flowId } = await params;
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { searchParams } = new URL(request.url);
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
        projectId,
        settings: {
          path: ['flowId'],
          equals: flowId
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

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[FLOW_SHARE_DELETE]", error);
    return NextResponse.json(
      { error: "Failed to delete share" },
      { status: 500 }
    );
  }
}