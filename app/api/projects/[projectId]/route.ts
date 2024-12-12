// app/api/projects/[projectId]/route.ts
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "../../auth/[...nextauth]/options";

export async function GET(req: Request, { params }: { params: { projectId: string } }) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const project = await prisma.project.findUnique({
      where: {
        id: params.projectId,
        user: {
          email: session.user.email
        }
      }
    });

    if (!project) {
      return NextResponse.json(
        { error: "Project not found" },
        { status: 404 }
      );
    }

    console.log('API GET project - Full project data:', JSON.stringify(project, null, 2));

    // Get flows for this project
    const flows = await prisma.chartInstance.findMany({
      where: {
        projectId: params.projectId,
        user: {
          email: session.user.email
        }
      },
      select: {
        id: true,
        name: true,
        content: true
      }
    });

    const response = { 
      project: {
        ...project,
        globalVariables: project.variables || []
      },
      flows
    };

    console.log('API GET project - Full response:', JSON.stringify(response, null, 2));

    return NextResponse.json(response);
  } catch (error) {
    console.error("Error fetching project:", error);
    return NextResponse.json(
      { error: "Failed to fetch project" },
      { status: 500 }
    );
  }
}

export async function PATCH(req: Request, { params }: { params: { projectId: string } }) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    console.log('API PATCH project - Request body:', JSON.stringify(body, null, 2));

    const updateData: any = {
      updatedAt: new Date()
    };

    if (body.name !== undefined) updateData.name = body.name;
    if (body.description !== undefined) updateData.description = body.description;
    if (body.variables !== undefined) {
      updateData.variables = body.variables;
    }

    console.log('API PATCH project - Update data:', JSON.stringify(updateData, null, 2));

    const project = await prisma.project.update({
      where: {
        id: params.projectId,
        user: {
          email: session.user.email
        }
      },
      data: updateData
    });

    console.log('API PATCH project - Updated project:', JSON.stringify(project, null, 2));

    return NextResponse.json({ 
      project: {
        ...project,
        globalVariables: project.variables || []
      }
    });
  } catch (error) {
    console.error("Error updating project:", error);
    return NextResponse.json(
      { error: "Failed to update project" },
      { status: 500 }
    );
  }
}

export async function DELETE(req: Request, { params }: { params: { projectId: string } }) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Delete associated charts first
    await prisma.chartInstance.deleteMany({
      where: {
        projectId: params.projectId,
        user: {
          email: session.user.email
        }
      }
    });

    // Then delete the project
    const project = await prisma.project.deleteMany({
      where: {
        id: params.projectId,
        user: {
          email: session.user.email
        }
      }
    });

    if (project.count === 0) {
      return NextResponse.json(
        { error: "Project not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting project:", error);
    return NextResponse.json(
      { error: "Failed to delete project" },
      { status: 500 }
    );
  }
}
