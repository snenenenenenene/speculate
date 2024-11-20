import { authOptions } from "@/app/api/auth/[...nextauth]/options";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

// Get all flowcharts for the current user
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: {
        flowcharts: {
          orderBy: { updatedAt: "desc" },
        },
      },
    });

    return NextResponse.json(user?.flowcharts || []);
  } catch (error) {
    console.error("Error fetching flowcharts:", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

// Create a new flowchart
export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const json = await req.json();
    const { name, color } = json;

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return new NextResponse("User not found", { status: 404 });
    }

    const flowchart = await prisma.flowchart.create({
      data: {
        name: name || "New Flowchart",
        color: color || "#80B500",
        content: "[]", // Default empty flowchart
        userId: user.id,
      },
    });

    return NextResponse.json(flowchart);
  } catch (error) {
    console.error("Error creating flowchart:", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
