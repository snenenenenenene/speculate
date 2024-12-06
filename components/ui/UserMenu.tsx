"use client";

import {
	CreditCard,
	LayoutDashboard,
	LogOut,
	Settings,
	User
} from "lucide-react";
import { signOut } from "next-auth/react";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

interface UserMenuProps {
  user: {
    name?: string | null;
    email?: string | null;
    image?: string | null;
  };
}

export function UserMenu({ user }: UserMenuProps) {
	const [isOpen, setIsOpen] = useState(false);

	return (
		<div className="relative">
			<button
				onClick={() => setIsOpen(!isOpen)}
				className="flex items-center gap-2 p-1 rounded-full hover:bg-gray-100 transition-colors"
			>
				{user.image ? (
					<Image
						src={user.image}
						alt={user.name || "User"}
						width={32}
						height={32}
						className="rounded-full"
					/>
				) : (
					<div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
						<User className="w-4 h-4 text-primary-600" />
					</div>
				)}
			</button>

			{isOpen && (
				<>
					<div
						className="fixed inset-0 z-40"
						onClick={() => setIsOpen(false)}
					/>
					<div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50">
						<div className="px-4 py-2 border-b border-gray-200">
							<p className="text-sm font-medium text-gray-900">{user.name}</p>
							<p className="text-xs text-gray-500">{user.email}</p>
						</div>

						<div className="py-1">
							<Link
								href="/dashboard"
								className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
							>
								<LayoutDashboard className="w-4 h-4" />
								Dashboard
							</Link>
							<Link
								href="/settings/profile"
								className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
							>
								<Settings className="w-4 h-4" />
								Settings
							</Link>
							<Link
								href="/settings/billing"
								className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
							>
								<CreditCard className="w-4 h-4" />
								Billing
							</Link>
						</div>

						<div className="border-t border-gray-200 py-1">
							<button
								onClick={() => signOut()}
								className="flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 w-full text-left"
							>
								<LogOut className="w-4 h-4" />
								Sign out
							</button>
						</div>
					</div>
				</>
			)}
		</div>
	);
}