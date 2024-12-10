"use client";

import { useSession, signOut } from "next-auth/react";
import { CreditCard, LayoutDashboard, LogOut, Settings, User } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function UserMenu() {
	const { data: session } = useSession();

	if (!session?.user) return null;

	return (
		<DropdownMenu>
			<DropdownMenuTrigger asChild>
				<button className="flex items-center gap-2 p-1 rounded-full hover:bg-gray-100 transition-colors">
					{session.user.image ? (
						<Image
							src={session.user.image}
							alt={session.user.name || "User"}
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
			</DropdownMenuTrigger>

			<DropdownMenuContent align="end" className="w-56">
				<DropdownMenuLabel className="font-normal">
					<div className="flex flex-col space-y-1">
						<p className="text-sm font-medium">{session.user.name}</p>
						<p className="text-xs text-muted-foreground">{session.user.email}</p>
					</div>
				</DropdownMenuLabel>
				<DropdownMenuSeparator />
				<DropdownMenuItem asChild>
					<Link href="/projects" className="flex items-center gap-2 cursor-pointer">
						<LayoutDashboard className="w-4 h-4" />
						<span>Dashboard</span>
					</Link>
				</DropdownMenuItem>
				<DropdownMenuItem asChild>
					<Link href="/settings/profile" className="flex items-center gap-2 cursor-pointer">
						<Settings className="w-4 h-4" />
						<span>Settings</span>
					</Link>
				</DropdownMenuItem>
				<DropdownMenuItem asChild>
					<Link href="/settings/billing" className="flex items-center gap-2 cursor-pointer">
						<CreditCard className="w-4 h-4" />
						<span>Billing</span>
					</Link>
				</DropdownMenuItem>
				<DropdownMenuSeparator />
				<DropdownMenuItem
					className="text-red-600 focus:text-red-600 focus:bg-red-50"
					onClick={() => signOut()}
				>
					<LogOut className="w-4 h-4 mr-2" />
					<span>Sign out</span>
				</DropdownMenuItem>
			</DropdownMenuContent>
		</DropdownMenu>
	);
}