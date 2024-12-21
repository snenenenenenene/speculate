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
          id: true,
          type: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  // Get credit history based on whether user is in an org or not
  const creditHistory = await prisma.creditUsage.findMany({
    where: orgMembership
      ? {
          organizationId: orgMembership.organizationId,
        }
      : {
          userId: session.user.id,
          organizationId: null,
        },
    include: {
      flow: {
        select: {
          name: true,
        },
      },
      user: {
        select: {
          name: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
    take: 50, // Limit to last 50 entries
  });

  return NextResponse.json({
    history: creditHistory.map(usage => ({
      id: usage.id,
      amount: usage.amount,
      operation: usage.operation,
      createdAt: usage.createdAt,
      flow: usage.flow,
      user: usage.user,
    })),
  });
} 