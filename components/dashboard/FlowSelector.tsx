"use client";

import { Plus } from "lucide-react";

interface FlowSelectorProps {
	currentFlow: any;
	chartInstances: any[];
	currentTab: string;
	onFlowSelect: (flowchartId: string, chartId: string) => void;
	onNewFlow: (flowchartId: string) => void;
	flowchartId?: string;
}

export function FlowSelector({
	currentFlow,
	chartInstances,
	currentTab,
	onFlowSelect,
	onNewFlow,
	flowchartId
}: FlowSelectorProps) {
	return (
		<div className="flex items-center gap-2">
			<select
				value={currentTab || ""}
				onChange={(e) => onFlowSelect(flowchartId!, e.target.value)}
				className="h-9 px-3 py-1 bg-white border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
			>
				<option value="" disabled>
					Select a chart
				</option>
				{(chartInstances || []).map((instance) => (
					<option key={instance.id} value={instance.id}>
						{instance.name}
					</option>
				))}
			</select>

			<button
				onClick={() => flowchartId && onNewFlow(flowchartId)}
				disabled={!flowchartId}
				className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-gray-600 hover:bg-gray-50 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
			>
				<Plus className="h-4 w-4" />
				New Chart
			</button>
		</div>
	);
}