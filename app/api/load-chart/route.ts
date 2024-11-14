// app/api/load-chart/route.ts
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "../auth/[...nextauth]/options";

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const chartInstance = await prisma.chartInstance.findUnique({
      where: {
        userId: session.user.id,
      },
    });

    if (!chartInstance) {
      return NextResponse.json({
        success: true,
        content: null,
      });
    }

    return NextResponse.json({
      success: true,
      content: chartInstance.content,
    });
  } catch (error) {
    console.error("Error loading chart:", error);
    return NextResponse.json(
      { error: "Failed to load chart" },
      { status: 500 },
    );
  }
}
