import {
	AlertTriangle,
	ArrowRight,
	CalendarClock,
	CheckCircle2,
	Clock3,
	FileStack,
	LineChart,
	Plus,
	ServerCog,
	WandSparkles,
} from "lucide-react";
import { Link } from "react-router";

import {
	DashboardPageHeader,
	DashboardPanel,
	InsightCard,
} from "@/components/app/dashboard";
import { SurfaceCard } from "@/components/app/brand";
import { Button } from "@/components/ui/button";

const metrics = [
	{
		title: "Tool runs today",
		value: "184",
		detail: "Across 12 active tools",
		delta: "+26 vs yesterday",
		icon: FileStack,
	},
	{
		title: "API requests",
		value: "48.2K",
		detail: "Workspace traffic in the last 24h",
		delta: "+14.1% vs baseline",
		icon: LineChart,
		tone: "success" as const,
	},
	{
		title: "Median run latency",
		value: "2.8m",
		detail: "Queued to completed",
		delta: "-22s improvement",
		icon: Clock3,
	},
	{
		title: "Workflow health",
		value: "96%",
		detail: "Checks and retries passing",
		delta: "1 workflow needs tuning",
		icon: WandSparkles,
		tone: "warning" as const,
	},
];

const runBoard = [
	{ title: "PNG to SVG batch", status: "Ready", owner: "Rina", date: "Mar 11" },
	{ title: "Domain sweep", status: "Running", owner: "Imran", date: "Mar 11" },
	{ title: "Logo generator retry", status: "Blocked", owner: "Pia", date: "Mar 12" },
];

const workflowStats = [
	{ label: "Credential checks", value: "98%" },
	{ label: "Retry success", value: "76%" },
	{ label: "Scheduled syncs", value: "94%" },
];

const riskItems = [
	{
		label: "Logo generator is waiting on upstream image quota reset",
		icon: AlertTriangle,
		badgeClass: "pill pill-error",
	},
	{
		label: "Two recurring jobs overlap on the same morning worker slot",
		icon: Clock3,
		badgeClass: "pill pill-warning",
	},
	{
		label: "Fallback domain lookup path recovered last night automatically",
		icon: CheckCircle2,
		badgeClass: "pill pill-success",
	},
];

export function DashboardOverview() {
	return (
		<div className="space-y-6">
			<DashboardPageHeader
				eyebrow="Control room"
				title="Overview"
				description="A high-level view of tool execution, API demand, workflow health, and the work most likely to need intervention."
				actions={
					<>
						<Button variant="outline" className="rounded-full" asChild>
							<Link to="/dashboard/analytics">
								<LineChart className="size-4" />
								View usage
							</Link>
						</Button>
						<Button
							className="rounded-full bg-gradient-brand text-white border-0"
							asChild
						>
							<Link to="/dashboard/posts/new">
								<Plus className="size-4" />
								Launch run
							</Link>
						</Button>
					</>
				}
			/>

			<div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
				{metrics.map((metric) => (
					<InsightCard key={metric.title} {...metric} />
				))}
			</div>

			<div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
				<DashboardPanel
					title="Run board"
					description="Today’s critical executions and the tool runs that still need intervention."
					action={
						<Button variant="ghost" className="rounded-full" asChild>
							<Link to="/dashboard/posts">
								Open runs
								<ArrowRight className="size-4" />
							</Link>
						</Button>
					}
				>
					<div className="grid gap-4 lg:grid-cols-3">
						{runBoard.map((item) => (
							<SurfaceCard key={item.title} tone="muted" className="p-5">
								<div className="flex items-start justify-between gap-4">
									<div>
										<div className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
											{item.date}
										</div>
										<div className="mt-2 text-lg font-medium">{item.title}</div>
									</div>
									<div
										className={
											item.status === "Ready"
												? "pill pill-success"
												: item.status === "Running"
													? "pill pill-warning"
													: "pill pill-error"
										}
									>
										{item.status}
									</div>
								</div>
								<div className="mt-6 text-sm text-muted-foreground">
									Owner: {item.owner}
								</div>
							</SurfaceCard>
						))}
					</div>
				</DashboardPanel>

				<DashboardPanel
					title="Risks to clear"
					description="Signals worth attention in the next 24 hours."
				>
					<div className="space-y-3">
						{riskItems.map((item) => (
							<div
								key={item.label}
								className="flex items-start gap-3 rounded-[24px] border border-[var(--brand-border-soft)] bg-background/70 p-4"
							>
								<div className="flex size-10 items-center justify-center rounded-2xl bg-primary/10 text-primary">
									<item.icon className="size-4" />
								</div>
								<div className="min-w-0 flex-1">
									<div className="text-sm font-medium">{item.label}</div>
									<div className="mt-2">
										<span className={item.badgeClass}>Needs review</span>
									</div>
								</div>
							</div>
						))}
					</div>
				</DashboardPanel>
			</div>

			<div className="grid gap-6 xl:grid-cols-[1fr_1fr]">
				<DashboardPanel
					title="Request curve"
					description="A lightweight traffic snapshot for the current workspace."
				>
					<div className="rounded-[26px] border border-[var(--brand-border-soft)] bg-background/70 p-5">
						<div className="flex h-60 items-end gap-3">
							{[34, 42, 30, 68, 74, 58, 82].map((height, index) => (
								<div
									key={height}
									className="flex flex-1 flex-col items-center gap-3"
								>
									<div
										className="w-full rounded-t-[16px] bg-gradient-brand"
										style={{ height: `${height * 2}px` }}
									/>
									<div className="text-xs text-muted-foreground">
										{["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"][index]}
									</div>
								</div>
							))}
						</div>
					</div>
				</DashboardPanel>

				<DashboardPanel
					title="Workflow health"
					description="Recurring checks, retries, and schedules all use the same workspace patterns."
					action={
						<Button variant="outline" className="rounded-full" asChild>
							<Link to="/dashboard/automations">
								<WandSparkles className="size-4" />
								Manage workflows
							</Link>
						</Button>
					}
				>
					<div className="grid gap-4 sm:grid-cols-3">
						{workflowStats.map((item) => (
							<SurfaceCard
								key={item.label}
								tone="muted"
								className="p-5 text-center"
							>
								<div className="text-3xl font-semibold tracking-tight">
									{item.value}
								</div>
								<div className="mt-2 text-sm text-muted-foreground">
									{item.label}
								</div>
							</SurfaceCard>
						))}
					</div>
					<div className="mt-4 rounded-[24px] border border-[var(--brand-border-soft)] bg-background/70 p-4 text-sm text-muted-foreground">
						Scheduled runs, retry policies, and file checks all share the same
						command model. That consistency keeps the product readable as more
						tools get added.
					</div>
				</DashboardPanel>
			</div>

			<DashboardPanel
				title="This week’s cadence"
				description="Core routes now support the tool platform story instead of acting like leftover placeholders."
			>
				<div className="grid gap-4 md:grid-cols-3">
					{[
						{
							icon: CalendarClock,
							title: "Calendar",
							description:
								"Review recurring schedules, execution windows, and collision points.",
							href: "/dashboard/calendar",
						},
						{
							icon: FileStack,
							title: "Runs",
							description:
								"Use the execution table for dense operations work and live queue review.",
							href: "/dashboard/posts",
						},
						{
							icon: ServerCog,
							title: "Workflows",
							description:
								"Inspect retry logic, credential checks, and scheduled routines.",
							href: "/dashboard/automations",
						},
					].map((item) => (
						<Link
							key={item.title}
							to={item.href}
							className="rounded-[26px] border border-[var(--brand-border-soft)] bg-background/70 p-5 transition-transform hover:-translate-y-0.5"
						>
							<div className="flex size-11 items-center justify-center rounded-2xl bg-primary/10 text-primary">
								<item.icon className="size-5" />
							</div>
							<div className="mt-4 text-lg font-medium">{item.title}</div>
							<p className="mt-2 text-sm leading-6 text-muted-foreground">
								{item.description}
							</p>
						</Link>
					))}
				</div>
			</DashboardPanel>
		</div>
	);
}
