import { Dialog as HeadlessDialog } from "@headlessui/react";
import { AnimatePresence, motion } from "framer-motion";

interface DialogProps {
	open: boolean;
	onClose: () => void;
	children: React.ReactNode;
}

export function Dialog({ open, onClose, children }: DialogProps) {
	return (
		<AnimatePresence>
			{open && (
				<HeadlessDialog
					as={motion.div}
					static
					open={open}
					onClose={onClose}
					className="relative z-50"
				>
					{/* Backdrop */}
					<motion.div
						initial={{ opacity: 0 }}
						animate={{ opacity: 1 }}
						exit={{ opacity: 0 }}
						className="fixed inset-0 bg-black/30 backdrop-blur-sm"
						aria-hidden="true"
					/>

					{/* Dialog position */}
					<div className="fixed inset-0 flex items-center justify-center p-4">
						<HeadlessDialog.Panel
							as={motion.div}
							initial={{ opacity: 0, scale: 0.95 }}
							animate={{ opacity: 1, scale: 1 }}
							exit={{ opacity: 0, scale: 0.95 }}
							className="relative"
						>
							{children}
						</HeadlessDialog.Panel>
					</div>
				</HeadlessDialog>
			)}
		</AnimatePresence>
	);
}