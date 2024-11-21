/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { Dialog } from "@/components/ui/Dialog";
import { LoadingSpinner } from "@/components/ui/base";
import { useStores } from "@/hooks/useStores";
import { cn } from "@/lib/utils";
import {
	ArrowLeft,
	Download,
	GitCommit,
	Save,
	Settings,
	Upload,
	XCircle
} from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "react-hot-toast";
import { FlowSelector } from "./FlowSelector";
import { ImportChoiceDialog } from "./ImportChoiceDialog";

interface QuickActionsProps {
	onOpenSettings: () => void;
}

export function QuickActions({ onOpenSettings }: QuickActionsProps) {
	const router = useRouter();
	const pathname = usePathname();
	const { chartStore, commitStore, utilityStore } = useStores() as any;
	const [isSaving, setIsSaving] = useState(false);
	const [isCommitModalOpen, setIsCommitModalOpen] = useState(false);
	const [isImportExportModalOpen, setIsImportExportModalOpen] = useState(false);
	const [commitMessage, setCommitMessage] = useState("");
	const [commitType, setCommitType] = useState<"local" | "global">("local");

	// Get flowchartId from URL
	const urlFlowchartId = pathname.split('/').find((part, index, arr) =>
		arr[index - 1] === 'flowcharts' && part !== 'flowcharts'
	);

	const [importChoiceOpen, setImportChoiceOpen] = useState(false);
	const [pendingImport, setPendingImport] = useState<{
		file: File;
		data: any;
		type: "single" | "complete";
	} | null>(null);

	const handleQuickSave = async () => {
		setIsSaving(true);
		try {
			await utilityStore.saveToDb(chartStore.chartInstances);
			toast.success("Changes saved successfully");
		} catch (error) {
			toast.error("Failed to save changes");
			console.error("Save error:", error);
		} finally {
			setIsSaving(false);
		}
	};

	const handleChartSelect = (flowchartId: string, chartId: string) => {
		chartStore.setCurrentDashboardTab(chartId);
		router.push(`/dashboard/flowcharts/${flowchartId}/charts/${chartId}`);
	};

	// In QuickActions.tsx
	const handleNewChart = async (flowchartId: string) => {
		if (!flowchartId) {
			toast.error('No flowchart selected');
			return;
		}

		console.log('Creating chart for flowchart:', flowchartId); // Debug log

		try {
			const response = await fetch(`/api/flowcharts/${flowchartId}/charts`, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({
					name: `New Chart ${chartStore.chartInstances?.length ?? 0 + 1}`,
				}),
			});

			console.log('Response status:', response.status); // Debug log

			const data = await response.json();
			console.log('Response data:', data); // Debug log

			if (!response.ok) {
				throw new Error(data.error || data.details || 'Failed to create chart');
			}

			if (!data.id) {
				throw new Error('Created chart has no ID');
			}

			await router.push(`/dashboard/flowcharts/${flowchartId}/charts/${data.id}`);
			toast.success('Chart created successfully');
		} catch (error: any) {
			console.error('Detailed error:', {
				message: error.message,
				error: error,
				stack: error.stack
			});
			toast.error(error.message || 'Failed to create chart');
		}
	};

	const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
		const files = Array.from(e.target.files || []);
		if (files.length > 0) {
			try {
				const file = files[0];
				const text = await file.text();
				const data = JSON.parse(text);

				const validationResult = chartStore.validateImport(data);

				if (!validationResult.isValid) {
					toast.error(`Import validation failed: ${validationResult.errors[0]}`);
					return;
				}

				if (validationResult.warnings.length > 0) {
					validationResult.warnings.forEach(warning => {
						toast.error(warning);
					});
				}

				setPendingImport({
					file,
					data,
					type: data.type || "single"
				});
				setImportChoiceOpen(true);

			} catch (error) {
				console.error("Import error:", error);
				toast.error("Failed to parse import file");
			}
		}
	};

	const handleImportReplace = async () => {
		if (!pendingImport || !urlFlowchartId) return;

		try {
			if (pendingImport.type === "single") {
				const currentChart = chartStore.getCurrentChartInstance();
				if (currentChart) {
					await chartStore.replaceFlow(currentChart.id, pendingImport.data.flow);
					toast.success("Chart replaced successfully");
				}
			} else {
				await chartStore.replaceAllFlows(pendingImport.data.flows);
				toast.success("All flows replaced successfully");
			}
		} catch (error) {
			console.error("Import error:", error);
			toast.error("Failed to import flows");
		} finally {
			setImportChoiceOpen(false);
			setIsImportExportModalOpen(false);
			setPendingImport(null);
		}
	};

	const handleImportAppend = async () => {
		if (!pendingImport || !urlFlowchartId) return;

		try {
			if (pendingImport.type === "single") {
				const newFlowId = await chartStore.importFlow(pendingImport.file);
				if (newFlowId) {
					router.push(`/dashboard/flowcharts/${urlFlowchartId}/charts/${newFlowId}`);
				}
				toast.success("Flow imported successfully");
			} else {
				await chartStore.importMultipleFlows(pendingImport.data.flows);
				toast.success("Flows imported successfully");
			}
		} catch (error) {
			console.error("Import error:", error);
			toast.error("Failed to import flows");
		} finally {
			setImportChoiceOpen(false);
			setIsImportExportModalOpen(false);
			setPendingImport(null);
		}
	};

	return (
		<div className="flex items-center gap-2">
			<Link
				href="/dashboard/flowcharts"
				className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-gray-600 hover:bg-gray-50 rounded-lg transition-colors mr-2"
			>
				<ArrowLeft className="h-4 w-4" />
				Back to Flowcharts
			</Link>

			<div className="h-6 w-px bg-gray-200" />

			<FlowSelector
				currentFlow={chartStore.getCurrentChartInstance()}
				chartInstances={chartStore.chartInstances}
				currentTab={chartStore.currentDashboardTab}
				onFlowSelect={handleChartSelect}
				onNewFlow={handleNewChart}
				flowchartId={urlFlowchartId}
			/>

			<div className="h-6 w-px bg-gray-200" />

			<button
				onClick={handleQuickSave}
				disabled={isSaving}
				className={cn(
					"flex items-center gap-2 px-3 py-1.5",
					"text-sm font-medium rounded-lg transition-colors",
					"bg-blue-50 text-blue-600 hover:bg-blue-100",
					"disabled:opacity-50 disabled:cursor-not-allowed"
				)}
			>
				{isSaving ? (
					<LoadingSpinner className="h-4 w-4" />
				) : (
					<Save className="h-4 w-4" />
				)}
				Save
			</button>

			<button
				onClick={() => setIsCommitModalOpen(true)}
				className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-gray-600 hover:bg-gray-50 rounded-lg transition-colors"
			>
				<GitCommit className="h-4 w-4" />
				Commit
			</button>

			<div className="h-6 w-px bg-gray-200" />

			<button
				onClick={() => setIsImportExportModalOpen(true)}
				className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-gray-600 hover:bg-gray-50 rounded-lg transition-colors"
			>
				<Upload className="h-4 w-4" />
				Import/Export
			</button>

			<div className="h-6 w-px bg-gray-200" />

			<button
				onClick={() => onOpenSettings()}
				className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-gray-600 hover:bg-gray-50 rounded-lg transition-colors"
			>
				<Settings className="h-4 w-4" />
				Settings
			</button>

			{/* Import/Export Modal */}
			<Dialog
				open={isImportExportModalOpen}
				onClose={() => setIsImportExportModalOpen(false)}
			>
				<div className="bg-white rounded-lg shadow-xl max-w-lg w-full mx-auto">
					<div className="p-6">
						<div className="flex items-center justify-between border-b border-gray-200 pb-4">
							<h3 className="text-lg font-bold text-gray-900">Import/Export Flows</h3>
							<button
								onClick={() => setIsImportExportModalOpen(false)}
								className="p-1 hover:bg-gray-100 rounded-md"
							>
								<XCircle className="h-5 w-5 text-gray-500" />
							</button>
						</div>

						<div className="space-y-6 mt-4">
							{/* Import Section */}
							<div>
								<h3 className="text-sm font-medium text-gray-900 mb-2">Import</h3>
								<label className="block">
									<div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-gray-400 transition-colors cursor-pointer">
										<Upload className="h-8 w-8 text-gray-400 mx-auto mb-4" />
										<p className="text-sm text-gray-600 mb-2">
											Click to select a flow file
										</p>
										<input
											type="file"
											className="hidden"
											accept="application/json"
											onChange={handleFileSelect}
										/>
									</div>
								</label>
							</div>

							{/* Export Section */}
							<div>
								<h3 className="text-sm font-medium text-gray-900 mb-2">Export</h3>
								<div className="space-y-2">
									<button
										onClick={() => {
											const currentFlow = chartStore.getCurrentChartInstance();
											if (currentFlow) {
												chartStore.exportFlow(currentFlow.id);
											}
										}}
										className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors"
									>
										<Download className="h-4 w-4" />
										Export Current Flow
									</button>
									<button
										onClick={() => chartStore.exportAllFlows()}
										className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-gray-50 text-gray-600 rounded-lg hover:bg-gray-100 transition-colors"
									>
										<Download className="h-4 w-4" />
										Export All Flows
									</button>
								</div>
							</div>
						</div>
					</div>
					<div className="border-t border-gray-200 px-6 py-4 bg-gray-50">
						<button
							onClick={() => setIsImportExportModalOpen(false)}
							className="w-full px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
						>
							Close
						</button>
					</div>
				</div>
			</Dialog>

			{/* Import Choice Dialog */}
			{pendingImport && (
				<ImportChoiceDialog
					isOpen={importChoiceOpen}
					onClose={() => {
						setImportChoiceOpen(false);
						setPendingImport(null);
					}}
					importType={pendingImport.type}
					onReplace={handleImportReplace}
					onAppend={handleImportAppend}
				/>
			)}
		</div>
	);
}