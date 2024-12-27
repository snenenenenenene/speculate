import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/options";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import type { OrganizationRole } from ".prisma/client";

export const GET = async (
  request: NextRequest,
  { params }: { params: { id: string } }
): Promise<Response> => {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const organizationId = params.id;

    // Get organization members
    const members = await prisma.organizationMember.findMany({
      where: {
        organizationId,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
          },
        },
      },
    });

    return NextResponse.json({ members });
  } catch (error) {
    console.error("[ORGANIZATION_MEMBERS_GET]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
};

export const POST = async (
  request: NextRequest,
  { params }: { params: { id: string } }
): Promise<Response> => {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const organizationId = params.id;
    const body = await request.json();
    const { email, role = "MEMBER" } = body;

    if (!email) {
      return new NextResponse("Email is required", { status: 400 });
    }

    // Check if user has permission to manage members
    const userMembership = await prisma.organizationMember.findFirst({
      where: {
        organizationId,
        userId: session.user.id,
        role: {
          in: ["OWNER", "ADMIN"],
        },
      },
    });

    if (!userMembership) {
      return new NextResponse("Not authorized to manage members", { status: 403 });
    }

    // Find or check user
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return new NextResponse("User not found", { status: 404 });
    }

    // Check if user is already a member
    const existingMember = await prisma.organizationMember.findUnique({
      where: {
        organizationId_userId: {
          organizationId,
          userId: user.id,
        },
      },
    });

    if (existingMember) {
      return new NextResponse("User is already a member", { status: 400 });
    }

    // Add user to organization
    const member = await prisma.organizationMember.create({
      data: {
        organizationId,
        userId: user.id,
        role: role as OrganizationRole,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
          },
        },
      },
    });

    return NextResponse.json(member);
  } catch (error) {
    console.error("[ORGANIZATION_MEMBERS_POST]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
};

export const PUT = async (
  request: NextRequest,
  { params }: { params: { id: string } }
): Promise<Response> => {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const organizationId = params.id;
    const body = await request.json();
    const { userId, role } = body;

    if (!userId || !role) {
      return new NextResponse("User ID and role are required", { status: 400 });
    }

    // Check if user has permission to manage members
    const userMembership = await prisma.organizationMember.findFirst({
      where: {
        organizationId,
        userId: session.user.id,
        role: {
          in: ["OWNER", "ADMIN"],
        },
      },
    });

    if (!userMembership) {
      return new NextResponse("Not authorized to manage members", { status: 403 });
    }

    // Don't allow changing owner's role
    const targetMember = await prisma.organizationMember.findUnique({
      where: {
        organizationId_userId: {
          organizationId,
          userId,
        },
      },
    });

    if (!targetMember) {
      return new NextResponse("Member not found", { status: 404 });
    }

    if (targetMember.role === "OWNER") {
      return new NextResponse("Cannot change owner's role", { status: 403 });
    }

    const member = await prisma.organizationMember.update({
      where: {
        organizationId_userId: {
          organizationId,
          userId,
        },
      },
      data: { role: role as OrganizationRole },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
          },
        },
      },
    });

    return NextResponse.json(member);
  } catch (error) {
    console.error("[ORGANIZATION_MEMBERS_PUT]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
};

export const DELETE = async (
  request: NextRequest,
  { params }: { params: { id: string } }
): Promise<Response> => {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const organizationId = params.id;
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");

    if (!userId) {
      return new NextResponse("User ID is required", { status: 400 });
    }

    // Check if user has permission to manage members
    const userMembership = await prisma.organizationMember.findFirst({
      where: {
        organizationId,
        userId: session.user.id,
        role: {
          in: ["OWNER", "ADMIN"],
        },
      },
    });

    if (!userMembership) {
      return new NextResponse("Not authorized to manage members", { status: 403 });
    }

    // Don't allow removing the owner
    const targetMember = await prisma.organizationMember.findUnique({
      where: {
        organizationId_userId: {
          organizationId,
          userId,
        },
      },
    });

    if (!targetMember) {
      return new NextResponse("Member not found", { status: 404 });
    }

    if (targetMember.role === "OWNER") {
      return new NextResponse("Cannot remove owner", { status: 403 });
    }

    await prisma.organizationMember.delete({
      where: {
        organizationId_userId: {
          organizationId,
          userId,
        },
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[ORGANIZATION_MEMBERS_DELETE]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}; 