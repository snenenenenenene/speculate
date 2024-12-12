/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useStores } from '@/hooks/use-stores';
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
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"

interface ImportExportModalProps {
	isOpen: boolean;
	onClose: () => void;
}

const ImportExportModal: React.FC<ImportExportModalProps> = ({ isOpen, onClose }) => {
	const fileInputRef = useRef<HTMLInputElement>(null);
	const dragRef = useRef<HTMLDivElement>(null);
	const [isDragging, setIsDragging] = React.useState(false);
	const { chartStore } = useStores() as any;
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

	return (
		<Dialog open={isOpen} onOpenChange={onClose}>
			<DialogContent className="sm:max-w-md">
				<DialogHeader>
					<DialogTitle>Import/Export Flows</DialogTitle>
				</DialogHeader>

				<div className="space-y-6">
					{/* Import Section */}
					<div className="space-y-4">
						<div className="flex items-center gap-2">
							<Upload className="h-5 w-5 text-blue-500" />
							<h3 className="text-sm font-medium">Import Flow</h3>
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
								<Button
									variant="link"
									onClick={() => fileInputRef.current?.click()}
									className="text-blue-500 hover:text-blue-600 font-medium p-0 h-auto"
								>
									Click to upload
								</Button>
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
							<h3 className="text-sm font-medium">Export Flow</h3>
						</div>

						<div className="space-y-3">
							{currentInstance && (
								<Button
									variant="outline"
									onClick={() => chartStore.exportFlow(currentInstance.id)}
									className="w-full justify-between h-auto py-3"
								>
									<div className="flex items-center gap-3">
										<FileJson className="h-5 w-5 text-gray-400" />
										<div className="text-left">
											<div className="text-sm font-medium">{currentInstance.name}</div>
											<div className="text-xs text-gray-500">Current Flow</div>
										</div>
									</div>
									<Download className="h-4 w-4 text-gray-400" />
								</Button>
							)}

							<Button
								variant="outline"
								onClick={() => chartStore.exportAllFlows()}
								className="w-full justify-between h-auto py-3"
							>
								<div className="flex items-center gap-3">
									<FileJson className="h-5 w-5 text-gray-400" />
									<div className="text-left">
										<div className="text-sm font-medium">All Flows</div>
										<div className="text-xs text-gray-500">Export complete system</div>
									</div>
								</div>
								<Download className="h-4 w-4 text-gray-400" />
							</Button>
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
			</DialogContent>
		</Dialog>
	);
};

export default ImportExportModal;