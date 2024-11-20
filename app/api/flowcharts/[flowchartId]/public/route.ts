import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

// Get published flowchart by API key
export async function GET(
  req: Request,
  { params }: { params: { flowchartId: string } }
) {
  try {
    const apiKey = req.headers.get("x-api-key");
    if (!apiKey) {
      return new NextResponse("API key required", { status: 401 });
    }

    const flowchart = await prisma.flowchart.findFirst({
      where: {
        id: params.flowchartId,
        isPublished: true,
        apiKey: apiKey,
      },
      select: {
        id: true,
        name: true,
        content: true,
        version: true,
        updatedAt: true,
      },
    });

    if (!flowchart) {
      return new NextResponse("Flowchart not found or unauthorized", {
        status: 404,
      });
    }

    return NextResponse.json(flowchart);
  } catch (error) {
    console.error("Error fetching flowchart:", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
