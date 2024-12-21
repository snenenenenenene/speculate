import { NextResponse } from "next/server";
import Stripe from "stripe";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2023-10-16",
});

const products = {
  pro: {
    name: "Pro",
    description: "For collaborative teams",
    price: 10,
    interval: "month",
    features: [
      "Unlimited shared flows",
      "All node types",
      "Full API access",
      "500 API calls/hour",
      "JSON export/import",
      "Premium support",
    ],
  },
  org: {
    name: "Org",
    description: "For teams who need extra security",
    price: 20,
    interval: "month",
    features: [
      "Enterprise SSO",
      "Advanced security",
      "Custom domain",
      "Unlimited API calls",
      "Priority support",
      "Custom contracts",
    ],
  },
};

export async function POST() {
  try {
    // Check if user is admin
    const session = await getServerSession(authOptions);
    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Create or update products and prices
    for (const [key, product] of Object.entries(products)) {
      // Check if product exists
      const existingProducts = await stripe.products.search({
        query: `name:'${product.name}'`,
      });

      let stripeProduct;
      
      if (existingProducts.data.length > 0) {
        // Update existing product
        stripeProduct = await stripe.products.update(existingProducts.data[0].id, {
          name: product.name,
          description: product.description,
          metadata: {
            features: JSON.stringify(product.features),
          },
        });
      } else {
        // Create new product
        stripeProduct = await stripe.products.create({
          name: product.name,
          description: product.description,
          metadata: {
            features: JSON.stringify(product.features),
          },
        });
      }

      // Check if price exists
      const existingPrices = await stripe.prices.list({
        product: stripeProduct.id,
        active: true,
      });

      if (existingPrices.data.length === 0) {
        // Create new price
        await stripe.prices.create({
          product: stripeProduct.id,
          unit_amount: product.price * 100, // Convert to cents
          currency: "usd",
          recurring: {
            interval: product.interval as "month" | "year",
          },
          metadata: {
            tier: key,
          },
        });
      }
    }

    return NextResponse.json({
      success: true,
      message: "Products and prices created successfully",
    });
  } catch (error) {
    console.error("Error setting up products:", error);
    return NextResponse.json(
      { error: "Failed to set up products" },
      { status: 500 }
    );
  }
} 