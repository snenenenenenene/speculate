"use client";

import { useStores } from '@/hooks/useStores';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';
import {
	AlertCircle,
	Download,
	FileJson,
	Upload,
	X
} from 'lucide-react';
import React, { useRef } from 'react';
import { toast } from 'react-hot-toast';

interface ImportExportModalProps {
	isOpen: boolean;
	onClose: () => void;
}

const ImportExportModal: React.FC<ImportExportModalProps> = ({ isOpen, onClose }) => {
	const fileInputRef = useRef<HTMLInputElement>(null);
	const dragRef = useRef<HTMLDivElement>(null);
	const [isDragging, setIsDragging] = React.useState(false);
	const { chartStore } = useStores();
	const currentInstance = chartStore.getCurrentChartInstance();

	const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
		const file = event.target.files?.[0];
		if (!file) return;

		if (!file.name.endsWith('.json')) {
			toast.error('Please select a JSON file');
			return;
		}

		try {
			await chartStore.importFlow(file);
			onClose();
		} catch (error) {
			toast.error("Failed to import flow");
			console.error('Import error:', error);
		}
	};

	const handleDragOver = (e: React.DragEvent) => {
		e.preventDefault();
		e.stopPropagation();
		setIsDragging(true);
	};

	const handleDragLeave = (e: React.DragEvent) => {
		e.preventDefault();
		e.stopPropagation();
		setIsDragging(false);
	};

	const handleDrop = async (e: React.DragEvent) => {
		e.preventDefault();
		e.stopPropagation();
		setIsDragging(false);

		const file = e.dataTransfer.files[0];
		if (!file) return;

		if (!file.name.endsWith('.json')) {
			toast.error('Please drop a JSON file');
			return;
		}

		try {
			await chartStore.importFlow(file);
			onClose();
		} catch (error) {
			toast.error("Failed to import flow");
			console.error('Import error:', error);
		}
	};

	if (!isOpen) return null;

	return (
		<div
			className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
			onClick={(e) => e.target === e.currentTarget && onClose()}
		>
			<motion.div
				initial={{ opacity: 0, scale: 0.95 }}
				animate={{ opacity: 1, scale: 1 }}
				exit={{ opacity: 0, scale: 0.95 }}
				className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden"
			>
				{/* Header */}
				<div className="flex items-center justify-between p-4 border-b border-gray-200">
					<h2 className="text-lg font-semibold text-gray-900">Import/Export Flows</h2>
					<button
						onClick={onClose}
						className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
						aria-label="Close dialog"
					>
						<X className="h-5 w-5 text-gray-500" />
					</button>
				</div>

				<div className="p-4 space-y-6">
					{/* Import Section */}
					<div className="space-y-4">
						<div className="flex items-center gap-2">
							<Upload className="h-5 w-5 text-blue-500" />
							<h3 className="text-sm font-medium text-gray-900">Import Flow</h3>
						</div>

						<div
							ref={dragRef}
							onDragOver={handleDragOver}
							onDragLeave={handleDragLeave}
							onDrop={handleDrop}
							className={cn(
								"border-2 border-dashed rounded-lg p-8 transition-colors text-center",
								isDragging
									? "border-blue-500 bg-blue-50"
									: "border-gray-200 hover:border-gray-300"
							)}
						>
							<input
								ref={fileInputRef}
								type="file"
								accept=".json"
								onChange={handleFileChange}
								className="hidden"
							/>
							<FileJson className="h-10 w-10 text-gray-400 mx-auto mb-4" />
							<div className="text-sm text-gray-600">
								<button
									onClick={() => fileInputRef.current?.click()}
									className="text-blue-500 hover:text-blue-600 font-medium"
								>
									Click to upload
								</button>
								{" or drag and drop"}
							</div>
							<p className="text-xs text-gray-500 mt-2">
								Supports single flow or complete system JSON files
							</p>
						</div>
					</div>

					{/* Export Section */}
					<div className="space-y-4">
						<div className="flex items-center gap-2">
							<Download className="h-5 w-5 text-green-500" />
							<h3 className="text-sm font-medium text-gray-900">Export Flow</h3>
						</div>

						<div className="space-y-3">
							{currentInstance && (
								<button
									onClick={() => chartStore.exportFlow(currentInstance.id)}
									className="w-full flex items-center justify-between px-4 py-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors group"
								>
									<div className="flex items-center gap-3">
										<FileJson className="h-5 w-5 text-gray-400 group-hover:text-gray-500" />
										<div className="text-left">
											<div className="text-sm font-medium text-gray-900">Current Flow</div>
											<div className="text-xs text-gray-500">{currentInstance.name}</div>
										</div>
									</div>
									<Download className="h-4 w-4 text-gray-400 group-hover:text-gray-500" />
								</button>
							)}

							<button
								onClick={() => chartStore.exportAllFlows()}
								className="w-full flex items-center justify-between px-4 py-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors group"
							>
								<div className="flex items-center gap-3">
									<FileJson className="h-5 w-5 text-gray-400 group-hover:text-gray-500" />
									<div className="text-left">
										<div className="text-sm font-medium text-gray-900">All Flows</div>
										<div className="text-xs text-gray-500">Export complete system</div>
									</div>
								</div>
								<Download className="h-4 w-4 text-gray-400 group-hover:text-gray-500" />
							</button>
						</div>
					</div>

					{/* Info Section */}
					<div className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg">
						<AlertCircle className="h-5 w-5 text-blue-500 flex-shrink-0 mt-0.5" />
						<div className="text-sm text-blue-700">
							<p className="font-medium mb-1">About Flow Export</p>
							<p className="text-blue-600 text-xs">
								Exporting all flows will preserve connections and references between flows.
								You can choose to export just the current flow or your entire system.
							</p>
						</div>
					</div>
				</div>
			</motion.div>
		</div>
	);
};

export default ImportExportModal;