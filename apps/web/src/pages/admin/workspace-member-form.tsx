import {
	ArrowLeft,
	Link2,
	LoaderCircle,
	Mail,
	ShieldCheck,
	Users,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router";

import { AdminFormPage, AdminFormSection } from "@/components/admin/form-page";
import { SurfaceCard } from "@/components/app/brand";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { useAuth } from "@/lib/auth-context";
import type {
	ApiListResponse,
	PlatformWorkspaceRecord,
	Role,
	WorkspaceMemberRecord,
} from "@/lib/api-types";
import { cn } from "@/lib/utils";

function toggleRole(current: string[], roleCode: string, checked: boolean) {
	if (checked) {
		return current.includes(roleCode) ? current : [...current, roleCode];
	}
	return current.filter((item) => item !== roleCode);
}

export function AdminWorkspaceMemberFormPage({
	mode,
}: {
	mode: "create" | "edit";
}) {
	const navigate = useNavigate();
	const { id = "", membershipId = "" } = useParams();
	const { platformRequest } = useAuth();
	const isCreate = mode === "create";

	const [workspace, setWorkspace] = useState<PlatformWorkspaceRecord | null>(null);
	const [roles, setRoles] = useState<Role[]>([]);
	const [membership, setMembership] = useState<WorkspaceMemberRecord | null>(null);
	const [userMode, setUserMode] = useState<"new" | "existing">("new");
	const [fullName, setFullName] = useState("");
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [status, setStatus] = useState("active");
	const [selectedRoleCodes, setSelectedRoleCodes] = useState<string[]>([]);
	const [loading, setLoading] = useState(true);
	const [saving, setSaving] = useState(false);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		let cancelled = false;

		async function load() {
			setLoading(true);
			setError(null);
			try {
				const [workspaceResponse, rolesResponse] = await Promise.all([
					platformRequest<PlatformWorkspaceRecord>(`/platform/workspaces/${id}`),
					platformRequest<ApiListResponse<Role>>(`/workspaces/${id}/roles`),
				]);
				if (cancelled) {
					return;
				}
				setWorkspace(workspaceResponse);
				setRoles(rolesResponse.items);

				if (!isCreate) {
					const membersResponse =
						await platformRequest<ApiListResponse<WorkspaceMemberRecord>>(
							`/platform/workspaces/${id}/members`,
						);
					if (cancelled) {
						return;
					}
					const currentMembership =
						membersResponse.items.find(
							(record) => record.membershipId === membershipId,
						) ?? null;
					setMembership(currentMembership);
					setFullName(currentMembership?.user.fullName ?? "");
					setEmail(currentMembership?.user.email ?? "");
					setStatus(currentMembership?.status ?? "active");
					setSelectedRoleCodes(
						currentMembership?.roles.map((role) => role.code) ?? [],
					);
				}
			} catch (loadError) {
				if (!cancelled) {
					setError(
						loadError instanceof Error
							? loadError.message
							: "Unable to load the workspace member form.",
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
	}, [id, isCreate, membershipId, platformRequest]);

	const selectedRoleLabels = useMemo(
		() =>
			roles
				.filter((role) => selectedRoleCodes.includes(role.code))
				.map((role) => role.label)
				.join(", "),
		[roles, selectedRoleCodes],
	);

	async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
		event.preventDefault();
		setSaving(true);
		setError(null);
		try {
			if (isCreate) {
				await platformRequest<WorkspaceMemberRecord>(
					`/platform/workspaces/${id}/members`,
					{
						method: "POST",
						body: {
							fullName: userMode === "new" ? fullName : "",
							email,
							password: userMode === "new" ? password : "",
							status,
							roleCodes: selectedRoleCodes,
						},
					},
				);
			} else {
				await platformRequest<WorkspaceMemberRecord>(
					`/platform/workspaces/${id}/members/${membershipId}`,
					{
						method: "PATCH",
						body: {
							status,
							roleCodes: selectedRoleCodes,
						},
					},
				);
			}
			navigate(`/admin/workspaces/${id}`);
		} catch (submitError) {
			setError(
				submitError instanceof Error
					? submitError.message
					: "Unable to save the association.",
			);
		} finally {
			setSaving(false);
		}
	}

	return (
		<AdminFormPage
			eyebrow="Workspace Associations"
			title={isCreate ? "Add workspace member" : "Edit workspace association"}
			description={
				isCreate
					? "Create a new customer user or associate an existing user with this workspace from a dedicated admin flow."
					: "Update membership state and workspace role coverage without leaving the tenant management area."
			}
			actions={
				<Button variant="outline" className="rounded-full" asChild>
					<Link to={`/admin/workspaces/${id}`}>
						<ArrowLeft className="size-4" />
						Back to workspace
					</Link>
				</Button>
			}
			aside={
				<SurfaceCard className="p-5">
					<div className="flex size-11 items-center justify-center rounded-2xl bg-amber-500/10 text-amber-600">
						<Users className="size-5" />
					</div>
					<div className="mt-4 space-y-2">
						<div className="text-lg font-semibold">
							{workspace?.name ?? "Workspace"} association
						</div>
						<p className="text-sm text-muted-foreground">
							Use this page for tenant-scoped access. Global platform staff still
							belong on the platform users flow.
						</p>
					</div>
					<div className="mt-4 space-y-3 text-sm text-muted-foreground">
						<div className="rounded-2xl border border-[var(--brand-border-soft)] bg-background/55 p-4">
							<div className="font-medium text-foreground">Selected roles</div>
							<div className="mt-2">
								{selectedRoleLabels || "No workspace roles selected yet."}
							</div>
						</div>
						{membership ? (
							<div className="rounded-2xl border border-[var(--brand-border-soft)] bg-background/55 p-4">
								<div className="font-medium text-foreground">Current member</div>
								<div className="mt-2">{membership.user.fullName}</div>
								<div className="text-xs">{membership.user.email}</div>
							</div>
						) : null}
					</div>
				</SurfaceCard>
			}
		>
			<form className="space-y-6" onSubmit={handleSubmit}>
				<AdminFormSection
					title="User source"
					description="Choose whether this association should create a new customer user or attach an existing person by email."
				>
					{isCreate ? (
						<div className="grid gap-3 md:grid-cols-2">
							<label
								className={cn(
									"flex cursor-pointer gap-4 rounded-[24px] border p-4 transition-colors",
									userMode === "new"
										? "border-amber-500/35 bg-amber-500/8"
										: "border-[var(--brand-border-soft)] bg-background/55",
								)}
							>
								<input
									type="radio"
									name="user-mode"
									value="new"
									checked={userMode === "new"}
									onChange={() => setUserMode("new")}
									className="mt-1"
								/>
								<div>
									<div className="font-medium">Create new workspace user</div>
									<div className="text-sm text-muted-foreground">
										Provision a fresh customer user account and attach it to this
										workspace in one step.
									</div>
								</div>
							</label>
							<label
								className={cn(
									"flex cursor-pointer gap-4 rounded-[24px] border p-4 transition-colors",
									userMode === "existing"
										? "border-amber-500/35 bg-amber-500/8"
										: "border-[var(--brand-border-soft)] bg-background/55",
								)}
							>
								<input
									type="radio"
									name="user-mode"
									value="existing"
									checked={userMode === "existing"}
									onChange={() => setUserMode("existing")}
									className="mt-1"
								/>
								<div>
									<div className="font-medium">Associate existing user</div>
									<div className="text-sm text-muted-foreground">
										Attach an already-known email to this workspace without
										creating a duplicate account.
									</div>
								</div>
							</label>
						</div>
					) : (
						<div className="rounded-[24px] border border-[var(--brand-border-soft)] bg-background/55 p-4">
							<div className="font-medium">{membership?.user.fullName}</div>
							<div className="mt-1 text-sm text-muted-foreground">
								{membership?.user.email}
							</div>
						</div>
					)}
				</AdminFormSection>

				<AdminFormSection
					title="Identity"
					description="Capture the user details or the existing email association."
				>
					{loading ? (
						<div className="flex items-center gap-3 text-sm text-muted-foreground">
							<LoaderCircle className="size-4 animate-spin" />
							Loading form details...
						</div>
					) : (
						<div className="grid gap-4 md:grid-cols-2">
							{isCreate && userMode === "new" ? (
								<div className="grid gap-2">
									<Label htmlFor="workspace-member-full-name">Full name</Label>
									<Input
										id="workspace-member-full-name"
										value={fullName}
										onChange={(event) => setFullName(event.target.value)}
										className="h-11 rounded-2xl"
										placeholder="Rina Ahmed"
									/>
								</div>
							) : null}
							<div className="grid gap-2">
								<Label htmlFor="workspace-member-email">Email</Label>
								<Input
									id="workspace-member-email"
									type="email"
									value={email}
									onChange={(event) => setEmail(event.target.value)}
									className="h-11 rounded-2xl"
									disabled={!isCreate}
									placeholder="user@company.com"
								/>
							</div>
							{isCreate && userMode === "new" ? (
								<div className="grid gap-2 md:col-span-2">
									<Label htmlFor="workspace-member-password">Password</Label>
									<Input
										id="workspace-member-password"
										type="password"
										value={password}
										onChange={(event) => setPassword(event.target.value)}
										className="h-11 rounded-2xl"
										placeholder="Create a temporary password"
									/>
								</div>
							) : null}
						</div>
					)}
				</AdminFormSection>

				<AdminFormSection
					title="Membership"
					description="Control whether this association is active and what workspace capabilities it grants."
				>
					<div className="grid gap-6">
						<div className="grid gap-2 md:max-w-[240px]">
							<Label htmlFor="workspace-member-status">Membership status</Label>
							<Select value={status} onValueChange={setStatus}>
								<SelectTrigger
									id="workspace-member-status"
									className="h-11 w-full rounded-2xl bg-background px-4 text-sm"
								>
									<SelectValue placeholder="Select membership status" />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value="active">Active</SelectItem>
									<SelectItem value="suspended">Suspended</SelectItem>
								</SelectContent>
							</Select>
						</div>
						<div className="grid gap-3 md:grid-cols-2">
							{roles.map((role) => {
								const checked = selectedRoleCodes.includes(role.code);
								return (
									<label
										key={role.id}
										className={cn(
											"flex cursor-pointer gap-4 rounded-[24px] border p-4 transition-colors",
											checked
												? "border-amber-500/35 bg-amber-500/8"
												: "border-[var(--brand-border-soft)] bg-background/55 hover:border-amber-500/20",
										)}
									>
										<Checkbox
											checked={checked}
											onCheckedChange={(value) =>
												setSelectedRoleCodes((current) =>
													toggleRole(current, role.code, Boolean(value)),
												)
											}
											className="mt-1"
										/>
										<div>
											<div className="font-medium">{role.label}</div>
											<div className="text-sm text-muted-foreground">
												{role.permissions
													.map((permission) => permission.label)
													.join(", ")}
											</div>
										</div>
									</label>
								);
							})}
						</div>
					</div>
				</AdminFormSection>

				{error ? (
					<SurfaceCard className="border border-destructive/20 bg-destructive/10 p-4 text-sm text-destructive">
						{error}
					</SurfaceCard>
				) : null}

				<SurfaceCard className="flex flex-col gap-3 p-5 sm:flex-row sm:items-center sm:justify-between">
					<div className="flex items-center gap-2 text-sm text-muted-foreground">
						{isCreate ? (
							<Link2 className="size-4" />
						) : (
							<Mail className="size-4" />
						)}
						{isCreate
							? "Associations are tenant-scoped and separate from global platform roles."
							: "Use this page for role and status changes on the current workspace only."}
					</div>
					<div className="flex flex-wrap gap-2">
						<Button variant="outline" className="rounded-full" asChild>
							<Link to={`/admin/workspaces/${id}`}>Cancel</Link>
						</Button>
						<Button
							type="submit"
							disabled={loading || saving}
							className="rounded-full border-0 bg-gradient-to-r from-amber-500 to-orange-600 text-white"
						>
							{saving ? (
								<>
									<LoaderCircle className="size-4 animate-spin" />
									Saving...
								</>
							) : (
								<>
									<ShieldCheck className="size-4" />
									{isCreate ? "Create association" : "Save association"}
								</>
							)}
						</Button>
					</div>
				</SurfaceCard>
			</form>
		</AdminFormPage>
	);
}
