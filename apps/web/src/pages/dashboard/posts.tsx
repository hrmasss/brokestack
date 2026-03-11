import {
	Archive,
	ArrowUpDown,
	Copy,
	Download,
	Eye,
	FilePlus2,
	MoreHorizontal,
	Send,
} from "lucide-react";
import { Link } from "react-router";

import { SurfaceCard } from "@/components/app/brand";
import { DashboardPageHeader } from "@/components/app/dashboard";
import { DataTable, type DataTableColumn } from "@/components/app/data-table";
import { Button } from "@/components/ui/button";

type RunRecord = {
	id: string;
	tool: string;
	trigger: string;
	status: "Queued" | "Running" | "Completed" | "Failed";
	owner: string;
	startedAt: string;
	startedSort: number;
	duration: string;
	inputCount: number;
	note: string;
};

const rows: RunRecord[] = [
	{
		id: "run-001",
		tool: "PNG to SVG batch",
		trigger: "Workspace UI",
		status: "Running",
		owner: "Rina Morales",
		startedAt: "Mar 11, 09:30",
		startedSort: 202603110930,
		duration: "2m 14s",
		inputCount: 14,
		note: "Converting a mixed upload set from the brand kit archive.",
	},
	{
		id: "run-002",
		tool: "Available domain finder",
		trigger: "API",
		status: "Completed",
		owner: "Imran Ali",
		startedAt: "Mar 11, 10:00",
		startedSort: 202603111000,
		duration: "46s",
		inputCount: 28,
		note: "Returned 11 candidates after TLD and trademark filtering.",
	},
	{
		id: "run-003",
		tool: "Logo generator",
		trigger: "Scheduled",
		status: "Failed",
		owner: "Pia Sorensen",
		startedAt: "Mar 11, 11:20",
		startedSort: 202603111120,
		duration: "5m 02s",
		inputCount: 3,
		note: "Upstream image quota exhausted during the refinement step.",
	},
	{
		id: "run-004",
		tool: "Screenshot scraper",
		trigger: "Workspace UI",
		status: "Queued",
		owner: "Noa Carter",
		startedAt: "Mar 11, 12:15",
		startedSort: 202603111215,
		duration: "Pending",
		inputCount: 8,
		note: "Waiting on browser pool capacity before execution starts.",
	},
	{
		id: "run-005",
		tool: "Prompt pack exporter",
		trigger: "API",
		status: "Completed",
		owner: "Jon Osei",
		startedAt: "Mar 11, 13:30",
		startedSort: 202603111330,
		duration: "18s",
		inputCount: 4,
		note: "Exported versioned prompt bundle for the support workspace.",
	},
	{
		id: "run-006",
		tool: "Lead list enrich",
		trigger: "Scheduled",
		status: "Running",
		owner: "Maya Ross",
		startedAt: "Mar 11, 14:10",
		startedSort: 202603111410,
		duration: "8m 09s",
		inputCount: 96,
		note: "Currently processing provider retry window for 12 contacts.",
	},
];

function StatusPill({ status }: { status: RunRecord["status"] }) {
	const className =
		status === "Completed"
			? "pill pill-success"
			: status === "Running"
				? "pill pill-warning"
				: status === "Failed"
					? "pill pill-error"
					: "pill pill-muted";

	return <span className={className}>{status}</span>;
}

const columns: DataTableColumn<RunRecord>[] = [
	{
		id: "tool",
		label: "Tool",
		width: 260,
		minWidth: 220,
		accessor: (row) => (
			<div>
				<div className="font-medium">{row.tool}</div>
				<div className="mt-1 text-xs text-muted-foreground">{row.note}</div>
			</div>
		),
		getSortValue: (row) => row.tool,
	},
	{
		id: "trigger",
		label: "Trigger",
		width: 130,
		accessor: (row) => row.trigger,
		getSortValue: (row) => row.trigger,
	},
	{
		id: "status",
		label: "Status",
		width: 140,
		accessor: (row) => <StatusPill status={row.status} />,
		getSortValue: (row) => row.status,
	},
	{
		id: "owner",
		label: "Owner",
		width: 180,
		accessor: (row) => row.owner,
		getSortValue: (row) => row.owner,
	},
	{
		id: "startedAt",
		label: "Started",
		width: 160,
		accessor: (row) => row.startedAt,
		getSortValue: (row) => row.startedSort,
	},
	{
		id: "duration",
		label: "Duration",
		width: 140,
		accessor: (row) => row.duration,
		getSortValue: (row) => row.duration,
	},
	{
		id: "inputs",
		label: "Inputs",
		width: 110,
		accessor: (row) => `${row.inputCount} items`,
		getSortValue: (row) => row.inputCount,
	},
];

export function DashboardPosts() {
	return (
		<div className="space-y-6">
			<DashboardPageHeader
				eyebrow="Execution queue"
				title="Runs"
				description="Track queued, active, completed, and failed tool runs from one queue so the team can spot issues and keep work moving."
				actions={
					<>
						<Button variant="outline" className="rounded-full">
							<Download className="size-4" />
							Export
						</Button>
						<Button
							className="rounded-full bg-gradient-brand text-white border-0"
							asChild
						>
							<Link to="/dashboard/posts/new">
								<FilePlus2 className="size-4" />
								Launch run
							</Link>
						</Button>
					</>
				}
			/>

			<SurfaceCard className="p-5 md:p-6">
				<DataTable
					title="Execution queue"
					description="Filter by trigger or status, scan what needs intervention, and jump straight into the next action."
					rows={rows}
					columns={columns}
					getRowId={(row) => row.id}
					getSearchText={(row) =>
						[row.tool, row.trigger, row.owner, row.status, row.note].join(" ")
					}
					filters={[
						{
							id: "trigger",
							label: "Trigger",
							options: ["Workspace UI", "API", "Scheduled"].map((value) => ({
								label: value,
								value,
							})),
							getValue: (row) => row.trigger,
						},
						{
							id: "status",
							label: "Status",
							options: ["Queued", "Running", "Completed", "Failed"].map(
								(value) => ({
									label: value,
									value,
								}),
							),
							getValue: (row) => row.status,
						},
					]}
					globalActions={[
						{ label: "Sort presets", icon: ArrowUpDown, variant: "outline" },
						{ label: "Open details", icon: Eye, variant: "ghost" },
						{ label: "Bulk rerun", icon: Send, variant: "default" },
					]}
					rowActions={[
						{ label: "Open run", icon: Eye },
						{ label: "Duplicate", icon: Copy },
						{ label: "Archive", icon: Archive, destructive: true },
					]}
					emptyState={{
						title: "No runs match the current view",
						description:
							"Adjust filters or search terms to bring the right executions back into focus.",
					}}
					renderGridCard={(row) => (
						<div className="space-y-4">
							<div className="flex items-start justify-between gap-3">
								<div>
									<div className="text-lg font-medium">{row.tool}</div>
									<div className="mt-1 text-sm text-muted-foreground">
										{row.note}
									</div>
								</div>
								<StatusPill status={row.status} />
							</div>
							<div className="grid grid-cols-2 gap-3 text-sm">
								<div>
									<div className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
										Trigger
									</div>
									<div className="mt-1">{row.trigger}</div>
								</div>
								<div>
									<div className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
										Owner
									</div>
									<div className="mt-1">{row.owner}</div>
								</div>
								<div>
									<div className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
										Started
									</div>
									<div className="mt-1">{row.startedAt}</div>
								</div>
								<div>
									<div className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
										Duration
									</div>
									<div className="mt-1">{row.duration}</div>
								</div>
							</div>
							<div className="flex items-center justify-between rounded-2xl border border-[var(--brand-border-soft)] bg-background/70 px-4 py-3 text-sm">
								<span>{row.inputCount} inputs attached</span>
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
