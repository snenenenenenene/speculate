// QuickActions.tsx
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
import { useEffect, useState } from "react";
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
	const [chartInstances, setChartInstances] = useState<any[]>([]);

	const urlParts = pathname.split('/');
	const flowchartIndex = urlParts.indexOf('flowcharts');
	const urlFlowchartId = flowchartIndex !== -1 ? urlParts[flowchartIndex + 1] : undefined;

	useEffect(() => {
		const loadCharts = async () => {
			if (urlFlowchartId) {
				try {
					const flowchart = await utilityStore.loadFlowchart(urlFlowchartId);
					if (flowchart?.charts) {
						const parsedCharts = flowchart.charts.map(chart => ({
							...chart,
							content: JSON.parse(chart.content || '[]')
						}));
						setChartInstances(parsedCharts);
						chartStore.setChartInstances(parsedCharts);
					}
				} catch (error) {
					console.error('Error loading charts:', error);
				}
			}
		};

		loadCharts();
	}, [urlFlowchartId, utilityStore, chartStore]);

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
		router.push(`/dashboard/flowcharts/${flowchartId}/charts/${chartId}`);
	};

	const handleNewChart = async (flowchartId: string) => {
		if (!flowchartId) {
			toast.error('No flowchart selected');
			return;
		}

		try {
			const response = await fetch(`/api/flowcharts/${flowchartId}/charts`, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({
					name: `New Chart ${chartInstances.length}`,
				}),
			});

			const data = await response.json();

			if (!response.ok) {
				throw new Error(data.error || data.details || 'Failed to create chart');
			}

			const updatedFlowchart = await utilityStore.loadFlowchart(flowchartId);
			if (updatedFlowchart?.charts) {
				const parsedCharts = updatedFlowchart.charts.map(chart => ({
					...chart,
					content: JSON.parse(chart.content || '[]')
				}));
				setChartInstances(parsedCharts);
				chartStore.setChartInstances(parsedCharts);
			}

			router.push(`/dashboard/flowcharts/${flowchartId}/charts/${data.id}`);
			toast.success('Chart created successfully');
		} catch (error: any) {
			console.error('Error creating chart:', error);
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

			{urlFlowchartId && (
				<FlowSelector
					currentFlow={chartStore.getCurrentChartInstance()}
					chartInstances={chartInstances}
					currentTab={chartStore.currentDashboardTab}
					onFlowSelect={handleChartSelect}
					onNewFlow={handleNewChart}
					flowchartId={urlFlowchartId}
				/>
			)}

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

			{/* Commit Modal */}
			<Dialog
				open={isCommitModalOpen}
				onClose={() => setIsCommitModalOpen(false)}
			>
				<div className="bg-white rounded-lg shadow-xl max-w-lg w-full mx-auto">
					<div className="p-6">
						<div className="flex items-center justify-between border-b border-gray-200 pb-4">
							<h3 className="text-lg font-bold text-gray-900">Commit Changes</h3>
							<button
								onClick={() => setIsCommitModalOpen(false)}
								className="p-1 hover:bg-gray-100 rounded-md"
							>
								<XCircle className="h-5 w-5 text-gray-500" />
							</button>
						</div>

						<div className="space-y-4 mt-4">
							<div>
								<label className="block text-sm font-medium text-gray-700 mb-1">
									Commit Message
								</label>
								<textarea
									value={commitMessage}
									onChange={(e) => setCommitMessage(e.target.value)}
									className="w-full px-3 py-2 border border-gray-300 rounded-md"
									rows={3}
									placeholder="Describe your changes..."
								/>
							</div>

							<div>
								<label className="block text-sm font-medium text-gray-700 mb-2">
									Commit Type
								</label>
								<div className="flex gap-4">
									<label className="flex items-center">
										<input
											type="radio"
											checked={commitType === "local"}
											onChange={() => setCommitType("local")}
											className="mr-2"
										/>
										<span className="text-sm text-gray-600">Local</span>
									</label>
									<label className="flex items-center">
										<input
											type="radio"
											checked={commitType === "global"}
											onChange={() => setCommitType("global")}
											className="mr-2"
										/>
										<span className="text-sm text-gray-600">Global</span>
									</label>
								</div>
							</div>
						</div>
					</div>

					<div className="border-t border-gray-200 px-6 py-4 bg-gray-50 flex justify-end gap-2">
						<button
							onClick={() => setIsCommitModalOpen(false)}
							className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
						>
							Cancel
						</button>
						<button
							onClick={async () => {
								try {
									await commitStore.createCommit(commitMessage, commitType);
									setIsCommitModalOpen(false);
									setCommitMessage("");
									toast.success("Changes committed successfully");
								} catch (error) {
									toast.error("Failed to commit changes");
								}
							}}
							className="px-4 py-2 text-sm font-medium bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
						>
							Commit
						</button>
					</div>
				</div>
			</Dialog>
		</div>
	);
}