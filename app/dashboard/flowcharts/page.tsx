"use client";

import { Modal } from '@/components/nodes/base/Modal';
import { Button, Card, CardContent, CardHeader, Input, Label, LoadingSpinner } from '@/components/ui/base';
import { ExternalLink, Plus, X } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState } from 'react';

interface Flowchart {
	id: string;
	name: string;
	color: string;
	updatedAt: string;
}

export default function FlowchartsPage() {
	const [flowcharts, setFlowcharts] = useState<Flowchart[]>([]);
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
	const [newFlowchartName, setNewFlowchartName] = useState('New Flowchart');
	const [newFlowchartColor, setNewFlowchartColor] = useState('#80B500');
	const [isCreating, setIsCreating] = useState(false);

	// Fetch flowcharts
	const fetchFlowcharts = async () => {
		try {
			const response = await fetch('/api/flowcharts');
			if (!response.ok) throw new Error('Failed to fetch flowcharts');
			const data = await response.json();
			setFlowcharts(data);
		} catch (error) {
			setError('Failed to load flowcharts');
			console.error('Error:', error);
		} finally {
			setIsLoading(false);
		}
	};

	useEffect(() => {
		fetchFlowcharts();
	}, []);

	const handleCreateFlowchart = async (e: React.FormEvent) => {
		e.preventDefault();
		setIsCreating(true);

		try {
			const response = await fetch('/api/flowcharts', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({
					name: newFlowchartName,
					color: newFlowchartColor,
				}),
			});

			if (!response.ok) throw new Error('Failed to create flowchart');

			const newFlowchart = await response.json();
			window.location.href = `/dashboard/flowcharts/${newFlowchart.id}`;
		} catch (error) {
			console.error('Error:', error);
			setError('Failed to create flowchart');
		} finally {
			setIsCreating(false);
		}
	};

	if (isLoading) {
		return (
			<div className="h-screen flex items-center justify-center">
				<LoadingSpinner className="h-6 w-6" />
			</div>
		);
	}

	return (
		<div className="p-6">
			<div className="flex justify-between items-center mb-6">
				<h1 className="text-2xl font-bold">My Flowcharts</h1>
				<Button onClick={() => setIsCreateModalOpen(true)}>
					<Plus className="h-4 w-4 mr-2" />
					New Flowchart
				</Button>
			</div>

			{error && (
				<div className="bg-red-50 text-red-600 p-4 rounded-lg mb-4">
					{error}
				</div>
			)}

			<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
				{flowcharts.map((flowchart) => (
					<Card key={flowchart.id}>
						<CardHeader className="pb-3">
							<div className="flex items-center justify-between">
								<div className="flex items-center gap-2">
									<div
										className="w-3 h-3 rounded-full"
										style={{ backgroundColor: flowchart.color }}
									/>
									<h3 className="text-lg font-semibold">{flowchart.name}</h3>
								</div>
								<div className="flex gap-2">
									<Link href={`/dashboard/flowcharts/${flowchart.id}`}>
										<Button variant="ghost" size="sm">
											<ExternalLink className="h-4 w-4" />
										</Button>
									</Link>
								</div>
							</div>
						</CardHeader>
						<CardContent>
							<div className="text-sm text-gray-500">
								Last edited {new Date(flowchart.updatedAt).toLocaleDateString()}
							</div>
						</CardContent>
					</Card>
				))}
			</div>

			{/* Create Flowchart Modal */}
			<Modal isOpen={isCreateModalOpen} onClose={() => setIsCreateModalOpen(false)}>
				<div className="p-6">
					<div className="flex items-center justify-between mb-6">
						<h2 className="text-2xl font-semibold">Create New Flowchart</h2>
						<button
							onClick={() => setIsCreateModalOpen(false)}
							className="p-2 hover:bg-gray-100 rounded-full transition-colors"
						>
							<X className="h-5 w-5" />
						</button>
					</div>

					<form onSubmit={handleCreateFlowchart} className="space-y-4">
						<div className="space-y-2">
							<Label htmlFor="name">Name</Label>
							<Input
								id="name"
								value={newFlowchartName}
								onChange={(e) => setNewFlowchartName(e.target.value)}
								placeholder="My Flowchart"
							/>
						</div>

						<div className="space-y-2">
							<Label htmlFor="color">Color</Label>
							<div className="flex gap-2">
								<Input
									type="color"
									id="color"
									value={newFlowchartColor}
									onChange={(e) => setNewFlowchartColor(e.target.value)}
									className="w-12 h-12 p-1"
								/>
								<Input
									type="text"
									value={newFlowchartColor}
									onChange={(e) => setNewFlowchartColor(e.target.value)}
									placeholder="#000000"
									className="flex-1"
								/>
							</div>
						</div>

						<div className="flex justify-end gap-2 mt-6">
							<Button
								type="button"
								variant="ghost"
								onClick={() => setIsCreateModalOpen(false)}
							>
								Cancel
							</Button>
							<Button type="submit" disabled={isCreating}>
								{isCreating ? 'Creating...' : 'Create Flowchart'}
							</Button>
						</div>
					</form>
				</div>
			</Modal>
		</div>
	);
}