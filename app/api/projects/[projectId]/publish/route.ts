import { type NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/options";
import { prisma } from "@/lib/prisma";
import { type AuditAction, type Prisma } from "@prisma/client";

export async function POST(req: Request) {
  try {
    const url = new URL(req.url);
    const projectId = url.pathname.split('/')[3]; // /api/projects/[projectId]/publish

    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    // Update project to published state
    const project = await prisma.project.update({
      where: { id: projectId },
      data: {
        isPublic: true,
      },
    });

    // Create audit log
    await prisma.auditLog.create({
      data: {
        action: 'PUBLISHED' as AuditAction,
        entityType: 'PROJECT',
        entityId: projectId,
        userId: session.user.id,
        projectId,
        metadata: {} as Prisma.JsonObject,
      },
    });

    return NextResponse.json(project);
  } catch (error) {
    console.error("[PROJECT_PUBLISH]", error);
    return NextResponse.json(
      { error: "Failed to publish project" },
      { status: 500 }
    );
  }
}

export async function DELETE(req: Request) {
  try {
    const url = new URL(req.url);
    const projectId = url.pathname.split('/')[3]; // /api/projects/[projectId]/publish

    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    // Update project to unpublished state
    const project = await prisma.project.update({
      where: { id: projectId },
      data: {
        isPublic: false,
      },
    });

    // Create audit log
    await prisma.auditLog.create({
      data: {
        action: 'UNPUBLISHED' as AuditAction,
        entityType: 'PROJECT',
        entityId: projectId,
        userId: session.user.id,
        projectId,
        metadata: {} as Prisma.JsonObject,
      },
    });

    return NextResponse.json(project);
  } catch (error) {
    console.error("[PROJECT_UNPUBLISH]", error);
    return NextResponse.json(
      { error: "Failed to unpublish project" },
      { status: 500 }
    );
  }
} 