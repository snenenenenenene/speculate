"use client";

import { LoadingSpinner } from "@/components/ui/base";
import { useStores } from "@/hooks/useStores";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { AlertTriangle, LayoutGrid, Plus } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function DashboardPage() {
	const { chartStore, utilityStore } = useStores();
	const { chartInstances, setChartInstances, addNewTab } = chartStore;
	const { currentTab, setCurrentTab } = utilityStore;
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
						if (parsedContent.length > 0 && !currentTab) {
							setCurrentTab(parsedContent[0].id);
							router.push(`/dashboard/${parsedContent[0].id}`);
						}
					}
				}
			} catch (error) {
				console.error('Failed to load chart instances:', error);
			} finally {
				setIsLoading(false);
			}
		};

		loadChartInstances();
	}, [setChartInstances, setCurrentTab, currentTab, router]);

	const handleAddNewTab = () => {
		const newTabName = `New Tab ${chartInstances.length + 1}`;
		const newTabId = addNewTab(newTabName);
		router.push(`/dashboard/${newTabId}`);
	};

	// Show loading state while fetching data
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

	// Show flow list if instances exist
	if (chartInstances.length > 0) {
		return (
			<div className="min-h-screen bg-gray-50 p-8">
				<div className="max-w-7xl mx-auto">
					{/* Header */}
					<div className="mb-8">
						<div className="flex items-center justify-between">
							<div className="flex items-center gap-3">
								<div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/50 backdrop-blur-sm border border-gray-200/50 shadow-sm">
									<LayoutGrid className="h-4 w-4 text-gray-500" />
									<span className="text-sm text-gray-600 font-medium">Your Flows</span>
								</div>
								<motion.button
									whileHover={{ scale: 1.02 }}
									whileTap={{ scale: 0.98 }}
									onClick={handleAddNewTab}
									className="flex items-center gap-2 px-4 py-1.5 bg-white rounded-full shadow-sm hover:shadow-md transition-all duration-200"
								>
									<Plus className="h-4 w-4 text-gray-600" />
									<span className="text-sm font-medium text-gray-700">New Flow</span>
								</motion.button>
							</div>
						</div>
					</div>

					{/* Flow Grid */}
					<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
						{chartInstances.map((instance) => (
							<motion.div
								key={instance.id}
								whileHover={{ scale: 1.02 }}
								whileTap={{ scale: 0.98 }}
							>
								<Link
									href={`/dashboard/${instance.id}`}
									className={cn(
										"block p-6 rounded-xl bg-white border transition-all duration-200",
										"hover:shadow-md",
										currentTab === instance.id
											? "ring-2 ring-offset-2"
											: "hover:ring-2 hover:ring-offset-1"
									)}
									style={{
										borderColor: instance.color,
										ringColor: instance.color
									}}
									onClick={() => {
										if (currentTab !== instance.id) {
											setCurrentTab(instance.id);
										}
									}}
								>
									<h3 className="text-lg font-semibold text-gray-900 mb-2">
										{instance.name}
									</h3>
									<p className="text-sm text-gray-500">
										{instance.nodes.length} nodes · {instance.edges.length} connections
									</p>
									<div
										className="h-2 rounded-full mt-4"
										style={{ backgroundColor: instance.color }}
									/>
								</Link>
							</motion.div>
						))}
					</div>
				</div>
			</div>
		);
	}

	// Show empty state if no instances exist
	return (
		<div className="flex items-center justify-center min-h-screen">
			<div className="text-center max-w-md mx-auto p-6">
				<AlertTriangle className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
				<h2 className="text-xl font-semibold text-gray-900 mb-2">
					No Flows Found
				</h2>
				<p className="text-gray-600 mb-6">
					Create your first flow to get started with the visual editor.
				</p>
				<motion.button
					whileHover={{ scale: 1.02 }}
					whileTap={{ scale: 0.98 }}
					onClick={handleAddNewTab}
					className="inline-flex items-center gap-2 px-6 py-2 bg-gradient-to-r from-blue-500 to-violet-500 text-white rounded-full hover:shadow-md transition-all duration-200"
				>
					<Plus className="h-4 w-4" />
					Create New Flow
				</motion.button>
			</div>
		</div>
	);
}