import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import Stripe from "stripe";
import { formatAmountForStripe } from "@/lib/stripe-helper";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2024-10-28.acacia",
});

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
    const { amount, creditAmount } = body;

    if (!amount || !creditAmount) {
      return NextResponse.json(
        { error: "Amount and credit amount are required" },
        { status: 400 }
      );
    }

    const checkoutSession = await stripe.checkout.sessions.create({
      mode: "payment",
      submit_type: "pay",
      payment_method_types: ["card"],
      customer_email: session.user.email ?? undefined,
      metadata: {
        userId: session.user.id,
        creditAmount: creditAmount.toString(),
      },
      line_items: [
        {
          price_data: {
            currency: "usd",
            unit_amount: formatAmountForStripe(amount, "usd"),
            product_data: {
              name: `${creditAmount} Credits`,
              description: "Credits for Speculate",
            },
          },
          quantity: 1,
        },
      ],
      success_url: `${req.headers.get("origin") ?? ""}/dashboard?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${req.headers.get("origin") ?? ""}/pricing`,
    });

    return NextResponse.json(checkoutSession);
  } catch (error) {
    console.error("Error creating checkout session:", error);
    return NextResponse.json(
      { error: "Failed to create checkout session" },
      { status: 500 }
    );
  }
} 