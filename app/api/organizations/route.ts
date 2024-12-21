import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/options";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const body = await req.json();
  const { name, type, domain } = body;

  if (!name) {
    return new NextResponse("Name is required", { status: 400 });
  }

  // Create organization
  const organization = await prisma.organization.create({
    data: {
      name,
      type: type || "BUSINESS",
      domain,
      members: {
        create: {
          userId: session.user.id,
          role: "OWNER",
        },
      },
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

  return NextResponse.json({ organization });
}

export async function GET() {
  const session = await getServerSession(authOptions);
  console.log(session);
  if (!session?.user?.id) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  // Get organizations where user is a member
  const memberships = await prisma.organizationMember.findMany({
    where: {
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

  return NextResponse.json({
    organizations: memberships.map(membership => ({
      ...membership.organization,
      role: membership.role,
    })),
  });
} 