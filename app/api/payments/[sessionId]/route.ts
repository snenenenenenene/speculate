/* eslint-disable @typescript-eslint/no-explicit-any */
// app/api/payments/[sessionId]/route.ts
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import Stripe from "stripe";
import { authOptions } from "../../auth/[...nextauth]/options";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2024-06-20",
});

export async function GET(request: Request, { params }) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    // First try to find payment in our database
    const payment = await prisma.payment.findFirst({
      where: {
        stripeSessionId: params.sessionId,
        userId: (session.user as any).id,
      },
    });

    if (payment) {
      return NextResponse.json({
        amount: payment.amount,
        credits: payment.creditAmount,
        date: payment.createdAt,
        status: payment.status,
      });
    }

    // If not found in database, check Stripe directly
    const stripeSession = await stripe.checkout.sessions.retrieve(
      params.sessionId
    );

    if (!stripeSession) {
      return NextResponse.json(
        { error: "Payment session not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      amount: stripeSession.amount_total ? stripeSession.amount_total / 100 : 0,
      credits: stripeSession.metadata?.creditAmount
        ? parseInt(stripeSession.metadata.creditAmount)
        : 0,
      date: new Date(stripeSession.created * 1000).toISOString(),
      status: stripeSession.payment_status,
    });
  } catch (error) {
    console.error("Error fetching payment:", error);
    return NextResponse.json(
      { error: "Failed to fetch payment details" },
      { status: 500 }
    );
  }
}
