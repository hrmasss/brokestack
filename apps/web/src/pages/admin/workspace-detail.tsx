import {
	ArrowRight,
	Building2,
	PencilLine,
	Shield,
	Users,
} from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router";

import { SurfaceCard } from "@/components/app/brand";
import { DashboardPageHeader } from "@/components/app/dashboard";
import { DataTable, type DataTableColumn } from "@/components/app/data-table";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth-context";
import type {
	ApiListResponse,
	PlatformWorkspaceRecord,
	WorkspaceMemberRecord,
} from "@/lib/api-types";
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

export function AdminWorkspaceDetailPage() {
	const navigate = useNavigate();
	const { id = "" } = useParams();
	const { platformRequest, hasPlatformPermission } = useAuth();
	const [workspace, setWorkspace] = useState<PlatformWorkspaceRecord | null>(null);
	const [members, setMembers] = useState<WorkspaceMemberRecord[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		let cancelled = false;

		async function load() {
			setLoading(true);
			setError(null);
			try {
				const [workspaceResponse, membersResponse] = await Promise.all([
					platformRequest<PlatformWorkspaceRecord>(`/platform/workspaces/${id}`),
					platformRequest<ApiListResponse<WorkspaceMemberRecord>>(
						`/platform/workspaces/${id}/members`,
					),
				]);
				if (cancelled) {
					return;
				}
				setWorkspace(workspaceResponse);
				setMembers(membersResponse.items);
			} catch (loadError) {
				if (!cancelled) {
					setError(
						loadError instanceof Error
							? loadError.message
							: "Unable to load workspace details.",
					);
				}
			} finally {
				if (!cancelled) {
					setLoading(false);
				}
			}
		}

		void load();
		return () => {
			cancelled = true;
		};
	}, [id, platformRequest]);

	async function assumeWorkspace() {
		await platformRequest(`/platform/workspaces/${id}/assume-access`, {
			method: "POST",
		});
		window.open("/dashboard", "_blank", "noopener,noreferrer");
	}

	const columns: DataTableColumn<WorkspaceMemberRecord>[] = [
		{
			id: "user",
			label: "Member",
			width: 260,
			accessor: (record) => (
				<div className="flex items-center gap-3">
					<Avatar className="size-9">
						<AvatarFallback className="bg-gradient-to-br from-amber-500 to-orange-600 text-sm text-white">
							{record.user.fullName
								.split(" ")
								.map((part) => part[0])
								.join("")
								.slice(0, 2)}
						</AvatarFallback>
					</Avatar>
					<div className="min-w-0">
						<div className="font-medium">{record.user.fullName}</div>
						<div className="truncate text-sm text-muted-foreground">
							{record.user.email}
						</div>
					</div>
				</div>
			),
			getSortValue: (record) => record.user.fullName,
		},
		{
			id: "roles",
			label: "Workspace roles",
			width: 260,
			accessor: (record) => (
				<div className="flex flex-wrap gap-2">
					{record.roles.map((role) => (
						<Badge key={role.id} variant="outline" className="rounded-full">
							{role.label}
						</Badge>
					))}
				</div>
			),
			getSortValue: (record) => record.roles.map((role) => role.label).join(", "),
		},
		{
			id: "status",
			label: "Membership",
			width: 140,
			accessor: (record) => <StatusBadge status={record.status} />,
			getSortValue: (record) => record.status,
		},
	];

	return (
		<div className="space-y-6">
			<DashboardPageHeader
				eyebrow="Tenant Management"
				title={workspace?.name ?? "Workspace"}
				description={
					workspace
						? `Manage tenant identity, member associations, and support access for ${workspace.name}.`
						: "Review the current workspace and its membership graph."
				}
				actions={
					<>
						{hasPlatformPermission("platform.workspaces.manage") ? (
							<Button variant="outline" className="rounded-full" asChild>
								<Link to={`/admin/workspaces/${id}/edit`}>
									<PencilLine className="size-4" />
									Edit workspace
								</Link>
							</Button>
						) : null}
						{hasPlatformPermission("platform.workspaces.manage") ? (
							<Button variant="outline" className="rounded-full" asChild>
								<Link to={`/admin/workspaces/${id}/members/new`}>
									<Users className="size-4" />
									Add member
								</Link>
							</Button>
						) : null}
						{hasPlatformPermission("platform.support.assume_workspace") ? (
							<Button
								className="rounded-full border-0 bg-gradient-to-r from-amber-500 to-orange-600 text-white"
								onClick={() => void assumeWorkspace()}
							>
								<Shield className="size-4" />
								Assume workspace
							</Button>
						) : null}
					</>
				}
			/>

			<div className="grid gap-4 xl:grid-cols-3">
				<SurfaceCard className="p-5">
					<div className="flex size-11 items-center justify-center rounded-2xl bg-amber-500/10 text-amber-600">
						<Building2 className="size-5" />
					</div>
					<div className="mt-4 text-sm uppercase tracking-[0.18em] text-muted-foreground">
						Workspace slug
					</div>
					<div className="mt-2 text-xl font-semibold">
						{workspace?.slug ?? "Loading..."}
					</div>
				</SurfaceCard>
				<SurfaceCard className="p-5">
					<div className="text-sm uppercase tracking-[0.18em] text-muted-foreground">
						Member count
					</div>
					<div className="mt-2 text-3xl font-semibold">
						{workspace?.memberCount ?? 0}
					</div>
					<div className="mt-2 text-sm text-muted-foreground">
						{workspace?.activeMemberCount ?? 0} active members
					</div>
				</SurfaceCard>
				<SurfaceCard className="p-5">
					<div className="text-sm uppercase tracking-[0.18em] text-muted-foreground">
						Workspace state
					</div>
					<div className="mt-3">
						<StatusBadge status={workspace?.status ?? "active"} />
					</div>
					<div className="mt-3 text-sm text-muted-foreground">
						Suspend the workspace from its edit page if the tenant should lose access.
					</div>
				</SurfaceCard>
			</div>

			<SurfaceCard className="p-5 md:p-6">
				<DataTable
					title="Workspace associations"
					description="Create new workspace users, attach existing users, and adjust their role mix from dedicated forms."
					rows={members}
					columns={columns}
					getRowId={(record) => record.membershipId}
					getSearchText={(record) =>
						[
							record.user.fullName,
							record.user.email,
							record.status,
							record.roles.map((role) => role.label).join(" "),
						].join(" ")
					}
					searchPlaceholder="Search members or roles..."
					loading={loading}
					error={error}
					emptyState={{
						title: "No workspace members yet",
						description:
							"Use the dedicated member form to create or associate the first user.",
					}}
					rowActions={
						hasPlatformPermission("platform.workspaces.manage")
							? [
									{
										label: "Edit association",
										icon: ArrowRight,
										onClick: (record) =>
											navigate(
												`/admin/workspaces/${id}/members/${record.membershipId}/edit`,
											),
									},
								]
							: []
					}
					renderGridCard={(record) => (
						<div className="space-y-4">
							<div className="flex items-start justify-between gap-3">
								<div>
									<div className="font-medium">{record.user.fullName}</div>
									<div className="text-sm text-muted-foreground">
										{record.user.email}
									</div>
								</div>
								<StatusBadge status={record.status} />
							</div>
							<div className="flex flex-wrap gap-2">
								{record.roles.map((role) => (
									<Badge key={role.id} variant="outline" className="rounded-full">
										{role.label}
									</Badge>
								))}
							</div>
						</div>
					)}
				/>
			</SurfaceCard>
		</div>
	);
}
