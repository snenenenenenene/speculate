"use client";

import { LoadingSpinner } from "@/components/ui/base";
import { motion } from "framer-motion";
import { ArrowLeft, ChevronRight } from "lucide-react";
import { signIn } from "next-auth/react";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

export default function LoginPage() {
	const [signInClicked, setSignInClicked] = useState(false);

	return (
		<div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex flex-col">
			{/* Top Navigation */}
			<nav className="w-full p-4">
				<div className="max-w-screen-xl mx-auto flex justify-between items-center">
					<Link
						href="/"
						className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
					>
						<ArrowLeft className="h-4 w-4" />
						<span className="text-sm font-medium">Back to home</span>
					</Link>
					<Link
						href="/signup"
						className="text-sm text-gray-600 hover:text-gray-900"
					>
						Don't have an account?
					</Link>
				</div>
			</nav>

			{/* Main Content */}
			<div className="flex-1 flex items-center justify-center p-4">
				<motion.div
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					className="w-full max-w-md"
				>
					<div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-200">
						{/* Header Section */}
						<div className="flex flex-col items-center justify-center space-y-3 border-b border-gray-200 bg-white px-4 py-8 text-center">
							<motion.div
								initial={{ scale: 0 }}
								animate={{ scale: 1 }}
								transition={{ type: "spring", duration: 0.5 }}
							>
								<Image
									src="/logo.png"
									alt="Logo"
									width={48}
									height={48}
									className="rounded-xl"
								/>
							</motion.div>
							<h1 className="font-display text-2xl font-bold text-gray-900">
								Welcome back
							</h1>
							<p className="text-sm text-gray-500 max-w-sm">
								Sign in to access your questionnaires, analytics, and settings.
							</p>
						</div>

						{/* Sign In Options */}
						<div className="flex flex-col space-y-4 bg-gray-50 px-4 py-8 md:px-16">
							<button
								disabled={signInClicked}
								onClick={() => {
									setSignInClicked(true);
									signIn("google", { callbackUrl: '/dashboard' });
								}}
								className={cn(
									"flex items-center justify-center gap-2 px-4 py-3 rounded-xl",
									"text-sm font-medium transition-all duration-200",
									"border shadow-sm hover:shadow-md",
									signInClicked
										? "cursor-not-allowed border-gray-200 bg-gray-100"
										: "border-gray-200 bg-white hover:bg-gray-50"
								)}
							>
								{signInClicked ? (
									<LoadingSpinner />
								) : (
									<>
										<Image
											src="/google.svg"
											alt="Google"
											width={20}
											height={20}
										/>
										<span>Continue with Google</span>
									</>
								)}
							</button>

							{/* Divider */}
							<div className="relative">
								<div className="absolute inset-0 flex items-center">
									<div className="w-full border-t border-gray-200"></div>
								</div>
								<div className="relative flex justify-center text-sm">
									<span className="px-2 text-gray-500 bg-gray-50">
										Or continue with
									</span>
								</div>
							</div>

							{/* Email/Password Fields (Optional for future use) */}
							<div className="space-y-4">
								<div>
									<label htmlFor="email" className="sr-only">
										Email
									</label>
									<input
										id="email"
										type="email"
										placeholder="Email"
										disabled={signInClicked}
										className={cn(
											"w-full px-4 py-3 rounded-xl text-sm",
											"border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200",
											"transition-all duration-200",
											"disabled:opacity-50 disabled:cursor-not-allowed"
										)}
									/>
								</div>
								<div>
									<label htmlFor="password" className="sr-only">
										Password
									</label>
									<input
										id="password"
										type="password"
										placeholder="Password"
										disabled={signInClicked}
										className={cn(
											"w-full px-4 py-3 rounded-xl text-sm",
											"border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200",
											"transition-all duration-200",
											"disabled:opacity-50 disabled:cursor-not-allowed"
										)}
									/>
								</div>
								<button
									disabled={signInClicked}
									className={cn(
										"w-full px-4 py-3 rounded-xl",
										"bg-gradient-to-r from-blue-500 to-violet-500",
										"text-white text-sm font-medium",
										"transition-all duration-200",
										"hover:shadow-md",
										"disabled:opacity-50 disabled:cursor-not-allowed",
										"flex items-center justify-center gap-2"
									)}
								>
									<span>Continue</span>
									<ChevronRight className="h-4 w-4" />
								</button>
							</div>
						</div>

						{/* Footer */}
						<div className="px-4 py-4 bg-gray-50 border-t border-gray-200">
							<p className="text-xs text-center text-gray-500">
								By signing in, you agree to our{" "}
								<Link href="/terms" className="text-blue-500 hover:text-blue-600">
									Terms of Service
								</Link>{" "}
								and{" "}
								<Link href="/privacy" className="text-blue-500 hover:text-blue-600">
									Privacy Policy
								</Link>
							</p>
						</div>
					</div>
				</motion.div>
			</div>
		</div>
	);
}

// Helper function for conditional classes
const cn = (...classes: string[]) => {
	return classes.filter(Boolean).join(" ");
};