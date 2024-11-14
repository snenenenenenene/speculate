"use client";

import { cn } from "@/lib/utils";
import { BarChart, Code, Globe, Layout, RefreshCw, Workflow } from 'lucide-react';

const features = [
	{
		icon: <Layout className="h-6 w-6" />,
		title: "Drag-and-Drop Editor",
		description: "Build complex questionnaires with our intuitive drag-and-drop interface. Choose from multiple node types and create conditional logic paths."
	},
	{
		icon: <Code className="h-6 w-6" />,
		title: "API Integration",
		description: "Access questionnaire data programmatically with our robust API. Perfect for seamless integration with your existing systems."
	},
	{
		icon: <Workflow className="h-6 w-6" />,
		title: "Flow Management",
		description: "Create sophisticated question flows with conditional logic, branching paths, and custom variables."
	},
	{
		icon: <BarChart className="h-6 w-6" />,
		title: "Real-time Analytics",
		description: "Track and analyze responses in real-time with our comprehensive dashboard and reporting tools."
	},
	{
		icon: <RefreshCw className="h-6 w-6" />,
		title: "Customization",
		description: "Personalize your questionnaires with custom themes, branding, and styling options."
	},
	{
		icon: <Globe className="h-6 w-6" />,
		title: "Sharing & Embedding",
		description: "Share questionnaires via links or embed them directly on your website."
	}
];

export default function Features() {
	return (
		<section className="py-24 bg-white">
			<div className="max-w-7xl mx-auto px-4">
				<div className="text-center mb-16">
					<h2 className="text-3xl font-bold text-base-800 mb-4">
						Everything You Need to Build Advanced Questionnaires
					</h2>
					<p className="text-xl text-base-600">
						Powerful features that make questionnaire creation and management effortless
					</p>
				</div>

				<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
					{features.map((feature, index) => (
						<div
							key={index}
							className={cn(
								"p-6 rounded-xl border border-base-200",
								"hover:border-primary-200 transition-colors",
								"bg-white group"
							)}
						>
							<div className="w-12 h-12 bg-primary-50 rounded-lg flex items-center justify-center text-primary-600 mb-4 group-hover:bg-primary-100 transition-colors">
								{feature.icon}
							</div>
							<h3 className="text-xl font-semibold text-base-800 mb-2">
								{feature.title}
							</h3>
							<p className="text-base-600">
								{feature.description}
							</p>
						</div>
					))}
				</div>
			</div>
		</section>
	);
}