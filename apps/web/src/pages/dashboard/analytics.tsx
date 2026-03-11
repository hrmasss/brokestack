import {
	ArrowUpRight,
	BarChart3,
	Clock3,
	Server,
	TrendingUp,
	Users2,
} from "lucide-react";

import {
	DashboardPageHeader,
	DashboardPanel,
	InsightCard,
} from "@/components/app/dashboard";
import { SurfaceCard } from "@/components/app/brand";
import { Button } from "@/components/ui/button";

const metrics = [
	{
		title: "Request growth",
		value: "18.2%",
		detail: "Week-over-week API acceleration",
		delta: "Healthy trend",
		icon: TrendingUp,
		tone: "success" as const,
	},
	{
		title: "Active users",
		value: "72",
		detail: "Across shared workspaces",
		delta: "Above baseline",
		icon: Users2,
	},
	{
		title: "Run completion rate",
		value: "96.4%",
		detail: "Across all tool types",
		delta: "Two tools need retry tuning",
		icon: Clock3,
		tone: "warning" as const,
	},
];

export function DashboardAnalytics() {
	return (
		<div className="space-y-6">
			<DashboardPageHeader
				eyebrow="Usage"
				title="Usage"
				description="Usage is presented in the same structural language as execution and scheduling, so the dashboard feels continuous."
				actions={
					<Button variant="outline" className="rounded-full">
						<ArrowUpRight className="size-4" />
						Share snapshot
					</Button>
				}
			/>

			<div className="grid gap-4 md:grid-cols-3">
				{metrics.map((metric) => (
					<InsightCard key={metric.title} {...metric} />
				))}
			</div>

			<DashboardPanel
				title="Request curve"
				description="A simple chart block that shows demand and completion without pretending to be a full BI suite."
			>
				<div className="rounded-[28px] border border-[var(--brand-border-soft)] bg-background/72 p-5">
					<div className="flex h-72 items-end gap-4">
						{[48, 62, 55, 78, 92, 87, 110, 98].map((height) => (
							<div key={height} className="flex flex-1 items-end">
								<div
									className="w-full rounded-t-[18px] bg-gradient-brand"
									style={{ height: `${height * 1.7}px` }}
								/>
							</div>
						))}
					</div>
					<div className="mt-4 flex justify-between text-xs uppercase tracking-[0.18em] text-muted-foreground">
						{["W1", "W2", "W3", "W4", "W5", "W6", "W7", "W8"].map((item) => (
							<span key={item}>{item}</span>
						))}
					</div>
				</div>
			</DashboardPanel>

			<div className="grid gap-6 xl:grid-cols-[1fr_1fr]">
				<DashboardPanel
					title="Demand mix"
					description="Quick breakdown of what is currently driving volume."
				>
					<div className="space-y-4">
						{[
							["Image tools", 37],
							["Scraping flows", 24],
							["Domain utilities", 19],
							["API-only tools", 20],
						].map(([label, value]) => (
							<div key={label} className="space-y-2">
								<div className="flex items-center justify-between text-sm">
									<span>{label}</span>
									<span className="text-muted-foreground">{value}%</span>
								</div>
								<div className="h-2 rounded-full bg-muted">
									<div
										className="h-full rounded-full bg-gradient-brand"
										style={{ width: `${value}%` }}
									/>
								</div>
							</div>
						))}
					</div>
				</DashboardPanel>

				<DashboardPanel
					title="What moved"
					description="Short narrative summaries keep the operational story close to decision-making."
				>
					<div className="grid gap-4">
						{[
							{
								icon: BarChart3,
								title: "Image conversion demand drove the largest request gain.",
								body: "Batch conversion tools led growth after a new free-tier workspace segment became active this week.",
							},
							{
								icon: Server,
								title: "Worker pressure increased on scheduled scraping flows.",
								body: "The slowdown aligns with two high-volume recurring jobs. Splitting their execution window should help immediately.",
							},
						].map((item) => (
							<SurfaceCard key={item.title} tone="muted" className="p-5">
								<div className="flex items-start gap-3">
									<div className="flex size-10 items-center justify-center rounded-2xl bg-primary/10 text-primary">
										<item.icon className="size-4" />
									</div>
									<div>
										<div className="font-medium">{item.title}</div>
										<p className="mt-2 text-sm leading-6 text-muted-foreground">
											{item.body}
										</p>
									</div>
								</div>
							</SurfaceCard>
						))}
					</div>
				</DashboardPanel>
			</div>
		</div>
	);
}
