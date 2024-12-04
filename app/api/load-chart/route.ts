// app/api/load-chart/route.ts
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";
import { authOptions } from "../auth/[...nextauth]/options";

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const projectId = searchParams.get('projectId');

    if (!projectId) {
      return NextResponse.json({ success: false, error: "Project ID is required" }, { status: 400 });
    }

    const flows = await prisma.flow.findMany({
      where: {
        projectId: projectId,
      },
      orderBy: {
        updatedAt: 'desc',
      },
    });

    return NextResponse.json({
      success: true,
      content: flows.length > 0 ? flows : [],
    });
  } catch (error) {
    console.error("Error loading chart:", error);
    return NextResponse.json(
      { success: false, error: "Failed to load chart" },
      { status: 500 }
    );
  }
}