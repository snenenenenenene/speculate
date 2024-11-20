import { Modal } from '@/components/nodes/base/Modal';
import { Button, Checkbox, Input, Label } from '@/components/ui/base';
import { X } from 'lucide-react';
import { useState } from 'react';

interface Flowchart {
	id: string;
	name: string;
	color: string;
	isPublished: boolean;
	onePageMode: boolean;
	apiKey: string;
}

interface SettingsModalProps {
	isOpen: boolean;
	onClose: () => void;
	currentInstance: Flowchart;
}

export default function SettingsModal({ isOpen, onClose, currentInstance }: SettingsModalProps) {
	const [name, setName] = useState(currentInstance.name);
	const [color, setColor] = useState(currentInstance.color);
	const [isPublished, setIsPublished] = useState(currentInstance.isPublished);
	const [onePageMode, setOnePageMode] = useState(currentInstance.onePageMode);
	const [isSaving, setIsSaving] = useState(false);
	const [error, setError] = useState<string | null>(null);

	const handleSave = async (e: React.FormEvent) => {
		e.preventDefault();
		setIsSaving(true);
		setError(null);

		try {
			const response = await fetch(`/api/flowcharts/${currentInstance.id}`, {
				method: 'PATCH',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({
					name,
					color,
					isPublished,
					onePageMode,
				}),
			});

			if (!response.ok) throw new Error('Failed to update flowchart');

			// Close modal and optionally refresh the page
			onClose();
			window.location.reload();
		} catch (error) {
			console.error('Error:', error);
			setError('Failed to update flowchart settings');
		} finally {
			setIsSaving(false);
		}
	};

	return (
		<Modal isOpen={isOpen} onClose={onClose}>
			<div className="p-6">
				<div className="flex items-center justify-between mb-6">
					<h2 className="text-2xl font-semibold">Flowchart Settings</h2>
					<button
						onClick={onClose}
						className="p-2 hover:bg-gray-100 rounded-full transition-colors"
					>
						<X className="h-5 w-5" />
					</button>
				</div>

				{error && (
					<div className="bg-red-50 text-red-600 p-4 rounded-lg mb-4">
						{error}
					</div>
				)}

				<form onSubmit={handleSave} className="space-y-4">
					<div className="space-y-2">
						<Label htmlFor="name">Name</Label>
						<Input
							id="name"
							value={name}
							onChange={(e) => setName(e.target.value)}
							placeholder="My Flowchart"
						/>
					</div>

					<div className="space-y-2">
						<Label htmlFor="color">Color</Label>
						<div className="flex gap-2">
							<Input
								type="color"
								id="color"
								value={color}
								onChange={(e) => setColor(e.target.value)}
								className="w-12 h-12 p-1"
							/>
							<Input
								type="text"
								value={color}
								onChange={(e) => setColor(e.target.value)}
								placeholder="#000000"
								className="flex-1"
							/>
						</div>
					</div>

					<div className="space-y-2">
						<div className="flex items-center justify-between">
							<Label htmlFor="published">Published</Label>
							<Checkbox
								id="published"
								checked={isPublished}
								onChange={(e) => setIsPublished(e.target.checked)}
							/>
						</div>
					</div>

					<div className="space-y-2">
						<div className="flex items-center justify-between">
							<Label htmlFor="onePageMode">One Page Mode</Label>
							<Checkbox
								id="onePageMode"
								checked={onePageMode}
								onChange={(e) => setOnePageMode(e.target.checked)}
							/>
						</div>
					</div>

					{isPublished && (
						<div className="space-y-2">
							<Label htmlFor="apiKey">API Key</Label>
							<div className="flex gap-2">
								<Input
									id="apiKey"
									value={currentInstance.apiKey}
									readOnly
									className="flex-1 bg-gray-50"
								/>
								<Button
									type="button"
									variant="outline"
									onClick={() => navigator.clipboard.writeText(currentInstance.apiKey)}
								>
									Copy
								</Button>
							</div>
							<p className="text-xs text-gray-500">
								Use this API key to access your published flowchart via the API
							</p>
						</div>
					)}

					<div className="flex justify-end gap-2 mt-6">
						<Button type="button" variant="ghost" onClick={onClose}>
							Cancel
						</Button>
						<Button type="submit" disabled={isSaving}>
							{isSaving ? 'Saving...' : 'Save Changes'}
						</Button>
					</div>
				</form>
			</div>
		</Modal>
	);
}