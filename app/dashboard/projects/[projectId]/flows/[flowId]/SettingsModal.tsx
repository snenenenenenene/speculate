/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { LoadingSpinner } from "@/components/ui/base";
import { useStores } from "@/hooks/useStores";
import { cn } from "@/lib/utils";
import { AnimatePresence, motion } from "framer-motion";
import {
	AlertTriangle,
	Hash,
	Layout, Plus, Save, Trash2, X
} from "lucide-react";
import { useRouter } from "next/navigation";
import React, { useState } from 'react';
import { toast } from "react-hot-toast";

interface SettingsModalProps {
	isOpen: boolean;
	onClose: () => void;
	currentInstance: any;
}

const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose, currentInstance }) => {
	const router = useRouter();
	const { chartStore, utilityStore, variableStore, projectStore } = useStores() as any;
	const [activeTab, setActiveTab] = useState("general");
	const [newColor, setNewColor] = useState(currentInstance?.color || "#721d62");
	const [onePageMode, setOnePageMode] = useState(currentInstance?.onePageMode || false);
	const [newTabName, setNewTabName] = useState(currentInstance?.name || "");
	const [localVariables, setLocalVariables] = useState(currentInstance?.variables || []);
	const [globalVariables, setGlobalVariables] = useState(variableStore.variables?.global || []);
	const [newVariableName, setNewVariableName] = useState("");
	const [newVariableValue, setNewVariableValue] = useState("");
	const [newVariableScope, setNewVariableScope] = useState<"local" | "global">("local");
	const [isSaving, setIsSaving] = useState(false);
	const [isDeleting, setIsDeleting] = useState(false);
	const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

	const handleSaveSettings = async () => {
		if (!currentInstance || !newTabName.trim()) {
			toast.error('Flow name cannot be empty');
			return;
		}

		setIsSaving(true);
		try {
			const projectId = projectStore.currentProject?.id;
			if (!projectId) {
				throw new Error("No project selected");
			}

			chartStore.setCurrentTabColor(currentInstance.id, newColor);
			chartStore.setOnePage(currentInstance.id, onePageMode);
			chartStore.updateChartInstanceName(currentInstance.id, newTabName);

			const updatedInstance = {
				...currentInstance,
				color: newColor,
				onePageMode,
				name: newTabName,
				variables: localVariables,
			};

			chartStore.updateChartInstance(updatedInstance);
			variableStore.setVariables({ ...variableStore.variables, global: globalVariables });
			await utilityStore.saveToDb(chartStore.chartInstances, projectId);

			onClose();
			toast.success('Settings saved successfully');
		} catch (error) {
			toast.error('Failed to save settings');
		} finally {
			setIsSaving(false);
		}
	};

	const handleDeleteFlow = async () => {
		if (!currentInstance) return;
		setIsDeleting(true);

		try {
			const projectId = projectStore.currentProject?.id;
			if (!projectId) {
				throw new Error("No project selected");
			}

			chartStore.deleteTab(currentInstance.id);
			await utilityStore.saveToDb(chartStore.chartInstances, projectId);
			onClose();

			const remainingFlows = chartStore.chartInstances;
			if (remainingFlows.length > 0) {
				await router.push(`/dashboard/projects/${projectId}/flows/${remainingFlows[0].id}`);
			} else {
				await router.push(`/dashboard/projects/${projectId}`);
			}

			toast.success('Flow deleted successfully');
		} catch (error) {
			console.error('Error deleting flow:', error);
			toast.error('Failed to delete flow');
		} finally {
			setIsDeleting(false);
		}
	};

	const handleAddVariable = () => {
		if (!newVariableName.trim() || !newVariableValue.trim()) {
			toast.error('Both variable name and value are required');
			return;
		}

		const variables = newVariableScope === "local" ? localVariables : globalVariables;
		const setVariables = newVariableScope === "local" ? setLocalVariables : setGlobalVariables;

		if (variables.some(v => v.name === newVariableName)) {
			toast.error(`A ${newVariableScope} variable with this name already exists`);
			return;
		}

		setVariables(prev => [...prev, { name: newVariableName, value: newVariableValue }]);
		setNewVariableName("");
		setNewVariableValue("");
		toast.success(`${newVariableScope} variable added`);
	};

	if (!isOpen) return null;

	return (
		<div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
			<motion.div
				initial={{ opacity: 0, scale: 0.95 }}
				animate={{ opacity: 1, scale: 1 }}
				exit={{ opacity: 0, scale: 0.95 }}
				className="bg-white rounded-lg shadow-xl w-full max-w-2xl overflow-hidden"
			>
				<div className="flex items-center justify-between p-4 border-b">
					<h2 className="text-lg font-medium">Settings</h2>
					<button onClick={onClose} className="text-gray-500 hover:text-gray-700">
						<X className="h-5 w-5" />
					</button>
				</div>

				<div className="flex border-b">
					{[
						{ id: "general", icon: Layout, label: "General" },
						{ id: "variables", icon: Hash, label: "Variables" },
						{ id: "danger", icon: AlertTriangle, label: "Danger" }
					].map((tab) => (
						<button
							key={tab.id}
							onClick={() => setActiveTab(tab.id)}
							className={cn(
								"flex items-center gap-2 px-4 py-2 text-sm transition-colors",
								activeTab === tab.id
									? "border-b-2 border-purple-500 text-purple-600"
									: "text-gray-500 hover:text-gray-700"
							)}
						>
							<tab.icon className="h-4 w-4" />
							{tab.label}
						</button>
					))}
				</div>

				<div className="p-4 max-h-[60vh] overflow-y-auto">
					<AnimatePresence mode="wait">
						{activeTab === "general" && (
							<motion.div
								initial={{ opacity: 0 }}
								animate={{ opacity: 1 }}
								exit={{ opacity: 0 }}
								className="space-y-4"
							>
								<div>
									<label className="text-sm font-medium text-gray-700">Flow Name</label>
									<input
										type="text"
										value={newTabName}
										onChange={(e) => setNewTabName(e.target.value)}
										className="mt-1 w-full px-3 py-2 border rounded-md"
									/>
								</div>

								<div>
									<label className="text-sm font-medium text-gray-700">Theme Color</label>
									<div className="flex gap-2 mt-1">
										<input
											type="color"
											value={newColor}
											onChange={(e) => setNewColor(e.target.value)}
											className="h-9 w-16"
										/>
										<input
											type="text"
											value={newColor}
											onChange={(e) => setNewColor(e.target.value)}
											className="px-3 py-2 border rounded-md"
										/>
									</div>
								</div>

								<label className="flex items-center gap-2">
									<input
										type="checkbox"
										checked={onePageMode}
										onChange={(e) => setOnePageMode(e.target.checked)}
										className="rounded text-purple-500"
									/>
									<span className="text-sm text-gray-700">One Page Mode</span>
								</label>
							</motion.div>
						)}

						{activeTab === "variables" && (
							<motion.div
								initial={{ opacity: 0 }}
								animate={{ opacity: 1 }}
								exit={{ opacity: 0 }}
								className="space-y-4"
							>
								<div className="flex gap-2">
									{["local", "global"].map((scope) => (
										<button
											key={scope}
											onClick={() => setNewVariableScope(scope as "local" | "global")}
											className={cn(
												"px-3 py-1.5 rounded text-sm",
												newVariableScope === scope
													? "bg-purple-100 text-purple-700"
													: "bg-gray-100 text-gray-600"
											)}
										>
											{scope.charAt(0).toUpperCase() + scope.slice(1)}
										</button>
									))}
								</div>

								<div className="flex gap-2">
									<input
										placeholder="Name"
										value={newVariableName}
										onChange={(e) => setNewVariableName(e.target.value)}
										className="flex-1 px-3 py-2 border rounded-md"
									/>
									<input
										placeholder="Value"
										value={newVariableValue}
										onChange={(e) => setNewVariableValue(e.target.value)}
										className="flex-1 px-3 py-2 border rounded-md"
									/>
									<button
										onClick={handleAddVariable}
										className="p-2 bg-purple-500 text-white rounded-md hover:bg-purple-600"
									>
										<Plus className="h-5 w-5" />
									</button>
								</div>

								<div className="space-y-2">
									{(newVariableScope === "local" ? localVariables : globalVariables).map(
										(variable, index) => (
											<div
												key={index}
												className="flex items-center justify-between p-2 bg-gray-50 rounded-md"
											>
												<div>
													<span className="font-medium">{variable.name}</span>
													<span className="text-gray-500 ml-2">{variable.value}</span>
												</div>
												<button
													onClick={() => {
														const setVariables = newVariableScope === "local"
															? setLocalVariables
															: setGlobalVariables;
														setVariables(prev => prev.filter((_, i) => i !== index));
													}}
													className="p-1 text-gray-400 hover:text-red-500"
												>
													<X className="h-4 w-4" />
												</button>
											</div>
										)
									)}
								</div>
							</motion.div>
						)}

						{activeTab === "danger" && (
							<motion.div
								initial={{ opacity: 0 }}
								animate={{ opacity: 1 }}
								exit={{ opacity: 0 }}
								className="space-y-4"
							>
								<div className="bg-red-50 border border-red-100 rounded-lg p-4">
									<h3 className="text-red-800 font-medium mb-2">Delete Flow</h3>
									{!showDeleteConfirm ? (
										<button
											onClick={() => setShowDeleteConfirm(true)}
											className="flex items-center gap-2 px-3 py-2 bg-red-500 text-white rounded-md hover:bg-red-600"
										>
											<Trash2 className="h-4 w-4" />
											Delete Flow
										</button>
									) : (
										<div className="space-y-2">
											<p className="text-red-600">Are you sure? This cannot be undone.</p>
											<div className="flex gap-2">
												<button
													onClick={handleDeleteFlow}
													disabled={isDeleting}
													className="flex items-center gap-2 px-3 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 disabled:opacity-50"
												>
													{isDeleting ? <LoadingSpinner className="h-4 w-4" /> : <Trash2 className="h-4 w-4" />}
													{isDeleting ? "Deleting..." : "Yes, delete"}
												</button>
												<button
													onClick={() => setShowDeleteConfirm(false)}
													className="px-3 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200"
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

				<div className="flex justify-end gap-2 p-4 border-t">
					<button
						onClick={onClose}
						className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-md"
					>
						Cancel
					</button>
					<button
						onClick={handleSaveSettings}
						disabled={isSaving}
						className="flex items-center gap-2 px-4 py-2 bg-purple-500 text-white rounded-md hover:bg-purple-600 disabled:opacity-50"
					>
						{isSaving ? (
							<>
								<LoadingSpinner className="h-4 w-4" />
								Saving...
							</>
						) : (
							<>
								<Save className="h-4 w-4" />
								Save
							</>
						)}
					</button>
				</div>
			</motion.div>
		</div>
	);
};

export default SettingsModal;