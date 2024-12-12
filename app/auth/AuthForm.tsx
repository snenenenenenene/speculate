/* eslint-disable react/no-unescaped-entities */
/* eslint-disable react-hooks/rules-of-hooks */
"use client";

import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowLeft, Check, ChevronRight, Sparkles } from "lucide-react";
import { signIn, useSession } from "next-auth/react";
import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

const features = [
	"Unlimited flow charts",
	"AI-powered generation",
	"Real-time collaboration",
	"Version history",
	"Export to multiple formats",
	"Priority support"
];

export default function AuthPage() {
	const router = useRouter();
	const searchParams = useSearchParams();
	const [isLogin, setIsLogin] = useState(true);
	const [signInClicked, setSignInClicked] = useState(false);
	const [showRightPanel, setShowRightPanel] = useState(true);
	const { data: session, status } = useSession();



	useEffect(() => {
		if (status !== "loading" && session) {
			router.push("/projects");
		}
	}, [session, status, router]);

	if (status === "loading") {
		return (
			<div className="min-h-screen flex items-center justify-center bg-base-50">
				<Loader2 className="h-6 w-6 text-primary-600" />
			</div>
		);
	}

	// Update URL when mode changes
	useEffect(() => {
		const mode = searchParams.get("mode");
		if (mode === "signup") {
			setIsLogin(false);
		} else {
			setIsLogin(true);
		}
	}, [searchParams]);

	const handleModeSwitch = (mode: "login" | "signup") => {
		// First animate the right panel away
		setShowRightPanel(false);

		// After animation, update the mode and bring panel back
		setTimeout(() => {
			router.push(`/auth?mode=${mode}`);
			setShowRightPanel(true);
		}, 300);
	};

	return (
		<div className="min-h-screen bg-base-50 flex flex-col">
			{/* Top Navigation */}
			<nav className="w-full p-4">
				<div className="max-w-screen-xl mx-auto flex justify-between items-center">
					<Link
						href="/"
						className="flex items-center gap-2 text-base-600 hover:text-base-800 transition-colors group"
					>
						<ArrowLeft className="h-4 w-4 group-hover:-translate-x-0.5 transition-transform" />
						<span className="text-sm font-medium">Back to home</span>
					</Link>
					<button
						onClick={() => handleModeSwitch(isLogin ? "signup" : "login")}
						className="text-sm text-base-600 hover:text-base-800 transition-colors"
					>
						{isLogin ? "Don't have an account?" : "Already have an account?"}
					</button>
				</div>
			</nav>

			{/* Main Content */}
			<div className="flex-1 flex items-center justify-center p-4">
				<div className="w-full max-w-5xl grid md:grid-cols-2 gap-8 items-center">
					{/* Left Side - Form */}
					<motion.div
						initial={{ opacity: 0, x: -20 }}
						animate={{ opacity: 1, x: 0 }}
						className="w-full max-w-md mx-auto"
					>
						<div className="bg-white rounded-3xl shadow-xl overflow-hidden border border-base-200">
							{/* Header Section */}
							<div className="flex flex-col items-center justify-center space-y-3 border-b border-base-100 bg-white px-4 py-8 text-center">
								<motion.div
									initial={{ scale: 0 }}
									animate={{ scale: 1 }}
									transition={{ type: "spring", duration: 0.5 }}
								>
									<Image
										src="/assets/images/logo.png"
										alt="Logo"
										width={48}
										height={48}
										className="rounded-xl"
									/>
								</motion.div>
								<AnimatePresence mode="wait">
									<motion.div
										key={isLogin ? "login" : "signup"}
										initial={{ opacity: 0, y: 20 }}
										animate={{ opacity: 1, y: 0 }}
										exit={{ opacity: 0, y: -20 }}
										className="space-y-1"
									>
										<h1 className="font-display text-2xl font-bold text-base-800">
											{isLogin ? "Welcome back" : "Start your journey"}
										</h1>
										<p className="text-sm text-base-600 max-w-sm">
											{isLogin
												? "Sign in to access your flows and settings"
												: "Create your free account and start building amazing flow charts"
											}
										</p>
									</motion.div>
								</AnimatePresence>
							</div>

							{/* Auth Form */}
							<div className="flex flex-col space-y-4 bg-base-50 px-4 py-8 md:px-16">
								<button
									disabled={signInClicked}
									onClick={() => {
										setSignInClicked(true);
										signIn("google", { callbackUrl: '/projects' });
									}}
									className={cn(
										"flex items-center justify-center gap-2 px-4 py-3 rounded-xl",
										"text-sm font-medium transition-all duration-200",
										"border shadow-sm hover:shadow-md",
										signInClicked
											? "cursor-not-allowed border-base-200 bg-base-100"
											: "border-base-200 bg-white hover:bg-base-50"
									)}
								>
									{signInClicked ? (
										<Loader2 />
									) : (
										<>
											<Image
												src="https://upload.wikimedia.org/wikipedia/commons/c/c1/Google_%22G%22_logo.svg"
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
										<div className="w-full border-t border-base-200"></div>
									</div>
									<div className="relative flex justify-center text-sm">
										<span className="px-2 text-base-600 bg-base-50">
											Or continue with
										</span>
									</div>
								</div>

								{/* Email/Password Fields */}
								<div className="space-y-4">
									<div>
										<label htmlFor="email" className="sr-only">
											Email
										</label>
										<input
											id="email"
											type="email"
											placeholder="Work email"
											disabled={signInClicked}
											className={cn(
												"w-full px-4 py-3 rounded-xl text-sm",
												"border border-base-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-200",
												"transition-all duration-200",
												"disabled:opacity-50 disabled:cursor-not-allowed",
												"bg-white"
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
												"border border-base-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-200",
												"transition-all duration-200",
												"disabled:opacity-50 disabled:cursor-not-allowed",
												"bg-white"
											)}
										/>
									</div>
									<button
										disabled={signInClicked}
										className={cn(
											"w-full px-4 py-3 rounded-xl",
											"bg-primary-600 hover:bg-primary-700",
											"text-white text-sm font-medium",
											"transition-all duration-200",
											"hover:shadow-md",
											"disabled:opacity-50 disabled:cursor-not-allowed",
											"flex items-center justify-center gap-2",
											"group"
										)}
									>
										<span>{isLogin ? "Sign In" : "Create Account"}</span>
										<ChevronRight className="h-4 w-4 group-hover:translate-x-0.5 transition-transform" />
									</button>
								</div>
							</div>

							{/* Footer */}
							<div className="px-4 py-4 bg-base-50 border-t border-base-200">
								<p className="text-xs text-center text-base-600">
									{isLogin ? "By signing in" : "By creating an account"}, you agree to our{" "}
									<Link href="/terms" className="text-primary-600 hover:text-primary-700">
										Terms of Service
									</Link>{" "}
									and{" "}
									<Link href="/privacy" className="text-primary-600 hover:text-primary-700">
										Privacy Policy
									</Link>
								</p>
							</div>
						</div>
					</motion.div>

					{/* Right Side - Features/Info */}
					<AnimatePresence mode="wait">
						{showRightPanel && (
							<motion.div
								key={isLogin ? "login-panel" : "signup-panel"}
								initial={{ opacity: 0, x: 20 }}
								animate={{ opacity: 1, x: 0 }}
								exit={{ opacity: 0, x: 20 }}
								transition={{ duration: 0.3 }}
								className="hidden md:block"
							>
								{isLogin ? (
									// Login Panel
									<div className="bg-white rounded-3xl border border-base-200 p-8 shadow-xl">
										<div className="flex items-center gap-2 mb-6">
											<div className="p-2 bg-primary-50 rounded-xl">
												<Sparkles className="h-5 w-5 text-primary-600" />
											</div>
											<h2 className="text-xl font-semibold text-base-800">
												Welcome back
											</h2>
										</div>

										<p className="text-base-600 mb-8">
											Sign in to continue building amazing flows and collaborating with your team.
										</p>

										<div className="mt-8 p-4 rounded-2xl bg-primary-50 border border-primary-100">
											<p className="text-sm text-primary-700">
												"I use Speculate every day to map out our user journeys and workflows.
												It's become an indispensable tool for our design process."
											</p>
											<div className="mt-3 flex items-center gap-3">
												<div className="h-8 w-8 rounded-full bg-primary-100" />
												<div>
													<p className="text-sm font-medium text-base-800">Alex Rivera</p>
													<p className="text-xs text-base-600">UX Designer at Meta</p>
												</div>
											</div>
										</div>
									</div>
								) : (
									// Signup Panel
									<div className="bg-white rounded-3xl border border-base-200 p-8 shadow-xl">
										<div className="flex items-center gap-2 mb-6">
											<div className="p-2 bg-primary-50 rounded-xl">
												<Sparkles className="h-5 w-5 text-primary-600" />
											</div>
											<h2 className="text-xl font-semibold text-base-800">
												Everything you need
											</h2>
										</div>

										<div className="space-y-4">
											{features.map((feature, index) => (
												<motion.div
													key={feature}
													initial={{ opacity: 0, x: 20 }}
													animate={{ opacity: 1, x: 0 }}
													transition={{ delay: index * 0.1 }}
													className="flex items-center gap-3"
												>
													<div className="p-1 rounded-full bg-primary-50">
														<Check className="h-4 w-4 text-primary-600" />
													</div>
													<span className="text-base-700">{feature}</span>
												</motion.div>
											))}
										</div>

										<div className="mt-8 p-4 rounded-2xl bg-primary-50 border border-primary-100">
											<p className="text-sm text-primary-700">
												"Speculate has transformed how we visualize and communicate our processes.
												It's become an essential tool for our team."
											</p>
											<div className="mt-3 flex items-center gap-3">
												<div className="h-8 w-8 rounded-full bg-primary-100" />
												<div>
													<p className="text-sm font-medium text-base-800">Sarah Chen</p>
													<p className="text-xs text-base-600">Product Manager at Acme</p>
												</div>
											</div>
										</div>
									</div>
								)}
							</motion.div>
						)}
					</AnimatePresence>
				</div>
			</div>
		</div>
	);
}