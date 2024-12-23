import { type NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ flowId: string }> }
) {
  try {
    const { flowId } = await params;
    const flow = await prisma.flow.findUnique({
      where: { id: flowId },
      include: {
        chartInstances: true
      }
    });

    if (!flow) {
      return Response.json(
        { error: "Flow not found" },
        { status: 404 }
      );
    }

    return Response.json(flow);
  } catch (error) {
    console.error("Error fetching flow:", error);
    return Response.json(
      { error: "Failed to fetch flow" },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ flowId: string }> }
) {
  try {
    const { flowId } = await params;
    const body = await request.json();
    const { name, chartInstances } = body;

    const flow = await prisma.flow.update({
      where: { id: flowId },
      data: {
        name,
        chartInstances: {
          upsert: chartInstances?.map((instance: any) => ({
            where: { id: instance.id },
            create: {
              id: instance.id,
              name: instance.name,
              nodes: instance.nodes,
              edges: instance.edges,
              color: instance.color,
              onePageMode: instance.onePageMode,
              publishedVersions: instance.publishedVersions,
              variables: instance.variables,
            },
            update: {
              name: instance.name,
              nodes: instance.nodes,
              edges: instance.edges,
              color: instance.color,
              onePageMode: instance.onePageMode,
              publishedVersions: instance.publishedVersions,
              variables: instance.variables,
            }
          }))
        }
      },
      include: {
        chartInstances: true
      }
    });

    return Response.json(flow);
  } catch (error) {
    console.error("Error updating flow:", error);
    return Response.json(
      { error: "Failed to update flow" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ flowId: string }> }
) {
  try {
    const { flowId } = await params;
    await prisma.flow.delete({
      where: { id: flowId }
    });

    return Response.json({ success: true });
  } catch (error) {
    console.error("Error deleting flow:", error);
    return Response.json(
      { error: "Failed to delete chart" },
      { status: 500 }
    );
  }
}
