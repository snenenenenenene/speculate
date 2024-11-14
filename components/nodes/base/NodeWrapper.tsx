// components/nodes/base/NodeWrapper.tsx
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';
import { GripVertical, Trash2 } from 'lucide-react';
import React, { useState } from 'react';
import { Handle, Position } from 'reactflow';

interface NodeWrapperProps {
	title: string;
	selected: boolean;
	onDelete?: () => void;
	children: React.ReactNode;
	headerClassName?: string;
	contentClassName?: string;
	handles?: {
		top?: boolean;
		right?: boolean;
		bottom?: boolean;
		left?: boolean;
	};
	customHandles?: React.ReactNode;
}

export const NodeWrapper: React.FC<NodeWrapperProps> = ({
	title,
	selected,
	onDelete,
	children,
	headerClassName,
	contentClassName,
	handles = { top: true, bottom: true },
	customHandles
}) => {
	const [showDelete, setShowDelete] = useState(false);

	return (
		<motion.div
			initial={{ scale: 0.9, opacity: 0 }}
			animate={{ scale: 1, opacity: 1 }}
			className={cn(
				"group min-w-[200px] bg-white rounded-xl border transition-all duration-200",
				selected ? "border-blue-500 shadow-lg" : "border-gray-200 shadow-sm",
				"hover:shadow-md"
			)}
			onMouseEnter={() => setShowDelete(true)}
			onMouseLeave={() => setShowDelete(false)}
		>
			{/* Default Node Handles */}
			{!customHandles && (
				<>
					{handles.top && (
						<Handle
							type="target"
							position={Position.Top}
							className="w-3 h-3 bg-blue-500 border-2 border-white transition-all duration-200 hover:bg-blue-600 hover:scale-110"
						/>
					)}
					{handles.right && (
						<Handle
							type="source"
							position={Position.Right}
							className="w-3 h-3 bg-blue-500 border-2 border-white transition-all duration-200 hover:bg-blue-600 hover:scale-110"
						/>
					)}
					{handles.bottom && (
						<Handle
							type="source"
							position={Position.Bottom}
							className="w-3 h-3 bg-blue-500 border-2 border-white transition-all duration-200 hover:bg-blue-600 hover:scale-110"
						/>
					)}
					{handles.left && (
						<Handle
							type="target"
							position={Position.Left}
							className="w-3 h-3 bg-blue-500 border-2 border-white transition-all duration-200 hover:bg-blue-600 hover:scale-110"
						/>
					)}
				</>
			)}

			{/* Custom Handles */}
			{customHandles}

			{/* Header */}
			<div className={cn(
				"flex items-center justify-between px-3 py-2 border-b border-gray-100 rounded-t-xl",
				"bg-gray-50/50 backdrop-blur-sm",
				headerClassName
			)}>
				<div className="flex items-center gap-2">
					<GripVertical className="h-4 w-4 text-gray-400 cursor-move" />
					<span className="text-sm font-medium text-gray-700">{title}</span>
				</div>
				{onDelete && showDelete && (
					<button
						onClick={onDelete}
						className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-gray-100 rounded"
					>
						<Trash2 className="h-4 w-4 text-gray-400 hover:text-red-500" />
					</button>
				)}
			</div>

			{/* Content */}
			<div className={cn("p-3", contentClassName)}>
				{children}
			</div>
		</motion.div>
	);
};