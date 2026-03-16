import {
	Code2,
	Copy,
	Eye,
	KeyRound,
	LoaderCircle,
	Plus,
	RefreshCw,
	Shield,
	Trash2,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router";

import { DataTable, type DataTableColumn } from "@/components/app/data-table";
import { DashboardPageHeader, InsightCard } from "@/components/app/dashboard";
import { SurfaceCard } from "@/components/app/brand";
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
import { useAuth } from "@/lib/auth-context";
import type {
	ApiListResponse,
	CreatedWorkspaceApiKey,
	ImageJob,
	WorkspaceApiKey,
} from "@/lib/api-types";
import { cn } from "@/lib/utils";
import { formatDashboardDate } from "@/pages/dashboard/images-shared";

const statusStyles: Record<string, string> = {
	active: "border-emerald-500/20 bg-emerald-500/10 text-emerald-700",
	revoked: "border-red-500/20 bg-red-500/10 text-red-700",
};

export function DashboardApi() {
	const navigate = useNavigate();
	const { activeWorkspaceId, customerRequest } = useAuth();
	const [keys, setKeys] = useState<WorkspaceApiKey[]>([]);
	const [jobs, setJobs] = useState<ImageJob[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [dialogOpen, setDialogOpen] = useState(false);
	const [name, setName] = useState("");
	const [requestsPerMinute, setRequestsPerMinute] = useState("60");
	const [dailyImageQuota, setDailyImageQuota] = useState("500");
	const [createdKey, setCreatedKey] = useState<CreatedWorkspaceApiKey | null>(null);
	const [submitting, setSubmitting] = useState(false);
	const [revealedKeys, setRevealedKeys] = useState<Record<string, boolean>>({});

	useEffect(() => {
		if (!activeWorkspaceId) {
			return;
		}
		setLoading(true);
		setError(null);
		void Promise.all([
			customerRequest<ApiListResponse<WorkspaceApiKey>>(
				`/workspaces/${activeWorkspaceId}/api-keys`,
			),
			customerRequest<ApiListResponse<ImageJob>>(`/workspaces/${activeWorkspaceId}/image-jobs`),
		])
			.then(([keysResponse, jobsResponse]) => {
				setKeys(keysResponse.items);
				setJobs(jobsResponse.items.filter((job) => job.source === "api"));
			})
			.catch((loadError) => {
				setError(
					loadError instanceof Error
						? loadError.message
						: "Unable to load the workspace API controls.",
				);
			})
			.finally(() => setLoading(false));
	}, [activeWorkspaceId, customerRequest]);

	const metrics = useMemo(
		() => [
			{ title: "API keys", value: String(keys.length), detail: "Workspace credentials" },
			{
				title: "Active keys",
				value: String(keys.filter((key) => key.status === "active").length),
				detail: "Ready for image generation",
			},
			{
				title: "API image jobs",
				value: String(jobs.length),
				detail: "Jobs created through the public API",
			},
			{
				title: "Last API job",
				value: jobs[0] ? formatDashboardDate(jobs[0].queuedAt) : "None yet",
				detail: "Most recent queued image",
			},
		],
		[jobs, keys],
	);

	async function createKey() {
		if (!activeWorkspaceId) {
			return;
		}
		setSubmitting(true);
		setError(null);
		try {
			const record = await customerRequest<CreatedWorkspaceApiKey>(
				`/workspaces/${activeWorkspaceId}/api-keys`,
				{
					method: "POST",
					body: {
						name,
						scopes: ["images.generate", "images.read"],
						requestsPerMinute: Number(requestsPerMinute) || 60,
						dailyImageQuota: Number(dailyImageQuota) || 500,
					},
				},
			);
			setCreatedKey(record);
			setDialogOpen(false);
			setName("");
			setRequestsPerMinute("60");
			setDailyImageQuota("500");
			const list = await customerRequest<ApiListResponse<WorkspaceApiKey>>(
				`/workspaces/${activeWorkspaceId}/api-keys`,
			);
			setKeys(list.items);
		} catch (submitError) {
			setError(
				submitError instanceof Error
					? submitError.message
					: "Unable to create the workspace API key.",
			);
		} finally {
			setSubmitting(false);
		}
	}

	async function revokeKey(keyId: string) {
		try {
			const updated = await customerRequest<WorkspaceApiKey>(
				`/workspace-api-keys/${keyId}/revoke`,
				{
					method: "POST",
					body: {},
				},
			);
			setKeys((current) =>
				current.map((item) => (item.id === updated.id ? updated : item)),
			);
		} catch (revokeError) {
			setError(
				revokeError instanceof Error
					? revokeError.message
					: "Unable to revoke the API key.",
			);
		}
	}

	async function copyText(value: string) {
		await navigator.clipboard.writeText(value);
	}

	const columns: DataTableColumn<WorkspaceApiKey>[] = [
		{
			id: "name",
			label: "Key",
			width: 280,
			accessor: (key) => (
				<div className="space-y-1">
					<div className="font-medium">{key.name}</div>
					<div className="font-mono text-sm text-muted-foreground">
						{key.keyPrefix}
					</div>
				</div>
			),
			getSortValue: (key) => key.name,
		},
		{
			id: "status",
			label: "Status",
			width: 140,
			accessor: (key) => (
				<span className={cn("pill", statusStyles[key.status] ?? "")}>
					{key.status}
				</span>
			),
			getSortValue: (key) => key.status,
		},
		{
			id: "scopes",
			label: "Scopes",
			width: 260,
			accessor: (key) => (
				<div className="flex flex-wrap gap-2">
					{key.scopes.map((scope) => (
						<span key={scope} className="pill pill-info">
							{scope}
						</span>
					))}
				</div>
			),
			getSortValue: (key) => key.scopes.join(","),
		},
		{
			id: "quota",
			label: "Quota",
			width: 220,
			accessor: (key) => (
				<div className="space-y-1 text-sm text-muted-foreground">
					<div>{key.requestsPerMinute} req/min</div>
					<div>{key.dailyImageQuota} images/day</div>
				</div>
			),
			getSortValue: (key) => key.requestsPerMinute + key.dailyImageQuota,
		},
		{
			id: "lastUsed",
			label: "Last used",
			width: 160,
			accessor: (key) => formatDashboardDate(key.lastUsedAt),
			getSortValue: (key) => key.lastUsedAt ?? "",
		},
	];

	return (
		<div className="space-y-6">
			<DashboardPageHeader
				eyebrow="Workspace API"
				title="API"
				description="Generate workspace keys, watch API-originated image traffic, and open the live API reference."
				actions={
					<div className="flex flex-wrap gap-2">
						<Button
							variant="outline"
							className="rounded-full"
							onClick={() => navigate("/dashboard/api/docs")}
						>
							<Code2 className="size-4" />
							View docs
						</Button>
						<Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
							<DialogTrigger asChild>
								<Button className="rounded-full bg-gradient-brand border-0 text-white">
									<Plus className="size-4" />
									Generate API key
								</Button>
							</DialogTrigger>
							<DialogContent>
								<DialogHeader>
									<DialogTitle>Create API key</DialogTitle>
									<DialogDescription>
										This key can create and read image jobs through the public API.
									</DialogDescription>
								</DialogHeader>
								<div className="space-y-4">
									<div className="space-y-2">
										<Label htmlFor="api-key-name">Key name</Label>
										<Input
											id="api-key-name"
											value={name}
											onChange={(event) => setName(event.target.value)}
											placeholder="Production image integration"
										/>
									</div>
									<div className="grid gap-4 md:grid-cols-2">
										<div className="space-y-2">
											<Label htmlFor="api-key-rpm">Requests per minute</Label>
											<Input
												id="api-key-rpm"
												type="number"
												min="1"
												value={requestsPerMinute}
												onChange={(event) =>
													setRequestsPerMinute(event.target.value)
												}
											/>
										</div>
										<div className="space-y-2">
											<Label htmlFor="api-key-daily">Daily image quota</Label>
											<Input
												id="api-key-daily"
												type="number"
												min="1"
												value={dailyImageQuota}
												onChange={(event) =>
													setDailyImageQuota(event.target.value)
												}
											/>
										</div>
									</div>
								</div>
								<DialogFooter>
									<Button variant="outline" onClick={() => setDialogOpen(false)}>
										Cancel
									</Button>
									<Button onClick={() => void createKey()} disabled={submitting}>
										{submitting ? (
											<LoaderCircle className="size-4 animate-spin" />
										) : (
											<KeyRound className="size-4" />
										)}
										Create key
									</Button>
								</DialogFooter>
							</DialogContent>
						</Dialog>
					</div>
				}
			/>

			{error ? (
				<SurfaceCard tone="muted" className="p-5 text-sm text-destructive">
					{error}
				</SurfaceCard>
			) : null}

			<div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
				{metrics.map((metric) => (
					<InsightCard
						key={metric.title}
						title={metric.title}
						value={metric.value}
						detail={metric.detail}
						icon={metric.title === "API keys" ? Shield : RefreshCw}
					/>
				))}
			</div>

			{createdKey ? (
				<SurfaceCard tone="muted" className="space-y-3 p-5">
					<div className="font-medium">Key created</div>
					<div className="text-sm text-muted-foreground">
						Copy this secret now. It is only shown once.
					</div>
					<div className="flex flex-wrap items-center gap-3 rounded-[24px] border border-[var(--brand-border-soft)] bg-background/70 p-4">
						<code className="flex-1 overflow-auto text-sm">{createdKey.secret}</code>
						<Button
							variant="outline"
							className="rounded-full"
							onClick={() => void copyText(createdKey.secret)}
						>
							<Copy className="size-4" />
							Copy
						</Button>
					</div>
				</SurfaceCard>
			) : null}

			<DataTable
				title="Workspace API keys"
				description="View scopes, quotas, and last-used information for the keys that can generate or read image jobs."
				rows={keys}
				columns={columns}
				getRowId={(key) => key.id}
				getSearchText={(key) =>
					[
						key.name,
						key.keyPrefix,
						key.status,
						key.scopes.join(" "),
						key.lastUsedIp,
					]
						.filter(Boolean)
						.join(" ")
				}
				loading={loading}
				error={error}
				globalActions={[
					{
						label: "Open docs",
						icon: Code2,
						variant: "outline",
						onClick: () => navigate("/dashboard/api/docs"),
					},
				]}
				rowActions={[
					{
						label: "Copy prefix",
						icon: Copy,
						onClick: (key) => void copyText(key.keyPrefix),
					},
					{
						label: "Reveal secret",
						icon: Eye,
						onClick: (key) =>
							setRevealedKeys((current) => ({
								...current,
								[key.id]: !current[key.id],
							})),
					},
					{
						label: "Revoke",
						icon: Trash2,
						destructive: true,
						onClick: (key) => void revokeKey(key.id),
					},
				]}
				emptyState={{
					title: "No API keys yet",
					description:
						"Generate the first workspace API key to enable image generation through the public API.",
					actionLabel: "Generate API key",
					onAction: () => setDialogOpen(true),
				}}
				renderGridCard={(key) => (
					<SurfaceCard className="space-y-4 p-5">
						<div className="flex items-center justify-between gap-3">
							<div className="font-medium">{key.name}</div>
							<span className={cn("pill", statusStyles[key.status] ?? "")}>
								{key.status}
							</span>
						</div>
						<code className="block overflow-auto rounded-[18px] bg-background/70 px-3 py-2 text-sm">
							{revealedKeys[key.id] && createdKey?.apiKey.id === key.id
								? createdKey.secret
								: key.keyPrefix}
						</code>
						<div className="flex flex-wrap gap-2">
							{key.scopes.map((scope) => (
								<span key={scope} className="pill pill-info">
									{scope}
								</span>
							))}
						</div>
						<div className="text-sm text-muted-foreground">
							{key.requestsPerMinute} req/min · {key.dailyImageQuota} images/day
						</div>
					</SurfaceCard>
				)}
			/>
		</div>
	);
}
