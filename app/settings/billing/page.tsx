"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { CreditCard, Receipt, Clock, AlertCircle } from "lucide-react";

interface PaymentHistory {
  id: string;
  amount: number;
  status: "succeeded" | "pending" | "failed";
  createdAt: string;
  description: string;
  type: "credit_purchase" | "subscription";
}

interface Subscription {
  id: string;
  status: "active" | "canceled" | "past_due";
  plan: string;
  currentPeriodEnd: string;
  cancelAtPeriodEnd: boolean;
}

export default function BillingPage() {
  const [loading, setLoading] = useState(true);
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [payments, setPayments] = useState<PaymentHistory[]>([]);

  useEffect(() => {
    const fetchBillingData = async () => {
      try {
        setLoading(true);
        const [subResponse, paymentsResponse] = await Promise.all([
          fetch("/api/stripe/subscription"),
          fetch("/api/stripe/payment-history"),
        ]);

        if (!subResponse.ok || !paymentsResponse.ok) {
          throw new Error("Failed to fetch billing data");
        }

        const [subData, paymentsData] = await Promise.all([
          subResponse.json(),
          paymentsResponse.json(),
        ]);

        setSubscription(subData.subscription);
        setPayments(paymentsData.payments);
      } catch (error) {
        console.error("Error loading billing data:", error);
        toast.error("Failed to load billing information");
      } finally {
        setLoading(false);
      }
    };

    fetchBillingData();
  }, []);

  const handleManageSubscription = async () => {
    try {
      const response = await fetch("/api/stripe/create-portal-session", {
        method: "POST",
      });
      
      if (!response.ok) throw new Error("Failed to create portal session");
      
      const data = await response.json();
      window.location.href = data.url;
    } catch (error) {
      console.error("Error opening customer portal:", error);
      toast.error("Failed to open billing portal");
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Subscription Plan</CardTitle>
          <CardDescription>Manage your subscription and billing details</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-2">
              <Skeleton className="h-4 w-[250px]" />
              <Skeleton className="h-4 w-[200px]" />
            </div>
          ) : subscription ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <p className="text-sm font-medium">
                    {subscription.plan}
                    <Badge 
                      variant={subscription.status === "active" ? "default" : "destructive"}
                      className="ml-2"
                    >
                      {subscription.status}
                    </Badge>
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {subscription.cancelAtPeriodEnd 
                      ? "Cancels at end of billing period" 
                      : `Renews on ${new Date(subscription.currentPeriodEnd).toLocaleDateString()}`
                    }
                  </p>
                </div>
                <Button onClick={handleManageSubscription}>
                  Manage Subscription
                </Button>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">No active subscription</p>
              <Button onClick={() => window.location.href = "/pricing"}>
                View Plans
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Payment History</CardTitle>
          <CardDescription>View your recent payments and invoices</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="flex items-center gap-4">
                  <Skeleton className="h-12 w-12 rounded-full" />
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-[250px]" />
                    <Skeleton className="h-4 w-[200px]" />
                  </div>
                </div>
              ))}
            </div>
          ) : payments.length > 0 ? (
            <div className="space-y-4">
              {payments.map((payment) => (
                <div
                  key={payment.id}
                  className="flex items-start justify-between border-b pb-4 last:border-0 last:pb-0"
                >
                  <div className="flex items-center gap-4">
                    <div className="rounded-full p-2 bg-primary/10">
                      {payment.type === "subscription" ? (
                        <CreditCard className="h-4 w-4 text-primary" />
                      ) : (
                        <Coins className="h-4 w-4 text-primary" />
                      )}
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm font-medium">{payment.description}</p>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Clock className="h-3 w-3" />
                        <span>{new Date(payment.createdAt).toLocaleDateString()}</span>
                        <Badge 
                          variant={
                            payment.status === "succeeded" 
                              ? "default" 
                              : payment.status === "pending"
                              ? "outline"
                              : "destructive"
                          }
                        >
                          {payment.status}
                        </Badge>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium">
                      ${(payment.amount / 100).toFixed(2)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <Receipt className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium">No payment history</h3>
              <p className="text-sm text-muted-foreground">
                Your payment history will appear here
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
} 