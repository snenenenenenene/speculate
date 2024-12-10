// components/nodes/base/NodeWrapper.tsx
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';
import { GripVertical, Trash2 } from 'lucide-react';
import React, { useState } from 'react';
import { Handle, Position } from 'reactflow';
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

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
			onMouseEnter={() => setShowDelete(true)}
			onMouseLeave={() => setShowDelete(false)}
		>
			<Card className={cn(
				"group min-w-[240px] shadow-sm relative",
				selected ? "ring-1 ring-black bg-white" : "ring-1 ring-zinc-200 bg-white",
				"transition-all duration-200"
			)}>
				{/* Default Node Handles */}
				{!customHandles && (
					<>
						{handles.top && (
							<Handle
								type="target"
								position={Position.Top}
								className={cn(
									"w-8 h-8 bg-white border-[3px] rounded-full -translate-y-[16px]",
									"hover:scale-110 hover:shadow-lg",
									selected ? "border-zinc-950" : "border-zinc-400",
									"transition-all duration-200 hover:border-zinc-950"
								)}
							/>
						)}
						{handles.right && (
							<Handle
								type="source"
								position={Position.Right}
								className={cn(
									"w-8 h-8 bg-white border-[3px] rounded-full translate-x-[16px]",
									"hover:scale-110 hover:shadow-lg",
									selected ? "border-zinc-950" : "border-zinc-400",
									"transition-all duration-200 hover:border-zinc-950"
								)}
							/>
						)}
						{handles.bottom && (
							<Handle
								type="source"
								position={Position.Bottom}
								className={cn(
									"w-8 h-8 bg-white border-[3px] rounded-full translate-y-[16px]",
									"hover:scale-110 hover:shadow-lg",
									selected ? "border-zinc-950" : "border-zinc-400",
									"transition-all duration-200 hover:border-zinc-950"
								)}
							/>
						)}
						{handles.left && (
							<Handle
								type="target"
								position={Position.Left}
								className={cn(
									"w-8 h-8 bg-white border-[3px] rounded-full -translate-x-[16px]",
									"hover:scale-110 hover:shadow-lg",
									selected ? "border-zinc-950" : "border-zinc-400",
									"transition-all duration-200 hover:border-zinc-950"
								)}
							/>
						)}
					</>
				)}

				<CardHeader className={cn(
					"flex flex-row items-center justify-between space-y-0 pb-2",
					headerClassName
				)}>
					<div className="flex items-center gap-2">
						<div className="cursor-move">
							<GripVertical className="h-4 w-4 text-zinc-500" />
						</div>
						<h4 className="font-medium leading-none nodrag">{title}</h4>
					</div>
					{onDelete && (
						<div className={cn(
							"absolute right-2 top-2 opacity-0 group-hover:opacity-100",
							"transition-opacity duration-200"
						)}>
							<Button
								variant="ghost"
								size="icon"
								onClick={onDelete}
								className="h-8 w-8 p-0 nodrag"
							>
								<Trash2 className="h-4 w-4" />
							</Button>
						</div>
					)}
				</CardHeader>
				<CardContent className={cn(
					"pt-0 nodrag",
					contentClassName
				)}>
					{children}
				</CardContent>
				{customHandles}
			</Card>
		</motion.div>
	);
};