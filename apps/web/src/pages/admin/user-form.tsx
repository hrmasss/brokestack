import {
	ArrowLeft,
	Copy,
	Eye,
	EyeOff,
	LoaderCircle,
	RefreshCw,
	ShieldCheck,
	Sparkles,
	UserPlus,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router";

import { AdminFormPage, AdminFormSection } from "@/components/admin/form-page";
import { SurfaceCard } from "@/components/app/brand";
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
import type { ApiListResponse, PlatformUserRecord, Role } from "@/lib/api-types";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

function getPlatformRoles(record: PlatformUserRecord) {
	return record.platformRoles ?? [];
}

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

function RoleSelector({
	roles,
	selectedRoleCodes,
	onToggle,
	disabled = false,
}: {
	roles: Role[];
	selectedRoleCodes: string[];
	onToggle: (roleCode: string, checked: boolean) => void;
	disabled?: boolean;
}) {
	return (
		<div className="grid gap-3 md:grid-cols-2">
			{roles.map((role) => {
				const checked = selectedRoleCodes.includes(role.code);
				const fieldId = `platform-role-${role.code}`;
				return (
					<label
						key={role.id}
						htmlFor={fieldId}
						className={cn(
							"flex gap-4 rounded-[24px] border p-4 transition-colors",
							disabled && "cursor-not-allowed opacity-70",
							!disabled && "cursor-pointer",
							checked
								? "border-amber-500/35 bg-amber-500/8"
								: "border-[var(--brand-border-soft)] bg-background/55 hover:border-amber-500/20",
						)}
					>
						<Checkbox
							id={fieldId}
							name="platformRoles"
							checked={checked}
							onCheckedChange={(value) => onToggle(role.code, Boolean(value))}
							className="mt-1"
							disabled={disabled}
						/>
						<div className="space-y-1">
							<div className="font-medium">{role.label}</div>
							<div className="text-sm text-muted-foreground">{role.code}</div>
							<div className="text-sm text-muted-foreground">
								{role.permissions.map((permission) => permission.label).join(", ")}
							</div>
						</div>
					</label>
				);
			})}
		</div>
	);
}

export function AdminUserFormPage({ mode }: { mode: "create" | "edit" }) {
	const navigate = useNavigate();
	const params = useParams();
	const { platformRequest, platformSession } = useAuth();
	const isCreate = mode === "create";
	const userId = params.id ?? "";
	const isSelfManaged = !isCreate && platformSession?.user.id === userId;

	const [roles, setRoles] = useState<Role[]>([]);
	const [record, setRecord] = useState<PlatformUserRecord | null>(null);
	const [fullName, setFullName] = useState("");
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [status, setStatus] = useState("active");
	const [selectedRoleCodes, setSelectedRoleCodes] = useState<string[]>([]);
	const [loading, setLoading] = useState(true);
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
				const roleResponse =
					await platformRequest<ApiListResponse<Role>>("/platform/roles");
				if (cancelled) {
					return;
				}
				setRoles(roleResponse.items);

				if (!isCreate) {
					const userResponse = await platformRequest<PlatformUserRecord>(
						`/platform/users/${userId}`,
					);
					if (cancelled) {
						return;
					}
					setRecord(userResponse);
					setFullName(userResponse.user.fullName);
					setEmail(userResponse.user.email);
					setStatus(userResponse.user.status);
					setSelectedRoleCodes(
						getPlatformRoles(userResponse).map((role) => role.code),
					);
				}
			} catch (loadError) {
				if (!cancelled) {
					setError(
						loadError instanceof Error
							? loadError.message
							: "Unable to load the admin user form.",
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
	}, [isCreate, platformRequest, userId]);

	const selectedRoles = useMemo(
		() => roles.filter((role) => selectedRoleCodes.includes(role.code)),
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
			if (isCreate) {
				await platformRequest<PlatformUserRecord>("/platform/users", {
					method: "POST",
					body: {
						fullName,
						email,
						password,
						status,
						roleCodes: selectedRoleCodes,
					},
				});
			} else {
				await platformRequest<PlatformUserRecord>(`/platform/users/${userId}`, {
					method: "PATCH",
					body: {
						fullName,
						status,
						roleCodes: selectedRoleCodes,
					},
				});
			}
			navigate("/admin/users");
		} catch (submitError) {
			setError(
				submitError instanceof Error
					? submitError.message
					: "Unable to save the user.",
			);
		} finally {
			setSaving(false);
		}
	}

	return (
		<AdminFormPage
			eyebrow="Platform Access"
			title={isCreate ? "Create platform user" : "Edit platform user"}
			description={
				isCreate
					? "Provision a global admin, ops, or support account with the exact preset role set it needs."
					: "Adjust lifecycle state and platform role coverage from a dedicated management page."
			}
			actions={
				<Button variant="outline" className="rounded-full" asChild>
					<Link to="/admin/users">
						<ArrowLeft className="size-4" />
						Back to users
					</Link>
				</Button>
			}
			aside={
				<>
					<SurfaceCard className="p-5">
						<div className="flex size-11 items-center justify-center rounded-2xl bg-amber-500/10 text-amber-600">
							<ShieldCheck className="size-5" />
						</div>
						<div className="mt-4 space-y-2">
							<div className="text-lg font-semibold">Access scope</div>
							<p className="text-sm text-muted-foreground">
								Platform users work above the tenant boundary. Keep this list for
								staff, support, and administrative operators.
							</p>
						</div>
						<div className="mt-4 space-y-3 text-sm text-muted-foreground">
							<div className="rounded-2xl border border-[var(--brand-border-soft)] bg-background/55 p-4">
								<div className="font-medium text-foreground">
									Selected roles
								</div>
								<div className="mt-2">
									{selectedRoles.length
										? selectedRoles.map((role) => role.label).join(", ")
										: "No platform role selected yet."}
								</div>
							</div>
							{record ? (
								<div className="rounded-2xl border border-[var(--brand-border-soft)] bg-background/55 p-4">
									<div className="font-medium text-foreground">
										Workspace footprint
									</div>
									<div className="mt-2">{record.workspaceCount} linked workspaces</div>
								</div>
							) : null}
						</div>
					</SurfaceCard>
				</>
			}
		>
			<form className="space-y-6" onSubmit={handleSubmit}>
				<AdminFormSection
					title="Identity"
					description="Capture the person behind this platform account."
				>
					{loading ? (
						<div className="flex items-center gap-3 text-sm text-muted-foreground">
							<LoaderCircle className="size-4 animate-spin" />
							Loading user details...
						</div>
					) : (
						<div className="grid gap-4 md:grid-cols-2">
							<div className="grid gap-2">
								<Label htmlFor="admin-user-full-name">Full name</Label>
								<Input
									id="admin-user-full-name"
									name="fullName"
									autoComplete="name"
									value={fullName}
									onChange={(event) => setFullName(event.target.value)}
									className="h-11 rounded-2xl"
									placeholder="System Admin"
								/>
							</div>
							<div className="grid gap-2">
								<Label htmlFor="admin-user-email">Email</Label>
								<Input
									id="admin-user-email"
									type="email"
									name="email"
									autoComplete="email"
									value={email}
									onChange={(event) => setEmail(event.target.value)}
									className="h-11 rounded-2xl"
									disabled={!isCreate}
									placeholder="admin@memofi.tech"
								/>
							</div>
							{isCreate ? (
								<div className="grid gap-2 md:col-span-2">
									<Label htmlFor="admin-user-password">Password</Label>
									<div className="space-y-3">
										<div className="relative">
											<Input
												id="admin-user-password"
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
											Use a temporary password and share it securely. The user can
											reset it after first sign-in.
										</div>
										{passwordFeedback ? (
											<div className="text-sm text-amber-600">
												{passwordFeedback}
											</div>
										) : null}
									</div>
								</div>
							) : null}
						</div>
					)}
				</AdminFormSection>

				<AdminFormSection
					title="Lifecycle"
					description="Control whether this person can actively sign in."
				>
					<div className="grid gap-2 md:max-w-[240px]">
						<Label htmlFor="admin-user-status">Status</Label>
						<Select value={status} onValueChange={setStatus}>
							<SelectTrigger
								id="admin-user-status"
								className="h-11 w-full rounded-2xl bg-background px-4 text-sm"
								disabled={isSelfManaged}
							>
								<SelectValue placeholder="Select status" />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="active">Active</SelectItem>
								<SelectItem value="suspended">Suspended</SelectItem>
							</SelectContent>
						</Select>
					</div>
				</AdminFormSection>

				<AdminFormSection
					title="Platform roles"
					description="Assign one or more preset roles. Permissions are derived from the role set."
				>
					{loading ? (
						<div className="flex items-center gap-3 text-sm text-muted-foreground">
							<LoaderCircle className="size-4 animate-spin" />
							Loading available roles...
						</div>
					) : (
						<RoleSelector
							roles={roles}
							selectedRoleCodes={selectedRoleCodes}
							disabled={isSelfManaged}
							onToggle={(roleCode, checked) =>
								setSelectedRoleCodes((current) =>
									toggleRole(current, roleCode, checked),
								)
							}
						/>
					)}
					{isSelfManaged ? (
						<div className="text-sm text-muted-foreground">
							Platform users cannot change their own status or role assignments.
							Use another super admin when those changes are required.
						</div>
					) : null}
				</AdminFormSection>

				{error ? (
					<SurfaceCard className="border border-destructive/20 bg-destructive/10 p-4 text-sm text-destructive">
						{error}
					</SurfaceCard>
				) : null}

				<SurfaceCard className="flex flex-col gap-3 p-5 sm:flex-row sm:items-center sm:justify-between">
					<div className="text-sm text-muted-foreground">
						{isCreate
							? "This creates a global platform account."
							: "Use this page to update the operator's display name, role mix, and sign-in status."}
					</div>
					<div className="flex flex-wrap gap-2">
						<Button variant="outline" className="rounded-full" asChild>
							<Link to="/admin/users">Cancel</Link>
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
									<UserPlus className="size-4" />
									{isCreate ? "Create platform user" : "Save user changes"}
								</>
							)}
						</Button>
					</div>
				</SurfaceCard>
			</form>
		</AdminFormPage>
	);
}
