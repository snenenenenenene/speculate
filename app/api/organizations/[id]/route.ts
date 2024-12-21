import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/options";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const organizationId = params.id;

    // Get organization with member role
    const membership = await prisma.organizationMember.findFirst({
      where: {
        organizationId,
        userId: session.user.id,
      },
      include: {
        organization: {
          include: {
            _count: {
              select: {
                members: true,
                projects: true,
              },
            },
          },
        },
      },
    });

    if (!membership) {
      return new NextResponse("Organization not found", { status: 404 });
    }

    return NextResponse.json({
      organization: {
        ...membership.organization,
        role: membership.role,
      },
    });
  } catch (error) {
    console.error("[ORGANIZATION_GET]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const organizationId = params.id;
    const body = await req.json();
    const { name, type, domain } = body;

    // Check if user has permission to update organization
    const membership = await prisma.organizationMember.findFirst({
      where: {
        organizationId,
        userId: session.user.id,
        role: {
          in: ["OWNER", "ADMIN"],
        },
      },
    });

    if (!membership) {
      return new NextResponse("Not authorized to update organization", { status: 403 });
    }

    // Update organization
    const organization = await prisma.organization.update({
      where: { id: organizationId },
      data: {
        name,
        type,
        domain,
        // Reset verification if domain changes
        verified: domain ? false : undefined,
      },
      include: {
        _count: {
          select: {
            members: true,
            projects: true,
          },
        },
      },
    });

    return NextResponse.json({
      organization: {
        ...organization,
        role: membership.role,
      },
    });
  } catch (error) {
    console.error("[ORGANIZATION_PATCH]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const organizationId = params.id;

    // Check if user is the owner
    const membership = await prisma.organizationMember.findFirst({
      where: {
        organizationId,
        userId: session.user.id,
        role: "OWNER",
      },
    });

    if (!membership) {
      return new NextResponse("Only the owner can delete the organization", { status: 403 });
    }

    // Delete organization (this will cascade delete all related data)
    await prisma.organization.delete({
      where: { id: organizationId },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[ORGANIZATION_DELETE]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
} 