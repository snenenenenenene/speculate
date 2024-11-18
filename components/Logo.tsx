import { cn } from "@/lib/utils";

export function Logo({ className }: { className?: string }) {
	return (
		<svg
			viewBox="0 0 100 100"
			className={cn("w-full h-full", className)}
			xmlns="http://www.w3.org/2000/svg"
		>
			<path
				className="animate-draw-s"
				d="M30 25 
			 C30 25, 45 25, 65 25
			 C85 25, 85 45, 65 45
			 C45 45, 35 45, 35 45
			 C15 45, 15 65, 35 65
			 C35 65, 45 65, 65 65
			 C85 65, 85 85, 65 85
			 C45 85, 30 85, 30 85"
				fill="none"
				stroke="#8C52FE"
				strokeWidth="12"
				strokeLinecap="round"
				strokeLinejoin="round"
			/>
		</svg>
	);
}