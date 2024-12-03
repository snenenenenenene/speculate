"use client";

import { useStores } from "@/hooks/useStores";
import { cn } from "@/lib/utils";
import { Project, ProjectFilters as ProjectFiltersType } from "@/types/project";
import { motion } from "framer-motion";
import { ArrowUpDown, Clock, Code, FileText, Plus, Search, Settings, Trash2 } from "lucide-react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { toast } from "react-hot-toast";

// ProjectCard Component
interface ProjectCardProps {
	project: Project;
	onDelete: () => Promise<void>;
}

function ProjectCard({ project, onDelete }: ProjectCardProps) {
	const [isDeleting, setIsDeleting] = useState(false);

	const handleDelete = async (e: React.MouseEvent) => {
		e.preventDefault();
		if (!confirm("Are you sure you want to delete this project?")) return;

		setIsDeleting(true);
		try {
			await onDelete();
			toast.success("Project deleted successfully");
		} catch (error) {
			toast.error("Failed to delete project");
		} finally {
			setIsDeleting(false);
		}
	};

	return (
		<Link href={`/dashboard/projects/${project.id}`}>
			<motion.div
				whileHover={{ y: -2 }}
				className={cn(
					"group relative bg-white rounded-xl shadow-sm border border-gray-200",
					"hover:shadow-md transition-all duration-200"
				)}
			>
				{/* Project Color Bar */}
				<div
					className="h-2 rounded-t-xl"
					style={{ backgroundColor: project.color }}
				/>

				<div className="p-6">
					<div className="flex justify-between items-start mb-4">
						<h3 className="font-medium text-gray-900 group-hover:text-primary-600 transition-colors">
							{project.name}
						</h3>
						<button
							onClick={handleDelete}
							disabled={isDeleting}
							className={cn(
								"p-1 rounded-lg opacity-0 group-hover:opacity-100",
								"hover:bg-red-50 text-gray-400 hover:text-red-500",
								"transition-all duration-200",
								"disabled:opacity-50 disabled:cursor-not-allowed"
							)}
						>
							<Trash2 className="h-4 w-4" />
						</button>
					</div>

					{project.description && (
						<p className="text-sm text-gray-600 mb-4 line-clamp-2">
							{project.description}
						</p>
					)}

					<div className="flex items-center gap-4 text-sm text-gray-500">
						<div className="flex items-center gap-1">
							<FileText className="h-4 w-4" />
							<span>{project.flows.length} flows</span>
						</div>
						{project.apiEnabled && (
							<div className="flex items-center gap-1">
								<Code className="h-4 w-4" />
								<span>API enabled</span>
							</div>
						)}
					</div>

					<div className="flex items-center gap-2 mt-4 text-xs text-gray-400">
						<Clock className="h-3 w-3" />
						<span>Updated {new Date(project.updatedAt).toLocaleDateString()}</span>
					</div>

					{project.tags.length > 0 && (
						<div className="flex flex-wrap gap-2 mt-4">
							{project.tags.map((tag) => (
								<span
									key={tag}
									className="px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-600"
								>
									{tag}
								</span>
							))}
						</div>
					)}
				</div>
			</motion.div>
		</Link>
	);
}

// ProjectFilters Component
interface ProjectFiltersComponentProps {
	onFilterChange: (filters: Partial<ProjectFiltersType>) => void;
	onReset: () => void;
}

function ProjectFilters({ onFilterChange, onReset }: ProjectFiltersComponentProps) {
	const [searchValue, setSearchValue] = useState("");
	const [sortBy, setSortBy] = useState<ProjectFiltersType["sortBy"]>("updatedAt");
	const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

	const handleSearch = (value: string) => {
		setSearchValue(value);
		onFilterChange({ search: value });
	};

	const toggleSort = (field: ProjectFiltersType["sortBy"]) => {
		if (sortBy === field) {
			const newOrder = sortOrder === "asc" ? "desc" : "asc";
			setSortOrder(newOrder);
			onFilterChange({ sortOrder: newOrder });
		} else {
			setSortBy(field);
			setSortOrder("desc");
			onFilterChange({ sortBy: field, sortOrder: "desc" });
		}
	};

	return (
		<div className="mb-6 space-y-4">
			<div className="flex items-center gap-4">
				{/* Search */}
				<div className="relative flex-1">
					<Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
					<input
						type="text"
						value={searchValue}
						onChange={(e) => handleSearch(e.target.value)}
						placeholder="Search projects..."
						className={cn(
							"w-full pl-9 pr-4 py-2 text-sm",
							"border border-gray-200 rounded-lg",
							"focus:outline-none focus:ring-2 focus:ring-primary-500"
						)}
					/>
				</div>

				{/* Sort Options */}
				<div className="flex items-center gap-2">
					{[
						{ id: "name", label: "Name" },
						{ id: "updatedAt", label: "Last Updated" },
						{ id: "createdAt", label: "Created" },
					].map((option) => (
						<button
							key={option.id}
							onClick={() => toggleSort(option.id as ProjectFiltersType["sortBy"])}
							className={cn(
								"flex items-center gap-1 px-3 py-2 rounded-lg text-sm",
								sortBy === option.id
									? "bg-primary-50 text-primary-600"
									: "text-gray-600 hover:bg-gray-50"
							)}
						>
							<span>{option.label}</span>
							{sortBy === option.id && (
								<ArrowUpDown className={cn(
									"h-3 w-3 transition-transform",
									sortOrder === "desc" && "rotate-180"
								)} />
							)}
						</button>
					))}
				</div>

				{/* Settings */}
				<button className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-50">
					<Settings className="h-5 w-5" />
				</button>
			</div>
		</div>
	);
}

// Main Dashboard Page
export default function DashboardPage() {
	const { data: session } = useSession();
	const [isCreating, setIsCreating] = useState(false);
	const { projectStore } = useStores() as any;
	const { projects, filters, loading, error } = projectStore;

	useEffect(() => {
		projectStore.fetchProjects();
	}, [projectStore]);

	const handleCreateProject = async () => {
		if (!session?.user) return;

		setIsCreating(true);
		try {
			const newProject = await projectStore.createProject({
				name: "New Project",
				userId: session.user.id,
			});
			toast.success("Project created successfully");
			// Navigate to the new project
			window.location.href = `/dashboard/projects/${newProject.id}`;
		} catch (error) {
			toast.error("Failed to create project");
		} finally {
			setIsCreating(false);
		}
	};

	// Filter and sort projects based on current filters
	const filteredProjects = projects.filter((project: Project) => {
		if (filters.search && !project.name.toLowerCase().includes(filters.search.toLowerCase())) {
			return false;
		}
		if (filters.category && project.category !== filters.category) {
			return false;
		}
		if (filters.tags && filters.tags.length > 0) {
			return filters.tags.every(tag => project.tags.includes(tag));
		}
		return true;
	}).sort((a: Project, b: Project) => {
		const sortBy = filters.sortBy || 'updatedAt';
		const order = filters.sortOrder === 'desc' ? -1 : 1;

		if (sortBy === 'name') {
			return order * a.name.localeCompare(b.name);
		}

		const dateA = new Date(a[sortBy]);
		const dateB = new Date(b[sortBy]);
		return order * (dateB.getTime() - dateA.getTime());
	});

	return (
		<div className="container mx-auto px-4 py-8">
			<div className="flex justify-between items-center mb-8">
				<h1 className="text-2xl font-bold text-gray-900">Your Projects</h1>
				<button
					onClick={handleCreateProject}
					disabled={isCreating}
					className={cn(
						"flex items-center gap-2 px-4 py-2 rounded-lg",
						"bg-primary-600 text-white",
						"hover:bg-primary-700 transition-colors",
						"disabled:opacity-50 disabled:cursor-not-allowed"
					)}
				>
					<Plus className="h-5 w-5" />
					New Project
				</button>
			</div>

			<ProjectFilters
				onFilterChange={projectStore.setFilters}
				onReset={projectStore.resetFilters}
			/>

			{loading ? (
				<div className="flex justify-center items-center h-64">
					<div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600" />
				</div>
			) : error ? (
				<div className="text-center text-red-600 py-8">{error}</div>
			) : filteredProjects.length === 0 ? (
				<div className="text-center py-16">
					<h3 className="text-lg font-medium text-gray-900 mb-2">No projects found</h3>
					<p className="text-gray-600">Create your first project to get started</p>
				</div>
			) : (
				<motion.div
					initial={{ opacity: 0 }}
					animate={{ opacity: 1 }}
					className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
				>
					{filteredProjects.map((project: Project) => (
						<ProjectCard
							key={project.id}
							project={project}
							onDelete={() => projectStore.deleteProject(project.id)}
						/>
					))}
				</motion.div>
			)}
		</div>
	);
}