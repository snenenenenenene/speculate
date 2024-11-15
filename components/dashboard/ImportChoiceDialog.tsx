// components/dashboard/ImportChoiceDialog.tsx
import { Dialog } from "@/components/ui/Dialog";
import { cn } from "@/lib/utils";
import { AlertTriangle } from "lucide-react";

interface ImportChoiceDialogProps {
	isOpen: boolean;
	onClose: () => void;
	importType: "single" | "complete";
	onReplace: () => void;
	onAppend: () => void;
}

export function ImportChoiceDialog({
	isOpen,
	onClose,
	importType,
	onReplace,
	onAppend
}: ImportChoiceDialogProps) {
	return (
		<Dialog open={isOpen} onClose={onClose}>
			<div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-auto">
				<div className="p-6">
					<div className="flex items-center gap-3 mb-4">
						<div className="p-2 bg-yellow-50 rounded-full">
							<AlertTriangle className="h-6 w-6 text-yellow-500" />
						</div>
						<h2 className="text-lg font-semibold text-gray-900">
							Import {importType === "single" ? "Flow" : "Flows"}
						</h2>
					</div>

					<p className="text-gray-600 mb-6">
						{importType === "single"
							? "You're importing a single flow. Would you like to replace the current flow or create a new one?"
							: "You're importing multiple flows. Would you like to replace all existing flows or add these as new flows?"}
					</p>

					<div className="space-y-3">
						<button
							onClick={onReplace}
							className={cn(
								"w-full flex items-center justify-between p-4",
								"bg-red-50 text-red-700 rounded-lg",
								"hover:bg-red-100 transition-colors"
							)}
						>
							<span className="font-medium">
								{importType === "single" ? "Replace Current Flow" : "Replace All Flows"}
							</span>
							<span className="text-sm opacity-75">
								{importType === "single"
									? "Overwrites the current flow"
									: "Removes all existing flows"}
							</span>
						</button>

						<button
							onClick={onAppend}
							className={cn(
								"w-full flex items-center justify-between p-4",
								"bg-green-50 text-green-700 rounded-lg",
								"hover:bg-green-100 transition-colors"
							)}
						>
							<span className="font-medium">
								{importType === "single" ? "Create New Flow" : "Add New Flows"}
							</span>
							<span className="text-sm opacity-75">
								{importType === "single"
									? "Adds as a new flow"
									: "Keeps existing flows"}
							</span>
						</button>
					</div>
				</div>

				<div className="border-t border-gray-200 p-4 bg-gray-50 flex justify-end">
					<button
						onClick={onClose}
						className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
					>
						Cancel
					</button>
				</div>
			</div>
		</Dialog>
	);
}