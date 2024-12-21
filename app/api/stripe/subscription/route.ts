import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/options";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // First check if user is part of an organization
  const orgMembership = await prisma.organizationMember.findFirst({
    where: {
      userId: session.user.id,
    },
    include: {
      organization: {
        include: {
          subscription: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  // Check for organization subscription first
  if (orgMembership?.organization?.subscription) {
    const orgSub = orgMembership.organization.subscription;
    const stripeSub = await stripe.subscriptions.retrieve(orgSub.stripeSubscriptionId);
    
    return NextResponse.json({
      subscription: {
        ...orgSub,
        stripeSubscription: stripeSub,
        isOrganization: true,
      },
    });
  }

  // Otherwise check personal subscription
  const subscription = await prisma.subscription.findFirst({
    where: {
      userId: session.user.id,
      NOT: {
        status: "canceled",
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  if (!subscription) {
    return NextResponse.json({ subscription: null });
  }

  const stripeSubscription = await stripe.subscriptions.retrieve(
    subscription.stripeSubscriptionId
  );

  return NextResponse.json({
    subscription: {
      ...subscription,
      stripeSubscription,
      isOrganization: false,
    },
  });
} 