"use client";

import { cn } from "@/lib/utils";
import { ArrowRight } from 'lucide-react';
import Link from 'next/link';

export default function Cta() {
	return (
		<section className="py-24 bg-primary-600">
			<div className="max-w-7xl mx-auto px-4 text-center">
				<h2 className="text-3xl font-bold text-white mb-6">
					Ready to Transform Your Questionnaires?
				</h2>
				<p className="text-xl text-primary-100 mb-8 max-w-2xl mx-auto">
					Start building smarter questionnaires today. No credit card required.
				</p>
				<Link
					href="/signup"
					className={cn(
						"inline-flex items-center space-x-2",
						"px-8 py-4 bg-white text-primary-600",
						"rounded-full hover:bg-primary-50 transition-colors"
					)}
				>
					<span>Start Your Free Trial</span>
					<ArrowRight className="h-5 w-5" />
				</Link>
			</div>
		</section>
	);
}