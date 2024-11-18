/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { cn } from "@/lib/utils";
import Link from "next/link";

const pricingTiers = [
	{
		name: "Starter",
		description: "No credit card required",
		headerDescription: "Best for solo problem solvers",
		price: "Free",
		features: [
			"1 chart limit",
			"Basic nodes only",
			"Simple save functionality",
			"60 API calls/hour",
			"Rate-limited API access",
			"Community support",
		],
	},
	{
		name: "Pro",
		popular: true,
		description: "Billed annually",
		headerDescription: "For collaborative teams",
		price: "10",
		priceDetail: {
			period: "month",
			per: "editor",
		},
		priceNote: "Or €12/editor billed monthly",
		features: [
			"Unlimited shared flows",
			"All node types",
			"Full API access",
			"500 API calls/hour",
			"JSON export/import",
			"Premium support",
		],
	},
	{
		name: "Org",
		description: "Billed annually",
		headerDescription: "For teams who need extra security",
		price: "20",
		priceDetail: {
			period: "month",
			per: "editor",
		},
		features: [
			"SAML SSO",
			"User provisioning (SCIM)",
			"New workspace prevention",
			"Custom agreements",
			"Private teams",
			"Unlimited API calls",
		],
	},
];

function PricingTier({ tier, index }: { tier: any; index: number }) {
	return (
		<li className={cn(
			"flex flex-col",
			tier.popular && "relative bg-primary-50/50 rounded-[20px] p-6"
		)}>
			<div className="styles_tierHeader">
				<h2 className={cn(
					"inline-block text-sm font-medium rounded-full px-3 py-1",
					tier.popular ? "bg-primary-100 text-primary-700" : "bg-base-100 text-base-700"
				)}>
					{tier.name}
				</h2>
			</div>

			<p className="text-base-600 text-sm mt-4">{tier.description}</p>

			<p className="mt-4 flex items-baseline">
				{tier.price === "Free" ? (
					<span className="text-4xl font-bold text-base-800">Free</span>
				) : (
					<>
						<span className="text-base-800 text-lg font-medium">€</span>
						<span className="text-4xl font-bold text-base-800">{tier.price}</span>
						{tier.priceDetail && (
							<>
								<span className="text-base-600 ml-2">/month</span>
								<span className="text-base-600 ml-1">/editor</span>
							</>
						)}
					</>
				)}
			</p>

			{tier.priceNote && (
				<p className="text-sm text-base-600 mt-2">{tier.priceNote}</p>
			)}

			<p className="text-lg font-medium text-base-800 mt-6">{tier.headerDescription}</p>

			<ul className={cn(
				"mt-6 space-y-4 flex-grow",
				tier.popular && "border-t border-primary-200 pt-6"
			)}>
				{tier.features.map((feature: string) => (
					<li key={feature} className="flex items-center gap-3">
						<span className={cn(
							"flex-shrink-0",
							tier.popular ? "text-primary-500" : "text-base-600"
						)}>
							<svg width="10" height="10" viewBox="0 0 10 10" fill="none">
								<path
									d="M1.5 5L3.5 7L8.5 2"
									stroke="currentColor"
									strokeWidth="2"
									strokeLinecap="round"
									strokeLinejoin="round"
								/>
							</svg>
						</span>
						<span className="text-base-700 text-sm">{feature}</span>
					</li>
				))}
			</ul>

			{index > 0 && (
				<p className={cn(
					"mt-6 text-sm",
					tier.popular ? "text-primary-600" : "text-base-600"
				)}>
					<svg
						width="26"
						height="5"
						viewBox="0 0 26 5"
						fill="none"
						className="inline-block mr-2"
					>
						<path
							d="M2.81363 0.0771968C2.91656 -0.0257322 3.08344 -0.0257323 3.18637 0.0771967L5.4228 2.31363C5.52573 2.41656 5.52573 2.58344 5.4228 2.68637L3.18637 4.9228C3.08344 5.02573 2.91656 5.02573 2.81363 4.9228L0.577197 2.68637C0.474268 2.58344 0.474268 2.41656 0.577197 2.31363L2.81363 0.0771968Z"
							fill="currentColor"
						/>
						{/* Repeat diamond pattern for middle and right */}
					</svg>
					Plus everything in {index === 1 ? "Starter" : "Pro"}
				</p>
			)}

			<Link
				href={tier.name === "Org" ? "/contact" : "/signup"}
				className={cn(
					"mt-8 rounded-lg px-6 py-3 text-center text-sm font-medium transition-colors",
					tier.popular
						? "bg-gradient-to-r from-primary-500 to-primary-600 text-white hover:from-primary-600 hover:to-primary-700"
						: "bg-base-50 text-base-800 hover:bg-base-100"
				)}
			>
				{tier.name === "Org" ? "Contact Sales" : "Get Started"}
			</Link>
		</li>
	);
}

export default function PricingPage() {
	return (
		<div className="bg-white">
			<div className="py-24">
				<div className="max-w-7xl mx-auto px-4">
					<div className="text-center mb-16">
						<h1 className="text-4xl font-bold text-base-800 mb-4">
							Simple, transparent pricing
						</h1>
						<p className="text-xl text-base-600">
							Plans for teams of all sizes. Always free to try.
						</p>
					</div>

					<ol className="grid md:grid-cols-3 gap-8">
						{pricingTiers.map((tier, index) => (
							<PricingTier key={tier.name} tier={tier} index={index} />
						))}
					</ol>

					<div className="mt-16 flex justify-center">
						<div className="inline-flex items-center gap-3 bg-base-50 rounded-full px-6 py-3 text-sm text-base-600">
							<img
								src="/assets/images/gdpr.png"
								alt=""
								className="w-8 h-8 object-contain"
							/>
							<span>
								We follow GDPR guidelines to ensure your data is protected.
							</span>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}