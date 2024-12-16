// app/api/flows/[flowId]/share/route.ts
import { authOptions } from '@/app/api/auth/[...nextauth]/options';
import { prisma } from '@/lib/prisma';
import crypto from 'crypto';
import { nanoid } from 'nanoid';
import { getServerSession } from 'next-auth';
import { NextResponse } from 'next/server';

export async function GET(
  req: Request,
  { params }: { params: { flowId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const shares = await prisma.share.findMany({
      where: {
        flowId: params.flowId,
        createdBy: session.user.id,
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
    console.error('Error fetching shares:', error);
    return NextResponse.json(
      { error: "Failed to fetch shares" },
      { status: 500 }
    );
  }
}

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
    const shareId = nanoid();
    const accessKey = crypto.randomBytes(32).toString('hex');

    // Create share record
    const share = await prisma.share.create({
      data: {
        flowId: params.flowId,
        createdBy: session.user.id,
        settings: {
          ...settings,
          shareId,
          accessKey,
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

    // Update flow share settings
    await prisma.chartInstance.update({
      where: { id: params.flowId },
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
        action: 'SHARE_CREATED',
        entityType: 'flow',
        entityId: params.flowId,
        userId: session.user.id,
        projectId: share.projectId,
        metadata: {
          shareId,
          settings,
        },
      },
    });

    const shareUrl = `${process.env.NEXT_PUBLIC_APP_URL}/share/${shareId}`;
    
    return NextResponse.json({
      share,
      shareUrl,
    });
  } catch (error) {
    console.error('Error sharing flow:', error);
    return NextResponse.json(
      { error: "Failed to share flow" },
      { status: 500 }
    );
  }
}