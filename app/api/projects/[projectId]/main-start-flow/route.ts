import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/options";

export async function PUT(
  req: Request,
  { params }: { params: { projectId: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const { mainStartFlowId } = await req.json();

  // Check if user has access to the project
  const project = await prisma.project.findFirst({
    where: {
      id: params.projectId,
      OR: [
        { userId: session.user.id },
        {
          collaborators: {
            some: {
              userId: session.user.id,
              role: {
                in: ["ADMIN", "OWNER"],
              },
            },
          },
        },
      ],
    },
  });

  if (!project) {
    return new NextResponse("Project not found", { status: 404 });
  }

  // Update the main start flow
  const updatedProject = await prisma.project.update({
    where: {
      id: params.projectId,
    },
    data: {
      mainStartFlowId,
    },
  });

  // Create audit log
  await prisma.auditLog.create({
    data: {
      entityId: params.projectId,
      entityType: "PROJECT",
      action: "UPDATED",
      userId: session.user.id,
      projectId: params.projectId,
      metadata: {
        mainStartFlowId,
        type: "MAIN_START_FLOW_UPDATE"
      },
    },
  });

  return NextResponse.json(updatedProject);
} 