import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

import { SurfaceCard } from "@/components/app/brand";
import { cn } from "@/lib/utils";

export function DashboardPageHeader({
	eyebrow,
	title,
	description,
	actions,
}: {
	eyebrow?: string;
	title: string;
	description: string;
	actions?: ReactNode;
}) {
	return (
		<div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
			<div className="space-y-3">
				{eyebrow ? (
					<div className="text-xs font-medium uppercase tracking-[0.24em] text-[var(--brand-accent)]">
						{eyebrow}
					</div>
				) : null}
				<div className="space-y-2">
					<h1 className="text-3xl font-semibold tracking-tight md:text-4xl">
						{title}
					</h1>
					<p className="max-w-2xl text-sm text-muted-foreground md:text-base">
						{description}
					</p>
				</div>
			</div>
			{actions ? (
				<div className="flex flex-wrap items-center gap-2">{actions}</div>
			) : null}
		</div>
	);
}

export function InsightCard({
	title,
	value,
	detail,
	delta,
	icon: Icon,
	tone = "default",
}: {
	title: string;
	value: string;
	detail: string;
	delta?: string;
	icon: LucideIcon;
	tone?: "default" | "success" | "warning";
}) {
	return (
		<SurfaceCard className="kpi-card">
			<div className="flex items-start justify-between gap-4">
				<div className="space-y-3">
					<div className="kpi-label">{title}</div>
					<div className="space-y-1">
						<div className="kpi-value">{value}</div>
						<div className="text-sm text-muted-foreground">{detail}</div>
					</div>
				</div>
				<div
					className={cn(
						"kpi-icon shrink-0",
						tone === "default" && "text-[var(--brand-primary)]",
						tone === "success" &&
							"text-[var(--brand-success)] bg-[color-mix(in_srgb,var(--brand-success)_12%,transparent)]",
						tone === "warning" &&
							"text-[var(--brand-warning)] bg-[color-mix(in_srgb,var(--brand-warning)_14%,transparent)]",
					)}
				>
					<Icon className="size-5" />
				</div>
			</div>
			{delta ? <div className="mt-4 pill pill-info w-fit">{delta}</div> : null}
		</SurfaceCard>
	);
}

export function DashboardPanel({
	title,
	description,
	action,
	className,
	children,
}: {
	title: string;
	description?: string;
	action?: ReactNode;
	className?: string;
	children: ReactNode;
}) {
	return (
		<SurfaceCard className={cn("dashboard-section", className)}>
			<div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
				<div className="space-y-1">
					<h2 className="text-lg font-semibold tracking-tight">{title}</h2>
					{description ? (
						<p className="text-sm text-muted-foreground">{description}</p>
					) : null}
				</div>
				{action ? <div className="shrink-0">{action}</div> : null}
			</div>
			{children}
		</SurfaceCard>
	);
}
