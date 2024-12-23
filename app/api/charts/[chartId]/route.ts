import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

type RouteContext = {
  params: {
    chartId: string;
  };
};

export async function DELETE(
  _req: NextRequest,
  { params }: RouteContext
) {
  try {
    const { chartId } = params;

    // Delete the chart instance
    await prisma.chartInstance.delete({
      where: {
        id: chartId,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting chart:", error);
    return NextResponse.json(
      { error: "Failed to delete chart" },
      { status: 500 }
    );
  }
}
