// components/nodes/base/Modal.tsx
import { createPortal } from 'react-dom';

interface ModalProps {
	isOpen: boolean;
	onClose: () => void;
	children: React.ReactNode;
}

export const Modal: React.FC<ModalProps> = ({ isOpen, onClose, children }) => {
	if (!isOpen) return null;

	return createPortal(
		<div className="fixed inset-0 z-50 flex items-center justify-center">
			<div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
			<div className="relative z-10 w-full max-w-2xl max-h-[90vh] overflow-auto bg-white rounded-xl shadow-xl">
				{children}
			</div>
		</div>,
		document.body
	);
};