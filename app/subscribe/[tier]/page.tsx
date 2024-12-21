"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { SUBSCRIPTION_TIERS } from "@/config/pricing";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";

export default function SubscribePage({
  params,
}: {
  params: { tier: string };
}) {
  const router = useRouter();
  const { data: session } = useSession();
  const [loading, setLoading] = useState(false);

  // Get the tier configuration
  const tier = SUBSCRIPTION_TIERS[params.tier as keyof typeof SUBSCRIPTION_TIERS];

  useEffect(() => {
    if (!session) {
      toast.error("Please sign in to subscribe");
      router.push("/login");
      return;
    }

    if (!tier) {
      toast.error("Invalid subscription tier");
      router.push("/pricing");
      return;
    }
  }, [session, tier, router]);

  const handleSubscribe = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/stripe/create-subscription", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          tier: params.tier,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to create subscription");
      }

      const data = await response.json();
      
      // Redirect to Stripe Checkout
      window.location.href = data.url;
    } catch (error) {
      console.error("Subscription error:", error);
      toast.error("Failed to start subscription process");
    } finally {
      setLoading(false);
    }
  };

  if (!tier) {
    return null;
  }

  return (
    <div className="container max-w-2xl py-10">
      <div className="text-center mb-10">
        <h1 className="text-3xl font-bold">Subscribe to {tier.name}</h1>
        <p className="text-muted-foreground mt-2">
          You're about to subscribe to our {tier.name} plan
        </p>
      </div>

      <Card className="p-6">
        <div className="space-y-6">
          <div>
            <h2 className="text-xl font-semibold">Plan Details</h2>
            <div className="mt-4 space-y-2">
              <div className="flex justify-between">
                <span>Price</span>
                <span className="font-medium">
                  ${tier.price}/{tier.interval}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Billing Period</span>
                <span className="font-medium capitalize">{tier.interval}</span>
              </div>
            </div>
          </div>

          <div>
            <h3 className="font-medium mb-2">Features included:</h3>
            <ul className="space-y-2">
              {tier.features.map((feature) => (
                <li key={feature} className="flex items-center gap-2">
                  <svg
                    className="h-5 w-5 text-primary flex-shrink-0"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z"
                      clipRule="evenodd"
                    />
                  </svg>
                  {feature}
                </li>
              ))}
            </ul>
          </div>

          <div className="border-t pt-6">
            <Button
              className="w-full"
              size="lg"
              onClick={handleSubscribe}
              disabled={loading}
            >
              {loading ? "Processing..." : "Subscribe Now"}
            </Button>
            <p className="text-sm text-muted-foreground text-center mt-4">
              You'll be redirected to Stripe to complete your subscription
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
} 