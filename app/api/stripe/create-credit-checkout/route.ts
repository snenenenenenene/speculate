import { CREDIT_PACKS } from "@/config/pricing";
import { stripe } from "@/lib/stripe";
import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const body = await req.json();
    const { amount, price } = body;

    if (!amount || !price) {
      return new NextResponse("Amount and price are required", { status: 400 });
    }

    // Validate that the amount and price match a credit pack
    const creditPack = CREDIT_PACKS.find(
      (pack) => pack.amount === amount && pack.price === price
    );

    if (!creditPack) {
      return new NextResponse("Invalid credit pack", { status: 400 });
    }

    // Create or get customer
    let customer;
    const existingCustomers = await stripe.customers.list({
      email: session.user.email,
      limit: 1,
    });

    if (existingCustomers.data.length > 0) {
      customer = existingCustomers.data[0];
    } else {
      customer = await stripe.customers.create({
        email: session.user.email!,
        metadata: {
          userId: session.user.id,
        },
      });
    }

    // Create checkout session
    const checkoutSession = await stripe.checkout.sessions.create({
      customer: customer.id,
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: creditPack.name,
              description: `${creditPack.amount} credits`,
            },
            unit_amount: creditPack.price * 100, // Convert to cents
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard?success=true`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/pricing?canceled=true`,
      metadata: {
        userId: session.user.id,
        creditAmount: amount,
        type: "credit_purchase",
      },
    });

    return NextResponse.json({ url: checkoutSession.url });
  } catch (error) {
    console.error("[STRIPE_CREATE_CREDIT_CHECKOUT_ERROR]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
} 