"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useCredits } from "@/hooks/use-credits";
import { CREDIT_PACKS } from "@/config/pricing";
import { cn } from "@/lib/utils";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Coins } from "lucide-react";

export default function CreditsPage() {
  const router = useRouter();
  const { data: session } = useSession();
  const { credits, purchaseCredits } = useCredits();

  const handlePurchaseCredits = async (amount: number, price: number) => {
    if (!session) {
      toast.error("Please sign in to purchase credits");
      router.push("/login");
      return;
    }

    await purchaseCredits(price, amount);
  };

  if (!session) {
    router.push("/login");
    return null;
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-background pt-20 pb-10">
      <div className="container max-w-5xl px-4 mx-auto">
        <div className="flex flex-col items-center justify-center mb-12">
          <div className="flex items-center gap-2 mb-4">
            <Coins className="h-8 w-8 text-primary" />
            <h1 className="text-3xl font-bold">Credits & Usage</h1>
          </div>
          <div className="flex items-center gap-2 text-lg">
            <span>Current Balance:</span>
            <span className="font-bold text-2xl">{credits}</span>
            <span className="text-muted-foreground">credits</span>
          </div>
        </div>

        <div className="grid gap-8 md:grid-cols-3">
          {CREDIT_PACKS.map((pack) => (
            <Card key={pack.name} className={cn(
              "relative",
              pack.popular && "border-primary shadow-lg"
            )}>
              {pack.popular && (
                <div className="absolute -top-4 left-0 right-0 mx-auto w-fit">
                  <span className="bg-primary text-primary-foreground text-sm font-medium px-3 py-1 rounded-full">
                    Best Value
                  </span>
                </div>
              )}
              <div className="p-6">
                <h3 className="text-xl font-bold">{pack.name}</h3>
                <p className="text-sm text-muted-foreground mt-2">
                  {pack.description}
                </p>
                <div className="mt-4 flex items-baseline gap-x-2">
                  <span className="text-3xl font-bold">${pack.price}</span>
                  <span className="text-muted-foreground">USD</span>
                </div>
                <div className="mt-1 text-sm text-muted-foreground">
                  ${(pack.price / pack.amount).toFixed(2)} per credit
                </div>
                <div className="mt-2 text-sm font-medium">
                  {pack.amount} credits
                </div>
                <Button
                  className="w-full mt-6"
                  variant={pack.popular ? "default" : "outline"}
                  onClick={() => handlePurchaseCredits(pack.amount, pack.price)}
                >
                  Purchase Credits
                </Button>
              </div>
            </Card>
          ))}
        </div>

        <div className="mt-12 max-w-2xl mx-auto">
          <Card className="p-6">
            <h2 className="text-lg font-semibold mb-4">Credit Usage</h2>
            <div className="space-y-4">
              <div className="flex justify-between items-center pb-2 border-b">
                <span className="text-muted-foreground">Flow Creation</span>
                <span className="font-medium">10 credits</span>
              </div>
              <div className="flex justify-between items-center pb-2 border-b">
                <span className="text-muted-foreground">Node Creation</span>
                <span className="font-medium">1 credit</span>
              </div>
              <div className="flex justify-between items-center pb-2 border-b">
                <span className="text-muted-foreground">API Call</span>
                <span className="font-medium">1 credit</span>
              </div>
              <div className="flex justify-between items-center pb-2 border-b">
                <span className="text-muted-foreground">Export</span>
                <span className="font-medium">5 credits</span>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
} 