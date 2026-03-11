import { Building2, PencilLine, Shield, Users } from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router";

import { SurfaceCard } from "@/components/app/brand";
import { DashboardPageHeader } from "@/components/app/dashboard";
import { DataTable, type DataTableColumn } from "@/components/app/data-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth-context";
import type { ApiListResponse, PlatformWorkspaceRecord } from "@/lib/api-types";
import { cn } from "@/lib/utils";

const statusStyles = {
	active: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20",
	suspended: "bg-red-500/10 text-red-600 border-red-500/20",
};

function StatusBadge({ status }: { status: string }) {
	return (
		<Badge
			variant="outline"
			className={cn(
				"rounded-full capitalize",
				statusStyles[status as keyof typeof statusStyles] ??
					"bg-muted text-foreground",
			)}
		>
			{status}
		</Badge>
	);
}

export function AdminWorkspaces() {
	const navigate = useNavigate();
	const { platformRequest, hasPlatformPermission } = useAuth();
	const [workspaces, setWorkspaces] = useState<PlatformWorkspaceRecord[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	async function loadWorkspaces() {
		setLoading(true);
		setError(null);
		try {
			const response =
				await platformRequest<ApiListResponse<PlatformWorkspaceRecord>>(
					"/platform/workspaces",
				);
			setWorkspaces(response.items);
		} catch (loadError) {
			setError(loadError instanceof Error ? loadError.message : "Unable to load workspaces.");
		} finally {
			setLoading(false);
		}
	}

	useEffect(() => {
		void loadWorkspaces();
	}, []);

	async function assumeWorkspace(workspaceId: string) {
		await platformRequest(`/platform/workspaces/${workspaceId}/assume-access`, {
			method: "POST",
		});
		window.open("/dashboard", "_blank", "noopener,noreferrer");
	}

	const columns: DataTableColumn<PlatformWorkspaceRecord>[] = [
		{
			id: "workspace",
			label: "Workspace",
			width: 260,
			accessor: (workspace) => (
				<div>
					<div className="font-medium">{workspace.name}</div>
					<div className="text-sm text-muted-foreground">{workspace.slug}</div>
				</div>
			),
			getSortValue: (workspace) => workspace.name,
		},
		{
			id: "status",
			label: "Status",
			width: 140,
			accessor: (workspace) => <StatusBadge status={workspace.status} />,
			getSortValue: (workspace) => workspace.status,
		},
		{
			id: "members",
			label: "Members",
			width: 120,
			accessor: (workspace) => String(workspace.memberCount),
			getSortValue: (workspace) => workspace.memberCount,
		},
		{
			id: "activeMembers",
			label: "Active",
			width: 120,
			accessor: (workspace) => String(workspace.activeMemberCount),
			getSortValue: (workspace) => workspace.activeMemberCount,
		},
	];

	return (
		<div className="space-y-6">
			<DashboardPageHeader
				eyebrow="Tenant Management"
				title="Workspaces"
				description="Create, update, suspend, and support customer workspaces from the platform control surface."
				actions={
					hasPlatformPermission("platform.workspaces.manage") ? (
						<Button
							className="rounded-full border-0 bg-gradient-to-r from-amber-500 to-orange-600 text-white"
							asChild
						>
							<Link to="/admin/workspaces/new">
								<Building2 className="size-4" />
								New workspace
							</Link>
						</Button>
					) : null
				}
			/>

			<SurfaceCard className="p-5 md:p-6">
				<DataTable
					title="Workspace directory"
					description="Inspect customer tenancy health, member counts, and launch support sessions when a customer needs help."
					rows={workspaces}
					columns={columns}
					getRowId={(workspace) => workspace.id}
					getSearchText={(workspace) =>
						[
							workspace.name,
							workspace.slug,
							workspace.status,
							String(workspace.memberCount),
						].join(" ")
					}
					searchPlaceholder="Search workspaces or slugs..."
					loading={loading}
					error={error}
					emptyState={{
						title: "No workspaces found",
						description: "Create the first managed workspace to populate the directory.",
					}}
					rowActions={[
						{
							label: "Manage members",
							icon: Users,
							onClick: (workspace) => navigate(`/admin/workspaces/${workspace.id}`),
						},
						{
							label: "Edit workspace",
							icon: PencilLine,
							onClick: (workspace) =>
								navigate(`/admin/workspaces/${workspace.id}/edit`),
						},
						{
							label: "Assume workspace",
							icon: Shield,
							onClick: (workspace) => void assumeWorkspace(workspace.id),
						},
					]}
					renderGridCard={(workspace) => (
						<div className="space-y-4">
							<div className="flex items-start justify-between gap-3">
								<div className="flex size-12 items-center justify-center rounded-2xl bg-amber-500/10 text-amber-600">
									<Building2 className="size-5" />
								</div>
								<StatusBadge status={workspace.status} />
							</div>
							<div>
								<div className="text-lg font-medium">{workspace.name}</div>
								<div className="text-sm text-muted-foreground">{workspace.slug}</div>
							</div>
							<div className="grid grid-cols-2 gap-3 text-sm">
								<div>
									<div className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
										Members
									</div>
									<div className="mt-1">{workspace.memberCount}</div>
								</div>
								<div>
									<div className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
										Active
									</div>
									<div className="mt-1">{workspace.activeMemberCount}</div>
								</div>
							</div>
						</div>
					)}
				/>
			</SurfaceCard>
		</div>
	);
}
