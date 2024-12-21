import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getCreditCost, hasInfiniteCredits } from "@/lib/dev-mode";

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await req.json();
    const { amount } = body;

    if (!amount) {
      return NextResponse.json(
        { error: "Amount is required" },
        { status: 400 }
      );
    }

    // Check if user has infinite credits
    if (hasInfiniteCredits(session.user.role)) {
      return NextResponse.json({ success: true, credits: Infinity });
    }

    // Get actual cost (might be 0 in dev mode)
    const actualCost = getCreditCost(amount, session.user.role);
    if (actualCost === 0) {
      return NextResponse.json({ success: true, credits: Infinity });
    }

    // Get user's current credits
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { credits: true }
    });

    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    // Check if user has enough credits
    if (user.credits < actualCost) {
      return NextResponse.json(
        { error: "Insufficient credits" },
        { status: 400 }
      );
    }

    // Deduct credits
    const updatedUser = await prisma.user.update({
      where: { id: session.user.id },
      data: {
        credits: {
          decrement: actualCost
        }
      },
      select: { credits: true }
    });

    return NextResponse.json({
      success: true,
      credits: updatedUser.credits
    });
  } catch (error) {
    console.error("Error deducting credits:", error);
    return NextResponse.json(
      { error: "Failed to deduct credits" },
      { status: 500 }
    );
  }
} 