"use client";

import { cn } from "@/lib/utils";
import { ArrowRight } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

export default function Hero() {
	return (
		<section className="relative min-h-screen pt-32 px-4">
			<div className="max-w-7xl mx-auto text-center">
				<div className="inline-flex items-center bg-primary-50 border border-primary-100 rounded-full px-4 py-2 text-sm font-medium text-primary-600 mb-8">
					<span className="w-2 h-2 bg-primary-600 rounded-full mr-2" />
					Now in public beta
				</div>

				<h1 className="text-5xl md:text-6xl font-bold text-base-800 mb-6">
					Build Smart Questionnaires<br />
					<span className="text-primary-600">Without Complexity</span>
				</h1>

				<p className="text-xl text-base-600 mb-12 max-w-3xl mx-auto">
					Create, manage, and analyze sophisticated questionnaires with our powerful drag-and-drop editor.
					Use it directly or integrate via API for seamless data collection.
				</p>

				<div className="flex flex-col sm:flex-row justify-center gap-4 mb-16">
					<Link
						href="/signup"
						className={cn(
							"px-8 py-4 bg-primary-600 text-white rounded-full",
							"hover:bg-primary-700 transition-colors",
							"flex items-center justify-center space-x-2",
							"border border-primary-400/20"
						)}
					>
						<span>Start Building for Free</span>
						<ArrowRight className="h-5 w-5" />
					</Link>
					<Link
						href="/demo"
						className={cn(
							"px-8 py-4 bg-white text-base-800 rounded-full",
							"hover:bg-base-50 transition-colors",
							"border border-base-200"
						)}
					>
						View Live Demo
					</Link>
				</div>

				{/* Editor Preview */}
				<div className="relative mx-auto max-w-5xl pb-32">
					<div className="relative">
						{/* Gradient overlays */}
						<div className="absolute -top-12 -left-12 w-64 h-64 bg-primary-400/10 rounded-full blur-3xl" />
						<div className="absolute -bottom-12 -right-12 w-64 h-64 bg-primary-400/10 rounded-full blur-3xl" />

						{/* Editor frame */}
						<div className="relative rounded-xl overflow-hidden shadow-2xl border border-base-200 bg-white">
							{/* Editor header */}
							<div className="bg-base-50 border-b border-base-200 p-4 flex items-center space-x-4">
								<div className="flex space-x-2">
									<div className="w-3 h-3 rounded-full bg-base-300" />
									<div className="w-3 h-3 rounded-full bg-base-300" />
									<div className="w-3 h-3 rounded-full bg-base-300" />
								</div>
								<div className="flex-1 text-center text-sm font-medium text-base-600">
									Questionnaire Editor
								</div>
							</div>

							{/* Editor content */}
							<Image
								src="/assets/images/placeholder-editor.png"
								alt="Questionnaire Editor Interface"
								width={1200}
								height={800}
								className="w-full h-auto"
							/>
						</div>
					</div>

					{/* Floating features badges */}
					<div className="absolute top-1/4 -left-8 bg-white rounded-lg shadow-lg border border-base-200 p-3 flex items-center space-x-2">
						<div className="w-8 h-8 rounded-full bg-primary-50 flex items-center justify-center">
							<ArrowRight className="h-4 w-4 text-primary-600" />
						</div>
						<span className="text-sm font-medium text-base-700">Logic Flows</span>
					</div>

					<div className="absolute top-2/3 -right-8 bg-white rounded-lg shadow-lg border border-base-200 p-3 flex items-center space-x-2">
						<div className="w-8 h-8 rounded-full bg-primary-50 flex items-center justify-center">
							<ArrowRight className="h-4 w-4 text-primary-600" />
						</div>
						<span className="text-sm font-medium text-base-700">API Ready</span>
					</div>
				</div>
			</div>
		</section>
	);
}