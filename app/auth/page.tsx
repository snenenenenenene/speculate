/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/ban-ts-comment */
"use client";

import { LoadingSpinner } from "@/components/ui/base";
import { useSession } from "next-auth/react";
import dynamic from "next/dynamic";
import { Suspense } from "react";

// @ts-ignore
const AuthForm = dynamic(() => import("./AuthForm"), {
	loading: () => (
		<div className="min-h-screen flex items-center justify-center bg-base-50">
			<LoadingSpinner className="h-6 w-6 text-primary-600" />
		</div>
	),
});

export default function AuthPage() {
	const { data: session, status } = useSession();

	// Auth redirect logic
	if (status === "loading") {
		return (
			<div className="min-h-screen flex items-center justify-center bg-base-50">
				<LoadingSpinner className="h-6 w-6 text-primary-600" />
			</div>
		);
	}

	return (
		<Suspense
			fallback={
				<div className="min-h-screen flex items-center justify-center bg-base-50">
					<LoadingSpinner className="h-6 w-6 text-primary-600" />
				</div>
			}
		>
			<AuthForm />
		</Suspense>
	);
}