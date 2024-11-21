// app/dashboard/flowcharts/[flowchartId]/page.tsx
"use client";

import { LoadingSpinner } from "@/components/ui/base";

export default function FlowchartPage() {
	return (
		<div className="h-screen flex items-center justify-center">
			<LoadingSpinner className="h-6 w-6" />
		</div>
	);
}