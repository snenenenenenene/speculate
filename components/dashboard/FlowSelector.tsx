"use client";

import { cn } from "@/lib/utils";
import { ChartInstance } from "@/types";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronDown, LayoutGrid, Plus, Search } from "lucide-react";
import { useState } from "react";

interface FlowSelectorProps {
	currentFlow: ChartInstance | undefined;
	chartInstances: ChartInstance[];
	currentTab: string;
	onFlowSelect: (id: string) => void;
	onNewFlow: () => void;
}

export function FlowSelector({
	currentFlow,
	chartInstances,
	currentTab,
	onFlowSelect,
	onNewFlow
}: FlowSelectorProps) {
	const [isOpen, setIsOpen] = useState(false);
	const [searchQuery, setSearchQuery] = useState("");

	const filteredInstances = chartInstances.filter(instance =>
		instance.name.toLowerCase().includes(searchQuery.toLowerCase())
	);

	return (
		<div className="relative">
			<button
				onClick={() => setIsOpen(!isOpen)}
				className={cn(
					"flex items-center gap-2 px-4 py-1.5 rounded-lg",
					"hover:bg-gray-50 transition-colors duration-200",
					"border border-gray-200"
				)}
			>
				<LayoutGrid className="h-4 w-4 text-gray-500" />
				<span className="text-sm font-medium text-gray-700">
					{currentFlow?.name || 'Select Flow'}
				</span>
				<ChevronDown className="h-4 w-4 text-gray-500" />
			</button>

			<AnimatePresence>
				{isOpen && (
					<motion.div
						initial={{ opacity: 0, y: -10 }}
						animate={{ opacity: 1, y: 0 }}
						exit={{ opacity: 0, y: -10 }}
						className="absolute top-full left-0 mt-2 w-72 bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden z-50"
					>
						<div className="p-2">
							<div className="relative mb-2">
								<Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-400" />
								<input
									type="text"
									placeholder="Search flows..."
									value={searchQuery}
									onChange={(e) => setSearchQuery(e.target.value)}
									className="w-full pl-9 pr-4 py-2 text-sm bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
								/>
							</div>

							<div className="max-h-64 overflow-y-auto">
								{filteredInstances.map((instance) => (
									<button
										key={instance.id}
										onClick={() => {
											onFlowSelect(instance.id);
											setIsOpen(false);
										}}
										className={cn(
											"w-full flex items-center gap-3 px-3 py-2 rounded-lg",
											"hover:bg-gray-50 transition-colors duration-200",
											currentTab === instance.id && "bg-blue-50 text-blue-600"
										)}
									>
										<div
											className="w-2 h-2 rounded-full"
											style={{ backgroundColor: instance.color }}
										/>
										<span className="text-sm font-medium">{instance.name}</span>
										<div className="ml-auto text-xs text-gray-400">
											{instance.nodes.length} nodes
										</div>
									</button>
								))}
							</div>

							<div className="border-t border-gray-200 mt-2 pt-2">
								<button
									onClick={() => {
										onNewFlow();
										setIsOpen(false);
									}}
									className="w-full flex items-center gap-2 px-3 py-2 text-sm font-medium text-blue-600 hover:bg-blue-50 rounded-lg transition-colors duration-200"
								>
									<Plus className="h-4 w-4" />
									Create New Flow
								</button>
							</div>
						</div>
					</motion.div>
				)}
			</AnimatePresence>
		</div>
	);
}