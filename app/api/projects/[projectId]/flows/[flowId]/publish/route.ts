// app/api/projects/[projectId]/flows/[flowId]/publish/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/options";
import { prisma } from "@/lib/prisma";
import { type AuditAction, type Prisma } from "@prisma/client";

interface SessionUser {
  id: string;
  name?: string | null;
  email?: string | null;
  image?: string | null;
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
    const { name, content, metadata } = body;

    // Get the flow first to verify it exists
    const flow = await prisma.chartInstance.findUnique({
      where: { id: flowId },
    });

    if (!flow) {
      return NextResponse.json(
        { error: "Flow not found" },
        { status: 404 }
      );
    }

    // Get the latest version number
    const latestVersion = await prisma.version.findFirst({
      where: { flowId },
      orderBy: { version: 'desc' },
    });

    const nextVersion = (latestVersion?.version || 0) + 1;

    // Create a new version
    const version = await prisma.version.create({
      data: {
        name: name || `Version ${nextVersion}`,
        version: nextVersion,
        content,
        metadata,
        flow: {
          connect: {
            id: flowId
          }
        },
        user: {
          connect: {
            id: session.user.id
          }
        }
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    return NextResponse.json(version);
  } catch (error) {
    console.error("[FLOW_PUBLISH]", error);
    return NextResponse.json(
      { error: "Failed to publish flow" },
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

    console.log('Updating flow to unpublish');
    const flow = await prisma.chartInstance.update({
      where: { id: flowId },
      data: {
        isPublished: false,
        publishedAt: null,
        activeVersionId: null,
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
        userId: session.user.id,
        projectId: flow.projectId,
        metadata: {} as Prisma.JsonObject,
      },
    });
    console.log('Created audit log for unpublish');

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[FLOW_UNPUBLISH]", error);
    return NextResponse.json(
      { error: "Failed to unpublish flow" },
      { status: 500 }
    );
  }
}