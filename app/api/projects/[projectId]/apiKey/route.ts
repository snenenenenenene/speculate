// app/api/projects/[projectId]/apikey/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/options";
import { prisma } from "@/lib/prisma";
import crypto from "crypto";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ projectId: string }> }
): Promise<Response> {
  try {
    const { projectId } = await params;
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    // Generate new API key
    const newApiKey = crypto.randomBytes(32).toString('hex');

    const project = await prisma.project.updateMany({
      where: {
        id: projectId,
        user: {
          email: session.user.email
        }
      },
      data: {
        apiKey: newApiKey
      }
    });

    if (project.count === 0) {
      return NextResponse.json(
        { error: "Project not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ apiKey: newApiKey });
  } catch (error) {
    console.error("[API_KEY_POST]", error);
    return NextResponse.json(
      { error: "Internal Error" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ projectId: string }> }
): Promise<Response> {
  try {
    const { projectId } = await params;
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const project = await prisma.project.updateMany({
      where: {
        id: projectId,
        user: {
          email: session.user.email
        }
      },
      data: {
        apiKey: null
      }
    });

    if (project.count === 0) {
      return NextResponse.json(
        { error: "Project not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[API_KEY_DELETE]", error);
    return NextResponse.json(
      { error: "Internal Error" },
      { status: 500 }
    );
  }
}