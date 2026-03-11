import { CheckCircle2, Clock3, PlayCircle, WandSparkles } from "lucide-react";

import {
	DashboardPageHeader,
	DashboardPanel,
} from "@/components/app/dashboard";
import { SurfaceCard } from "@/components/app/brand";
import { Button } from "@/components/ui/button";

const rules = [
	{
		name: "Credential refresh check",
		status: "Healthy",
		description:
			"Verifies provider credentials before scheduled runs move into the active queue.",
	},
	{
		name: "Failed run retry policy",
		status: "Healthy",
		description:
			"Retries transient worker and provider errors with a capped backoff policy.",
	},
	{
		name: "Quota alert escalation",
		status: "Needs attention",
		description:
			"Escalates to the workspace owner when a tool repeatedly hits provider or plan limits.",
	},
];

const runtimeStats = [
	{
		icon: CheckCircle2,
		value: "96%",
		label: "Successful workflows this week",
	},
	{ icon: Clock3, value: "4m", label: "Median time to trigger" },
	{ icon: WandSparkles, value: "18", label: "Workflows currently active" },
];

export function DashboardAutomations() {
	return (
		<div className="space-y-6">
			<DashboardPageHeader
				eyebrow="Workflows"
				title="Workflows"
				description="Recurring checks, retries, and schedules live in the same warm system as the rest of the workspace."
				actions={
					<Button className="rounded-full bg-gradient-brand text-white border-0">
						<WandSparkles className="size-4" />
						New workflow
					</Button>
				}
			/>

			<DashboardPanel
				title="Workflow set"
				description="The current workspace uses a compact, readable card model for background routines."
			>
				<div className="grid gap-4 lg:grid-cols-3">
					{rules.map((rule) => (
						<SurfaceCard key={rule.name} className="p-5">
							<div className="flex items-start justify-between gap-4">
								<div className="flex size-11 items-center justify-center rounded-2xl bg-primary/10 text-primary">
									<PlayCircle className="size-5" />
								</div>
								<span
									className={
										rule.status === "Healthy"
											? "pill pill-success"
											: "pill pill-warning"
									}
								>
									{rule.status}
								</span>
							</div>
							<div className="mt-5 text-lg font-medium">{rule.name}</div>
							<p className="mt-2 text-sm leading-6 text-muted-foreground">
								{rule.description}
							</p>
						</SurfaceCard>
					))}
				</div>
			</DashboardPanel>

			<DashboardPanel
				title="Runtime details"
				description="Workflows are still simple, but they now read like real product surfaces instead of placeholders."
			>
				<div className="grid gap-4 md:grid-cols-3">
					{runtimeStats.map((item) => (
						<SurfaceCard key={item.label} tone="muted" className="p-5">
							<div className="flex size-10 items-center justify-center rounded-2xl bg-primary/10 text-primary">
								<item.icon className="size-4" />
							</div>
							<div className="mt-4 text-3xl font-semibold tracking-tight">
								{item.value}
							</div>
							<div className="mt-2 text-sm text-muted-foreground">
								{item.label}
							</div>
						</SurfaceCard>
					))}
				</div>
			</DashboardPanel>
		</div>
	);
}
