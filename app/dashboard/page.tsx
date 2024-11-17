/* eslint-disable @typescript-eslint/no-explicit-any */
// app/dashboard/page.tsx
"use client";

import { LoadingSpinner } from "@/components/ui/base";
import { useStores } from "@/hooks/useStores";
import { AlertTriangle } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "react-hot-toast";

export default function DashboardPage() {
	const { chartStore } = useStores() as any;
	const { chartInstances, setChartInstances } = chartStore;
	const router = useRouter();
	const [isLoading, setIsLoading] = useState(true);

	useEffect(() => {
		const loadChartInstances = async () => {
			try {
				const response = await fetch('/api/load-chart');
				if (response.ok) {
					const data = await response.json();
					if (data.content) {
						const parsedContent = JSON.parse(data.content);
						setChartInstances(parsedContent);
						if (parsedContent.length > 0) {
							router.push(`/dashboard/${parsedContent[0].id}`);
						}
					}
					setIsLoading(false);
				}
			} catch (error) {
				console.error('Failed to load chart instances:', error);
				toast.error('Failed to load flows');
				setIsLoading(false);
			}
		};

		loadChartInstances();
	}, [setChartInstances, router]);

	if (isLoading) {
		return (
			<div className="flex items-center justify-center min-h-screen">
				<div className="text-center">
					<LoadingSpinner />
					<p className="mt-4 text-gray-600">Loading your flows...</p>
				</div>
			</div>
		);
	}

	if (chartInstances.length === 0) {
		return (
			<div className="flex items-center justify-center min-h-screen">
				<div className="text-center max-w-md mx-auto p-6">
					<AlertTriangle className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
					<h2 className="text-xl font-semibold text-gray-900 mb-2">
						No Flows Found
					</h2>
					<p className="text-gray-600">
						Use the Quick Actions menu to create your first flow.
					</p>
				</div>
			</div>
		);
	}

	return null;
}