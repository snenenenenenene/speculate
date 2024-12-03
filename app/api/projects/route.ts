import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "../auth/[...nextauth]/options";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get user with their email since we don't have direct ID access
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Get all projects for the user including their flows
    const projects = await prisma.project.findMany({
      where: {
        userId: user.id,
      },
      include: {
        flows: true,
      },
      orderBy: {
        updatedAt: "desc",
      },
    });

    return NextResponse.json(projects);
  } catch (error) {
    console.error("Failed to fetch projects:", error);
    return NextResponse.json(
      { error: "Failed to fetch projects" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get user with their email since we don't have direct ID access
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const data = await request.json();

    // Create project with an initial empty flow
    const project = await prisma.project.create({
      data: {
        name: data.name || "New Project",
        description: data.description,
        color: data.color || "#80B500",
        userId: user.id,
        category: data.category,
        tags: data.tags || [],
        flows: {
          create: [
            {
              name: "Main Flow",
              content: JSON.stringify({
                nodes: [],
                edges: [],
              }),
              version: 1,
              color: "#80B500",
            },
          ],
        },
      },
      include: {
        flows: true,
      },
    });

    return NextResponse.json(project);
  } catch (error) {
    console.error("Failed to create project:", error);
    return NextResponse.json(
      { error: "Failed to create project" },
      { status: 500 }
    );
  }
}
