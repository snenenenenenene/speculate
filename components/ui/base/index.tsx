"use client"
// components/ui/base/index.tsx
import { cn } from '@/lib/utils';
import { Loader2 } from 'lucide-react';
import React, { forwardRef } from 'react';

// Base loading animation used across components
export const LoadingSpinner = () => (
	<Loader2 className="h-4 w-4 animate-spin" />
);

// Checkbox with Notion-like styling
export interface CheckboxProps extends React.InputHTMLAttributes<HTMLInputElement> {
	label?: string;
}

export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(({
	className,
	label,
	...props
}, ref) => (
	<label className="flex items-center space-x-2">
		<input
			type="checkbox"
			ref={ref}
			className={cn(
				"h-4 w-4 rounded border-gray-300 text-blue-600",
				"focus:ring-2 focus:ring-blue-500 focus:ring-offset-2",
				"disabled:cursor-not-allowed disabled:opacity-50",
				className
			)}
			{...props}
		/>
		{label && <span className="text-sm text-gray-700">{label}</span>}
	</label>
));
Checkbox.displayName = 'Checkbox';