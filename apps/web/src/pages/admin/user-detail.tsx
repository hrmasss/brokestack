import {
	ArrowLeft,
	BriefcaseBusiness,
	Building2,
	CalendarDays,
	Mail,
	PencilLine,
	ShieldCheck,
	ShieldUser,
	ToggleLeft,
	ToggleRight,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router";

import { SurfaceCard } from "@/components/app/brand";
import { DashboardPageHeader } from "@/components/app/dashboard";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth-context";
import type { PlatformUserRecord } from "@/lib/api-types";
import { cn } from "@/lib/utils";

function getPlatformRoles(record: PlatformUserRecord) {
	return record.platformRoles ?? [];
}

const statusConfig: Record<string, string> = {
	active: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20",
	pending: "bg-amber-500/10 text-amber-600 border-amber-500/20",
	suspended: "bg-red-500/10 text-red-600 border-red-500/20",
};

function StatusBadge({ status }: { status: string }) {
	return (
		<Badge
			variant="outline"
			className={cn(
				"rounded-full capitalize",
				statusConfig[status] ?? "bg-muted text-foreground",
			)}
		>
			{status}
		</Badge>
	);
}

function getUserType(record: PlatformUserRecord) {
	const platformRoles = getPlatformRoles(record);
	if (platformRoles.length && record.workspaceCount) {
		return "Hybrid access";
	}
	if (platformRoles.length) {
		return "Platform staff";
	}
	return "Client user";
}

export function AdminUserDetailPage() {
	const navigate = useNavigate();
	const { id = "" } = useParams();
	const { platformRequest, hasPlatformPermission, platformSession } = useAuth();
	const [record, setRecord] = useState<PlatformUserRecord | null>(null);
	const [loading, setLoading] = useState(true);
	const [saving, setSaving] = useState(false);
	const [error, setError] = useState<string | null>(null);

	async function loadRecord() {
		setLoading(true);
		setError(null);
		try {
			const response = await platformRequest<PlatformUserRecord>(
				`/platform/users/${id}`,
			);
			setRecord(response);
		} catch (loadError) {
			setError(
				loadError instanceof Error
					? loadError.message
					: "Unable to load the platform user.",
			);
		} finally {
			setLoading(false);
		}
	}

	useEffect(() => {
		void loadRecord();
	}, [id, platformRequest]);

	async function toggleStatus() {
		if (!record) {
			return;
		}
		setSaving(true);
		setError(null);
		const nextStatus = record.user.status === "active" ? "suspended" : "active";
		try {
			const updated = await platformRequest<PlatformUserRecord>(
				`/platform/users/${id}`,
				{
					method: "PATCH",
						body: {
							fullName: record.user.fullName,
							status: nextStatus,
							roleCodes: getPlatformRoles(record).map((role) => role.code),
						},
					},
			);
			setRecord(updated);
		} catch (toggleError) {
			setError(
				toggleError instanceof Error
					? toggleError.message
					: "Unable to update this user.",
			);
		} finally {
			setSaving(false);
		}
	}

	async function openCustomerPortal() {
		if (!record || record.workspaceCount === 0) {
			return;
		}
		const endpoint =
			record.user.id === platformSession?.user.id
				? "/platform/customer-access"
				: `/platform/users/${record.user.id}/impersonate`;
		await platformRequest(endpoint, { method: "POST" });
		window.open("/dashboard", "_blank", "noopener,noreferrer");
	}

	const createdLabel = useMemo(() => {
		if (!record) {
			return "";
		}
		return new Date(record.user.createdAt).toLocaleString();
	}, [record]);

	const platformRoles = record ? getPlatformRoles(record) : [];

	return (
		<div className="space-y-6">
			<DashboardPageHeader
				eyebrow="User Directory"
				title={record?.user.fullName ?? "User detail"}
				description={
					record
						? "Review platform access, customer workspace associations, and lifecycle state from one dedicated page."
						: "Inspect the user profile and linked workspace memberships."
				}
				actions={
					<>
						<Button variant="outline" className="rounded-full" asChild>
							<Link to="/admin/users">
								<ArrowLeft className="size-4" />
								Back to users
							</Link>
						</Button>
						{record && hasPlatformPermission("platform.users.manage") ? (
							<Button variant="outline" className="rounded-full" asChild>
								<Link to={`/admin/users/${id}/edit`}>
									<PencilLine className="size-4" />
									Edit user
								</Link>
							</Button>
						) : null}
						{record &&
						record.workspaceCount > 0 &&
						(record.user.id === platformSession?.user.id ||
							hasPlatformPermission("platform.support.assume_user")) ? (
							<Button
								variant="outline"
								className="rounded-full"
								onClick={() => void openCustomerPortal()}
							>
								<ShieldUser className="size-4" />
								{record.user.id === platformSession?.user.id
									? "Open dashboard"
									: "Impersonate user"}
							</Button>
						) : null}
						{record && hasPlatformPermission("platform.users.manage") ? (
							<Button
								className="rounded-full border-0 bg-gradient-to-r from-amber-500 to-orange-600 text-white"
								onClick={() => void toggleStatus()}
								disabled={saving || record.user.id === platformSession?.user.id}
								title={
									record.user.id === platformSession?.user.id
										? "You cannot suspend your own platform account."
										: undefined
								}
							>
								{record.user.status === "active" ? (
									<ToggleLeft className="size-4" />
								) : (
									<ToggleRight className="size-4" />
								)}
								{record.user.status === "active" ? "Suspend user" : "Activate user"}
							</Button>
						) : null}
					</>
				}
			/>

			{error ? (
				<SurfaceCard className="border border-destructive/20 bg-destructive/10 p-4 text-sm text-destructive">
					{error}
				</SurfaceCard>
			) : null}

			<div className="grid gap-4 xl:grid-cols-[1.2fr_0.8fr]">
				<SurfaceCard className="p-6">
					{loading || !record ? (
						<div className="text-sm text-muted-foreground">Loading user details...</div>
					) : (
						<div className="space-y-6">
							<div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
								<div className="flex items-center gap-4">
									<Avatar className="size-14">
										<AvatarFallback className="bg-gradient-to-br from-amber-500 to-orange-600 text-base text-white">
											{record.user.fullName
												.split(" ")
												.map((part) => part[0])
												.join("")
												.slice(0, 2)}
										</AvatarFallback>
									</Avatar>
									<div className="space-y-1">
										<div className="text-2xl font-semibold">
											{record.user.fullName}
										</div>
										<div className="flex items-center gap-2 text-sm text-muted-foreground">
											<Mail className="size-4" />
											{record.user.email}
										</div>
									</div>
								</div>
								<StatusBadge status={record.user.status} />
							</div>

							<div className="grid gap-4 md:grid-cols-3">
								<div className="rounded-[24px] border border-[var(--brand-border-soft)] bg-background/55 p-4">
									<div className="flex items-center gap-2 text-sm uppercase tracking-[0.18em] text-muted-foreground">
										<BriefcaseBusiness className="size-4" />
										User type
									</div>
									<div className="mt-3 text-sm font-medium">
										{getUserType(record)}
									</div>
								</div>
								<div className="rounded-[24px] border border-[var(--brand-border-soft)] bg-background/55 p-4">
									<div className="text-sm uppercase tracking-[0.18em] text-muted-foreground">
										Platform roles
									</div>
									<div className="mt-3 text-3xl font-semibold">
										{platformRoles.length}
									</div>
								</div>
								<div className="rounded-[24px] border border-[var(--brand-border-soft)] bg-background/55 p-4">
									<div className="text-sm uppercase tracking-[0.18em] text-muted-foreground">
										Workspace links
									</div>
									<div className="mt-3 text-3xl font-semibold">
										{record.workspaceCount}
									</div>
								</div>
								<div className="rounded-[24px] border border-[var(--brand-border-soft)] bg-background/55 p-4 md:col-span-3">
									<div className="flex items-center gap-2 text-sm uppercase tracking-[0.18em] text-muted-foreground">
										<CalendarDays className="size-4" />
										Created
									</div>
									<div className="mt-3 text-sm font-medium">{createdLabel}</div>
								</div>
							</div>

							<div className="space-y-3">
								<div className="text-lg font-semibold">Role coverage</div>
								<div className="grid gap-3">
									{platformRoles.length ? (
										platformRoles.map((role) => (
											<div
												key={role.id}
												className="rounded-[24px] border border-[var(--brand-border-soft)] bg-background/55 p-4"
											>
												<div className="flex items-center gap-2 font-medium">
													<ShieldCheck className="size-4 text-amber-600" />
													{role.label}
												</div>
												<div className="mt-1 text-sm text-muted-foreground">
													{role.code}
												</div>
												<div className="mt-3 flex flex-wrap gap-2">
													{role.permissions.map((permission) => (
														<Badge
															key={permission.code}
															variant="outline"
															className="rounded-full"
														>
															{permission.label}
														</Badge>
													))}
												</div>
											</div>
										))
									) : (
										<div className="rounded-[24px] border border-[var(--brand-border-soft)] bg-background/55 p-4 text-sm text-muted-foreground">
											This person has no platform role yet. They can still exist as a
											customer user.
										</div>
									)}
								</div>
							</div>
						</div>
					)}
				</SurfaceCard>

				<SurfaceCard className="p-6">
					<div className="space-y-4">
						<div>
							<div className="text-lg font-semibold">Workspace associations</div>
							<div className="mt-1 text-sm text-muted-foreground">
								Open the workspace when you need to manage the tenant-side
								association.
							</div>
						</div>
						{loading || !record ? (
							<div className="text-sm text-muted-foreground">
								Loading associations...
							</div>
						) : record.workspaceMemberships?.length ? (
							<div className="space-y-3">
								{record.workspaceMemberships.map((membership) => (
									<button
										key={membership.id}
										type="button"
										onClick={() =>
											navigate(`/admin/workspaces/${membership.workspaceId}`)
										}
										className="w-full rounded-[24px] border border-[var(--brand-border-soft)] bg-background/55 p-4 text-left transition-colors hover:bg-accent/20"
									>
										<div className="flex items-center justify-between gap-3">
											<div>
												<div className="flex items-center gap-2 font-medium">
													<Building2 className="size-4 text-amber-600" />
													{membership.workspaceName}
												</div>
												<div className="mt-1 text-sm text-muted-foreground">
													{membership.workspaceSlug}
												</div>
											</div>
											<StatusBadge status={membership.status} />
										</div>
										<div className="mt-3 flex flex-wrap gap-2">
											{membership.roles.map((role) => (
												<Badge
													key={role.id}
													variant="outline"
													className="rounded-full"
												>
													{role.label}
												</Badge>
											))}
										</div>
									</button>
								))}
							</div>
						) : (
							<div className="rounded-[24px] border border-[var(--brand-border-soft)] bg-background/55 p-4 text-sm text-muted-foreground">
								No workspace association exists for this person yet.
							</div>
						)}
					</div>
				</SurfaceCard>
			</div>
		</div>
	);
}
