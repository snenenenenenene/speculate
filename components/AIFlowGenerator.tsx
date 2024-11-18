import { AnimatePresence, motion } from 'framer-motion';
import { Sparkles } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

const AIFlowGenerator = ({ onGenerate, loading }) => {
	const [isOpen, setIsOpen] = useState(false);
	const [input, setInput] = useState('');
	const [thinking, setThinking] = useState(false);
	const [generatedFlow, setGeneratedFlow] = useState(null);
	const inputRef = useRef(null);

	const handleSubmit = async () => {
		setThinking(true);
		try {
			const flow = await onGenerate(input);
			setGeneratedFlow(flow);
		} catch (error) {
			toast.error("Failed to generate flow");
		}
		setThinking(false);
	};

	useEffect(() => {
		if (isOpen && inputRef.current) {
			inputRef.current.focus();
		}
	}, [isOpen]);

	return (
		<div className="fixed top-20 left-[20vw] z-20">
			<button
				onClick={() => setIsOpen(!isOpen)}
				className="flex items-center px-4 py-2 bg-purple-600 text-white rounded-t-lg shadow-lg hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500"
			>
				<Sparkles className="h-5 w-5 mr-2" />
				<span>AI Flow</span>
			</button>

			<AnimatePresence>
				{isOpen && (
					<>
						{(thinking || generatedFlow) && (
							<motion.div
								initial={{ opacity: 0, y: -10 }}
								animate={{ opacity: 1, y: 0 }}
								exit={{ opacity: 0, y: -10 }}
								className="bg-purple-50 p-4 rounded-lg shadow-lg mb-2 max-w-md"
							>
								{thinking ? (
									<div className="text-purple-700">
										<span className="loading">Generating flow chart...</span>
									</div>
								) : (
									<div className="space-y-2">
										<pre className="bg-white p-2 rounded text-xs overflow-auto max-h-40">
											{JSON.stringify(generatedFlow, null, 2)}
										</pre>
										<div className="flex justify-end space-x-2">
											<button
												onClick={() => setGeneratedFlow(null)}
												className="px-3 py-1 text-sm text-purple-600 hover:bg-purple-100 rounded"
											>
												Cancel
											</button>
											<button
												onClick={() => {
													chartStore.addAIChart(generatedFlow);
													router.push(`/dashboard/${generatedFlow.id}`);
													setIsOpen(false);
													setGeneratedFlow(null);
													setInput('');
												}}
												className="px-3 py-1 text-sm bg-purple-600 text-white hover:bg-purple-700 rounded"
											>
												Apply
											</button>
										</div>
									</div>
								)}
							</motion.div>
						)}

						<motion.div
							initial={{ opacity: 0, height: 0 }}
							animate={{ opacity: 1, height: 'auto' }}
							exit={{ opacity: 0, height: 0 }}
							className="relative"
						>
							<input
								ref={inputRef}
								value={input}
								onChange={(e) => setInput(e.target.value)}
								onKeyDown={(e) => {
									if (e.key === 'Enter' && !e.shiftKey) {
										e.preventDefault();
										handleSubmit();
									}
								}}
								placeholder="Describe your flow chart..."
								className="w-[400px] p-3 rounded-b-lg border border-t-0 border-purple-200 focus:outline-none focus:ring-2 focus:ring-purple-500"
							/>
						</motion.div>
					</>
				)}
			</AnimatePresence>
		</div>
	);
};

export default AIFlowGenerator;