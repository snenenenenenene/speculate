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
        select: {
          stripeCustomerId: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  // Get customer ID (either org or personal)
  const customerId = orgMembership?.organization?.stripeCustomerId || session.user.stripeCustomerId;
  
  if (!customerId) {
    return NextResponse.json({ payments: [] });
  }

  // Fetch all payments (invoices and one-time charges)
  const [charges, invoices] = await Promise.all([
    stripe.charges.list({
      customer: customerId,
      limit: 100,
    }),
    stripe.invoices.list({
      customer: customerId,
      limit: 100,
    }),
  ]);

  // Combine and sort payments
  const payments = [
    ...charges.data.map(charge => ({
      id: charge.id,
      amount: charge.amount,
      status: charge.status,
      createdAt: new Date(charge.created * 1000).toISOString(),
      description: charge.description,
      receipt_url: charge.receipt_url,
      type: 'credit_purchase',
    })),
    ...invoices.data.map(invoice => ({
      id: invoice.id,
      amount: invoice.amount_paid,
      status: invoice.status,
      createdAt: new Date(invoice.created * 1000).toISOString(),
      description: invoice.description || `Invoice ${invoice.number}`,
      receipt_url: invoice.hosted_invoice_url,
      type: 'subscription',
    })),
  ].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  return NextResponse.json({ payments });
} 