import {
	Bell,
	Database,
	Globe,
	Key,
	Lock,
	Mail,
	Save,
	Server,
	Shield,
	ShieldCheck,
	Users,
} from "lucide-react";
import { useState } from "react";

import { SurfaceCard } from "@/components/app/brand";
import { DashboardPageHeader, DashboardPanel } from "@/components/app/dashboard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
	NativeSelect,
	NativeSelectOption,
} from "@/components/ui/native-select";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";

const settingsSections = [
	{ id: "general", label: "General", icon: Globe },
	{ id: "security", label: "Security", icon: Shield },
	{ id: "notifications", label: "Notifications", icon: Bell },
	{ id: "integrations", label: "Integrations", icon: Server },
];

export function AdminSettings() {
	const [activeSection, setActiveSection] = useState("general");

	return (
		<div className="space-y-6">
			<DashboardPageHeader
				eyebrow="Configuration"
				title="Admin Settings"
				description="Configure system-wide settings and preferences"
			/>

			<div className="grid gap-6 lg:grid-cols-[240px_1fr]">
				<SurfaceCard className="h-fit p-3">
					<nav className="space-y-1">
						{settingsSections.map((section) => (
							<button
								key={section.id}
								type="button"
								onClick={() => setActiveSection(section.id)}
								className={cn(
									"flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition-colors",
									activeSection === section.id
										? "bg-gradient-to-r from-amber-500 to-orange-600 text-white"
										: "text-muted-foreground hover:bg-accent/60 hover:text-foreground",
								)}
							>
								<section.icon className="size-4" />
								{section.label}
							</button>
						))}
					</nav>
				</SurfaceCard>

				<div className="space-y-6">
					{activeSection === "general" && (
						<>
							<DashboardPanel
								title="Site Settings"
								description="Basic configuration for the platform"
							>
								<div className="grid gap-4 sm:grid-cols-2">
									<div className="grid gap-2">
										<Label htmlFor="site-name">Site name</Label>
										<Input
											id="site-name"
											defaultValue="BrokeStack"
											className="rounded-xl"
										/>
									</div>
									<div className="grid gap-2">
										<Label htmlFor="site-url">Site URL</Label>
										<Input
											id="site-url"
											defaultValue="https://brokestack.app"
											className="rounded-xl"
										/>
									</div>
									<div className="grid gap-2">
										<Label htmlFor="support-email">Support email</Label>
										<Input
											id="support-email"
											defaultValue="support@brokestack.app"
											className="rounded-xl"
										/>
									</div>
									<div className="grid gap-2">
										<Label htmlFor="timezone">Default timezone</Label>
										<NativeSelect defaultValue="utc" className="rounded-xl">
											<NativeSelectOption value="utc">UTC</NativeSelectOption>
											<NativeSelectOption value="est">Eastern Time</NativeSelectOption>
											<NativeSelectOption value="pst">Pacific Time</NativeSelectOption>
											<NativeSelectOption value="gmt">GMT</NativeSelectOption>
										</NativeSelect>
									</div>
								</div>
								<div className="mt-4 flex justify-end">
									<Button className="rounded-full bg-gradient-to-r from-amber-500 to-orange-600 text-white border-0">
										<Save className="size-4" />
										Save Changes
									</Button>
								</div>
							</DashboardPanel>

							<DashboardPanel
								title="Maintenance Mode"
								description="Temporarily disable access to the platform"
							>
								<div className="flex items-center justify-between rounded-xl border border-[var(--brand-border-soft)] p-4">
									<div>
										<div className="font-medium">Enable maintenance mode</div>
										<div className="text-sm text-muted-foreground">
											Users will see a maintenance page instead of the app
										</div>
									</div>
									<Switch />
								</div>
							</DashboardPanel>
						</>
					)}

					{activeSection === "security" && (
						<>
							<DashboardPanel
								title="Authentication"
								description="Configure login and access settings"
							>
								<div className="space-y-4">
									<div className="flex items-center justify-between rounded-xl border border-[var(--brand-border-soft)] p-4">
										<div className="flex items-center gap-3">
											<div className="flex size-10 items-center justify-center rounded-xl bg-[var(--brand-primary)]/10 text-[var(--brand-primary)]">
												<Lock className="size-5" />
											</div>
											<div>
												<div className="font-medium">Require 2FA for admins</div>
												<div className="text-sm text-muted-foreground">
													All admin accounts must have two-factor authentication
												</div>
											</div>
										</div>
										<Switch defaultChecked />
									</div>

									<div className="flex items-center justify-between rounded-xl border border-[var(--brand-border-soft)] p-4">
										<div className="flex items-center gap-3">
											<div className="flex size-10 items-center justify-center rounded-xl bg-[var(--brand-primary)]/10 text-[var(--brand-primary)]">
												<Users className="size-5" />
											</div>
											<div>
												<div className="font-medium">Allow SSO login</div>
												<div className="text-sm text-muted-foreground">
													Enable Google and Microsoft SSO for users
												</div>
											</div>
										</div>
										<Switch defaultChecked />
									</div>

									<div className="flex items-center justify-between rounded-xl border border-[var(--brand-border-soft)] p-4">
										<div className="flex items-center gap-3">
											<div className="flex size-10 items-center justify-center rounded-xl bg-[var(--brand-primary)]/10 text-[var(--brand-primary)]">
												<Key className="size-5" />
											</div>
											<div>
												<div className="font-medium">Password requirements</div>
												<div className="text-sm text-muted-foreground">
													Minimum 12 characters with special characters
												</div>
											</div>
										</div>
										<NativeSelect defaultValue="strong" className="w-32 rounded-xl">
											<NativeSelectOption value="basic">Basic</NativeSelectOption>
											<NativeSelectOption value="strong">Strong</NativeSelectOption>
											<NativeSelectOption value="strict">Strict</NativeSelectOption>
										</NativeSelect>
									</div>
								</div>
							</DashboardPanel>

							<DashboardPanel
								title="Session Management"
								description="Control user session behavior"
							>
								<div className="grid gap-4 sm:grid-cols-2">
									<div className="grid gap-2">
										<Label htmlFor="session-timeout">Session timeout (minutes)</Label>
										<Input
											id="session-timeout"
											type="number"
											defaultValue="60"
											className="rounded-xl"
										/>
									</div>
									<div className="grid gap-2">
										<Label htmlFor="max-sessions">Max concurrent sessions</Label>
										<Input
											id="max-sessions"
											type="number"
											defaultValue="5"
											className="rounded-xl"
										/>
									</div>
								</div>
							</DashboardPanel>
						</>
					)}

					{activeSection === "notifications" && (
						<DashboardPanel
							title="Email Notifications"
							description="Configure system email settings"
						>
							<div className="space-y-4">
								{[
									{
										title: "New user registrations",
										description: "Get notified when a new user signs up",
									},
									{
										title: "Failed payment attempts",
										description: "Alert when subscription payments fail",
									},
									{
										title: "Security alerts",
										description: "Suspicious login attempts or breaches",
									},
									{
										title: "Daily digest",
										description: "Summary of platform activity",
									},
									{
										title: "Weekly reports",
										description: "Analytics and growth metrics",
									},
								].map((item, index) => (
									<div
										key={index}
										className="flex items-center justify-between rounded-xl border border-[var(--brand-border-soft)] p-4"
									>
										<div>
											<div className="font-medium">{item.title}</div>
											<div className="text-sm text-muted-foreground">
												{item.description}
											</div>
										</div>
										<Switch defaultChecked={index < 3} />
									</div>
								))}
							</div>
						</DashboardPanel>
					)}

					{activeSection === "integrations" && (
						<DashboardPanel
							title="API & Webhooks"
							description="External service integrations"
						>
							<div className="space-y-4">
								<div className="rounded-xl border border-[var(--brand-border-soft)] p-4">
									<div className="flex items-center gap-3">
										<div className="flex size-10 items-center justify-center rounded-xl bg-[var(--brand-primary)]/10 text-[var(--brand-primary)]">
											<Database className="size-5" />
										</div>
										<div className="flex-1">
											<div className="font-medium">Database</div>
											<div className="text-sm text-muted-foreground">
												PostgreSQL - Connected
											</div>
										</div>
										<span className="flex items-center gap-1.5 text-sm text-emerald-600">
											<span className="size-2 rounded-full bg-emerald-500" />
											Healthy
										</span>
									</div>
								</div>

								<div className="rounded-xl border border-[var(--brand-border-soft)] p-4">
									<div className="flex items-center gap-3">
										<div className="flex size-10 items-center justify-center rounded-xl bg-[var(--brand-primary)]/10 text-[var(--brand-primary)]">
											<Mail className="size-5" />
										</div>
										<div className="flex-1">
											<div className="font-medium">Email Provider</div>
											<div className="text-sm text-muted-foreground">
												Resend - api.resend.com
											</div>
										</div>
										<span className="flex items-center gap-1.5 text-sm text-emerald-600">
											<span className="size-2 rounded-full bg-emerald-500" />
											Connected
										</span>
									</div>
								</div>

								<div className="rounded-xl border border-[var(--brand-border-soft)] p-4">
									<div className="flex items-center gap-3">
										<div className="flex size-10 items-center justify-center rounded-xl bg-[var(--brand-primary)]/10 text-[var(--brand-primary)]">
											<ShieldCheck className="size-5" />
										</div>
										<div className="flex-1">
											<div className="font-medium">Payment Processor</div>
											<div className="text-sm text-muted-foreground">
												Stripe - Live mode
											</div>
										</div>
										<span className="flex items-center gap-1.5 text-sm text-emerald-600">
											<span className="size-2 rounded-full bg-emerald-500" />
											Active
										</span>
									</div>
								</div>
							</div>
						</DashboardPanel>
					)}
				</div>
			</div>
		</div>
	);
}
