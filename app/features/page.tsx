"use client";

import { motion } from "framer-motion";
import {
	ArrowRight,
	Boxes,
	BrainCircuit,
	CodeSquare,
	Share2,
	Workflow,
	Zap
} from "lucide-react";
import Link from "next/link";

const features = [
	{
		icon: Workflow,
		title: "Intuitive Flow Builder",
		description: "Create complex decision flows with our drag-and-drop interface. Perfect for mapping out processes, decisions, and user journeys.",
	},
	{
		icon: BrainCircuit,
		title: "AI-Powered Generation",
		description: "Let AI help you create flows from natural language descriptions. Transform ideas into visual flowcharts instantly.",
	},
	{
		icon: Share2,
		title: "Real-time Collaboration",
		description: "Work together with your team in real-time. Share, comment, and iterate on flows seamlessly.",
	},
	{
		icon: Boxes,
		title: "Template Library",
		description: "Start faster with our extensive template library. Customize pre-built flows for common use cases.",
	},
	{
		icon: CodeSquare,
		title: "Export & Integration",
		description: "Export your flows in multiple formats. Integrate with your favorite tools through our API.",
	},
	{
		icon: Zap,
		title: "Version Control",
		description: "Track changes, maintain history, and revert when needed. Never lose your work with automatic saves.",
	},
];

const container = {
	hidden: { opacity: 0 },
	show: {
		opacity: 1,
		transition: {
			staggerChildren: 0.1,
			delayChildren: 0.3,
		},
	},
};

const item = {
	hidden: { opacity: 0, y: 20 },
	show: { opacity: 1, y: 0 },
};

export default function FeaturesPage() {
	return (
		<div className="min-h-screen bg-base-50">
			{/* Hero Section */}
			<div className="relative isolate overflow-hidden">
				<div className="mx-auto max-w-7xl px-6 pb-24 pt-16 sm:pt-32 lg:px-8">
					<div className="mx-auto max-w-2xl text-center">
						<motion.h1
							className="text-4xl font-bold tracking-tight text-base-800 sm:text-6xl"
							initial={{ opacity: 0, y: 20 }}
							animate={{ opacity: 1, y: 0 }}
							transition={{ duration: 0.5 }}
						>
							Powerful features for
							<span className="text-primary-600"> modern teams</span>
						</motion.h1>
						<motion.p
							className="mt-6 text-lg leading-8 text-base-600"
							initial={{ opacity: 0, y: 20 }}
							animate={{ opacity: 1, y: 0 }}
							transition={{ duration: 0.5, delay: 0.2 }}
						>
							Everything you need to create, manage, and share complex workflows.
							Built for teams that value clarity and efficiency.
						</motion.p>
					</div>
				</div>
			</div>

			{/* Features Grid */}
			<motion.div
				className="mx-auto max-w-7xl px-6 pb-24 lg:px-8"
				variants={container}
				initial="hidden"
				animate="show"
			>
				<div className="mx-auto grid max-w-2xl grid-cols-1 gap-x-8 gap-y-16 sm:gap-y-20 lg:mx-0 lg:max-w-none lg:grid-cols-3">
					{features.map((feature, index) => (
						<motion.div
							key={feature.title}
							variants={item}
							className="bg-white p-8 rounded-3xl border border-base-200 hover:border-primary-200 transition-colors group"
						>
							<div className="relative">
								<div className="flex items-center gap-4">
									<div className="p-3 rounded-2xl bg-primary-50 text-primary-600 group-hover:bg-primary-100 transition-colors">
										<feature.icon className="h-6 w-6" />
									</div>
									<h3 className="text-xl font-semibold leading-7 text-base-800">
										{feature.title}
									</h3>
								</div>
								<p className="mt-4 text-base leading-7 text-base-600">
									{feature.description}
								</p>
							</div>
						</motion.div>
					))}
				</div>
			</motion.div>

			{/* CTA Section */}
			<div className="relative isolate overflow-hidden bg-primary-600">
				<div className="px-6 py-24 sm:px-6 sm:py-32 lg:px-8">
					<div className="mx-auto max-w-2xl text-center">
						<h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
							Ready to transform your workflow?
							<br />
							Start using Speculate today.
						</h2>
						<p className="mx-auto mt-6 max-w-xl text-lg leading-8 text-primary-100">
							Join thousands of teams already using Speculate to streamline their processes and make better decisions.
						</p>
						<div className="mt-10 flex items-center justify-center gap-x-6">
							<Link
								href="/auth"
								className="group rounded-full bg-white px-6 py-2.5 text-sm font-semibold text-primary-600 hover:bg-primary-50 transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
							>
								<span className="flex items-center gap-2">
									Get started
									<ArrowRight className="h-4 w-4 group-hover:translate-x-0.5 transition-transform" />
								</span>
							</Link>
							<Link
								href="/documentation"
								className="text-sm font-semibold leading-6 text-white hover:text-primary-100 transition-colors"
							>
								Learn more <span aria-hidden="true">→</span>
							</Link>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}