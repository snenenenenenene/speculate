"use client";

import { cn } from "@/lib/utils";
import { ArrowRight } from "lucide-react";
import Link from "next/link";

export default function ApiSection() {
	return (
		<section className="py-24 bg-gray-50">
			<div className="max-w-7xl mx-auto px-4">
				<div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
					{/* Left Content */}
					<div>
						<h2 className="text-4xl font-extrabold text-gray-900 mb-6 leading-tight">
							Integrate Seamlessly with Our API
						</h2>
						<p className="text-lg text-gray-600 mb-8 leading-relaxed">
							Harness the power of our advanced API to programmatically access and manage
							questionnaire data. Automate workflows, create custom integrations, and
							unlock new possibilities for your projects.
						</p>
						<Link
							href="/docs/api"
							className={cn(
								"text-blue-600 hover:text-blue-700",
								"font-medium inline-flex items-center space-x-2"
							)}
						>
							<span>Explore API Documentation</span>
							<ArrowRight className="h-5 w-5" />
						</Link>
					</div>

					{/* Right Content */}
					<div className="relative bg-gray-900 rounded-xl p-6 text-white shadow-lg">
						<pre className="overflow-x-auto font-mono text-sm leading-relaxed">
							<code>{`// Example API Usage
const response = await fetch('https://api.specular.dev/v1/questionnaires', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer your_api_key',
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    title: 'Customer Feedback',
    nodes: [
      {
        type: 'multiple_choice',
        question: 'How satisfied are you?',
        options: ['Very', 'Somewhat', 'Not at all']
      }
    ]
  })
});`}</code>
						</pre>

						{/* Gradient Highlights */}
						<div className="absolute -top-10 -right-10 w-40 h-40 bg-blue-500/30 rounded-full blur-3xl" />
						<div className="absolute -bottom-10 -left-10 w-40 h-40 bg-purple-500/30 rounded-full blur-3xl" />
						<div className="absolute inset-0 border border-gray-700 rounded-xl pointer-events-none"></div>
					</div>
				</div>
			</div>
		</section>
	);
}
