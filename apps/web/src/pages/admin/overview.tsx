import {
	AlertTriangle,
	ArrowRight,
	CreditCard,
	FileText,
	Key,
	ShieldAlert,
	Tag,
	TrendingUp,
	UserCheck,
	UserPlus,
	Users,
} from "lucide-react";
import { Link } from "react-router";

import { SurfaceCard } from "@/components/app/brand";
import {
	DashboardPageHeader,
	DashboardPanel,
	InsightCard,
} from "@/components/app/dashboard";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const adminMetrics = [
	{
		title: "Total Users",
		value: "12,847",
		detail: "Active accounts",
		delta: "+248 this month",
		icon: Users,
	},
	{
		title: "Active Subscriptions",
		value: "3,421",
		detail: "Paying customers",
		delta: "+12.3% growth",
		icon: CreditCard,
		tone: "success" as const,
	},
	{
		title: "API Requests",
		value: "2.4M",
		detail: "Last 30 days",
		delta: "+18% vs last month",
		icon: Key,
	},
	{
		title: "MRR",
		value: "$284K",
		detail: "Monthly recurring revenue",
		delta: "+$18K this month",
		icon: TrendingUp,
		tone: "success" as const,
	},
];

const recentActivity = [
	{
		type: "user",
		title: "New user registered",
		description: "sarah.chen@company.io signed up via Google SSO",
		time: "2 minutes ago",
		icon: UserPlus,
	},
	{
		type: "subscription",
		title: "Subscription upgraded",
		description: "Acme Corp upgraded from Pro to Enterprise",
		time: "15 minutes ago",
		icon: TrendingUp,
	},
	{
		type: "alert",
		title: "Rate limit exceeded",
		description: "API key xxx-4521 exceeded quota",
		time: "32 minutes ago",
		icon: AlertTriangle,
		isWarning: true,
	},
	{
		type: "user",
		title: "User verified",
		description: "mike.johnson@startup.co completed email verification",
		time: "1 hour ago",
		icon: UserCheck,
	},
	{
		type: "security",
		title: "Failed login attempts",
		description: "5 failed attempts for admin@example.com",
		time: "2 hours ago",
		icon: ShieldAlert,
		isWarning: true,
	},
];

const quickActions = [
	{
		label: "Manage Users",
		description: "View and edit user accounts",
		href: "/admin/users",
		icon: Users,
	},
	{
		label: "Subscriptions",
		description: "Billing and plan management",
		href: "/admin/subscriptions",
		icon: CreditCard,
	},
	{
		label: "API Keys",
		description: "Create and revoke keys",
		href: "/admin/api-keys",
		icon: Key,
	},
	{
		label: "Blog Posts",
		description: "Content management",
		href: "/admin/blog-posts",
		icon: FileText,
	},
	{
		label: "Pricing Plans",
		description: "Configure pricing tiers",
		href: "/admin/pricing-plans",
		icon: Tag,
	},
];

export function AdminOverview() {
	return (
		<div className="space-y-6">
			<DashboardPageHeader
				eyebrow="Admin Dashboard"
				title="System Overview"
				description="Monitor platform health, manage users, and configure system settings"
			/>

			<div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
				{adminMetrics.map((metric) => (
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

			<div className="grid gap-6 lg:grid-cols-3">
				<DashboardPanel
					title="Recent Activity"
					description="Latest system events and user actions"
					className="lg:col-span-2"
				>
					<div className="space-y-3">
						{recentActivity.map((activity, index) => (
							<div
								key={index}
								className={cn(
									"flex items-start gap-4 rounded-2xl border p-4 transition-colors",
									activity.isWarning
										? "border-amber-500/30 bg-amber-500/5"
										: "border-[var(--brand-border-soft)] bg-background/50",
								)}
							>
								<div
									className={cn(
										"flex size-10 shrink-0 items-center justify-center rounded-xl",
										activity.isWarning
											? "bg-amber-500/15 text-amber-600 dark:text-amber-400"
											: "bg-[var(--brand-primary)]/10 text-[var(--brand-primary)]",
									)}
								>
									<activity.icon className="size-5" />
								</div>
								<div className="min-w-0 flex-1">
									<div className="flex items-start justify-between gap-2">
										<div className="font-medium">{activity.title}</div>
										<div className="shrink-0 text-xs text-muted-foreground">
											{activity.time}
										</div>
									</div>
									<div className="mt-0.5 text-sm text-muted-foreground">
										{activity.description}
									</div>
								</div>
							</div>
						))}
					</div>
				</DashboardPanel>

				<DashboardPanel
					title="Quick Actions"
					description="Common admin tasks"
				>
					<div className="space-y-2">
						{quickActions.map((action) => (
							<Link
								key={action.href}
								to={action.href}
								className="group flex items-center gap-3 rounded-2xl border border-[var(--brand-border-soft)] bg-background/50 p-4 transition-colors hover:border-amber-500/30 hover:bg-amber-500/5"
							>
								<div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-[var(--brand-primary)]/10 text-[var(--brand-primary)] transition-colors group-hover:bg-amber-500/15 group-hover:text-amber-600 dark:group-hover:text-amber-400">
									<action.icon className="size-5" />
								</div>
								<div className="min-w-0 flex-1">
									<div className="font-medium">{action.label}</div>
									<div className="text-sm text-muted-foreground">
										{action.description}
									</div>
								</div>
								<ArrowRight className="size-4 text-muted-foreground transition-transform group-hover:translate-x-1" />
							</Link>
						))}
					</div>
				</DashboardPanel>
			</div>

			<DashboardPanel
				title="System Health"
				description="Platform status and performance metrics"
				action={
					<Button variant="outline" size="sm" className="rounded-full">
						View details
					</Button>
				}
			>
				<div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
					{[
						{ label: "API Uptime", value: "99.98%", status: "healthy" },
						{ label: "Avg Response Time", value: "42ms", status: "healthy" },
						{ label: "Active Sessions", value: "1,247", status: "healthy" },
						{ label: "Queue Backlog", value: "23 jobs", status: "warning" },
					].map((item) => (
						<SurfaceCard key={item.label} className="p-4">
							<div className="flex items-center justify-between">
								<span className="text-sm text-muted-foreground">
									{item.label}
								</span>
								<span
									className={cn(
										"size-2 rounded-full",
										item.status === "healthy" && "bg-emerald-500",
										item.status === "warning" && "bg-amber-500",
										item.status === "error" && "bg-red-500",
									)}
								/>
							</div>
							<div className="mt-2 text-2xl font-semibold">{item.value}</div>
						</SurfaceCard>
					))}
				</div>
			</DashboardPanel>
		</div>
	);
}
