// app/api/flowcharts/[flowchartId]/route.ts
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { NextRequest } from "next/server";

export async function GET(
  request: NextRequest,
  { params }: { params: { flowchartId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
      });
    }

    const flowchartId = await params.flowchartId;
    console.log("Fetching flowchart:", flowchartId);
    console.log("Session:", session);

    const flowchart = await prisma.flowchart.findUnique({
      where: {
        id: flowchartId,
      },
      include: {
        charts: true,
      },
    });

    console.log("Found flowchart:", flowchart);

    if (!flowchart) {
      return new Response(JSON.stringify({ error: "Flowchart not found" }), {
        status: 404,
      });
    }

    return new Response(JSON.stringify(flowchart), {
      status: 200,
    });
  } catch (error) {
    console.error("Error:", error);
    return new Response(
      JSON.stringify({ error: "Failed to fetch flowchart" }),
      { status: 500 }
    );
  }
}
