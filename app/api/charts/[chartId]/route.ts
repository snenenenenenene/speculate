import { prisma } from "@/lib/prisma";
import { type NextRequest } from "next/server";

export async function DELETE(
  request: NextRequest,
  { params }: { params: { chartId: string } }
) {
  try {
    const { chartId } = params;

    // Delete the chart instance
    await prisma.chartInstance.delete({
      where: {
        id: chartId,
      },
    });

    return Response.json({ success: true });
  } catch (error) {
    console.error("Error deleting chart:", error);
    return Response.json(
      { error: "Failed to delete chart" },
      { status: 500 }
    );
  }
}
