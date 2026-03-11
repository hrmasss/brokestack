import { ArrowLeft, Building2, LoaderCircle, Shield } from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router";

import { AdminFormPage, AdminFormSection } from "@/components/admin/form-page";
import { SurfaceCard } from "@/components/app/brand";
import { Button } from "@/components/ui/button";
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
import type { PlatformWorkspaceRecord } from "@/lib/api-types";

export function AdminWorkspaceFormPage({ mode }: { mode: "create" | "edit" }) {
	const navigate = useNavigate();
	const params = useParams();
	const { platformRequest } = useAuth();
	const isCreate = mode === "create";
	const workspaceId = params.id ?? "";

	const [workspace, setWorkspace] = useState<PlatformWorkspaceRecord | null>(null);
	const [name, setName] = useState("");
	const [status, setStatus] = useState("active");
	const [loading, setLoading] = useState(!isCreate);
	const [saving, setSaving] = useState(false);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		if (isCreate) {
			return;
		}

		let cancelled = false;
		async function load() {
			setLoading(true);
			setError(null);
			try {
				const response = await platformRequest<PlatformWorkspaceRecord>(
					`/platform/workspaces/${workspaceId}`,
				);
				if (cancelled) {
					return;
				}
				setWorkspace(response);
				setName(response.name);
				setStatus(response.status);
			} catch (loadError) {
				if (!cancelled) {
					setError(
						loadError instanceof Error
							? loadError.message
							: "Unable to load the workspace.",
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
	}, [isCreate, platformRequest, workspaceId]);

	async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
		event.preventDefault();
		setSaving(true);
		setError(null);
		try {
			if (isCreate) {
				await platformRequest<PlatformWorkspaceRecord>("/platform/workspaces", {
					method: "POST",
					body: { name },
				});
			} else {
				await platformRequest<PlatformWorkspaceRecord>(
					`/platform/workspaces/${workspaceId}`,
					{
						method: "PATCH",
						body: { name, status },
					},
				);
			}
			navigate("/admin/workspaces");
		} catch (submitError) {
			setError(
				submitError instanceof Error
					? submitError.message
					: "Unable to save the workspace.",
			);
		} finally {
			setSaving(false);
		}
	}

	return (
		<AdminFormPage
			eyebrow="Tenant Management"
			title={isCreate ? "Create workspace" : "Edit workspace"}
			description={
				isCreate
					? "Launch a new customer tenant with a proper workspace record before assigning users and support access."
					: "Manage the tenant identity and lifecycle state from a full-page control surface."
			}
			actions={
				<Button variant="outline" className="rounded-full" asChild>
					<Link to={isCreate ? "/admin/workspaces" : `/admin/workspaces/${workspaceId}`}>
						<ArrowLeft className="size-4" />
						Back
					</Link>
				</Button>
			}
			aside={
				<SurfaceCard className="p-5">
					<div className="flex size-11 items-center justify-center rounded-2xl bg-amber-500/10 text-amber-600">
						<Building2 className="size-5" />
					</div>
					<div className="mt-4 space-y-2">
						<div className="text-lg font-semibold">Workspace guidance</div>
						<p className="text-sm text-muted-foreground">
							Workspace slugs are generated from the name and kept unique. Use a
							clear customer-facing name so support, billing, and operations stay
							aligned.
						</p>
					</div>
					{workspace ? (
						<div className="mt-4 grid gap-3 text-sm text-muted-foreground">
							<div className="rounded-2xl border border-[var(--brand-border-soft)] bg-background/55 p-4">
								<div className="font-medium text-foreground">Members</div>
								<div className="mt-2">{workspace.memberCount} total members</div>
							</div>
							<div className="rounded-2xl border border-[var(--brand-border-soft)] bg-background/55 p-4">
								<div className="font-medium text-foreground">Support access</div>
								<div className="mt-2">
									Use the workspace detail page to inspect associations and start
									an assume-access session.
								</div>
							</div>
						</div>
					) : null}
				</SurfaceCard>
			}
		>
			<form className="space-y-6" onSubmit={handleSubmit}>
				<AdminFormSection
					title="Workspace identity"
					description="This name appears in tenant management, user associations, and support tools."
				>
					{loading ? (
						<div className="flex items-center gap-3 text-sm text-muted-foreground">
							<LoaderCircle className="size-4 animate-spin" />
							Loading workspace...
						</div>
					) : (
						<div className="grid gap-4 md:grid-cols-2">
							<div className="grid gap-2 md:col-span-2">
								<Label htmlFor="workspace-name">Workspace name</Label>
								<Input
									id="workspace-name"
									value={name}
									onChange={(event) => setName(event.target.value)}
									className="h-11 rounded-2xl"
									placeholder="Northset"
								/>
							</div>
							{isCreate ? null : (
								<div className="grid gap-2 md:max-w-[240px]">
									<Label htmlFor="workspace-status">Status</Label>
									<Select value={status} onValueChange={setStatus}>
										<SelectTrigger
											id="workspace-status"
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
							)}
						</div>
					)}
				</AdminFormSection>

				{error ? (
					<SurfaceCard className="border border-destructive/20 bg-destructive/10 p-4 text-sm text-destructive">
						{error}
					</SurfaceCard>
				) : null}

				<SurfaceCard className="flex flex-col gap-3 p-5 sm:flex-row sm:items-center sm:justify-between">
					<div className="flex items-center gap-2 text-sm text-muted-foreground">
						<Shield className="size-4" />
						{isCreate
							? "Create the tenant first, then assign workspace members."
							: "Memberships and support actions live on the workspace detail page."}
					</div>
					<div className="flex flex-wrap gap-2">
						<Button variant="outline" className="rounded-full" asChild>
							<Link to={isCreate ? "/admin/workspaces" : `/admin/workspaces/${workspaceId}`}>
								Cancel
							</Link>
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
									<Building2 className="size-4" />
									{isCreate ? "Create workspace" : "Save workspace"}
								</>
							)}
						</Button>
					</div>
				</SurfaceCard>
			</form>
		</AdminFormPage>
	);
}
