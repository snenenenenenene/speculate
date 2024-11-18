"use client";

import { UserMenu } from "@/components/ui/UserMenu";
import { cn } from "@/lib/utils";
import { LayoutDashboard } from "lucide-react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { useEffect, useState } from 'react';

export default function Navbar() {
	const [isHeaderHidden, setIsHeaderHidden] = useState(false);
	const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
	const { data: session } = useSession();

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

	const navItems = [
		{ label: 'Features', href: '/features' },
		{ label: 'Documentation', href: '/documentation' },
		{ label: 'Pricing', href: '/pricing' }
	];

	return (
		<header
			className={cn(
				"fixed top-0 w-full z-50",
				"transition-all duration-300",
				isHeaderHidden && "opacity-0 -translate-y-full"
			)}
		>
			<div className={cn(
				"mx-auto px-4 py-4 max-w-7xl",
				"bg-white/80 backdrop-blur-md rounded-3xl",
				"border border-base-200",
				"flex items-center justify-between",
				"mt-4"
			)}>
				<Link href="/" className="flex items-center space-x-2">
					<span className="text-xl font-bold text-base-800">Speculate</span>
				</Link>

				<nav className="hidden lg:flex items-center space-x-8">
					{navItems.map(item => (
						<Link
							key={item.href}
							href={item.href}
							className="text-base-600 hover:text-base-800 transition-colors"
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
									"hover:bg-primary-100 transition-colors"
								)}
							>
								<LayoutDashboard className="w-4 h-4" />
								Dashboard
							</Link>
							<UserMenu />
						</div>
					) : (
						<>
							<div className="h-6 w-px bg-base-200" />
							<Link
								href="/login"
								className="text-base-600 hover:text-base-800 transition-colors"
							>
								Log in
							</Link>
							<Link
								href="/signup"
								className={cn(
									"px-6 py-2 rounded-full",
									"bg-primary-600 text-white",
									"hover:bg-primary-700 transition-colors"
								)}
							>
								Start Free Trial
							</Link>
						</>
					)}
				</nav>

				<button
					className="lg:hidden p-2"
					onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
				>
					<div className="w-6 h-6 flex flex-col justify-around">
						<span className={cn(
							"w-full h-0.5 bg-base-800 transition-all",
							mobileMenuOpen && "rotate-45 translate-y-[7px]"
						)} />
						<span className={cn(
							"w-full h-0.5 bg-base-800 transition-all",
							mobileMenuOpen && "opacity-0"
						)} />
						<span className={cn(
							"w-full h-0.5 bg-base-800 transition-all",
							mobileMenuOpen && "-rotate-45 -translate-y-[7px]"
						)} />
					</div>
				</button>
			</div>

			{/* Mobile Menu */}
			{mobileMenuOpen && (
				<div className="lg:hidden absolute w-full px-4 mt-2">
					<div className="bg-white rounded-2xl shadow-lg border border-base-200 p-4">
						<nav className="flex flex-col space-y-4">
							{navItems.map(item => (
								<Link
									key={item.href}
									href={item.href}
									className="text-base-600 hover:text-base-800 px-4 py-2 rounded-lg hover:bg-base-50"
								>
									{item.label}
								</Link>
							))}
							<hr className="border-base-200" />
							{session ? (
								<>
									<Link
										href="/dashboard"
										className="flex items-center gap-2 px-4 py-2 bg-primary-50 text-primary-700 rounded-lg hover:bg-primary-100"
									>
										<LayoutDashboard className="w-4 h-4" />
										Dashboard
									</Link>
									<button
										onClick={() => signOut()}
										className="text-red-600 hover:text-red-700 px-4 py-2 rounded-lg hover:bg-red-50 text-left"
									>
										Sign out
									</button>
								</>
							) : (
								<>
									<Link
										href="/login"
										className="text-base-600 hover:text-base-800 px-4 py-2 rounded-lg hover:bg-base-50"
									>
										Log in
									</Link>
									<Link
										href="/signup"
										className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 text-center"
									>
										Start Free Trial
									</Link>
								</>
							)}
						</nav>
					</div>
				</div>
			)}
		</header>
	);
}