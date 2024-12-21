import { useCallback, useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { toast } from "sonner";

export function useCredits() {
  const { data: session } = useSession();
  const [credits, setCredits] = useState<number>(0);
  const [loading, setLoading] = useState(true);

  const fetchCredits = useCallback(async () => {
    if (!session?.user) return;

    try {
      const response = await fetch("/api/credits");
      const data = await response.json();
      setCredits(data.credits);
    } catch (error) {
      console.error("Error fetching credits:", error);
      toast.error("Failed to fetch credits");
    } finally {
      setLoading(false);
    }
  }, [session?.user]);

  useEffect(() => {
    fetchCredits();
  }, [fetchCredits]);

  const purchaseCredits = async (price: number, amount: number) => {
    if (!session?.user) {
      toast.error("Please sign in to purchase credits");
      return;
    }

    try {
      const response = await fetch("/api/stripe/create-credit-checkout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ price, amount }),
      });

      if (!response.ok) {
        throw new Error("Failed to create checkout session");
      }

      const data = await response.json();
      
      // Redirect to Stripe Checkout
      window.location.href = data.url;
    } catch (error) {
      console.error("Credit purchase error:", error);
      toast.error("Failed to start purchase process");
    }
  };

  const deductCredits = async (amount: number) => {
    if (!session?.user) {
      toast.error("Please sign in to use credits");
      return false;
    }

    try {
      const response = await fetch("/api/credits/deduct", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ amount }),
      });

      if (!response.ok) {
        const error = await response.json();
        toast.error(error.message || "Failed to deduct credits");
        return false;
      }

      const data = await response.json();
      setCredits(data.remainingCredits);
      return true;
    } catch (error) {
      console.error("Error deducting credits:", error);
      toast.error("Failed to deduct credits");
      return false;
    }
  };

  return {
    credits,
    loading,
    purchaseCredits,
    deductCredits,
    refreshCredits: fetchCredits,
  };
} 