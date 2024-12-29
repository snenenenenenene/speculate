import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ projectId: string }> }
): Promise<Response> {
  try {
    const { projectId } = await params;

    const activities = await prisma.activity.findMany({
      where: {
        projectId,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json({ activities });
  } catch (error) {
    console.error("[ACTIVITY_GET]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
} 