/* eslint-disable @typescript-eslint/no-empty-object-type */
"use client";

import { cn } from '@/lib/utils';
import { ArrowRight, Loader2, Sparkles, X } from 'lucide-react';
import React, { forwardRef } from 'react';

// Loading Spinner
export const LoadingSpinner = ({ className }: { className?: string }) => (
	<Loader2 className={cn("h-4 w-4 animate-spin", className)} />
);

// Checkbox
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
				"h-4 w-4 rounded border-gray-300 text-purple-600",
				"focus:ring-2 focus:ring-purple-500 focus:ring-offset-2",
				"disabled:cursor-not-allowed disabled:opacity-50",
				className
			)}
			{...props}
		/>
		{label && <span className="text-sm text-gray-700">{label}</span>}
	</label>
));
Checkbox.displayName = 'Checkbox';

// Dialog
export interface DialogProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	children: React.ReactNode;
}

export const Dialog = ({ open, onOpenChange, children }: DialogProps) => (
	<>
		{open && (
			<div className="fixed inset-0 z-50">
				<div
					className="fixed inset-0 bg-black/50"
					onClick={() => onOpenChange(false)}
					aria-hidden="true"
				/>
				<div className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full">
					{children}
				</div>
			</div>
		)}
	</>
);

// Dialog Content
export const DialogContent = forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(({
	className,
	children,
	...props
}, ref) => (
	<div
		ref={ref}
		className={cn(
			"bg-white rounded-lg shadow-xl",
			"w-full max-w-lg",
			"animate-in fade-in-0 zoom-in-95",
			className
		)}
		{...props}
	>
		{children}
	</div>
));
DialogContent.displayName = 'DialogContent';

// Button
export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
	variant?: 'default' | 'outline' | 'ghost';
	size?: 'default' | 'sm' | 'lg';
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(({
	className,
	variant = 'default',
	size = 'default',
	...props
}, ref) => (
	<button
		ref={ref}
		className={cn(
			"inline-flex items-center justify-center rounded-md font-medium transition-colors",
			"focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-500",
			"disabled:pointer-events-none disabled:opacity-50",
			{
				'bg-purple-600 text-white hover:bg-purple-700': variant === 'default',
				'border border-gray-300 bg-transparent hover:bg-gray-50': variant === 'outline',
				'bg-transparent hover:bg-gray-100': variant === 'ghost',
				'h-10 px-4 py-2': size === 'default',
				'h-8 px-3 text-sm': size === 'sm',
				'h-12 px-6': size === 'lg',
			},
			className
		)}
		{...props}
	/>
));
Button.displayName = 'Button';

// Textarea
export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> { }

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(({
	className,
	...props
}, ref) => (
	<textarea
		ref={ref}
		className={cn(
			"flex w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm",
			"placeholder:text-gray-400",
			"focus:outline-none focus:ring-2 focus:ring-purple-500",
			"disabled:cursor-not-allowed disabled:opacity-50",
			className
		)}
		{...props}
	/>
));
Textarea.displayName = 'Textarea';

export { ArrowRight, Sparkles, X };
