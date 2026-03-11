import {
	Bell,
	CalendarRange,
	CheckCheck,
	MessageSquareMore,
	ShieldAlert,
	WandSparkles,
} from "lucide-react";
import { useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

type AlertKind = "workflow" | "run" | "assistant" | "risk";

type InboxAlert = {
	id: string;
	body: string;
	context: string;
	kind: AlertKind;
	read: boolean;
	time: string;
	title: string;
};

const initialAlerts: InboxAlert[] = [
	{
		id: "alert-workflow",
		title: "Workflow backlog is growing",
		body: "Three scheduled runs are still waiting on required credentials.",
		context: "Overview",
		kind: "workflow",
		read: false,
		time: "5m ago",
	},
	{
		id: "alert-calendar",
		title: "Execution window collision",
		body: "Two recurring jobs are targeting the same worker slot tomorrow morning.",
		context: "Calendar",
		kind: "run",
		read: false,
		time: "18m ago",
	},
	{
		id: "alert-mira",
		title: "Mira surfaced fresh suggestions",
		body: "The current workspace view now has three new intervention prompts.",
		context: "Assistant",
		kind: "assistant",
		read: false,
		time: "44m ago",
	},
	{
		id: "alert-risk",
		title: "Owner load is drifting upward",
		body: "Two teammates are holding both failed runs and support follow-ups.",
		context: "Team",
		kind: "risk",
		read: true,
		time: "Yesterday",
	},
];

function getAlertIcon(kind: AlertKind) {
	switch (kind) {
		case "workflow":
			return ShieldAlert;
		case "run":
			return CalendarRange;
		case "assistant":
			return WandSparkles;
		case "risk":
			return MessageSquareMore;
	}
}

function getAlertIconClasses(kind: AlertKind) {
	switch (kind) {
		case "workflow":
			return "bg-amber-500/10 text-amber-600 dark:text-amber-300";
		case "run":
			return "bg-sky-500/10 text-sky-600 dark:text-sky-300";
		case "assistant":
			return "bg-[color-mix(in_srgb,var(--brand-primary)_12%,transparent)] text-[var(--brand-primary)]";
		case "risk":
			return "bg-rose-500/10 text-rose-600 dark:text-rose-300";
	}
}

function getAlertLabel(kind: AlertKind) {
	switch (kind) {
		case "workflow":
			return "Workflow";
		case "run":
			return "Run";
		case "assistant":
			return "Mira";
		case "risk":
			return "Risk";
	}
}

function AlertRow({
	alert,
	onOpen,
}: {
	alert: InboxAlert;
	onOpen: (id: string) => void;
}) {
	const Icon = getAlertIcon(alert.kind);

	return (
		<button
			type="button"
			onClick={() => onOpen(alert.id)}
			className={cn(
				"flex w-full items-start gap-3 rounded-[20px] px-3 py-3 text-left transition-colors hover:bg-accent/50",
				!alert.read &&
					"bg-[color-mix(in_srgb,var(--brand-highlight)_10%,transparent)]",
			)}
		>
			<div
				className={cn(
					"mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-2xl",
					getAlertIconClasses(alert.kind),
				)}
			>
				<Icon className="size-4" />
			</div>
			<div className="min-w-0 flex-1">
				<div className="flex items-start justify-between gap-3">
					<div className="min-w-0">
						<div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
							<span>{getAlertLabel(alert.kind)}</span>
							{!alert.read ? (
								<span className="size-1.5 rounded-full bg-[var(--brand-primary)]" />
							) : null}
						</div>
						<div className="mt-1 truncate text-sm font-medium">
							{alert.title}
						</div>
					</div>
					<div className="shrink-0 text-[11px] text-muted-foreground">
						{alert.time}
					</div>
				</div>
				<div className="mt-1 line-clamp-2 text-sm leading-5 text-muted-foreground">
					{alert.body}
				</div>
				<div className="mt-2">
					<span className="rounded-full bg-muted px-2 py-1 text-[11px] text-muted-foreground">
						{alert.context}
					</span>
				</div>
			</div>
		</button>
	);
}

export function AlertInbox() {
	const [alerts, setAlerts] = useState(initialAlerts);

	const unreadCount = useMemo(
		() => alerts.filter((alert) => !alert.read).length,
		[alerts],
	);

	const sections = useMemo(
		() => [
			{
				label: "Today",
				items: alerts.filter((alert) => alert.time !== "Yesterday"),
			},
			{
				label: "Earlier",
				items: alerts.filter((alert) => alert.time === "Yesterday"),
			},
		],
		[alerts],
	);

	function markAllRead() {
		setAlerts((current) => current.map((alert) => ({ ...alert, read: true })));
	}

	function markRead(alertId: string) {
		setAlerts((current) =>
			current.map((alert) =>
				alert.id === alertId ? { ...alert, read: true } : alert,
			),
		);
	}

	return (
		<DropdownMenu>
			<DropdownMenuTrigger asChild>
				<Button variant="outline" className="h-10 rounded-full px-4">
					<div className="relative">
						<Bell className="size-4" />
						{unreadCount > 0 ? (
							<span className="absolute -right-1 -top-1 size-1.5 rounded-full bg-[var(--brand-primary)]" />
						) : null}
					</div>
					<span className="hidden sm:inline">Alerts</span>
				</Button>
			</DropdownMenuTrigger>
			<DropdownMenuContent
				align="end"
				sideOffset={10}
				className="w-[min(92vw,360px)] rounded-[24px] p-0"
			>
				<div className="rounded-[inherit] border border-[var(--brand-border-soft)] bg-background/98">
					<div className="flex items-center justify-between gap-3 px-4 py-3.5">
						<div>
							<div className="text-sm font-semibold tracking-tight">
								Alert inbox
							</div>
							<div className="text-xs text-muted-foreground">
								{unreadCount > 0 ? `${unreadCount} unread` : "All caught up"}
							</div>
						</div>
						<Button
							type="button"
							variant="ghost"
							size="sm"
							className="rounded-full px-3"
							onClick={markAllRead}
							disabled={unreadCount === 0}
						>
							<CheckCheck className="size-3.5" />
							<span className="text-xs">Mark all read</span>
						</Button>
					</div>

					<DropdownMenuSeparator className="mx-0" />

					<div className="alert-inbox-scroll max-h-[380px] overflow-y-auto bg-background/98 px-2 py-2">
						{sections.map((section) =>
							section.items.length > 0 ? (
								<div key={section.label} className="pb-2 last:pb-0">
									<div className="px-2 pb-1.5 pt-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
										{section.label}
									</div>
									<div className="space-y-1">
										{section.items.map((alert) => (
											<AlertRow
												key={alert.id}
												alert={alert}
												onOpen={markRead}
											/>
										))}
									</div>
								</div>
							) : null,
						)}
					</div>
				</div>
			</DropdownMenuContent>
		</DropdownMenu>
	);
}
