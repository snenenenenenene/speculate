import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";
import { authOptions } from "../auth/[...nextauth]/options";

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const body = await request.json();
    const { name, description, color } = body;

    // Create project with flow in a single transaction
    const project = await prisma.project.create({
      data: {
        name,
        description,
        color,
        userId: user.id,
        flow: {
          create: {
            name: "Main Flow",
            description: "Default project flow",
            chartInstances: {
              create: {
                name: "Default Chart",
                nodes: [],
                edges: [],
                color: color || "#3B82F6",
              }
            }
          }
        }
      },
      include: {
        flow: {
          include: {
            chartInstances: true
          }
        }
      }
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

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const projects = await prisma.project.findMany({
      where: { userId: user.id },
      include: {
        flow: {
          include: {
            chartInstances: true
          }
        }
      },
      orderBy: { updatedAt: "desc" }
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
