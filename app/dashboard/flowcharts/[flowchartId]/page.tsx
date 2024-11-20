"use client";

import { Modal } from '@/components/nodes/base/Modal';
import { Button, Card, CardContent, CardHeader, Input, Label, LoadingSpinner } from '@/components/ui/base';
import { ExternalLink, Plus, X } from 'lucide-react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';

interface Instance {
	id: string;
	name: string;
	updatedAt: string;
	isPublished: boolean;
}

export default function FlowchartInstancesPage() {
	const params = useParams();
	const flowchartId = params.flowchartId as string;

	const [instances, setInstances] = useState<Instance[]>([]);
	const [flowchartName, setFlowchartName] = useState('');
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
	const [newInstanceName, setNewInstanceName] = useState('');
	const [isCreating, setIsCreating] = useState(false);

	const fetchInstances = async () => {
		try {
			const response = await fetch(`/api/flowcharts/${flowchartId}/instances`);
			if (!response.ok) throw new Error('Failed to fetch instances');
			const data = await response.json();
			setInstances(data.instances);
			setFlowchartName(data.name);
		} catch (error) {
			setError('Failed to load instances');
			console.error('Error:', error);
		} finally {
			setIsLoading(false);
		}
	};

	useEffect(() => {
		fetchInstances();
	}, [flowchartId]);

	const handleCreateInstance = async (e: React.FormEvent) => {
		e.preventDefault();
		setIsCreating(true);

		try {
			const response = await fetch(`/api/flowcharts/${flowchartId}/instances`, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({
					name: newInstanceName,
				}),
			});

			if (!response.ok) throw new Error('Failed to create instance');

			const newInstance = await response.json();
			window.location.href = `/dashboard/flowcharts/${flowchartId}/instances/${newInstance.id}`;
		} catch (error) {
			console.error('Error:', error);
			setError('Failed to create instance');
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
			<div className="flex flex-col gap-2 mb-6">
				<Link href="/dashboard/flowcharts" className="text-sm text-gray-500 hover:text-gray-700">
					← Back to Flowcharts
				</Link>
				<div className="flex justify-between items-center">
					<h1 className="text-2xl font-bold">{flowchartName} - Instances</h1>
					<Button onClick={() => setIsCreateModalOpen(true)}>
						<Plus className="h-4 w-4 mr-2" />
						New Instance
					</Button>
				</div>
			</div>

			{error && (
				<div className="bg-red-50 text-red-600 p-4 rounded-lg mb-4">
					{error}
				</div>
			)}

			<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
				{instances.map((instance) => (
					<Card key={instance.id}>
						<CardHeader className="pb-3">
							<div className="flex items-center justify-between">
								<h3 className="text-lg font-semibold">{instance.name}</h3>
								<div className="flex gap-2">
									<Link href={`/dashboard/flowcharts/${flowchartId}/instances/${instance.id}`}>
										<Button variant="ghost" size="sm">
											<ExternalLink className="h-4 w-4" />
										</Button>
									</Link>
								</div>
							</div>
						</CardHeader>
						<CardContent>
							<div className="text-sm text-gray-500">
								Last edited {new Date(instance.updatedAt).toLocaleDateString()}
							</div>
							{instance.isPublished && (
								<div className="mt-2">
									<span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs">
										Published
									</span>
								</div>
							)}
						</CardContent>
					</Card>
				))}
			</div>

			{/* Create Instance Modal */}
			<Modal isOpen={isCreateModalOpen} onClose={() => setIsCreateModalOpen(false)}>
				<div className="p-6">
					<div className="flex items-center justify-between mb-6">
						<h2 className="text-2xl font-semibold">Create New Instance</h2>
						<button
							onClick={() => setIsCreateModalOpen(false)}
							className="p-2 hover:bg-gray-100 rounded-full transition-colors"
						>
							<X className="h-5 w-5" />
						</button>
					</div>

					<form onSubmit={handleCreateInstance} className="space-y-4">
						<div className="space-y-2">
							<Label htmlFor="name">Name</Label>
							<Input
								id="name"
								value={newInstanceName}
								onChange={(e) => setNewInstanceName(e.target.value)}
								placeholder="Instance Name"
							/>
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
								{isCreating ? 'Creating...' : 'Create Instance'}
							</Button>
						</div>
					</form>
				</div>
			</Modal>
		</div>
	);
}