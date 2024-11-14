import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "../auth/[...nextauth]/options";

export async function POST(request: Request) {
  console.log("Received POST request to /api/save-chart");

  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      console.log("Unauthorized access attempt");
      return NextResponse.json(
        { statusCode: 401, message: "Unauthorized" },
        { status: 401 },
      );
    }

    console.log("Authenticated user:", session.user.id);

    const body = await request.json();
    console.log("Received request body:", body);

    if (!body.content) {
      console.log("Missing chart content in request");
      return NextResponse.json(
        { statusCode: 400, message: "Missing chart content" },
        { status: 400 },
      );
    }

    console.log("Chart content:", body.content);

    // Update or create the chart instance
    const savedChart = await prisma.chartInstance.upsert({
      where: {
        userId: session.user.id,
      },
      update: {
        content: JSON.stringify(body.content),
      },
      create: {
        userId: session.user.id,
        content: JSON.stringify(body.content),
      },
    });

    console.log("Saved chart:", savedChart);

    return NextResponse.json({
      success: true,
      message: "Chart saved successfully",
      id: savedChart.id,
    });
  } catch (err: any) {
    console.error("Error in POST route:", err);
    return NextResponse.json(
      { statusCode: 500, message: err.message },
      { status: 500 },
    );
  }
}
