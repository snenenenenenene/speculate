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

export function QuickActions() {
	const router = useRouter();
	const { chartStore, commitStore, utilityStore } = useStores();
	const [isSaving, setIsSaving] = useState(false);
	const [isCommitModalOpen, setIsCommitModalOpen] = useState(false);
	const [isImportExportModalOpen, setIsImportExportModalOpen] = useState(false);
	const [commitMessage, setCommitMessage] = useState("");
	const [commitType, setCommitType] = useState<"local" | "global">("local");

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

	const handleCommitAndSave = async () => {
		if (!commitMessage.trim()) {
			toast.error("Please enter a commit message");
			return;
		}

		setIsSaving(true);
		try {
			if (commitType === "local") {
				commitStore.addLocalCommit(commitMessage);
			} else {
				commitStore.addGlobalCommit(commitMessage);
			}

			await utilityStore.saveToDb(chartStore.chartInstances);
			toast.success("Changes committed successfully");
			setCommitMessage("");
			setIsCommitModalOpen(false);
		} catch (error) {
			toast.error("Failed to commit changes");
			console.error("Commit error:", error);
		} finally {
			setIsSaving(false);
		}
	};

	const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
		const files = Array.from(e.target.files || []);
		if (files.length > 0) {
			try {
				await chartStore.importFlow(files[0]);
				toast.success("Flow imported successfully");
				setIsImportExportModalOpen(false);
			} catch (error) {
				toast.error("Failed to import flow");
				console.error("Import error:", error);
			}
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

			{/* Commit Modal */}
			<Dialog open={isCommitModalOpen} onClose={() => setIsCommitModalOpen(false)}>
				<div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-auto">
					<div className="p-6">
						<h2 className="text-lg font-semibold text-gray-900 mb-4">
							Commit Changes
						</h2>
						<div className="space-y-4">
							<div>
								<label className="block text-sm font-medium text-gray-700 mb-1">
									Commit Message
								</label>
								<input
									type="text"
									value={commitMessage}
									onChange={(e) => setCommitMessage(e.target.value)}
									placeholder="Describe your changes..."
									className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
								/>
							</div>
							<div className="flex items-center gap-2">
								<button
									onClick={() => setCommitType("local")}
									className={cn(
										"px-3 py-1.5 rounded-lg text-sm font-medium transition-colors",
										commitType === "local"
											? "bg-blue-100 text-blue-700"
											: "bg-gray-100 text-gray-600 hover:bg-gray-200"
									)}
								>
									Local Commit
								</button>
								<button
									onClick={() => setCommitType("global")}
									className={cn(
										"px-3 py-1.5 rounded-lg text-sm font-medium transition-colors",
										commitType === "global"
											? "bg-blue-100 text-blue-700"
											: "bg-gray-100 text-gray-600 hover:bg-gray-200"
									)}
								>
									Global Commit
								</button>
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
							onClick={handleCommitAndSave}
							disabled={isSaving || !commitMessage.trim()}
							className={cn(
								"px-4 py-2 rounded-lg text-sm font-medium transition-colors",
								"disabled:opacity-50 disabled:cursor-not-allowed",
								isSaving || !commitMessage.trim()
									? "bg-gray-100 text-gray-400"
									: "bg-blue-500 text-white hover:bg-blue-600"
							)}
						>
							{isSaving ? <LoadingSpinner className="h-4 w-4" /> : "Commit & Save"}
						</button>
					</div>
				</div>
			</Dialog>

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
		</div>
	);
}