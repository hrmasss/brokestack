import { Bell, CreditCard, ShieldCheck, Sparkles } from "lucide-react";
import { useEffect, useState } from "react";

import { DashboardPageHeader, DashboardPanel } from "@/components/app/dashboard";
import { SurfaceCard } from "@/components/app/brand";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/lib/auth-context";
import type { WorkspaceSummary } from "@/lib/api-types";

const preferenceCards = [
	{
		icon: Bell,
		title: "Approval notifications",
		description: "Send reminders when posts sit in review over 4 hours.",
	},
	{
		icon: ShieldCheck,
		title: "Governance locks",
		description: "Prevent scheduling when required asset checks are missing.",
	},
	{
		icon: Sparkles,
		title: "AI assistance",
		description:
			"Allow caption and summary suggestions in compose and review surfaces.",
	},
];

export function DashboardSettings() {
	const { activeWorkspaceId, customerRequest, hasCustomerPermission } = useAuth();
	const [workspace, setWorkspace] = useState<WorkspaceSummary | null>(null);
	const [name, setName] = useState("");
	const [saving, setSaving] = useState(false);

	useEffect(() => {
		if (!activeWorkspaceId) {
			return;
		}
		void customerRequest<WorkspaceSummary>(`/workspaces/${activeWorkspaceId}`).then(
			(response) => {
				setWorkspace(response);
				setName(response.name);
			},
		);
	}, [activeWorkspaceId]);

	const canManageSettings = hasCustomerPermission(
		"workspace.settings.manage",
		workspace?.capabilities,
	);
	const canManageBilling = hasCustomerPermission(
		"workspace.billing.manage",
		workspace?.capabilities,
	);

	async function saveProfile() {
		if (!activeWorkspaceId) {
			return;
		}
		setSaving(true);
		try {
			const updated = await customerRequest<WorkspaceSummary>(
				`/workspaces/${activeWorkspaceId}`,
				{
					method: "PATCH",
					body: { name },
				},
			);
			setWorkspace(updated);
			setName(updated.name);
		} finally {
			setSaving(false);
		}
	}

	return (
		<div className="space-y-6">
			<DashboardPageHeader
				eyebrow="Preferences"
				title="Settings"
				description="Workspace profile, governance controls, and billing visibility now respect the active workspace role model."
			/>

			<DashboardPanel
				title="Workspace profile"
				description="Update the workspace name and review the permissions available in the current role bundle."
			>
				<div className="grid gap-4 lg:grid-cols-2">
					<SurfaceCard tone="muted" className="space-y-4 p-5">
						<label className="block space-y-2">
							<span className="text-sm font-medium">Workspace name</span>
							<Input
								className="h-10 rounded-2xl"
								value={name}
								onChange={(event) => setName(event.target.value)}
								disabled={!canManageSettings}
							/>
						</label>
						<label className="block space-y-2">
							<span className="text-sm font-medium">Workspace slug</span>
							<Input
								className="h-10 rounded-2xl"
								value={workspace?.slug ?? ""}
								readOnly
							/>
						</label>
						<Button
							className="rounded-full bg-gradient-brand text-white border-0"
							disabled={!canManageSettings || saving}
							onClick={() => void saveProfile()}
						>
							{saving ? "Saving..." : "Save profile"}
						</Button>
					</SurfaceCard>

					<SurfaceCard tone="muted" className="space-y-4 p-5">
						{preferenceCards.map((item) => (
							<div
								key={item.title}
								className="flex items-start gap-3 rounded-[22px] border border-[var(--brand-border-soft)] bg-background/70 p-4"
							>
								<div className="flex size-10 items-center justify-center rounded-2xl bg-primary/10 text-primary">
									<item.icon className="size-4" />
								</div>
								<div className="min-w-0 flex-1">
									<div className="font-medium">{item.title}</div>
									<div className="mt-1 text-sm text-muted-foreground">
										{item.description}
									</div>
								</div>
								<div className="pill pill-success">
									{canManageSettings ? "Editable" : "View"}
								</div>
							</div>
						))}
					</SurfaceCard>
				</div>
			</DashboardPanel>

			<DashboardPanel
				title="Billing and governance"
				description="The billing module is exposed separately so finance access can be combined with other roles without a custom role builder."
			>
				<div className="grid gap-4 md:grid-cols-2">
					<SurfaceCard tone="muted" className="p-5">
						<div className="flex size-10 items-center justify-center rounded-2xl bg-primary/10 text-primary">
							<CreditCard className="size-4" />
						</div>
						<div className="mt-4 text-lg font-medium">Billing access</div>
						<div className="mt-2 text-sm text-muted-foreground">
							{canManageBilling
								? "You can manage billing for this workspace."
								: "Your current role bundle does not include billing management."}
						</div>
					</SurfaceCard>

					<SurfaceCard tone="muted" className="p-5">
						<div className="flex size-10 items-center justify-center rounded-2xl bg-primary/10 text-primary">
							<ShieldCheck className="size-4" />
						</div>
						<div className="mt-4 text-lg font-medium">Granted capabilities</div>
						<div className="mt-2 flex flex-wrap gap-2">
							{workspace?.capabilities.map((permission) => (
								<span key={permission.code} className="pill pill-info">
									{permission.label}
								</span>
							))}
						</div>
					</SurfaceCard>
				</div>
			</DashboardPanel>
		</div>
	);
}
