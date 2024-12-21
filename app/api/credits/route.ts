import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/options";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  // First check if user is part of an organization
  const orgMembership = await prisma.organizationMember.findFirst({
    where: {
      userId: session.user.id,
    },
    include: {
      organization: {
        select: {
          credits: true,
          type: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  // If user is part of an organization, return org credits
  if (orgMembership?.organization) {
    const org = orgMembership.organization;
    // For school organizations, return unlimited credits or a very high number
    if (org.type === "SCHOOL") {
      return NextResponse.json({ credits: 999999 });
    }
    return NextResponse.json({ credits: org.credits });
  }

  // Otherwise return user's personal credits
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      credits: true,
    },
  });

  if (!user) {
    return new NextResponse("User not found", { status: 404 });
  }

  return NextResponse.json({ credits: user.credits });
} 