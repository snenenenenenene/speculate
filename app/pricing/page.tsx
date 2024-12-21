"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { SUBSCRIPTION_TIERS } from "@/config/pricing";
import { cn } from "@/lib/utils";
import { Check } from "lucide-react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

export default function PricingPage() {
	const router = useRouter();
	const { data: session } = useSession();

	const handleSubscribe = async (tier: keyof typeof SUBSCRIPTION_TIERS) => {
		if (!session) {
			toast.error("Please sign in to subscribe");
			router.push("/login");
			return;
		}

		router.push(`/subscribe/${tier}`);
	};

	return (
		<div className="min-h-[calc(100vh-4rem)] bg-background pt-20 pb-10">
			<div className="container max-w-5xl px-4 mx-auto">
				<div className="text-center space-y-4 mb-12">
					<h1 className="text-4xl font-bold tracking-tight">
						Choose your plan
					</h1>
					<p className="text-lg text-muted-foreground max-w-2xl mx-auto">
						Start with our free tier and upgrade as you grow. All plans include access to our core features.
						Purchase additional credits anytime for more usage.
					</p>
				</div>

				<div className="grid gap-8 md:grid-cols-3">
					{Object.entries(SUBSCRIPTION_TIERS).map(([key, tier]) => (
						<Card 
							key={key} 
							className={cn(
								"relative flex flex-col",
								key === "pro" && "border-primary shadow-lg scale-105 z-10"
							)}
						>
							{key === "pro" && (
								<div className="absolute -top-4 left-0 right-0 mx-auto w-fit">
									<span className="bg-primary text-primary-foreground text-sm font-medium px-3 py-1 rounded-full">
										Most Popular
									</span>
								</div>
							)}

							<div className="p-6 flex flex-col flex-1">
								<div>
									<h3 className="text-2xl font-bold">{tier.name}</h3>
									<p className="mt-2 text-sm text-muted-foreground">
										{tier.description}
									</p>
								</div>

								<div className="mt-4 flex items-baseline">
									<span className="text-3xl font-bold">
										${tier.price}
									</span>
									{tier.price > 0 && (
										<span className="ml-1 text-muted-foreground">
											/{tier.interval}
										</span>
									)}
								</div>

								<ul className="mt-6 space-y-3 flex-1">
									{tier.features.map((feature) => (
										<li key={feature} className="flex text-sm">
											<Check className="h-5 w-5 text-primary shrink-0 mr-2" />
											<span>{feature}</span>
										</li>
									))}
								</ul>

								<Button
									className="mt-8 w-full"
									variant={key === "pro" ? "default" : "outline"}
									size="lg"
									onClick={() => handleSubscribe(key as keyof typeof SUBSCRIPTION_TIERS)}
								>
									{tier.price === 0 ? "Get Started" : "Subscribe"}
								</Button>
							</div>
						</Card>
					))}
				</div>

				<div className="mt-12 text-center">
					<p className="text-sm text-muted-foreground">
						Need more credits? Purchase them anytime from your account settings.
					</p>
				</div>
			</div>
		</div>
	);
}