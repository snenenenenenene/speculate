"use client";

import { Dialog } from "@/components/ui/Dialog";
import { LoadingSpinner } from "@/components/ui/base";
import { useStores } from "@/hooks/useStores";
import { cn } from "@/lib/utils";
import {
	Download,
	GitCommit,
	Save,
	Settings,
	Upload,
	XCircle
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "react-hot-toast";
import { FlowSelector } from "./FlowSelector";
import { ImportChoiceDialog } from "./ImportChoiceDialog";

export function QuickActions() {
	const router = useRouter();
	const { chartStore, commitStore, utilityStore } = useStores();
	const [isSaving, setIsSaving] = useState(false);
	const [isCommitModalOpen, setIsCommitModalOpen] = useState(false);
	const [isImportExportModalOpen, setIsImportExportModalOpen] = useState(false);
	const [commitMessage, setCommitMessage] = useState("");
	const [commitType, setCommitType] = useState<"local" | "global">("local");

	// New import-related state
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

	const handleFlowSelect = (id: string) => {
		chartStore.setCurrentDashboardTab(id);
		router.push(`/dashboard/${id}`);
	};

	const handleNewFlow = () => {
		const newTabId = chartStore.addNewTab(`New Flow ${chartStore.chartInstances.length + 1}`);
		router.push(`/dashboard/${newTabId}`);
	};

	const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
		const files = Array.from(e.target.files || []);
		if (files.length > 0) {
			try {
				const file = files[0];
				const text = await file.text();
				const data = JSON.parse(text);

				// Validate the import data
				const validationResult = chartStore.validateImport(data);

				if (!validationResult.isValid) {
					toast.error(`Import validation failed: ${validationResult.errors[0]}`);
					return;
				}

				if (validationResult.warnings.length > 0) {
					validationResult.warnings.forEach(warning => {
						toast.warning(warning);
					});
				}

				// Store the pending import and open choice dialog
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
		if (!pendingImport) return;

		try {
			if (pendingImport.type === "single") {
				// Replace current flow only
				const currentInstance = chartStore.getCurrentChartInstance();
				if (currentInstance) {
					await chartStore.replaceFlow(currentInstance.id, pendingImport.data.flow);
					toast.success("Flow replaced successfully");
				}
			} else {
				// Replace all flows
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
		if (!pendingImport) return;

		try {
			if (pendingImport.type === "single") {
				// Add as new flow
				const newFlowId = await chartStore.importFlow(pendingImport.file);
				if (newFlowId) {
					router.push(`/dashboard/${newFlowId}`);
				}
				toast.success("Flow imported successfully");
			} else {
				// Append all flows
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
			{/* Flow Selector */}
			<FlowSelector
				currentFlow={chartStore.getCurrentChartInstance()}
				chartInstances={chartStore.chartInstances}
				currentTab={chartStore.currentDashboardTab}
				onFlowSelect={handleFlowSelect}
				onNewFlow={handleNewFlow}
			/>

			<div className="h-6 w-px bg-gray-200" />

			{/* Quick Save */}
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

			{/* Commit */}
			<button
				onClick={() => setIsCommitModalOpen(true)}
				className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-gray-600 hover:bg-gray-50 rounded-lg transition-colors"
			>
				<GitCommit className="h-4 w-4" />
				Commit
			</button>

			{/* Import/Export */}
			<div className="h-6 w-px bg-gray-200" />

			<button
				onClick={() => setIsImportExportModalOpen(true)}
				className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-gray-600 hover:bg-gray-50 rounded-lg transition-colors"
			>
				<Upload className="h-4 w-4" />
				Import/Export
			</button>

			{/* Settings */}
			<div className="h-6 w-px bg-gray-200" />

			<button
				onClick={() => {
					const modal = document.getElementById('settings_modal') as HTMLDialogElement;
					if (modal) modal.showModal();
				}}
				className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-gray-600 hover:bg-gray-50 rounded-lg transition-colors"
			>
				<Settings className="h-4 w-4" />
				Settings
			</button>

			{/* All existing modals (Commit, Settings, etc.) remain the same */}
			{/* ... */}

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