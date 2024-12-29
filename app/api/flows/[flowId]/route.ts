import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ flowId: string }> }
): Promise<Response> {
  try {
    const { flowId } = await params;
    const flow = await prisma.chartInstance.findUnique({
      where: { id: flowId },
      include: {
        versions: true
      }
    });

    if (!flow) {
      return NextResponse.json(
        { error: "Flow not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(flow);
  } catch (error) {
    console.error("[FLOW_GET]", error);
    return NextResponse.json(
      { error: "Failed to fetch flow" },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ flowId: string }> }
): Promise<Response> {
  try {
    const { flowId } = await params;
    const body = await request.json();
    const { name, chartInstances } = body;

    const flow = await prisma.chartInstance.update({
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

    return NextResponse.json(flow);
  } catch (error) {
    console.error("[FLOW_PATCH]", error);
    return NextResponse.json(
      { error: "Failed to update flow" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ flowId: string }> }
): Promise<Response> {
  try {
    const { flowId } = await params;
    await prisma.chartInstance.delete({
      where: { id: flowId }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[FLOW_DELETE]", error);
    return NextResponse.json(
      { error: "Failed to delete flow" },
      { status: 500 }
    );
  }
}
