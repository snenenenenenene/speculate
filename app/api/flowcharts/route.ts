// app/api/flowcharts/route.ts
import { authOptions } from "@/app/api/auth/[...nextauth]/options";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    console.log("Session:", session); // Debug log

    if (!session?.user?.email) {
      return NextResponse.json(
        { error: "Unauthorized", details: "No session found" },
        { status: 401 }
      );
    }

    console.log("Fetching flowcharts for user:", session.user.email); // Debug log

    // First find the user
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      console.log("User not found"); // Debug log
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Then find their flowcharts
    const flowcharts = await prisma.flowchart.findMany({
      where: {
        userId: user.id,
      },
      include: {
        charts: {
          select: {
            id: true,
            name: true,
            updatedAt: true,
            isPublished: true,
          },
        },
      },
      orderBy: {
        updatedAt: "desc",
      },
    });

    console.log("Found flowcharts:", flowcharts); // Debug log

    return NextResponse.json(flowcharts);
  } catch (error) {
    console.error("Error in flowcharts GET route:", error); // Detailed error log
    return NextResponse.json(
      {
        error: "Failed to fetch flowcharts",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { name, color } = await req.json();

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const flowchart = await prisma.flowchart.create({
      data: {
        name: name || "New Flowchart",
        color: color || "#80B500",
        userId: user.id,
      },
      include: {
        charts: true,
      },
    });

    return NextResponse.json(flowchart);
  } catch (error) {
    console.error("Error in flowcharts POST route:", error);
    return NextResponse.json(
      {
        error: "Failed to create flowchart",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
