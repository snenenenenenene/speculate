/* eslint-disable @typescript-eslint/ban-ts-comment */
// app/api/checkout_sessions/route.ts
import { formatAmountForStripe } from "@/lib/stripe-helper";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import Stripe from "stripe";
import { authOptions } from "../auth/[...nextauth]/options";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  // @ts-ignore
  apiVersion: "2024-06-20",
});

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const { amount, creditAmount } = await req.json();

    const checkoutSession = await stripe.checkout.sessions.create({
      mode: "payment",
      submit_type: "pay",
      payment_method_types: ["card"],
      customer_email: session.user.email,
      metadata: {
        creditAmount: creditAmount.toString(),
      },
      line_items: [
        {
          price_data: {
            currency: "eur",
            unit_amount: formatAmountForStripe(amount, "eur"),
            product_data: {
              name: `${creditAmount} Credits`,
              description: "Credits for Green Claims Validator",
            },
          },
          quantity: 1,
        },
      ],
      success_url: `${
        req.headers.get("origin") ?? ""
      }/payment-success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${req.headers.get("origin") ?? ""}/payments`,
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
