import { Mail, ShieldCheck, UserCog, UserPlus, Users2 } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

import { SurfaceCard } from "@/components/app/brand";
import { DashboardPageHeader, DashboardPanel } from "@/components/app/dashboard";
import { DataTable, type DataTableColumn } from "@/components/app/data-table";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
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
import { useAuth } from "@/lib/auth-context";
import type {
	ApiListResponse,
	Role,
	WorkspaceInvite,
	WorkspaceMemberRecord,
	WorkspaceSummary,
} from "@/lib/api-types";
import { cn } from "@/lib/utils";

const memberStatusStyles: Record<string, string> = {
	active: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20",
	suspended: "bg-red-500/10 text-red-600 border-red-500/20",
	pending: "bg-amber-500/10 text-amber-600 border-amber-500/20",
};

function MemberIdentity({ record }: { record: WorkspaceMemberRecord }) {
	return (
		<div className="flex items-center gap-3">
			<Avatar className="size-9">
				<AvatarFallback className="bg-gradient-brand text-white">
					{record.user.fullName
						.split(" ")
						.map((part) => part[0])
						.join("")}
				</AvatarFallback>
			</Avatar>
			<div className="min-w-0">
				<div className="font-medium">{record.user.fullName}</div>
				<div className="truncate text-sm text-muted-foreground">{record.user.email}</div>
			</div>
		</div>
	);
}

function MemberStatusBadge({ status }: { status: string }) {
	return (
		<Badge
			variant="outline"
			className={cn(
				"rounded-full capitalize",
				memberStatusStyles[status] ?? "bg-muted text-foreground",
			)}
		>
			{status}
		</Badge>
	);
}

function RoleList({ roles }: { roles: Role[] }) {
	return (
		<div className="flex flex-wrap gap-2">
			{roles.map((role) => (
				<Badge key={role.id} variant="outline" className="rounded-full">
					{role.label}
				</Badge>
			))}
		</div>
	);
}

export function DashboardTeam() {
	const { activeWorkspaceId, customerRequest, hasCustomerPermission } = useAuth();
	const [workspace, setWorkspace] = useState<WorkspaceSummary | null>(null);
	const [members, setMembers] = useState<WorkspaceMemberRecord[]>([]);
	const [invites, setInvites] = useState<WorkspaceInvite[]>([]);
	const [roles, setRoles] = useState<Role[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [inviteEmail, setInviteEmail] = useState("");
	const [selectedRoleCodes, setSelectedRoleCodes] = useState<string[]>([]);
	const [editTarget, setEditTarget] = useState<WorkspaceMemberRecord | null>(null);
	const [editStatus, setEditStatus] = useState("active");
	const [editRoleCodes, setEditRoleCodes] = useState<string[]>([]);

	const canManageMembers = hasCustomerPermission(
		"workspace.members.manage",
		workspace?.capabilities,
	);

	async function loadData() {
		if (!activeWorkspaceId) {
			return;
		}
		setLoading(true);
		setError(null);
		try {
			const [workspaceResponse, memberResponse, inviteResponse, roleResponse] =
				await Promise.all([
					customerRequest<WorkspaceSummary>(`/workspaces/${activeWorkspaceId}`),
					customerRequest<ApiListResponse<WorkspaceMemberRecord>>(
						`/workspaces/${activeWorkspaceId}/members`,
					),
					customerRequest<ApiListResponse<WorkspaceInvite>>(
						`/workspaces/${activeWorkspaceId}/invites`,
					),
					customerRequest<ApiListResponse<Role>>(
						`/workspaces/${activeWorkspaceId}/roles`,
					),
				]);
			setWorkspace(workspaceResponse);
			setMembers(memberResponse.items);
			setInvites(inviteResponse.items);
			setRoles(roleResponse.items);
		} catch (loadError) {
			setError(loadError instanceof Error ? loadError.message : "Unable to load team data.");
		} finally {
			setLoading(false);
		}
	}

	useEffect(() => {
		void loadData();
	}, [activeWorkspaceId]);

	const inviteRoleCodes = useMemo(
		() => (selectedRoleCodes.length ? selectedRoleCodes : ["content_manager"]),
		[selectedRoleCodes],
	);

	async function sendInvite() {
		if (!activeWorkspaceId) {
			return;
		}
		await customerRequest(`/workspaces/${activeWorkspaceId}/invites`, {
			method: "POST",
			body: {
				email: inviteEmail,
				roleCodes: inviteRoleCodes,
			},
		});
		setInviteEmail("");
		setSelectedRoleCodes([]);
		await loadData();
	}

	async function updateMember() {
		if (!activeWorkspaceId || !editTarget) {
			return;
		}
		await customerRequest(
			`/workspaces/${activeWorkspaceId}/members/${editTarget.membershipId}`,
			{
				method: "PATCH",
				body: {
					status: editStatus,
					roleCodes: editRoleCodes,
				},
			},
		);
		setEditTarget(null);
		await loadData();
	}

	const columns: DataTableColumn<WorkspaceMemberRecord>[] = [
		{
			id: "member",
			label: "Member",
			width: 280,
			accessor: (record) => <MemberIdentity record={record} />,
			getSortValue: (record) => record.user.fullName,
		},
		{
			id: "roles",
			label: "Roles",
			width: 260,
			accessor: (record) => <RoleList roles={record.roles} />,
			getSortValue: (record) => record.roles.map((role) => role.label).join(", "),
		},
		{
			id: "status",
			label: "Status",
			width: 140,
			accessor: (record) => <MemberStatusBadge status={record.status} />,
			getSortValue: (record) => record.status,
		},
	];

	return (
		<div className="space-y-6">
			<DashboardPageHeader
				eyebrow="Workspace Access"
				title="Team"
				description="Invite members, assign multiple preset roles, and manage workspace access from one surface."
				actions={
					canManageMembers ? (
						<Dialog>
							<DialogTrigger asChild>
								<Button className="rounded-full bg-gradient-brand text-white border-0">
									<UserPlus className="size-4" />
									Invite member
								</Button>
							</DialogTrigger>
							<DialogContent>
								<DialogHeader>
									<DialogTitle>Invite member</DialogTitle>
									<DialogDescription>
										Send a workspace invitation with one or more preset roles.
									</DialogDescription>
								</DialogHeader>
								<div className="grid gap-4 py-2">
									<div className="grid gap-2">
										<Label htmlFor="invite-email">Email</Label>
										<Input
											id="invite-email"
											value={inviteEmail}
											onChange={(event) => setInviteEmail(event.target.value)}
											className="rounded-xl"
											placeholder="operator@company.com"
										/>
									</div>
									<div className="space-y-3">
										<Label>Roles</Label>
										<div className="grid gap-3 rounded-2xl border border-[var(--brand-border-soft)] bg-background/60 p-4">
											{roles.map((role) => {
												const checked = selectedRoleCodes.includes(role.code);
												return (
													<label key={role.id} className="flex items-start gap-3">
														<Checkbox
															checked={checked}
															onCheckedChange={(nextChecked) =>
																setSelectedRoleCodes((current) =>
																	nextChecked
																		? [...current, role.code]
																		: current.filter((code) => code !== role.code),
																)
															}
														/>
														<div>
															<div className="font-medium">{role.label}</div>
															<div className="text-sm text-muted-foreground">
																{role.permissions.map((permission) => permission.label).slice(0, 3).join(", ")}
															</div>
														</div>
													</label>
												);
											})}
										</div>
									</div>
								</div>
								<DialogFooter>
									<Button variant="outline" className="rounded-full">
										Cancel
									</Button>
									<Button
										className="rounded-full bg-gradient-brand text-white border-0"
										onClick={() => void sendInvite()}
									>
										Send invite
									</Button>
								</DialogFooter>
							</DialogContent>
						</Dialog>
					) : null
				}
			/>

			<DashboardPanel
				title={workspace?.name ?? "Workspace team"}
				description="Member roles are additive, so a person can combine billing, analytics, and content responsibilities without a custom-role editor."
			>
				<DataTable
					title="Member directory"
					description="Search members, inspect multi-role assignments, and change workspace access state."
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
					loading={loading}
					error={error}
					searchPlaceholder="Search workspace members..."
					emptyState={{
						title: "No members in this workspace",
						description: "Send the first invite to begin building the team.",
					}}
					rowActions={
						canManageMembers
							? [
									{
										label: "Edit access",
										icon: UserCog,
										onClick: (record) => {
											setEditTarget(record);
											setEditStatus(record.status);
											setEditRoleCodes(record.roles.map((role) => role.code));
										},
									},
								]
							: []
					}
					renderGridCard={(record) => (
						<div className="space-y-4">
							<div className="flex items-start justify-between gap-3">
								<MemberIdentity record={record} />
								<MemberStatusBadge status={record.status} />
							</div>
							<RoleList roles={record.roles} />
						</div>
					)}
				/>
			</DashboardPanel>

			<DashboardPanel
				title="Pending invites"
				description="Track who has been invited and which role bundles will be granted on acceptance."
			>
				<div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
					{invites.map((invite) => (
						<SurfaceCard key={invite.id} tone="muted" className="space-y-4 p-5">
							<div className="flex items-start justify-between gap-3">
								<div className="flex size-10 items-center justify-center rounded-2xl bg-primary/10 text-primary">
									<Mail className="size-4" />
								</div>
								<MemberStatusBadge status={invite.status} />
							</div>
							<div>
								<div className="font-medium">{invite.email}</div>
								<div className="text-sm text-muted-foreground">
									Expires {new Date(invite.expiresAt).toLocaleDateString()}
								</div>
							</div>
							<RoleList roles={invite.roles} />
						</SurfaceCard>
					))}
					{!invites.length ? (
						<SurfaceCard tone="muted" className="p-5">
							<div className="flex size-10 items-center justify-center rounded-2xl bg-primary/10 text-primary">
								<Users2 className="size-4" />
							</div>
							<div className="mt-4 font-medium">No pending invites</div>
							<div className="mt-2 text-sm text-muted-foreground">
								New invitations will appear here with their selected role bundles.
							</div>
						</SurfaceCard>
					) : null}
				</div>
			</DashboardPanel>

			<Dialog open={Boolean(editTarget)} onOpenChange={(open) => !open && setEditTarget(null)}>
				<DialogContent>
					<DialogHeader>
						<DialogTitle>Edit member access</DialogTitle>
						<DialogDescription>
							Update status and preset role assignments for this workspace member.
						</DialogDescription>
					</DialogHeader>
					<div className="grid gap-4 py-2">
						<div className="rounded-2xl border border-[var(--brand-border-soft)] bg-background/70 p-4">
							<div className="font-medium">{editTarget?.user.fullName}</div>
							<div className="text-sm text-muted-foreground">{editTarget?.user.email}</div>
						</div>
						<div className="grid gap-2">
							<Label htmlFor="member-status">Status</Label>
							<NativeSelect
								id="member-status"
								value={editStatus}
								onChange={(event) => setEditStatus(event.target.value)}
								className="rounded-xl"
							>
								<NativeSelectOption value="active">Active</NativeSelectOption>
								<NativeSelectOption value="suspended">Suspended</NativeSelectOption>
							</NativeSelect>
						</div>
						<div className="space-y-3">
							<Label>Roles</Label>
							<div className="grid gap-3 rounded-2xl border border-[var(--brand-border-soft)] bg-background/60 p-4">
								{roles.map((role) => {
									const checked = editRoleCodes.includes(role.code);
									return (
										<label key={role.id} className="flex items-start gap-3">
											<Checkbox
												checked={checked}
												onCheckedChange={(nextChecked) =>
													setEditRoleCodes((current) =>
														nextChecked
															? [...current, role.code]
															: current.filter((code) => code !== role.code),
													)
												}
											/>
											<div>
												<div className="font-medium">{role.label}</div>
												<div className="text-sm text-muted-foreground">
													{role.permissions.map((permission) => permission.label).slice(0, 3).join(", ")}
												</div>
											</div>
										</label>
									);
								})}
							</div>
						</div>
					</div>
					<DialogFooter>
						<Button variant="outline" className="rounded-full">
							Cancel
						</Button>
						<Button className="rounded-full bg-gradient-brand text-white border-0" onClick={() => void updateMember()}>
							<ShieldCheck className="size-4" />
							Save access
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>
		</div>
	);
}
