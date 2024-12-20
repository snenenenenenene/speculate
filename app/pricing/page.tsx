/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { cn } from "@/lib/utils";
import Link from "next/link";
import { useTheme } from "next-themes";

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
	const { theme } = useTheme();
	const isDark = theme === 'dark';

	return (
		<li className={cn(
			"flex flex-col",
			tier.popular && cn(
				"relative rounded-[20px] p-6",
				isDark ? "bg-primary-950/50" : "bg-primary-50/50"
			)
		)}>
			<div className="styles_tierHeader">
				<h2 className={cn(
					"inline-block text-sm font-medium rounded-full px-3 py-1",
					tier.popular 
						? isDark 
							? "bg-primary-800 text-primary-200" 
							: "bg-primary-100 text-primary-700"
						: isDark
							? "bg-zinc-800 text-zinc-300"
							: "bg-base-100 text-base-700"
				)}>
					{tier.name}
				</h2>
			</div>

			<p className={cn(
				"text-sm mt-4",
				isDark ? "text-zinc-400" : "text-base-600"
			)}>{tier.description}</p>

			<p className="mt-4 flex items-baseline">
				{tier.price === "Free" ? (
					<span className={cn(
						"text-4xl font-bold",
						isDark ? "text-zinc-100" : "text-base-800"
					)}>Free</span>
				) : (
					<>
						<span className={cn(
							"text-lg font-medium",
							isDark ? "text-zinc-100" : "text-base-800"
						)}>€</span>
						<span className={cn(
							"text-4xl font-bold",
							isDark ? "text-zinc-100" : "text-base-800"
						)}>{tier.price}</span>
						{tier.priceDetail && (
							<>
								<span className={cn(
									"ml-2",
									isDark ? "text-zinc-400" : "text-base-600"
								)}>/month</span>
								<span className={cn(
									"ml-1",
									isDark ? "text-zinc-400" : "text-base-600"
								)}>/editor</span>
							</>
						)}
					</>
				)}
			</p>

			{tier.priceNote && (
				<p className={cn(
					"text-sm mt-2",
					isDark ? "text-zinc-400" : "text-base-600"
				)}>{tier.priceNote}</p>
			)}

			<p className={cn(
				"text-lg font-medium mt-6",
				isDark ? "text-zinc-100" : "text-base-800"
			)}>{tier.headerDescription}</p>

			<ul className={cn(
				"mt-6 space-y-4 flex-grow",
				tier.popular && cn(
					"border-t pt-6",
					isDark ? "border-primary-700" : "border-primary-200"
				)
			)}>
				{tier.features.map((feature: string) => (
					<li key={feature} className="flex items-center gap-3">
						<span className={cn(
							"flex-shrink-0",
							tier.popular 
								? isDark 
									? "text-primary-300" 
									: "text-primary-500"
								: isDark
									? "text-zinc-400"
									: "text-base-600"
						)}>
							<svg width="10" height="10" viewBox="0 0 10 10" fill="none">
								<path
									d="M1.5 5L3.5 7L8.5 2"
									stroke="currentColor"
									strokeLinejoin="round"
								/>
							</svg>
						</span>
						<span className={cn(
							"text-sm",
							isDark ? "text-zinc-300" : "text-base-700"
						)}>{feature}</span>
					</li>
				))}
			</ul>

			{index > 0 && (
				<p className={cn(
					"mt-6 text-sm",
					tier.popular 
						? isDark 
							? "text-primary-300" 
							: "text-primary-600"
						: isDark
							? "text-zinc-400"
							: "text-base-600"
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
					</svg>
					Plus everything in {index === 1 ? "Starter" : "Pro"}
				</p>
			)}

			<Link
				href={tier.name === "Org" ? "/contact" : "/auth"}
				className={cn(
					"mt-8 rounded-lg px-6 py-3 text-center text-sm font-medium transition-colors",
					tier.popular
						? isDark
							? "bg-gradient-to-r from-primary-300 to-primary-400 text-primary-950 hover:from-primary-400 hover:to-primary-500"
							: "bg-gradient-to-r from-primary-500 to-primary-600 text-white hover:from-primary-600 hover:to-primary-700"
						: isDark
							? "bg-zinc-800 text-zinc-100 hover:bg-zinc-700"
							: "bg-base-50 text-base-800 hover:bg-base-100"
				)}
			>
				{tier.name === "Org" ? "Contact Sales" : "Get Started"}
			</Link>
		</li>
	);
}

export default function PricingPage() {
	const { theme } = useTheme();
	const isDark = theme === 'dark';

	return (
		<div className="py-24 sm:py-32">
			<div className="mx-auto max-w-7xl px-6 lg:px-8">
				<div className="mx-auto max-w-4xl text-center">
					<h1 className={cn(
						"text-base font-semibold leading-7",
						isDark ? "text-primary-300" : "text-primary-600"
					)}>
						Pricing
					</h1>
					<p className={cn(
						"mt-2 text-4xl font-bold tracking-tight sm:text-5xl",
						isDark ? "text-zinc-100" : "text-base-900"
					)}>
						Choose your plan
					</p>
					<p className={cn(
						"mt-6 text-lg leading-8",
						isDark ? "text-zinc-400" : "text-base-600"
					)}>
						Start building for free, then add a plan to go further
					</p>
				</div>

				<div className="isolate mx-auto mt-16 grid max-w-md grid-cols-1 gap-y-8 sm:mt-20 lg:mx-0 lg:max-w-none lg:grid-cols-3 lg:gap-x-8 xl:gap-x-12">
					{pricingTiers.map((tier, index) => (
						<div
							key={tier.name}
							className={cn(
								"relative flex flex-col gap-6 rounded-3xl p-8",
								tier.popular 
									? isDark
										? "ring-2 ring-primary-300"
										: "ring-2 ring-primary-600"
									: isDark
										? "ring-1 ring-zinc-800"
										: "ring-1 ring-base-200"
							)}
						>
							<div className="flex items-center justify-between gap-x-4">
								<h3
									className={cn(
										"text-lg font-semibold leading-8",
										tier.popular 
											? isDark
												? "text-primary-200"
												: "text-primary-600"
											: isDark
												? "text-zinc-100"
												: "text-base-900"
									)}
								>
									{tier.name}
								</h3>
								{tier.popular && (
									<p className={cn(
										"rounded-full px-2.5 py-1 text-xs font-semibold leading-5",
										isDark
											? "bg-primary-800/50 text-primary-200"
											: "bg-primary-600/10 text-primary-600"
									)}>
										Most popular
									</p>
								)}
							</div>
							<p className={cn(
								"text-sm leading-6",
								isDark ? "text-zinc-400" : "text-base-600"
							)}>
								{tier.headerDescription}
							</p>

							<div className="mt-4 flex items-baseline gap-x-2">
								{tier.priceDetail ? (
									<>
										<span className={cn(
											"text-4xl font-bold tracking-tight",
											isDark ? "text-zinc-100" : "text-base-900"
										)}>
											€{tier.price}
										</span>
										<span className={cn(
											"text-sm font-semibold leading-6",
											isDark ? "text-zinc-400" : "text-base-600"
										)}>
											/month/editor
										</span>
									</>
								) : (
									<span className={cn(
										"text-4xl font-bold tracking-tight",
										isDark ? "text-zinc-100" : "text-base-900"
									)}>
										Free
									</span>
								)}
							</div>

							{tier.priceNote && (
								<p className={cn(
									"mt-2 text-sm leading-6",
									isDark ? "text-zinc-400" : "text-base-600"
								)}>
									{tier.priceNote}
								</p>
							)}

							<ul className={cn(
								"mt-8 space-y-3 text-sm leading-6",
								isDark ? "text-zinc-300" : "text-base-600"
							)}>
								{tier.features.map((feature: string) => (
									<li key={feature} className="flex gap-x-3">
										<svg
											className={cn(
												"h-6 w-5 flex-none",
												tier.popular
													? isDark
														? "text-primary-300"
														: "text-primary-600"
													: isDark
														? "text-zinc-500"
														: "text-base-400"
											)}
											aria-hidden="true"
											xmlns="http://www.w3.org/2000/svg"
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

							<Link
								href={tier.name === "Org" ? "/contact" : "/auth"}
								className={cn(
									"mt-8 block rounded-md px-3 py-2 text-center text-sm font-semibold leading-6 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2",
									tier.popular
										? isDark
											? "bg-primary-300 text-primary-950 hover:bg-primary-200 focus-visible:outline-primary-300"
											: "bg-primary-600 text-white hover:bg-primary-500 focus-visible:outline-primary-600"
										: isDark
											? "bg-zinc-800 text-zinc-100 hover:bg-zinc-700 focus-visible:outline-white"
											: "bg-base-50 text-base-900 hover:bg-base-100 focus-visible:outline-base-600"
								)}
							>
								{tier.name === "Org" ? "Contact sales" : "Get started"}
							</Link>
						</div>
					))}
				</div>
			</div>
		</div>
	);
}