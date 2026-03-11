import {
	ArrowLeft,
	Building2,
	Copy,
	Eye,
	EyeOff,
	LoaderCircle,
	Mail,
	RefreshCw,
	Sparkles,
	Users,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router";

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

function generateTemporaryPassword(length = 18) {
	const characters =
		"ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789!@#$%^&*";
	const random = new Uint32Array(length);
	if (globalThis.crypto) {
		globalThis.crypto.getRandomValues(random);
	}

	return Array.from(random, (value) => {
		if (!globalThis.crypto) {
			return characters[(Math.random() * characters.length) | 0];
		}
		return characters[value % characters.length];
	}).join("");
}

function defaultWorkspaceName(fullName: string) {
	const trimmedName = fullName.trim();
	if (!trimmedName) {
		return "User's Workspace";
	}
	return trimmedName.toLowerCase().endsWith("s")
		? `${trimmedName}' Workspace`
		: `${trimmedName}'s Workspace`;
}

export function AdminCustomerUserFormPage() {
	const navigate = useNavigate();
	const { platformRequest } = useAuth();

	const [workspaces, setWorkspaces] = useState<PlatformWorkspaceRecord[]>([]);
	const [roles, setRoles] = useState<Role[]>([]);
	const [workspaceMode, setWorkspaceMode] = useState<"create" | "existing">(
		"create",
	);
	const [workspaceId, setWorkspaceId] = useState("");
	const [workspaceName, setWorkspaceName] = useState("");
	const [workspaceNameTouched, setWorkspaceNameTouched] = useState(false);
	const [fullName, setFullName] = useState("");
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [status, setStatus] = useState("active");
	const [selectedRoleCodes, setSelectedRoleCodes] = useState<string[]>([]);
	const [loading, setLoading] = useState(true);
	const [rolesLoading, setRolesLoading] = useState(false);
	const [saving, setSaving] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [showPassword, setShowPassword] = useState(false);
	const [passwordFeedback, setPasswordFeedback] = useState<string | null>(null);

	useEffect(() => {
		let cancelled = false;

		async function load() {
			setLoading(true);
			setError(null);
			try {
				const response =
					await platformRequest<ApiListResponse<PlatformWorkspaceRecord>>(
						"/platform/workspaces",
					);
				if (cancelled) {
					return;
				}
				setWorkspaces(response.items);
				if (response.items[0]) {
					setWorkspaceId(response.items[0].id);
				}
			} catch (loadError) {
				if (!cancelled) {
					setError(
						loadError instanceof Error
							? loadError.message
							: "Unable to load workspaces.",
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
	}, [platformRequest]);

	useEffect(() => {
		let cancelled = false;

		async function loadRoles() {
			setRolesLoading(true);
			setError(null);
			try {
				const response =
					await platformRequest<ApiListResponse<Role>>(
						"/platform/workspace-roles",
					);
				if (cancelled) {
					return;
				}
				setRoles(response.items);
				setSelectedRoleCodes((current) =>
					current.filter((roleCode) =>
						response.items.some((role) => role.code === roleCode),
					),
				);
			} catch (loadError) {
				if (!cancelled) {
					setError(
						loadError instanceof Error
							? loadError.message
							: "Unable to load workspace roles.",
					);
				}
			} finally {
				if (!cancelled) {
					setRolesLoading(false);
				}
			}
		}

		void loadRoles();
		return () => {
			cancelled = true;
		};
	}, [platformRequest]);

	useEffect(() => {
		if (!workspaceNameTouched) {
			setWorkspaceName(defaultWorkspaceName(fullName));
		}
	}, [fullName, workspaceNameTouched]);

	const selectedWorkspace = useMemo(
		() => workspaces.find((workspace) => workspace.id === workspaceId) ?? null,
		[workspaces, workspaceId],
	);

	const selectedRoleLabels = useMemo(
		() =>
			roles
				.filter((role) => selectedRoleCodes.includes(role.code))
				.map((role) => role.label)
				.join(", "),
		[roles, selectedRoleCodes],
	);

	function setTemporaryFeedback(message: string) {
		setPasswordFeedback(message);
		window.setTimeout(() => {
			setPasswordFeedback((current) => (current === message ? null : current));
		}, 2000);
	}

	function assignGeneratedPassword() {
		setPassword(generateTemporaryPassword());
		setShowPassword(true);
		setTemporaryFeedback("Generated a temporary password.");
	}

	async function copyPassword() {
		if (!password || !navigator.clipboard) {
			return;
		}
		await navigator.clipboard.writeText(password);
		setTemporaryFeedback("Password copied to clipboard.");
	}

	async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
		event.preventDefault();
		setSaving(true);
		setError(null);
		try {
			let targetWorkspaceId = workspaceId;
			if (workspaceMode === "create") {
				const createdWorkspace = await platformRequest<PlatformWorkspaceRecord>(
					"/platform/workspaces",
					{
						method: "POST",
						body: {
							name: workspaceName.trim() || defaultWorkspaceName(fullName),
						},
					},
				);
				targetWorkspaceId = createdWorkspace.id;
			}

			if (!targetWorkspaceId) {
				setError("Select a workspace for this client user.");
				setSaving(false);
				return;
			}

			await platformRequest<WorkspaceMemberRecord>(
				`/platform/workspaces/${targetWorkspaceId}/members`,
				{
					method: "POST",
					body: {
						fullName,
						email,
						password,
						status,
						roleCodes: selectedRoleCodes,
					},
				},
			);
			navigate("/admin/users");
		} catch (submitError) {
			setError(
				submitError instanceof Error
					? submitError.message
					: "Unable to create the client user.",
			);
		} finally {
			setSaving(false);
		}
	}

	return (
		<AdminFormPage
			eyebrow="User Directory"
			title="Create client user"
			description="Create a customer account and place it into the correct workspace with the right preset role mix."
			actions={
				<Button variant="outline" className="rounded-full" asChild>
					<Link to="/admin/users">
						<ArrowLeft className="size-4" />
						Back to users
					</Link>
				</Button>
			}
			aside={
				<SurfaceCard className="p-5">
					<div className="flex size-11 items-center justify-center rounded-2xl bg-amber-500/10 text-amber-600">
						<Users className="size-5" />
					</div>
					<div className="mt-4 space-y-2">
						<div className="text-lg font-semibold">Client user guidance</div>
						<p className="text-sm text-muted-foreground">
							Client users belong to one or more workspaces. Create the user here,
							then add more associations later from the workspace detail pages.
						</p>
					</div>
					<div className="mt-4 space-y-3 text-sm text-muted-foreground">
						<div className="rounded-2xl border border-[var(--brand-border-soft)] bg-background/55 p-4">
							<div className="font-medium text-foreground">Initial workspace</div>
							<div className="mt-2">
								{workspaceMode === "create"
									? workspaceName.trim() || defaultWorkspaceName(fullName)
									: selectedWorkspace?.name ?? "Choose a workspace to continue."}
							</div>
						</div>
						<div className="rounded-2xl border border-[var(--brand-border-soft)] bg-background/55 p-4">
							<div className="font-medium text-foreground">Selected roles</div>
							<div className="mt-2">
								{selectedRoleLabels || "No workspace roles selected yet."}
							</div>
						</div>
					</div>
				</SurfaceCard>
			}
		>
			<form className="space-y-6" onSubmit={handleSubmit}>
				<AdminFormSection
					title="Identity"
					description="Capture the customer-facing account details."
				>
					<div className="grid gap-4 md:grid-cols-2">
						<div className="grid gap-2">
							<Label htmlFor="client-user-full-name">Full name</Label>
							<Input
								id="client-user-full-name"
								name="fullName"
								autoComplete="name"
								value={fullName}
								onChange={(event) => setFullName(event.target.value)}
								className="h-11 rounded-2xl"
								placeholder="Rina Ahmed"
							/>
						</div>
						<div className="grid gap-2">
							<Label htmlFor="client-user-email">Email</Label>
							<Input
								id="client-user-email"
								type="email"
								name="email"
								autoComplete="email"
								value={email}
								onChange={(event) => setEmail(event.target.value)}
								className="h-11 rounded-2xl"
								placeholder="rina@northset.com"
							/>
						</div>
						<div className="grid gap-2 md:col-span-2">
							<Label htmlFor="client-user-password">Password</Label>
							<div className="space-y-3">
								<div className="relative">
									<Input
										id="client-user-password"
										type={showPassword ? "text" : "password"}
										name="password"
										autoComplete="new-password"
										value={password}
										onChange={(event) => setPassword(event.target.value)}
										className="h-11 rounded-2xl pr-12"
										placeholder="Create a temporary password"
									/>
									<Button
										type="button"
										variant="ghost"
										size="icon-sm"
										className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full"
										onClick={() => setShowPassword((value) => !value)}
										aria-label={showPassword ? "Hide password" : "Show password"}
									>
										{showPassword ? (
											<EyeOff className="size-4" />
										) : (
											<Eye className="size-4" />
										)}
									</Button>
								</div>
								<div className="flex flex-wrap gap-2">
									<Button
										type="button"
										variant="outline"
										size="sm"
										className="rounded-full"
										onClick={assignGeneratedPassword}
									>
										<Sparkles className="size-4" />
										Generate password
									</Button>
									<Button
										type="button"
										variant="ghost"
										size="sm"
										className="rounded-full"
										onClick={() => void copyPassword()}
										disabled={!password}
									>
										<Copy className="size-4" />
										Copy
									</Button>
									<Button
										type="button"
										variant="ghost"
										size="sm"
										className="rounded-full"
										onClick={assignGeneratedPassword}
									>
										<RefreshCw className="size-4" />
										Regenerate
									</Button>
								</div>
								<div className="text-sm text-muted-foreground">
									Use a temporary password and share it securely. The client user
									can change it after first sign-in.
								</div>
								{passwordFeedback ? (
									<div className="text-sm text-amber-600">{passwordFeedback}</div>
								) : null}
							</div>
						</div>
					</div>
				</AdminFormSection>

				<AdminFormSection
					title="Workspace placement"
					description="Create a new workspace for this client user or attach them to an existing one."
				>
					{loading ? (
						<div className="flex items-center gap-3 text-sm text-muted-foreground">
							<LoaderCircle className="size-4 animate-spin" />
							Loading workspaces...
						</div>
					) : (
						<div className="space-y-4">
							<div className="grid gap-3 md:grid-cols-2">
								<label
									className={cn(
										"flex cursor-pointer gap-4 rounded-[24px] border p-4 transition-colors",
										workspaceMode === "create"
											? "border-amber-500/35 bg-amber-500/8"
											: "border-[var(--brand-border-soft)] bg-background/55",
									)}
								>
									<input
										type="radio"
										name="client-workspace-mode"
										value="create"
										checked={workspaceMode === "create"}
										onChange={() => setWorkspaceMode("create")}
										className="mt-1"
									/>
									<div>
										<div className="font-medium">Create new workspace</div>
										<div className="text-sm text-muted-foreground">
											Default for new clients. The name follows the user’s name
											unless you customize it.
										</div>
									</div>
								</label>
								<label
									className={cn(
										"flex gap-4 rounded-[24px] border p-4 transition-colors",
										!workspaces.length && "cursor-not-allowed opacity-60",
										workspaces.length && "cursor-pointer",
										workspaceMode === "existing"
											? "border-amber-500/35 bg-amber-500/8"
											: "border-[var(--brand-border-soft)] bg-background/55",
									)}
								>
									<input
										type="radio"
										name="client-workspace-mode"
										value="existing"
										checked={workspaceMode === "existing"}
										onChange={() => setWorkspaceMode("existing")}
										className="mt-1"
										disabled={!workspaces.length}
									/>
									<div>
										<div className="font-medium">Use existing workspace</div>
										<div className="text-sm text-muted-foreground">
											Attach this client user to an existing customer workspace.
										</div>
									</div>
								</label>
							</div>

							{workspaceMode === "create" ? (
								<div className="grid gap-2 md:max-w-[420px]">
									<Label htmlFor="client-user-workspace-name">Workspace name</Label>
									<Input
										id="client-user-workspace-name"
										value={workspaceName}
										onChange={(event) => {
											setWorkspaceNameTouched(true);
											setWorkspaceName(event.target.value);
										}}
										className="h-11 rounded-2xl"
										placeholder={defaultWorkspaceName(fullName)}
									/>
									<div className="text-sm text-muted-foreground">
										Leave it blank and BrokeStack will create{" "}
										{defaultWorkspaceName(fullName)}.
									</div>
								</div>
							) : workspaces.length ? (
								<div className="grid gap-2 md:max-w-[320px]">
									<Label htmlFor="client-user-workspace">Existing workspace</Label>
									<Select value={workspaceId} onValueChange={setWorkspaceId}>
										<SelectTrigger
											id="client-user-workspace"
											className="h-11 w-full rounded-2xl bg-background px-4 text-sm"
										>
											<SelectValue placeholder="Select workspace" />
										</SelectTrigger>
										<SelectContent>
											{workspaces.map((workspace) => (
												<SelectItem key={workspace.id} value={workspace.id}>
													{workspace.name}
												</SelectItem>
											))}
										</SelectContent>
									</Select>
								</div>
							) : (
								<div className="rounded-[24px] border border-[var(--brand-border-soft)] bg-background/55 p-4 text-sm text-muted-foreground">
									Create new workspace stays selected because no existing workspaces
									are available yet.
								</div>
							)}
						</div>
					)}
				</AdminFormSection>

				<AdminFormSection
					title="Access"
					description="Set the initial lifecycle state and workspace-scoped roles."
				>
					<div className="grid gap-6">
						<div className="grid gap-2 md:max-w-[240px]">
							<Label htmlFor="client-user-status">Status</Label>
							<Select value={status} onValueChange={setStatus}>
								<SelectTrigger
									id="client-user-status"
									className="h-11 w-full rounded-2xl bg-background px-4 text-sm"
								>
									<SelectValue placeholder="Select status" />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value="active">Active</SelectItem>
									<SelectItem value="suspended">Suspended</SelectItem>
								</SelectContent>
							</Select>
						</div>

						{rolesLoading ? (
							<div className="flex items-center gap-3 text-sm text-muted-foreground">
								<LoaderCircle className="size-4 animate-spin" />
								Loading workspace roles...
							</div>
						) : roles.length ? (
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
						) : (
							<div className="rounded-[24px] border border-[var(--brand-border-soft)] bg-background/55 p-4 text-sm text-muted-foreground">
								Workspace roles are unavailable right now.
							</div>
						)}
					</div>
				</AdminFormSection>

				{error ? (
					<SurfaceCard className="border border-destructive/20 bg-destructive/10 p-4 text-sm text-destructive">
						{error}
					</SurfaceCard>
				) : null}

				<SurfaceCard className="flex flex-col gap-3 p-5 sm:flex-row sm:items-center sm:justify-between">
					<div className="flex items-center gap-2 text-sm text-muted-foreground">
						<Mail className="size-4" />
						This creates a customer user and its first workspace association in one step.
					</div>
					<div className="flex flex-wrap gap-2">
						<Button variant="outline" className="rounded-full" asChild>
							<Link to="/admin/users">Cancel</Link>
						</Button>
						<Button
							type="submit"
							disabled={loading || rolesLoading || saving}
							className="rounded-full border-0 bg-gradient-to-r from-amber-500 to-orange-600 text-white"
						>
							{saving ? (
								<>
									<LoaderCircle className="size-4 animate-spin" />
									Creating...
								</>
							) : (
								<>
									<Building2 className="size-4" />
									Create client user
								</>
							)}
						</Button>
					</div>
				</SurfaceCard>
			</form>
		</AdminFormPage>
	);
}
