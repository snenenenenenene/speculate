import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { formatAmountForStripe } from "@/lib/stripe-helper";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2024-10-28.acacia",
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { priceId } = body;

    if (!priceId) {
      return NextResponse.json({ 
        error: "Missing required fields" 
      }, { status: 400 });
    }

    // For now, we'll just return a mock response
    return NextResponse.json({ 
      url: 'https://example.com/checkout',
      sessionId: 'mock_session_id'
    });
  } catch (error) {
    console.error("Error creating checkout session:", error);
    return NextResponse.json(
      { error: "Failed to create checkout session" },
      { status: 500 }
    );
  }
} 