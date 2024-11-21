"use client";

import { Modal } from '@/components/nodes/base/modal';
import { Button, Card, CardContent, CardHeader, Input, Label, LoadingSpinner } from '@/components/ui/base';
import { ArrowLeft, ChevronRight, Plus, X } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { toast } from 'react-hot-toast';

interface Chart {
	id: string;
	name: string;
	updatedAt: string;
	isPublished: boolean;
}

interface Flowchart {
	id: string;
	name: string;
	color: string;
	updatedAt: string;
	charts: Chart[];
}

export default function FlowchartsPage() {
	const [flowcharts, setFlowcharts] = useState<Flowchart[]>([]);
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
	const [newFlowchartName, setNewFlowchartName] = useState('New Flowchart');
	const [newFlowchartColor, setNewFlowchartColor] = useState('#80B500');
	const [isCreating, setIsCreating] = useState(false);

	useEffect(() => {
		const loadFlowcharts = async () => {
			try {
				setIsLoading(true);
				const response = await fetch('/api/flowcharts', {
					headers: {
						'Cache-Control': 'no-cache'
					}
				});

				const data = await response.json();
				console.log("Response data:", data); // Debug log

				if (!response.ok) {
					throw new Error(data.error || 'Failed to fetch flowcharts');
				}

				// Handle both array and error object responses
				if (Array.isArray(data)) {
					setFlowcharts(data);
				} else if (data.error) {
					throw new Error(data.error);
				} else {
					throw new Error('Invalid response format');
				}

			} catch (error: any) {
				console.error('Error details:', error);
				setError(error.message || 'Failed to load flowcharts');
				setFlowcharts([]);
			} finally {
				setIsLoading(false);
			}
		};

		loadFlowcharts();
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

			if (!response.ok) {
				const errorData = await response.json().catch(() => ({}));
				throw new Error(errorData.error || 'Failed to create flowchart');
			}

			const data = await response.json();
			window.location.href = `/dashboard/flowcharts/${data.id}`;
		} catch (error: any) {
			console.error('Error:', error);
			toast.error(error.message || 'Failed to create flowchart');
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
		<div className="p-6 max-w-7xl mx-auto">
			<div className="flex justify-between items-center mb-6">
				<div className="flex items-center gap-4">
					<Link
						href="/dashboard"
						className="text-sm text-gray-500 hover:text-gray-700 flex items-center gap-1"
					>
						<ArrowLeft className="h-4 w-4" />
						Back to Dashboard
					</Link>
					<h1 className="text-2xl font-bold">My Flowcharts</h1>
				</div>
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

			{flowcharts.length === 0 && !error ? (
				<div className="text-center py-12">
					<p className="text-gray-500 mb-4">No flowcharts yet</p>
					<Button onClick={() => setIsCreateModalOpen(true)}>
						<Plus className="h-4 w-4 mr-2" />
						Create your first flowchart
					</Button>
				</div>
			) : (
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
									<Link href={`/dashboard/flowcharts/${flowchart.id}`}>
										<Button variant="ghost" size="sm">
											<ChevronRight className="h-4 w-4" />
										</Button>
									</Link>
								</div>
							</CardHeader>
							<CardContent>
								<div className="text-sm text-gray-500">
									Last edited {new Date(flowchart.updatedAt).toLocaleDateString()}
								</div>
								<div className="mt-2 text-sm text-gray-500">
									{flowchart.charts?.length ?? 0} chart{flowchart.charts?.length !== 1 ? 's' : ''}
								</div>
							</CardContent>
						</Card>
					))}
				</div>
			)}

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