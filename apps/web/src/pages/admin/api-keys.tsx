import {
	AlertTriangle,
	CheckCircle2,
	Clock,
	Copy,
	Eye,
	EyeOff,
	Key,
	MoreHorizontal,
	Plus,
	RefreshCw,
	Shield,
	Trash2,
	XCircle,
} from "lucide-react";
import { useState } from "react";

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

type ApiKeyRecord = {
	id: string;
	name: string;
	keyPrefix: string;
	fullKey: string;
	owner: string;
	email: string;
	status: "active" | "rate_limited" | "expired" | "revoked";
	permissions: "full" | "write" | "read";
	requests: string;
	requestsSort: number;
	lastUsed: string;
	lastUsedSort: number;
	createdAt: string;
	expiresAt: string;
	expiresSort: number;
};

const apiKeys: ApiKeyRecord[] = [
	{
		id: "key_1",
		name: "Production API",
		keyPrefix: "hm_prod_x4k2...",
		fullKey: "hm_prod_x4k2n9f8j3m1p5v7",
		owner: "Acme Corporation",
		email: "dev@acme.co",
		status: "active",
		permissions: "full",
		requests: "1.2M",
		requestsSort: 1200000,
		lastUsed: "2 minutes ago",
		lastUsedSort: 2,
		createdAt: "Jan 15, 2026",
		expiresAt: "Never",
		expiresSort: 99999999,
	},
	{
		id: "key_2",
		name: "Staging Environment",
		keyPrefix: "hm_stg_y7h9...",
		fullKey: "hm_stg_y7h9w2c4d6a8b0z1",
		owner: "Acme Corporation",
		email: "dev@acme.co",
		status: "active",
		permissions: "read",
		requests: "245K",
		requestsSort: 245000,
		lastUsed: "1 hour ago",
		lastUsedSort: 60,
		createdAt: "Feb 1, 2026",
		expiresAt: "Jun 1, 2026",
		expiresSort: 20260601,
	},
	{
		id: "key_3",
		name: "Mobile App",
		keyPrefix: "hm_mob_q3r5...",
		fullKey: "hm_mob_q3r5t7u9i1o3p5s7",
		owner: "TechStart Inc",
		email: "mobile@techstart.io",
		status: "rate_limited",
		permissions: "write",
		requests: "890K",
		requestsSort: 890000,
		lastUsed: "5 minutes ago",
		lastUsedSort: 5,
		createdAt: "Dec 10, 2025",
		expiresAt: "Dec 10, 2026",
		expiresSort: 20261210,
	},
	{
		id: "key_4",
		name: "Analytics Integration",
		keyPrefix: "hm_int_k8l0...",
		fullKey: "hm_int_k8l0m2n4v6b8c0x2",
		owner: "Design Studio",
		email: "ops@designstudio.com",
		status: "expired",
		permissions: "read",
		requests: "12K",
		requestsSort: 12000,
		lastUsed: "2 weeks ago",
		lastUsedSort: 20160,
		createdAt: "Aug 5, 2025",
		expiresAt: "Feb 5, 2026",
		expiresSort: 20260205,
	},
	{
		id: "key_5",
		name: "Webhook Handler",
		keyPrefix: "hm_whk_e4f6...",
		fullKey: "hm_whk_e4f6g8h0j2l4n6p8",
		owner: "Global Enterprises",
		email: "integrations@globalent.com",
		status: "revoked",
		permissions: "full",
		requests: "0",
		requestsSort: 0,
		lastUsed: "Never",
		lastUsedSort: 999999,
		createdAt: "Mar 1, 2026",
		expiresAt: "N/A",
		expiresSort: 99999998,
	},
];

const statusConfig = {
	active: {
		label: "Active",
		icon: CheckCircle2,
		className: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20",
	},
	rate_limited: {
		label: "Rate Limited",
		icon: AlertTriangle,
		className: "bg-amber-500/10 text-amber-600 border-amber-500/20",
	},
	expired: {
		label: "Expired",
		icon: Clock,
		className: "bg-gray-500/10 text-gray-600 border-gray-500/20",
	},
	revoked: {
		label: "Revoked",
		icon: XCircle,
		className: "bg-red-500/10 text-red-600 border-red-500/20",
	},
} satisfies Record<
	ApiKeyRecord["status"],
	{ label: string; icon: typeof CheckCircle2; className: string }
>;

const permissionConfig = {
	full: {
		label: "Full Access",
		className: "bg-purple-500/10 text-purple-600 border-purple-500/20",
	},
	write: {
		label: "Read/Write",
		className: "bg-blue-500/10 text-blue-600 border-blue-500/20",
	},
	read: {
		label: "Read Only",
		className: "bg-gray-500/10 text-gray-600 border-gray-500/20",
	},
} satisfies Record<ApiKeyRecord["permissions"], { label: string; className: string }>;

const metrics = [
	{
		title: "Total API Keys",
		value: "2,847",
		detail: "Across all accounts",
		icon: Key,
	},
	{
		title: "Active Keys",
		value: "2,412",
		detail: "Currently in use",
		delta: "+84 this month",
		icon: CheckCircle2,
		tone: "success" as const,
	},
	{
		title: "Total Requests",
		value: "2.4M",
		detail: "Last 30 days",
		delta: "+18% vs last month",
		icon: RefreshCw,
	},
	{
		title: "Rate Limited",
		value: "23",
		detail: "Exceeded quota",
		icon: AlertTriangle,
		tone: "warning" as const,
	},
];

function StatusBadge({ status }: { status: ApiKeyRecord["status"] }) {
	const config = statusConfig[status];

	return (
		<Badge variant="outline" className={cn("gap-1 rounded-full", config.className)}>
			<config.icon className="size-3" />
			{config.label}
		</Badge>
	);
}

function PermissionBadge({
	permission,
}: {
	permission: ApiKeyRecord["permissions"];
}) {
	const config = permissionConfig[permission];

	return (
		<Badge variant="outline" className={cn("rounded-full", config.className)}>
			{config.label}
		</Badge>
	);
}

export function AdminApiKeys() {
	const [visibleKeys, setVisibleKeys] = useState<Record<string, boolean>>({});

	const toggleKeyVisibility = (keyId: string) => {
		setVisibleKeys((current) => ({ ...current, [keyId]: !current[keyId] }));
	};

	const columns: DataTableColumn<ApiKeyRecord>[] = [
		{
			id: "key",
			label: "Key",
			width: 320,
			minWidth: 260,
			accessor: (apiKey) => {
				const isVisible = visibleKeys[apiKey.id];

				return (
					<div>
						<div className="font-medium">{apiKey.name}</div>
						<div className="mt-1 flex items-center gap-2 font-mono text-sm text-muted-foreground">
							<span>{isVisible ? apiKey.fullKey : apiKey.keyPrefix}</span>
							<button
								type="button"
								onClick={() => toggleKeyVisibility(apiKey.id)}
								className="text-muted-foreground transition-colors hover:text-foreground"
							>
								{isVisible ? (
									<EyeOff className="size-3.5" />
								) : (
									<Eye className="size-3.5" />
								)}
							</button>
							<button
								type="button"
								className="text-muted-foreground transition-colors hover:text-foreground"
							>
								<Copy className="size-3.5" />
							</button>
						</div>
					</div>
				);
			},
			getSortValue: (apiKey) => apiKey.name,
		},
		{
			id: "owner",
			label: "Owner",
			width: 220,
			accessor: (apiKey) => (
				<div>
					<div className="font-medium">{apiKey.owner}</div>
					<div className="mt-1 text-sm text-muted-foreground">{apiKey.email}</div>
				</div>
			),
			getSortValue: (apiKey) => apiKey.owner,
		},
		{
			id: "permissions",
			label: "Permissions",
			width: 160,
			accessor: (apiKey) => <PermissionBadge permission={apiKey.permissions} />,
			getSortValue: (apiKey) => apiKey.permissions,
		},
		{
			id: "status",
			label: "Status",
			width: 160,
			accessor: (apiKey) => <StatusBadge status={apiKey.status} />,
			getSortValue: (apiKey) => apiKey.status,
		},
		{
			id: "usage",
			label: "Usage",
			width: 150,
			accessor: (apiKey) => (
				<div>
					<div className="font-medium">{apiKey.requests}</div>
					<div className="mt-1 text-sm text-muted-foreground">{apiKey.lastUsed}</div>
				</div>
			),
			getSortValue: (apiKey) => apiKey.requestsSort,
		},
		{
			id: "expiresAt",
			label: "Expires",
			width: 150,
			accessor: (apiKey) => apiKey.expiresAt,
			getSortValue: (apiKey) => apiKey.expiresSort,
		},
	];

	return (
		<div className="space-y-6">
			<DashboardPageHeader
				eyebrow="Developer Tools"
				title="API Keys"
				description="Create and monitor API credentials with the same operational controls available on the user-side work queues."
				actions={
					<Dialog>
						<DialogTrigger asChild>
							<Button className="rounded-full border-0 bg-gradient-to-r from-amber-500 to-orange-600 text-white">
								<Plus className="size-4" />
								Create key
							</Button>
						</DialogTrigger>
						<DialogContent className="sm:max-w-[425px]">
							<DialogHeader>
								<DialogTitle>Create API Key</DialogTitle>
								<DialogDescription>
									Generate a new API key for programmatic access. Store it securely because the full token will not be shown again.
								</DialogDescription>
							</DialogHeader>
							<div className="grid gap-4 py-4">
								<div className="grid gap-2">
									<Label htmlFor="key-name">Key name</Label>
									<Input
										id="key-name"
										placeholder="Production API"
										className="rounded-xl"
									/>
								</div>
								<div className="grid gap-2">
									<Label htmlFor="key-owner">Owner</Label>
									<Input
										id="key-owner"
										placeholder="Select user or organization"
										className="rounded-xl"
									/>
								</div>
								<div className="grid gap-2">
									<Label htmlFor="permissions">Permissions</Label>
									<NativeSelect defaultValue="read" className="rounded-xl">
										<NativeSelectOption value="read">Read Only</NativeSelectOption>
										<NativeSelectOption value="write">Read/Write</NativeSelectOption>
										<NativeSelectOption value="full">Full Access</NativeSelectOption>
									</NativeSelect>
								</div>
								<div className="grid gap-2">
									<Label htmlFor="expiry">Expiration</Label>
									<NativeSelect defaultValue="never" className="rounded-xl">
										<NativeSelectOption value="never">Never</NativeSelectOption>
										<NativeSelectOption value="30">30 days</NativeSelectOption>
										<NativeSelectOption value="90">90 days</NativeSelectOption>
										<NativeSelectOption value="365">1 year</NativeSelectOption>
									</NativeSelect>
								</div>
							</div>
							<DialogFooter>
								<Button variant="outline" className="rounded-full">
									Cancel
								</Button>
								<Button className="rounded-full border-0 bg-gradient-to-r from-amber-500 to-orange-600 text-white">
									Generate key
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
					title="Credential inventory"
					description="Search credentials, filter by health or permission scope, and switch from audit table to compact grid cards."
					rows={apiKeys}
					columns={columns}
					getRowId={(apiKey) => apiKey.id}
					getSearchText={(apiKey) =>
						[
							apiKey.name,
							apiKey.owner,
							apiKey.email,
							apiKey.status,
							apiKey.permissions,
							apiKey.keyPrefix,
						].join(" ")
					}
					searchPlaceholder="Search API keys, owners, or permission scopes..."
					filters={[
						{
							id: "status",
							label: "Status",
							options: Object.entries(statusConfig).map(([value, config]) => ({
								label: config.label,
								value,
							})),
							getValue: (apiKey) => apiKey.status,
						},
						{
							id: "permissions",
							label: "Permissions",
							options: Object.entries(permissionConfig).map(
								([value, config]) => ({
									label: config.label,
									value,
								}),
							),
							getValue: (apiKey) => apiKey.permissions,
						},
					]}
					globalActions={[
						{ label: "Regenerate batch", icon: RefreshCw, variant: "outline" },
						{ label: "Permission review", icon: Shield, variant: "ghost" },
					]}
					rowActions={[
						{ label: "Copy key", icon: Copy },
						{ label: "Edit permissions", icon: Shield },
						{ label: "Regenerate", icon: RefreshCw },
						{ label: "Revoke key", icon: Trash2, destructive: true },
					]}
					emptyState={{
						title: "No API keys match the current view",
						description:
							"Adjust search or filters to bring the relevant credentials back into focus.",
					}}
					renderGridCard={(apiKey) => {
						const isVisible = visibleKeys[apiKey.id];

						return (
							<div className="space-y-4">
								<div className="flex items-start justify-between gap-3">
									<div>
										<div className="text-lg font-medium">{apiKey.name}</div>
										<div className="mt-1 text-sm text-muted-foreground">
											{apiKey.owner}
										</div>
									</div>
									<StatusBadge status={apiKey.status} />
								</div>
								<div className="flex flex-wrap gap-2">
									<PermissionBadge permission={apiKey.permissions} />
									<Badge variant="outline" className="rounded-full">
										{apiKey.expiresAt}
									</Badge>
								</div>
								<div className="rounded-2xl border border-[var(--brand-border-soft)] bg-background/70 px-4 py-3">
									<div className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
										Token
									</div>
									<div className="mt-2 flex items-center justify-between gap-3">
										<div className="min-w-0 truncate font-mono text-sm">
											{isVisible ? apiKey.fullKey : apiKey.keyPrefix}
										</div>
										<div className="flex items-center gap-1">
											<Button
												variant="ghost"
												size="icon-sm"
												onClick={() => toggleKeyVisibility(apiKey.id)}
											>
												{isVisible ? (
													<EyeOff className="size-4" />
												) : (
													<Eye className="size-4" />
												)}
											</Button>
											<Button variant="ghost" size="icon-sm">
												<Copy className="size-4" />
											</Button>
										</div>
									</div>
								</div>
								<div className="grid grid-cols-2 gap-3 text-sm">
									<div>
										<div className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
											Requests
										</div>
										<div className="mt-1 font-medium">{apiKey.requests}</div>
									</div>
									<div>
										<div className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
											Last used
										</div>
										<div className="mt-1">{apiKey.lastUsed}</div>
									</div>
								</div>
								<div className="flex items-center justify-between rounded-2xl border border-[var(--brand-border-soft)] bg-background/70 px-4 py-3 text-sm">
									<span>{apiKey.email}</span>
									<Button variant="ghost" size="icon-sm">
										<MoreHorizontal className="size-4" />
									</Button>
								</div>
							</div>
						);
					}}
				/>
			</SurfaceCard>
		</div>
	);
}
