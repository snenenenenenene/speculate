/* eslint-disable @typescript-eslint/ban-ts-comment */
/* eslint-disable @typescript-eslint/no-explicit-any */
// app/api/stripe/webhook/route.ts
import { sendPaymentSuccessEmail } from "@/lib/mail-service";
import prisma from "@/lib/prisma";
import { headers } from "next/headers";
import { NextResponse } from "next/server";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  // @ts-ignore
  apiVersion: "2024-06-20",
});

export async function POST(req: Request) {
  const body = await req.text();
  const signature = headers().get("stripe-signature") as string;

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err: any) {
    return NextResponse.json(
      { error: `Webhook Error: ${err.message}` },
      { status: 400 }
    );
  }

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        const userEmail = session.customer_details?.email;

        // Get credit amount from metadata
        const creditAmount = session.metadata?.creditAmount
          ? parseInt(session.metadata.creditAmount)
          : 0;

        // Create payment record
        const payment = await prisma.payment
          .create({
            data: {
              stripeSessionId: session.id,
              amount: session.amount_total! / 100,
              currency: session.currency,
              status: "completed",
              user: {
                connect: {
                  email: userEmail,
                },
              },
              creditAmount,
            },
          })
          .then((payment) => {
            console.log("Payment DB created: ", payment);
          })
          .catch((error) => {
            console.error("Error creating payment DB: ", error);
          });

        // Send email notifications
        await sendPaymentSuccessEmail(
          userEmail!,
          payment.amount,
          creditAmount,
          payment.id
        );

        break;
      }

      case "payment_intent.payment_failed": {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;

        await prisma.payment.create({
          data: {
            stripeSessionId: paymentIntent.id,
            amount: paymentIntent.amount / 100,
            currency: paymentIntent.currency,
            status: "failed",
            user: {
              connect: {
                email: paymentIntent.receipt_email!,
              },
            },
            creditAmount: 0,
          },
        });
        break;
      }
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Error processing webhook:", error);
    return NextResponse.json(
      { error: "Failed to process webhook" },
      { status: 500 }
    );
  }
}
