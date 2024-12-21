"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useCredits } from "@/hooks/use-credits";
import { CREDIT_PACKS, CREDIT_COSTS } from "@/config/pricing";
import { ArrowRight, Coins, History, Zap } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

interface CreditUsage {
  id: string;
  amount: number;
  operation: string;
  createdAt: string;
  flow?: {
    name: string;
  };
}

export default function CreditsPage() {
  const { credits, loading: creditsLoading, purchaseCredits } = useCredits();
  const [usageHistory, setUsageHistory] = useState<CreditUsage[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(true);

  useEffect(() => {
    const fetchUsageHistory = async () => {
      try {
        setLoadingHistory(true);
        const response = await fetch("/api/credits/history");
        if (!response.ok) throw new Error("Failed to fetch credit usage history");
        const data = await response.json();
        setUsageHistory(data.history);
      } catch (error) {
        console.error("Error loading credit history:", error);
        toast.error("Failed to load credit usage history");
      } finally {
        setLoadingHistory(false);
      }
    };

    fetchUsageHistory();
  }, []);

  const handlePurchaseCredits = async (amount: number, price: number) => {
    await purchaseCredits(price, amount);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Credit Balance</CardTitle>
          <CardDescription>View and manage your credit balance</CardDescription>
        </CardHeader>
        <CardContent>
          {creditsLoading ? (
            <div className="space-y-2">
              <Skeleton className="h-4 w-[250px]" />
              <Skeleton className="h-4 w-[200px]" />
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="rounded-full p-3 bg-primary/10">
                  <Coins className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{credits}</p>
                  <p className="text-sm text-muted-foreground">Available credits</p>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Purchase Credits</CardTitle>
            <CardDescription>Top up your credit balance</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {CREDIT_PACKS.map((pack) => (
                <div
                  key={pack.name}
                  className="flex items-center justify-between rounded-lg border p-4"
                >
                  <div className="space-y-1">
                    <p className="font-medium">{pack.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {pack.amount} credits
                    </p>
                    <p className="text-xs text-muted-foreground">
                      ${(pack.price / pack.amount).toFixed(2)} per credit
                    </p>
                  </div>
                  <div className="flex items-center gap-4">
                    <p className="font-medium">${pack.price}</p>
                    <Button
                      variant="outline"
                      onClick={() => handlePurchaseCredits(pack.amount, pack.price)}
                    >
                      Purchase
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Credit Usage</CardTitle>
            <CardDescription>View credit costs for different operations</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {Object.entries(CREDIT_COSTS).map(([operation, cost]) => (
                <div
                  key={operation}
                  className="flex items-center justify-between rounded-lg border p-4"
                >
                  <div className="flex items-center gap-3">
                    <div className="rounded-full p-2 bg-primary/10">
                      <Zap className="h-4 w-4 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium">
                        {operation.split("_").map(word => 
                          word.charAt(0) + word.slice(1).toLowerCase()
                        ).join(" ")}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Per operation
                      </p>
                    </div>
                  </div>
                  <Badge variant="secondary">
                    {cost} {cost === 1 ? "credit" : "credits"}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Usage History</CardTitle>
          <CardDescription>View your recent credit usage</CardDescription>
        </CardHeader>
        <CardContent>
          {loadingHistory ? (
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
          ) : usageHistory.length > 0 ? (
            <div className="space-y-4">
              {usageHistory.map((usage) => (
                <div
                  key={usage.id}
                  className="flex items-start justify-between border-b pb-4 last:border-0 last:pb-0"
                >
                  <div className="flex items-center gap-4">
                    <div className="rounded-full p-2 bg-primary/10">
                      <History className="h-4 w-4 text-primary" />
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm font-medium">
                        {usage.operation}
                        {usage.flow && (
                          <span className="text-muted-foreground">
                            {" "}in {usage.flow.name}
                          </span>
                        )}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {new Date(usage.createdAt).toLocaleString()}
                      </p>
                    </div>
                  </div>
                  <Badge variant="outline" className="font-mono">
                    -{usage.amount}
                  </Badge>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <History className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium">No usage history</h3>
              <p className="text-sm text-muted-foreground">
                Your credit usage history will appear here
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
} 