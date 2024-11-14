"use client";

import { cn } from "@/lib/utils";
import { ArrowRight } from 'lucide-react';
import Link from 'next/link';

export default function ApiSection() {
	return (
		<section className="py-24 bg-base-50">
			<div className="max-w-7xl mx-auto px-4">
				<div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
					<div>
						<h2 className="text-3xl font-bold text-base-800 mb-6">
							Powerful API for Seamless Integration
						</h2>
						<p className="text-xl text-base-600 mb-8">
							Access questionnaire data programmatically with our comprehensive API.
							Build custom integrations and automate your workflow.
						</p>
						<Link
							href="/docs/api"
							className={cn(
								"text-primary-600 hover:text-primary-700",
								"font-medium inline-flex items-center space-x-2"
							)}
						>
							<span>Explore API Documentation</span>
							<ArrowRight className="h-5 w-5" />
						</Link>
					</div>
					<div className="bg-base-800 rounded-xl p-6 text-white overflow-hidden relative">
						{/* Code snippet */}
						<pre className="overflow-x-auto font-mono text-sm">
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

						{/* Decorative elements */}
						<div className="absolute top-0 right-0 w-32 h-32 bg-primary-500/10 rounded-full blur-2xl" />
						<div className="absolute bottom-0 left-0 w-32 h-32 bg-primary-500/10 rounded-full blur-2xl" />
					</div>
				</div>
			</div>
		</section>
	);
}