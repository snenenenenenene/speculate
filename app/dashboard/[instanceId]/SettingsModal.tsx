"use client";

import { LoadingSpinner } from "@/components/ui/base";
import { useStores } from "@/hooks/useStores";
import { cn } from "@/lib/utils";
import { AnimatePresence, motion } from "framer-motion";
import {
	AlertTriangle,
	Database,
	Globe,
	Hash,
	Layout,
	Plus,
	Save,
	Trash2,
	X
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { toast } from "react-hot-toast";

interface SettingsModalProps {
	chartStore: any;
	utilityStore: any;
	variableStore: any;
	currentTab: string;
	onClose: () => void;
}

export default function SettingsModal() {
	const { chartStore, utilityStore, variableStore } = useStores();
	const { setCurrentTabColor, setOnePage, updateChartInstanceName, deleteTab } = chartStore;
	const { currentTab, saveToDb } = utilityStore;

	const currentInstance = chartStore.getChartInstance(currentTab);
	const modalRef = useRef<HTMLDialogElement>(null);

	const [activeTab, setActiveTab] = useState("general");
	const [newColor, setNewColor] = useState(currentInstance?.color || "#80B500");
	const [onePageMode, setOnePageMode] = useState(currentInstance?.onePageMode || false);
	const [newTabName, setNewTabName] = useState(currentInstance?.name || "");
	const [localVariables, setLocalVariables] = useState(currentInstance?.variables || []);
	const [globalVariables, setGlobalVariables] = useState(variableStore.variables?.global || []);
	const [newVariableName, setNewVariableName] = useState("");
	const [newVariableValue, setNewVariableValue] = useState("");
	const [newVariableScope, setNewVariableScope] = useState<"local" | "global">("local");
	const [isSaving, setIsSaving] = useState(false);
	const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

	useEffect(() => {
		if (currentInstance) {
			setNewColor(currentInstance.color || "#80B500");
			setOnePageMode(currentInstance.onePageMode || false);
			setNewTabName(currentInstance.name);
			setLocalVariables(currentInstance.variables || []);
		}
		setGlobalVariables(variableStore.variables?.global || []);
	}, [currentInstance, variableStore.variables]);

	const handleSaveSettings = async () => {
		if (!currentInstance) return;

		if (!newTabName.trim()) {
			toast.error('Flow name cannot be empty');
			return;
		}

		setIsSaving(true);
		try {
			setCurrentTabColor(currentInstance.id, newColor);
			setOnePage(currentInstance.id, onePageMode);
			updateChartInstanceName(currentInstance.id, newTabName);

			const updatedInstance = {
				...currentInstance,
				color: newColor,
				onePageMode: onePageMode,
				name: newTabName,
				variables: localVariables,
			};

			chartStore.updateChartInstance(updatedInstance);
			variableStore.setVariables({ ...variableStore.variables, global: globalVariables });

			await saveToDb(chartStore.chartInstances);
			toast.success('Settings saved successfully');
			closeModal();
		} catch (error) {
			console.error("Error saving settings:", error);
			toast.error('Failed to save settings');
		} finally {
			setIsSaving(false);
		}
	};

	const handleAddVariable = () => {
		if (!newVariableName.trim() || !newVariableValue.trim()) {
			toast.error('Both variable name and value are required');
			return;
		}

		const isDuplicate = (newVariableScope === "local" ? localVariables : globalVariables)
			.some(v => v.name === newVariableName);

		if (isDuplicate) {
			toast.error(`A ${newVariableScope} variable with this name already exists`);
			return;
		}

		const newVariable = { name: newVariableName, value: newVariableValue };
		if (newVariableScope === "local") {
			setLocalVariables(prev => [...prev, newVariable]);
		} else {
			setGlobalVariables(prev => [...prev, newVariable]);
		}
		setNewVariableName("");
		setNewVariableValue("");
		toast.success(`${newVariableScope} variable added`);
	};

	const tabs = [
		{ id: "general", label: "General", icon: Layout },
		{ id: "variables", label: "Variables", icon: Hash },
		{ id: "danger", label: "Danger Zone", icon: AlertTriangle },
	];

	return (
		<dialog
			ref={modalRef}
			id="settings_modal"
			className="modal modal-bottom sm:modal-middle"
			onClose={() => {
				setShowDeleteConfirm(false);
				setActiveTab("general");
			}}
		>
			<div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-auto">
				<div className="flex items-center justify-between p-4 border-b border-gray-200">
					<h2 className="text-lg font-semibold text-gray-900">Flow Settings</h2>
					<button
						onClick={() => modalRef.current?.close()}
						className="p-1 rounded-lg hover:bg-gray-100 transition-colors"
						aria-label="Close settings"
					>
						<X className="h-5 w-5 text-gray-500" />
					</button>
				</div>

				<div className="flex border-b border-gray-200">
					{tabs.map((tab) => {
						const Icon = tab.icon;
						return (
							<button
								key={tab.id}
								onClick={() => setActiveTab(tab.id)}
								className={cn(
									"flex items-center gap-2 px-4 py-2 text-sm font-medium transition-colors",
									"focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2",
									activeTab === tab.id
										? "border-b-2 border-blue-500 text-blue-600"
										: "text-gray-600 hover:text-gray-900"
								)}
							>
								<Icon className="h-4 w-4" />
								{tab.label}
							</button>
						);
					})}
				</div>

				<div className="p-4 max-h-[calc(100vh-200px)] overflow-y-auto">
					<AnimatePresence mode="wait">
						{activeTab === "general" && (
							<motion.div
								initial={{ opacity: 0, y: 20 }}
								animate={{ opacity: 1, y: 0 }}
								exit={{ opacity: 0, y: -20 }}
								className="space-y-4"
							>
								<div>
									<label className="block text-sm font-medium text-gray-700 mb-1">
										Flow Name
									</label>
									<input
										type="text"
										value={newTabName}
										onChange={(e) => setNewTabName(e.target.value)}
										className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
										placeholder="Enter flow name"
									/>
								</div>

								<div>
									<label className="block text-sm font-medium text-gray-700 mb-1">
										Theme Color
									</label>
									<div className="flex items-center gap-3">
										<input
											type="color"
											value={newColor}
											onChange={(e) => setNewColor(e.target.value)}
											className="h-10 w-20 rounded cursor-pointer"
										/>
										<input
											type="text"
											value={newColor}
											onChange={(e) => setNewColor(e.target.value)}
											className="px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
											placeholder="#000000"
											pattern="^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$"
										/>
									</div>
								</div>

								<div className="flex items-center gap-3">
									<label className="relative inline-flex items-center cursor-pointer">
										<input
											type="checkbox"
											checked={onePageMode}
											onChange={(e) => setOnePageMode(e.target.checked)}
											className="sr-only peer"
										/>
										<div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
									</label>
									<span className="text-sm font-medium text-gray-700">
										Enable One Page Mode
									</span>
								</div>
							</motion.div>
						)}

						{activeTab === "variables" && (
							<motion.div
								initial={{ opacity: 0, y: 20 }}
								animate={{ opacity: 1, y: 0 }}
								exit={{ opacity: 0, y: -20 }}
								className="space-y-4"
							>
								<div className="flex items-center gap-2 mb-4">
									<button
										onClick={() => setNewVariableScope("local")}
										className={cn(
											"flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors",
											newVariableScope === "local"
												? "bg-blue-100 text-blue-700"
												: "bg-gray-100 text-gray-600 hover:bg-gray-200"
										)}
									>
										<Database className="h-4 w-4" />
										Local
									</button>
									<button
										onClick={() => setNewVariableScope("global")}
										className={cn(
											"flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors",
											newVariableScope === "global"
												? "bg-blue-100 text-blue-700"
												: "bg-gray-100 text-gray-600 hover:bg-gray-200"
										)}
									>
										<Globe className="h-4 w-4" />
										Global
									</button>
								</div>

								<div className="flex gap-2">
									<input
										type="text"
										value={newVariableName}
										onChange={(e) => setNewVariableName(e.target.value)}
										placeholder="Variable name"
										className="flex-1 px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
									/>
									<input
										type="text"
										value={newVariableValue}
										onChange={(e) => setNewVariableValue(e.target.value)}
										placeholder="Value"
										className="flex-1 px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
									/>
									<button
										onClick={handleAddVariable}
										className="px-3 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
									>
										<Plus className="h-5 w-5" />
									</button>
								</div>

								<div className="space-y-2">
									<h3 className="font-medium text-gray-900">
										{newVariableScope === "local" ? "Local" : "Global"} Variables
									</h3>
									<div className="space-y-2">
										{(newVariableScope === "local" ? localVariables : globalVariables).map(
											(variable, index) => (
												<div
													key={index}
													className="flex items-center justify-between p-2 bg-gray-50 rounded-lg"
												>
													<div>
														<span className="font-medium text-gray-900">
															{variable.name}
														</span>
														<span className="text-gray-500 ml-2">
															= {variable.value}
														</span>
													</div>
													<button
														onClick={() =>
															newVariableScope === "local"
																? setLocalVariables((prev) =>
																	prev.filter((_, i) => i !== index)
																)
																: setGlobalVariables((prev) =>
																	prev.filter((_, i) => i !== index)
																)
														}
														className="p-1 text-red-500 hover:bg-red-50 rounded"
														aria-label="Remove variable"
													>
														<X className="h-4 w-4" />
													</button>
												</div>
											)
										)}
									</div>
								</div>
							</motion.div>
						)}

						{activeTab === "danger" && (
							<motion.div
								initial={{ opacity: 0, y: 20 }}
								animate={{ opacity: 1, y: 0 }}
								exit={{ opacity: 0, y: -20 }}
								className="space-y-4"
							>
								<div className="bg-red-50 border border-red-200 rounded-lg p-4">
									<h3 className="text-red-800 font-medium mb-2">Delete Flow</h3>
									<p className="text-red-600 text-sm mb-4">
										This action cannot be undone. This will permanently delete this
										flow and all associated data.
									</p>
									{!showDeleteConfirm ? (
										<button
											onClick={() => setShowDeleteConfirm(true)}
											className="flex items-center gap-2 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
										>
											<Trash2 className="h-4 w-4" />
											Delete Flow
										</button>
									) : (
										<div className="space-y-2">
											<p className="text-red-800 font-medium">
												Are you sure? This cannot be undone.
											</p>
											<div className="flex items-center gap-2">
												<button
													onClick={() => {
														deleteTab(currentInstance.id);
														modalRef.current?.close();
													}}
													className="flex items-center gap-2 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
												>
													Yes, delete flow
												</button>
												<button
													onClick={() => setShowDeleteConfirm(false)}
													className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
												>
													Cancel
												</button>
											</div>
										</div>
									)}
								</div>
							</motion.div>
						)}
					</AnimatePresence>
				</div>

				<div className="flex items-center justify-end gap-2 p-4 border-t border-gray-200">
					<button
						onClick={() => modalRef.current?.close()}
						className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
					>
						Cancel
					</button>
					<button
						onClick={handleSaveSettings}
						disabled={isSaving}
						className={cn(
							"flex items-center gap-2 px-4 py-2 text-white rounded-lg transition-colors",
							"bg-blue-500 hover:bg-blue-600",
							"disabled:opacity-50 disabled:cursor-not-allowed"
						)}
					>
						{isSaving ? (
							<>
								<LoadingSpinner className="h-4 w-4" />
								Saving...
							</>
						) : (
							<>
								<Save className="h-4 w-4" />
								Save Changes
							</>
						)}
					</button>
				</div>
			</div>

			<form method="dialog" className="modal-backdrop">
				<button>close</button>
			</form>
		</dialog>
	);
};