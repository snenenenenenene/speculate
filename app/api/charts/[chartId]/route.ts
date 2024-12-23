import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function DELETE(
  request: NextRequest,
  context: { params: { chartId: string } }
) {
  try {
    const { chartId } = context.params;

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
