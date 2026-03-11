import {
	Archive,
	Calendar,
	Clock,
	Edit2,
	Eye,
	FileText,
	Globe,
	MoreHorizontal,
	PenLine,
	Plus,
	Send,
	Trash2,
} from "lucide-react";

import { SurfaceCard } from "@/components/app/brand";
import {
	DashboardPageHeader,
	InsightCard,
} from "@/components/app/dashboard";
import { DataTable, type DataTableColumn } from "@/components/app/data-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
	NativeSelect,
	NativeSelectOption,
} from "@/components/ui/native-select";
import { cn } from "@/lib/utils";

type BlogPostRecord = {
	id: string;
	title: string;
	slug: string;
	author: string;
	authorAvatar: string;
	status: "published" | "draft" | "scheduled" | "archived";
	category: "Product" | "Case Study" | "Guide" | "Tutorial" | "Company";
	views: string;
	viewsSort: number;
	publishedAt: string | null;
	publishedSort: number;
	updatedAt: string;
	updatedSort: number;
};

const blogPosts: BlogPostRecord[] = [
	{
		id: "post_1",
		title: "Introducing BrokeStack: A Practical Workspace for Tool Operations",
		slug: "introducing-brokestack",
		author: "Sarah Chen",
		authorAvatar: "",
		status: "published",
		category: "Product",
		views: "12,847",
		viewsSort: 12847,
		publishedAt: "Mar 5, 2026",
		publishedSort: 20260305,
		updatedAt: "Mar 5, 2026",
		updatedSort: 20260305,
	},
	{
		id: "post_2",
		title: "How Enterprise Teams Cut Tool-Run Triage Time by 38%",
		slug: "enterprise-run-triage-savings",
		author: "Mike Johnson",
		authorAvatar: "",
		status: "published",
		category: "Case Study",
		views: "8,421",
		viewsSort: 8421,
		publishedAt: "Feb 28, 2026",
		publishedSort: 20260228,
		updatedAt: "Mar 1, 2026",
		updatedSort: 20260301,
	},
	{
		id: "post_3",
		title: "Building Scalable Automation Workflows: A Complete Guide",
		slug: "scalable-automation-workflows",
		author: "Emily Davis",
		authorAvatar: "",
		status: "draft",
		category: "Guide",
		views: "0",
		viewsSort: 0,
		publishedAt: null,
		publishedSort: 99999999,
		updatedAt: "Mar 8, 2026",
		updatedSort: 20260308,
	},
	{
		id: "post_4",
		title: "Q1 2026 Product Roadmap Update",
		slug: "q1-2026-roadmap-update",
		author: "Jordan Kim",
		authorAvatar: "",
		status: "scheduled",
		category: "Company",
		views: "0",
		viewsSort: 0,
		publishedAt: "Mar 15, 2026",
		publishedSort: 20260315,
		updatedAt: "Mar 7, 2026",
		updatedSort: 20260307,
	},
	{
		id: "post_5",
		title: "API Best Practices for Utility and Automation Platforms",
		slug: "api-best-practices-automation-platforms",
		author: "Alex Rodriguez",
		authorAvatar: "",
		status: "published",
		category: "Tutorial",
		views: "5,234",
		viewsSort: 5234,
		publishedAt: "Feb 15, 2026",
		publishedSort: 20260215,
		updatedAt: "Feb 20, 2026",
		updatedSort: 20260220,
	},
	{
		id: "post_6",
		title: "Deprecated: Legacy Analytics Migration Guide",
		slug: "legacy-analytics-migration",
		author: "Taylor Martinez",
		authorAvatar: "",
		status: "archived",
		category: "Guide",
		views: "892",
		viewsSort: 892,
		publishedAt: "Nov 10, 2025",
		publishedSort: 20251110,
		updatedAt: "Jan 5, 2026",
		updatedSort: 20260105,
	},
];

const statusConfig = {
	published: {
		label: "Published",
		icon: Globe,
		className: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20",
	},
	draft: {
		label: "Draft",
		icon: PenLine,
		className: "bg-gray-500/10 text-gray-600 border-gray-500/20",
	},
	scheduled: {
		label: "Scheduled",
		icon: Clock,
		className: "bg-blue-500/10 text-blue-600 border-blue-500/20",
	},
	archived: {
		label: "Archived",
		icon: Archive,
		className: "bg-amber-500/10 text-amber-600 border-amber-500/20",
	},
} satisfies Record<
	BlogPostRecord["status"],
	{ label: string; icon: typeof Globe; className: string }
>;

const categories: BlogPostRecord["category"][] = [
	"Product",
	"Case Study",
	"Guide",
	"Tutorial",
	"Company",
];

const metrics = [
	{
		title: "Total Posts",
		value: "127",
		detail: "Published articles",
		icon: FileText,
	},
	{
		title: "Total Views",
		value: "284K",
		detail: "All time page views",
		delta: "+18% this month",
		icon: Eye,
		tone: "success" as const,
	},
	{
		title: "Drafts",
		value: "12",
		detail: "Awaiting review",
		icon: PenLine,
	},
	{
		title: "Scheduled",
		value: "5",
		detail: "Coming soon",
		icon: Calendar,
	},
];

function StatusBadge({ status }: { status: BlogPostRecord["status"] }) {
	const config = statusConfig[status];

	return (
		<Badge variant="outline" className={cn("gap-1 rounded-full", config.className)}>
			<config.icon className="size-3" />
			{config.label}
		</Badge>
	);
}

const columns: DataTableColumn<BlogPostRecord>[] = [
	{
		id: "post",
		label: "Post",
		width: 320,
		minWidth: 280,
		accessor: (post) => (
			<div>
				<div className="line-clamp-1 font-medium">{post.title}</div>
				<div className="mt-1 text-sm text-muted-foreground">/{post.slug}</div>
			</div>
		),
		getSortValue: (post) => post.title,
	},
	{
		id: "author",
		label: "Author",
		width: 160,
		accessor: (post) => (
			<div className="flex items-center gap-2">
				<div className="flex size-7 items-center justify-center rounded-full bg-gradient-to-br from-amber-500 to-orange-600 text-xs font-medium text-white">
					{post.author
						.split(" ")
						.map((part) => part[0])
						.join("")}
				</div>
				<span className="text-sm">{post.author}</span>
			</div>
		),
		getSortValue: (post) => post.author,
	},
	{
		id: "category",
		label: "Category",
		width: 140,
		accessor: (post) => <Badge variant="outline" className="rounded-full">{post.category}</Badge>,
		getSortValue: (post) => post.category,
	},
	{
		id: "status",
		label: "Status",
		width: 160,
		accessor: (post) => <StatusBadge status={post.status} />,
		getSortValue: (post) => post.status,
	},
	{
		id: "views",
		label: "Views",
		width: 120,
		accessor: (post) => post.views,
		getSortValue: (post) => post.viewsSort,
	},
	{
		id: "updatedAt",
		label: "Updated",
		width: 150,
		accessor: (post) => post.updatedAt,
		getSortValue: (post) => post.updatedSort,
	},
];

export function AdminBlogPosts() {
	return (
		<div className="space-y-6">
			<DashboardPageHeader
				eyebrow="Content Management"
				title="Blog Posts"
				description="Manage the public content backlog with the same search, filtering, and grid/list controls used in the operator dashboard."
				actions={
					<Dialog>
						<DialogTrigger asChild>
							<Button className="rounded-full border-0 bg-gradient-to-r from-amber-500 to-orange-600 text-white">
								<Plus className="size-4" />
								New post
							</Button>
						</DialogTrigger>
						<DialogContent className="sm:max-w-[500px]">
							<DialogHeader>
								<DialogTitle>Create New Post</DialogTitle>
								<DialogDescription>
									Start a new blog post. You can save it as a draft and publish it later.
								</DialogDescription>
							</DialogHeader>
							<div className="grid gap-4 py-4">
								<div className="grid gap-2">
									<Label htmlFor="post-title">Title</Label>
									<Input
										id="post-title"
										placeholder="Enter post title..."
										className="rounded-xl"
									/>
								</div>
								<div className="grid gap-2">
									<Label htmlFor="post-slug">URL Slug</Label>
									<Input
										id="post-slug"
										placeholder="post-url-slug"
										className="rounded-xl"
									/>
								</div>
								<div className="grid grid-cols-2 gap-4">
									<div className="grid gap-2">
										<Label htmlFor="post-category">Category</Label>
										<NativeSelect defaultValue="Product" className="rounded-xl">
											{categories.map((category) => (
												<NativeSelectOption key={category} value={category}>
													{category}
												</NativeSelectOption>
											))}
										</NativeSelect>
									</div>
									<div className="grid gap-2">
										<Label htmlFor="post-author">Author</Label>
										<NativeSelect defaultValue="current" className="rounded-xl">
											<NativeSelectOption value="current">Current Admin</NativeSelectOption>
											<NativeSelectOption value="sarah">Sarah Chen</NativeSelectOption>
											<NativeSelectOption value="mike">Mike Johnson</NativeSelectOption>
										</NativeSelect>
									</div>
								</div>
							</div>
							<DialogFooter>
								<Button variant="outline" className="rounded-full">
									Cancel
								</Button>
								<Button variant="outline" className="rounded-full">
									Save draft
								</Button>
								<Button className="rounded-full border-0 bg-gradient-to-r from-amber-500 to-orange-600 text-white">
									Create & edit
								</Button>
							</DialogFooter>
						</DialogContent>
					</Dialog>
				}
			/>

			<div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
				{metrics.map((metric) => (
					<InsightCard
						key={metric.title}
						title={metric.title}
						value={metric.value}
						detail={metric.detail}
						delta={metric.delta}
						icon={metric.icon}
						tone={metric.tone}
					/>
				))}
			</div>

			<SurfaceCard className="p-5 md:p-6">
				<DataTable
					title="Editorial queue"
					description="Filter by publication state or category, rank by traffic, and jump between structured list and content cards."
					rows={blogPosts}
					columns={columns}
					getRowId={(post) => post.id}
					getSearchText={(post) =>
						[
							post.title,
							post.slug,
							post.author,
							post.category,
							post.status,
							post.updatedAt,
						].join(" ")
					}
					searchPlaceholder="Search posts, authors, or categories..."
					filters={[
						{
							id: "status",
							label: "Status",
							options: Object.entries(statusConfig).map(([value, config]) => ({
								label: config.label,
								value,
							})),
							getValue: (post) => post.status,
						},
						{
							id: "category",
							label: "Category",
							options: categories.map((category) => ({
								label: category,
								value: category,
							})),
							getValue: (post) => post.category,
						},
					]}
					globalActions={[
						{ label: "Review drafts", icon: PenLine, variant: "outline" },
						{ label: "Open preview", icon: Eye, variant: "ghost" },
					]}
					rowActions={[
						{ label: "Edit post", icon: Edit2 },
						{ label: "Preview", icon: Eye },
						{ label: "Publish", icon: Send },
						{ label: "Archive", icon: Archive },
						{ label: "Delete post", icon: Trash2, destructive: true },
					]}
					emptyState={{
						title: "No blog posts match the current view",
						description:
							"Adjust the filters or search query to bring the right content back into focus.",
					}}
					renderGridCard={(post) => (
						<div className="space-y-4">
							<div className="flex items-start justify-between gap-3">
								<div>
									<div className="text-lg font-medium">{post.title}</div>
									<div className="mt-1 text-sm text-muted-foreground">/{post.slug}</div>
								</div>
								<StatusBadge status={post.status} />
							</div>
							<div className="flex flex-wrap items-center gap-2">
								<Badge variant="outline" className="rounded-full">
									{post.category}
								</Badge>
								<div className="flex items-center gap-2 text-sm text-muted-foreground">
									<div className="flex size-7 items-center justify-center rounded-full bg-gradient-to-br from-amber-500 to-orange-600 text-xs font-medium text-white">
										{post.author
											.split(" ")
											.map((part) => part[0])
											.join("")}
									</div>
									<span>{post.author}</span>
								</div>
							</div>
							<div className="grid grid-cols-2 gap-3 text-sm">
								<div>
									<div className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
										Views
									</div>
									<div className="mt-1 font-medium">{post.views}</div>
								</div>
								<div>
									<div className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
										Updated
									</div>
									<div className="mt-1">{post.updatedAt}</div>
								</div>
							</div>
							<div className="flex items-center justify-between rounded-2xl border border-[var(--brand-border-soft)] bg-background/70 px-4 py-3 text-sm">
								<span>{post.publishedAt ?? "Not published"}</span>
								<Button variant="ghost" size="icon-sm">
									<MoreHorizontal className="size-4" />
								</Button>
							</div>
						</div>
					)}
				/>
			</SurfaceCard>
		</div>
	);
}
