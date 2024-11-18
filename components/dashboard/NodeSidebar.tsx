"use client";

import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { Search } from "lucide-react";
import { useState } from "react";

// Node templates and categories
const nodeTemplates = [
	{
		id: 'startNode',
		label: 'Start Node',
		description: 'Begins the flow',
		icon: '▶️',
		category: 'basic'
	},
	{
		id: 'endNode',
		label: 'End Node',
		description: 'Ends the flow',
		icon: '⏹️',
		category: 'basic'
	},
	{
		id: 'yesNo',
		label: 'Yes/No Question',
		description: 'Binary choice question',
		icon: '❓',
		category: 'question'
	},
	{
		id: 'singleChoice',
		label: 'Single Choice',
		description: 'One option from many',
		icon: '☝️',
		category: 'question'
	},
	{
		id: 'multipleChoice',
		label: 'Multiple Choice',
		description: 'Multiple selections allowed',
		icon: '✨',
		category: 'question'
	},
	{
		id: 'weightNode',
		label: 'Weight Node',
		description: 'Adjusts scoring weight',
		icon: '⚖️',
		category: 'logic'
	},
	{
		id: 'functionNode',
		label: 'Function Node',
		description: 'Custom logic and calculations',
		icon: '🔧',
		category: 'logic'
	},
];

const categories = [
	{ id: 'all', label: 'All Nodes' },
	{ id: 'basic', label: 'Basic' },
	{ id: 'question', label: 'Questions' },
	{ id: 'logic', label: 'Logic' },
];

interface NodeSidebarProps {
	width: number;
	onWidthChange: (width: number) => void;
}

export function NodeSidebar({ width, onWidthChange }: NodeSidebarProps) {
	const [searchQuery, setSearchQuery] = useState('');
	const [activeCategory, setActiveCategory] = useState('all');

	const handleDragStart = (event: React.DragEvent, nodeType: string) => {
		event.dataTransfer.setData('application/reactflow', nodeType);
		event.dataTransfer.effectAllowed = 'move';
	};

	const filteredNodes = nodeTemplates.filter(node =>
		(activeCategory === 'all' || node.category === activeCategory) &&
		(node.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
			node.description.toLowerCase().includes(searchQuery.toLowerCase()))
	);

	return (
		<div className="flex flex-col h-full">
			{/* Search Bar */}
			<div className="p-3 border-b border-base-200">
				<div className="relative">
					<Search className="absolute left-2.5 top-2.5 h-4 w-4 text-base-600" />
					<input
						type="text"
						placeholder="Search nodes..."
						value={searchQuery}
						onChange={(e) => setSearchQuery(e.target.value)}
						className={cn(
							"w-full pl-9 pr-4 py-2 text-sm",
							"bg-base-50 border border-base-200 rounded-xl",
							"focus:outline-none focus:ring-2 focus:ring-primary-200 focus:border-primary-500",
							"placeholder:text-base-500 text-base-800",
							"transition-all duration-200"
						)}
					/>
				</div>
			</div>

			{/* Categories */}
			<div className="border-b border-base-200 p-3">
				<div className="flex flex-wrap gap-2">
					{categories.map((category) => (
						<button
							key={category.id}
							onClick={() => setActiveCategory(category.id)}
							className={cn(
								"px-3 py-1 text-sm rounded-full transition-all duration-200",
								activeCategory === category.id
									? "bg-primary-100 text-primary-700"
									: "bg-base-100 text-base-600 hover:bg-base-200"
							)}
							aria-pressed={activeCategory === category.id}
						>
							{category.label}
						</button>
					))}
				</div>
			</div>

			{/* Node List */}
			<div className="flex-1 overflow-y-auto p-3 space-y-2 hide-scrollbar">
				{filteredNodes.map((node) => (
					<motion.div
						key={node.id}
						draggable
						onDragStart={(e) => handleDragStart(e, node.id)}
						className={cn(
							"group cursor-move rounded-xl border border-base-200",
							"bg-white p-2.5 hover:border-primary-200",
							"hover:shadow-sm transition-all duration-200"
						)}
						whileHover={{ scale: 1.02 }}
						whileTap={{ scale: 0.98 }}
					>
						<div className="flex items-center gap-2">
							<span role="img" aria-label={node.label} className="text-xl">
								{node.icon}
							</span>
							<div>
								<h3 className="font-medium text-base-800 text-sm">{node.label}</h3>
								<p className="text-xs text-base-600 mt-0.5">{node.description}</p>
							</div>
						</div>
					</motion.div>
				))}
			</div>

			{/* Resize Handle */}
			<div
				className={cn(
					"absolute right-0 top-0 bottom-0 w-1",
					"cursor-col-resize hover:bg-primary-500/50",
					"transition-colors duration-200"
				)}
				onMouseDown={(e) => {
					const startX = e.pageX;
					const startWidth = width;

					const onMouseMove = (e: MouseEvent) => {
						const newWidth = startWidth + (e.pageX - startX);
						if (newWidth >= 200 && newWidth <= 400) {
							onWidthChange(newWidth);
						}
					};

					const onMouseUp = () => {
						document.removeEventListener('mousemove', onMouseMove);
						document.removeEventListener('mouseup', onMouseUp);
					};

					document.addEventListener('mousemove', onMouseMove);
					document.addEventListener('mouseup', onMouseUp);
				}}
			/>
		</div>
	);
}