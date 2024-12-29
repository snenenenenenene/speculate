import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/options";
import { prisma } from "@/lib/prisma";
import { type AuditAction, type Prisma } from "@prisma/client";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ projectId: string; flowId: string; versionId: string }> }
): Promise<Response> {
  try {
    const { projectId, flowId, versionId } = await params;
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    // Update flow to set active version
    const flow = await prisma.chartInstance.update({
      where: { id: flowId },
      data: {
        isPublished: true,
        publishedAt: new Date(),
        activeVersionId: versionId,
      },
      include: {
        activeVersion: true,
      },
    });

    // Create audit log
    await prisma.auditLog.create({
      data: {
        action: 'PUBLISHED' as AuditAction,
        entityType: 'FLOW',
        entityId: flowId,
        userId: session.user.id,
        projectId,
        metadata: {
          versionId,
          version: flow.activeVersion?.version,
          versionName: flow.activeVersion?.name,
        } as Prisma.JsonObject,
      },
    });

    return NextResponse.json(flow);
  } catch (error) {
    console.error("[VERSION_ACTIVATE]", error);
    return NextResponse.json(
      { error: "Failed to activate version" },
      { status: 500 }
    );
  }
} 