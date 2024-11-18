"use client";

import { UserMenu } from "@/components/ui/UserMenu";
import { cn } from "@/lib/utils";
import { AnimatePresence, motion } from "framer-motion";
import { LayoutDashboard, LogOut, Menu, X } from "lucide-react";
import { signOut, useSession } from "next-auth/react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from 'react';

export default function Navbar() {
	const [isHeaderHidden, setIsHeaderHidden] = useState(false);
	const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
	const { data: session } = useSession();
	const pathname = usePathname();

	useEffect(() => {
		let lastScroll = 0;
		const handleScroll = () => {
			const currentScroll = window.scrollY;
			setIsHeaderHidden(currentScroll > lastScroll && currentScroll > 50);
			lastScroll = currentScroll;
		};
		window.addEventListener('scroll', handleScroll, { passive: true });
		return () => window.removeEventListener('scroll', handleScroll);
	}, []);

	// Check if current route is a dashboard route
	const isDashboardRoute = pathname.startsWith('/dashboard');

	const navItems = [
		{ label: 'Features', href: '/features' },
		{ label: 'Documentation', href: '/documentation' },
		{ label: 'Pricing', href: '/pricing' }
	];

	// Return null after all hooks are called
	if (isDashboardRoute) {
		return null;
	}

	return (
		<header
			className={cn(
				"fixed top-0 w-full z-50",
				"transition-all duration-300",
				isHeaderHidden && "opacity-0 -translate-y-full"
			)}
		>
			<div className={cn(
				"mx-auto px-4 py-3 max-w-7xl",
				"bg-white/80 backdrop-blur-md rounded-3xl",
				"border border-gray-200",
				"flex items-center justify-between",
				"mt-4 shadow-sm"
			)}>
				<Link
					href="/"
					className={cn(
						"flex items-center gap-3",
						"group transition-all duration-300",
						"hover:opacity-85"
					)}
				>
					<div className="w-8 h-8 relative transition-transform duration-300 group-hover:scale-110">
						<img
							src="/assets/images/logo.png"
							alt="Speculate Logo"
							className="object-cover w-full h-full"
						/>
					</div>
					<span className={cn(
						"text-xl font-bold",
						"bg-clip-text text-transparent bg-gradient-to-r",
						"from-primary-600 to-primary-800",
						"transition-all duration-300"
					)}>
						Speculate
					</span>
				</Link>

				<nav className="hidden lg:flex items-center space-x-8">
					{navItems.map(item => (
						<Link
							key={item.href}
							href={item.href}
							className={cn(
								"text-sm font-medium",
								"text-gray-600 hover:text-gray-900",
								"transition-colors duration-200"
							)}
						>
							{item.label}
						</Link>
					))}

					{session ? (
						<div className="flex items-center gap-4">
							<Link
								href="/dashboard"
								className={cn(
									"flex items-center gap-2 px-4 py-2 rounded-lg",
									"bg-primary-50 text-primary-700",
									"hover:bg-primary-100 transition-all duration-200",
									"text-sm font-medium",
									"hover:scale-105"
								)}
							>
								<LayoutDashboard className="w-4 h-4" />
								Dashboard
							</Link>
							<UserMenu />
						</div>
					) : (
						<>
							<div className="h-6 w-px bg-gray-200" />
							<Link
								href="/login"
								className={cn(
									"text-sm font-medium",
									"text-gray-600 hover:text-gray-900",
									"transition-colors duration-200"
								)}
							>
								Log in
							</Link>
							<Link
								href="/signup"
								className={cn(
									"px-4 py-2 rounded-full text-sm font-medium",
									"bg-primary-600 text-white",
									"hover:bg-primary-700 transition-all duration-200",
									"hover:scale-105 hover:shadow-md"
								)}
							>
								Start Free Trial
							</Link>
						</>
					)}
				</nav>

				{/* Mobile Menu Button */}
				<button
					className={cn(
						"lg:hidden p-2 rounded-lg",
						"hover:bg-gray-100 transition-colors",
						"focus:outline-none focus:ring-2",
						"focus:ring-primary-500 focus:ring-offset-2"
					)}
					onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
					aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
				>
					<AnimatePresence mode="wait">
						{mobileMenuOpen ? (
							<motion.div
								key="close"
								initial={{ opacity: 0, rotate: -90 }}
								animate={{ opacity: 1, rotate: 0 }}
								exit={{ opacity: 0, rotate: 90 }}
								transition={{ duration: 0.2 }}
							>
								<X className="w-6 h-6 text-gray-600" />
							</motion.div>
						) : (
							<motion.div
								key="menu"
								initial={{ opacity: 0, rotate: 90 }}
								animate={{ opacity: 1, rotate: 0 }}
								exit={{ opacity: 0, rotate: -90 }}
								transition={{ duration: 0.2 }}
							>
								<Menu className="w-6 h-6 text-gray-600" />
							</motion.div>
						)}
					</AnimatePresence>
				</button>
			</div>

			{/* Mobile Menu */}
			<AnimatePresence>
				{mobileMenuOpen && (
					<motion.div
						initial={{ opacity: 0, height: 0 }}
						animate={{ opacity: 1, height: "auto" }}
						exit={{ opacity: 0, height: 0 }}
						transition={{ duration: 0.2 }}
						className="lg:hidden w-full px-4"
					>
						<motion.div
							initial={{ y: -20 }}
							animate={{ y: 0 }}
							exit={{ y: -20 }}
							transition={{ duration: 0.2 }}
							className={cn(
								"mt-2 bg-white rounded-2xl",
								"shadow-lg border border-gray-200",
								"overflow-hidden"
							)}
						>
							<nav className="flex flex-col p-4 space-y-4">
								{navItems.map(item => (
									<Link
										key={item.href}
										href={item.href}
										onClick={() => setMobileMenuOpen(false)}
										className={cn(
											"text-gray-600 hover:text-gray-900",
											"px-4 py-2 rounded-lg hover:bg-gray-50",
											"transition-all duration-200",
											"text-sm font-medium"
										)}
									>
										{item.label}
									</Link>
								))}
								<hr className="border-gray-200" />
								{session ? (
									<>
										<Link
											href="/dashboard"
											onClick={() => setMobileMenuOpen(false)}
											className={cn(
												"flex items-center gap-2 px-4 py-2 rounded-lg",
												"bg-primary-50 text-primary-700",
												"hover:bg-primary-100 transition-colors",
												"text-sm font-medium"
											)}
										>
											<LayoutDashboard className="w-4 h-4" />
											Dashboard
										</Link>
										<button
											onClick={() => {
												setMobileMenuOpen(false);
												signOut();
											}}
											className={cn(
												"flex items-center gap-2 w-full",
												"text-red-600 hover:text-red-700",
												"px-4 py-2 rounded-lg",
												"hover:bg-red-50 text-left",
												"transition-colors",
												"text-sm font-medium"
											)}
										>
											<LogOut className="w-4 h-4" />
											Sign out
										</button>
									</>
								) : (
									<>
										<Link
											href="/login"
											onClick={() => setMobileMenuOpen(false)}
											className={cn(
												"text-gray-600 hover:text-gray-900",
												"px-4 py-2 rounded-lg hover:bg-gray-50",
												"transition-colors",
												"text-sm font-medium"
											)}
										>
											Log in
										</Link>
										<Link
											href="/signup"
											onClick={() => setMobileMenuOpen(false)}
											className={cn(
												"bg-primary-600 text-white",
												"px-4 py-2 rounded-lg",
												"hover:bg-primary-700",
												"text-center transition-colors",
												"text-sm font-medium"
											)}
										>
											Start Free Trial
										</Link>
									</>
								)}
							</nav>
						</motion.div>
					</motion.div>
				)}
			</AnimatePresence>
		</header>
	);
}