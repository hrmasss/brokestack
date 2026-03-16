import { Bot, Eye, ImageIcon, Layers3, Plus } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router";

import { SurfaceCard } from "@/components/app/brand";
import { DashboardPageHeader } from "@/components/app/dashboard";
import { DataTable, type DataTableColumn } from "@/components/app/data-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth-context";
import type { ApiListResponse, ImageJob, ProviderAccount } from "@/lib/api-types";
import { cn } from "@/lib/utils";
import {
	accountStatusStyles,
	formatDashboardDate,
	imageJobStatusStyles,
	providerCards,
} from "@/pages/dashboard/images-shared";

function SourceBadge({ source }: { source: string }) {
	return (
		<Badge
			variant="outline"
			className={cn(
				"rounded-full capitalize",
				source === "api"
					? "border-sky-500/20 bg-sky-500/10 text-sky-700"
					: "border-emerald-500/20 bg-emerald-500/10 text-emerald-700",
			)}
		>
			{source}
		</Badge>
	);
}

function RequestTypeBadge({ requestType }: { requestType: string }) {
	return (
		<Badge
			variant="outline"
			className={cn(
				"rounded-full capitalize",
				requestType === "batch"
					? "border-amber-500/20 bg-amber-500/10 text-amber-700"
					: "border-stone-500/20 bg-stone-500/10 text-stone-700",
			)}
		>
			{requestType}
		</Badge>
	);
}

export function DashboardImages() {
	const navigate = useNavigate();
	const { activeWorkspaceId, customerRequest } = useAuth();
	const [jobs, setJobs] = useState<ImageJob[]>([]);
	const [accounts, setAccounts] = useState<ProviderAccount[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	const readyAccounts = useMemo(
		() => accounts.filter((account) => account.status === "ready" || account.status === "busy"),
		[accounts],
	);

	useEffect(() => {
		if (!activeWorkspaceId) {
			return;
		}
		setLoading(true);
		setError(null);
		void Promise.all([
			customerRequest<ApiListResponse<ImageJob>>(`/workspaces/${activeWorkspaceId}/image-jobs`),
			customerRequest<ApiListResponse<ProviderAccount>>(
				`/workspaces/${activeWorkspaceId}/provider-accounts`,
			),
		])
			.then(([jobResponse, accountResponse]) => {
				setJobs(jobResponse.items);
				setAccounts(accountResponse.items);
			})
			.catch((loadError) => {
				setError(
					loadError instanceof Error
						? loadError.message
						: "Unable to load generated images.",
				);
			})
			.finally(() => setLoading(false));
	}, [activeWorkspaceId, customerRequest]);

	const columns: DataTableColumn<ImageJob>[] = [
		{
			id: "title",
			label: "Image job",
			width: 300,
			accessor: (job) => (
				<div className="space-y-1">
					<div className="font-medium">{job.title || "Untitled image"}</div>
					<div className="line-clamp-2 text-sm text-muted-foreground">
						{job.promptText}
					</div>
				</div>
			),
			getSortValue: (job) => `${job.title} ${job.promptText}`,
		},
		{
			id: "source",
			label: "Source",
			width: 120,
			accessor: (job) => <SourceBadge source={job.source} />,
			getSortValue: (job) => job.source,
		},
		{
			id: "type",
			label: "Type",
			width: 120,
			accessor: (job) => <RequestTypeBadge requestType={job.requestType} />,
			getSortValue: (job) => job.requestType,
		},
		{
			id: "provider",
			label: "Provider",
			width: 180,
			accessor: (job) => (
				<div className="space-y-1">
					<div className="font-medium capitalize">{job.provider}</div>
					<div className="text-sm text-muted-foreground">{job.providerLabel}</div>
				</div>
			),
			getSortValue: (job) => `${job.provider}-${job.providerLabel}`,
		},
		{
			id: "status",
			label: "Status",
			width: 140,
			accessor: (job) => (
				<span className={imageJobStatusStyles[job.status] ?? "pill pill-info"}>
					{job.status.replaceAll("_", " ")}
				</span>
			),
			getSortValue: (job) => job.status,
		},
		{
			id: "queued",
			label: "Queued",
			width: 160,
			accessor: (job) => formatDashboardDate(job.queuedAt),
			getSortValue: (job) => job.queuedAt,
		},
	];

	const emptyState =
		readyAccounts.length === 0
			? {
					title: "Connect a provider to start generating images",
					description:
						"Image generation is available once this workspace has at least one ready provider connection.",
					actionLabel: "Open connections",
					onAction: () => navigate("/dashboard/images/connections"),
				}
			: {
					title: "No generated images yet",
					description:
						"Generate a single image or run a batch to build the workspace image history.",
					actionLabel: "Generate image",
					onAction: () => navigate("/dashboard/images/new"),
				};

	return (
		<div className="space-y-6">
			<DashboardPageHeader
				eyebrow="Image generation"
				title="Images"
				description="Generated images from the web flow and API share one queue, one history, and one detail surface."
				actions={
					<div className="flex flex-wrap gap-2">
						<Button
							variant="outline"
							className="rounded-full"
							onClick={() => navigate("/dashboard/images/connections")}
						>
							<Bot className="size-4" />
							Connections
						</Button>
						{readyAccounts.length > 0 ? (
							<>
								<Button
									variant="outline"
									className="rounded-full"
									onClick={() => navigate("/dashboard/images/batch")}
								>
									<Layers3 className="size-4" />
									Generate batch
								</Button>
								<Button
									className="rounded-full bg-gradient-brand border-0 text-white"
									onClick={() => navigate("/dashboard/images/new")}
								>
									<Plus className="size-4" />
									Generate image
								</Button>
							</>
						) : null}
					</div>
				}
			/>

			{readyAccounts.length === 0 ? (
				<div className="grid gap-4 md:grid-cols-3">
					{providerCards.map((provider) => (
						<SurfaceCard key={provider.id} tone="muted" className="space-y-4 p-5">
							<div className="flex size-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
								<provider.icon className="size-5" />
							</div>
							<div>
								<div className="font-medium">{provider.label}</div>
								<div className="mt-1 text-sm text-muted-foreground">
									{provider.state}
								</div>
							</div>
							{provider.id === "chatgpt" ? (
								<Button
									className="rounded-full bg-gradient-brand border-0 text-white"
									onClick={() => navigate("/dashboard/images/connections")}
								>
									Connect account
								</Button>
							) : (
								<span className="pill pill-info">{provider.state}</span>
							)}
						</SurfaceCard>
					))}
				</div>
			) : null}

			<DataTable
				title="Generated images"
				description="Switch between dense list review and visual cards without losing the shared operational filters."
				rows={jobs}
				columns={columns}
				getRowId={(job) => job.id}
				getSearchText={(job) =>
					[
						job.title,
						job.promptText,
						job.provider,
						job.providerLabel,
						job.source,
						job.requestType,
						job.status,
					]
						.filter(Boolean)
						.join(" ")
				}
				filters={[
					{
						id: "status",
						label: "Status",
						options: [
							{ label: "All", value: "all" },
							{ label: "Queued", value: "queued" },
							{ label: "Completed", value: "completed" },
							{ label: "Failed", value: "failed" },
						],
						getValue: (job) => job.status,
					},
					{
						id: "source",
						label: "Source",
						options: [
							{ label: "All", value: "all" },
							{ label: "Web", value: "web" },
							{ label: "API", value: "api" },
						],
						getValue: (job) => job.source,
					},
					{
						id: "requestType",
						label: "Type",
						options: [
							{ label: "All", value: "all" },
							{ label: "Single", value: "single" },
							{ label: "Batch", value: "batch" },
						],
						getValue: (job) => job.requestType,
					},
					{
						id: "providerAccountId",
						label: "Connection",
						options: [
							{ label: "All", value: "all" },
							...accounts.map((account) => ({
								label: account.label,
								value: account.id,
							})),
						],
						getValue: (job) => job.providerAccountId,
					},
				]}
				globalActions={
					readyAccounts.length > 0
						? [
								{
									label: "Generate image",
									icon: Plus,
									onClick: () => navigate("/dashboard/images/new"),
								},
								{
									label: "Generate batch",
									icon: Layers3,
									variant: "outline",
									onClick: () => navigate("/dashboard/images/batch"),
								},
							]
						: [
								{
									label: "Connect account",
									icon: Bot,
									onClick: () => navigate("/dashboard/images/connections"),
								},
							]
				}
				emptyState={emptyState}
				loading={loading}
				error={error}
				onRowClick={(job) => navigate(`/dashboard/images/${job.id}`)}
				renderGridCard={(job) => (
					<SurfaceCard className="space-y-4 p-5">
						<div className="aspect-[4/3] rounded-[22px] border border-dashed border-[var(--brand-border-soft)] bg-background/60">
							<div className="flex h-full items-center justify-center text-muted-foreground">
								<ImageIcon className="size-6" />
							</div>
						</div>
						<div className="space-y-2">
							<div className="font-medium">{job.title || "Untitled image"}</div>
							<div className="line-clamp-3 text-sm text-muted-foreground">
								{job.promptText}
							</div>
						</div>
						<div className="flex flex-wrap gap-2">
							<SourceBadge source={job.source} />
							<RequestTypeBadge requestType={job.requestType} />
							<span className={imageJobStatusStyles[job.status] ?? "pill pill-info"}>
								{job.status.replaceAll("_", " ")}
							</span>
						</div>
						<div className="flex items-center justify-between text-sm text-muted-foreground">
							<span>{job.providerLabel}</span>
							<span>{job.outputCount} outputs</span>
						</div>
						<Button
							variant="outline"
							className="rounded-full"
							onClick={(event) => {
								event.stopPropagation();
								navigate(`/dashboard/images/${job.id}`);
							}}
						>
							<Eye className="size-4" />
							View details
						</Button>
					</SurfaceCard>
				)}
			/>

			<div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
				{accounts.map((account) => (
					<SurfaceCard key={account.id} tone="muted" className="space-y-3 p-5">
						<div className="flex items-center justify-between gap-3">
							<div className="font-medium">{account.label}</div>
							<span className={accountStatusStyles[account.status] ?? "pill pill-info"}>
								{account.status.replaceAll("_", " ")}
							</span>
						</div>
						<div className="text-sm text-muted-foreground">
							Cooldown {account.cooldownSeconds}s
							{account.jitterMaxSeconds > 0
								? ` + jitter ${account.jitterMinSeconds}-${account.jitterMaxSeconds}s`
								: ""}
						</div>
						<div className="text-sm text-muted-foreground">
							{account.isDefaultForApi ? "Default API connection" : "Web-only unless selected"}
						</div>
					</SurfaceCard>
				))}
			</div>
		</div>
	);
}
