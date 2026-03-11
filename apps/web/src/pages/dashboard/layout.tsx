import {
	CalendarRange,
	ChevronDown,
	ChevronLeft,
	Command,
	FileStack,
	FolderKanban,
	Home,
	LineChart,
	LogOut,
	Menu,
	PanelLeftClose,
	PanelLeftOpen,
	Settings,
	Users2,
	WandSparkles,
	X,
} from "lucide-react";
import { type ReactNode, useEffect, useState } from "react";
import { Link, Outlet, useLocation, useNavigate } from "react-router";

import { AlertInbox } from "@/components/app/alert-inbox";
import { getDashboardBreadcrumbs } from "@/components/app/dashboard-context";
import { MiraAssistant } from "@/components/app/mira-assistant";
import { SearchCommand } from "@/components/app/search-command";
import { ThemeToggle } from "@/components/app/theme-toggle";
import { Logo } from "@/components/logo";
import {
	Breadcrumb,
	BreadcrumbItem,
	BreadcrumbLink,
	BreadcrumbList,
	BreadcrumbPage,
	BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Button } from "@/components/ui/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useAuth } from "@/lib/auth-context";
import { cn } from "@/lib/utils";

const navigation = [
	{ href: "/dashboard", label: "Overview", icon: Home },
	{ href: "/dashboard/posts", label: "Runs", icon: FileStack },
	{ href: "/dashboard/calendar", label: "Calendar", icon: CalendarRange },
	{ href: "/dashboard/analytics", label: "Usage", icon: LineChart },
	{ href: "/dashboard/automations", label: "Workflows", icon: WandSparkles },
	{ href: "/dashboard/library", label: "Artifacts", icon: FolderKanban },
	{ href: "/dashboard/team", label: "Team", icon: Users2 },
	{ href: "/dashboard/settings", label: "Settings", icon: Settings },
];

const sidebarTransitionClass =
	"duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:duration-0";

function SidebarBrand({ collapsed }: { collapsed: boolean }) {
	return (
		<div
			className={cn(
				"relative h-7 overflow-hidden transition-[width]",
				sidebarTransitionClass,
				collapsed ? "h-[34px] lg:w-[34px]" : "w-[132px]",
			)}
		>
			<span
				className={cn(
					"absolute inset-y-0 left-0 flex items-center transition-[opacity,transform]",
					sidebarTransitionClass,
					collapsed
						? "lg:-translate-x-3 lg:opacity-0"
						: "opacity-100 translate-x-0",
				)}
				aria-hidden={collapsed ? true : undefined}
			>
				<Logo size="sm" />
			</span>
			<span
				className={cn(
					"absolute inset-0 flex items-center justify-center transition-[opacity,transform]",
					sidebarTransitionClass,
					collapsed ? "opacity-100" : "lg:translate-x-2 lg:opacity-0",
				)}
				aria-hidden={collapsed ? undefined : true}
			>
				<Logo size="md" showText={false} />
			</span>
		</div>
	);
}

function SidebarCopy({
	collapsed,
	className,
	children,
}: {
	collapsed: boolean;
	className?: string;
	children: ReactNode;
}) {
	return (
		<div
			className={cn(
				"min-w-0 overflow-hidden transition-[max-width,opacity,transform]",
				sidebarTransitionClass,
				collapsed
					? "lg:max-w-0 lg:flex-none lg:opacity-0 lg:-translate-x-2"
					: "max-w-[14rem] opacity-100 translate-x-0",
				className,
			)}
			aria-hidden={collapsed ? true : undefined}
		>
			{children}
		</div>
	);
}

function WorkspaceSwitcher({ compact }: { compact?: boolean }) {
	const { customerSession, activeWorkspaceId, setActiveWorkspaceId } = useAuth();
	const workspaces = customerSession?.workspaceMemberships ?? [];
	const activeWorkspace =
		workspaces.find((workspace) => workspace.workspaceId === activeWorkspaceId) ??
		workspaces[0];

	if (!activeWorkspace) {
		return null;
	}

	return (
		<DropdownMenu>
			<DropdownMenuTrigger asChild>
				<button
					type="button"
					className={cn(
						"flex w-full items-center gap-3 overflow-hidden rounded-[24px] border border-[var(--brand-border-soft)] bg-background/75 p-3 text-left transition-[width,gap,padding,background-color] hover:bg-accent/60",
						sidebarTransitionClass,
						compact && "lg:mx-auto lg:size-16 lg:justify-center lg:gap-0",
					)}
					aria-label={compact ? activeWorkspace.workspaceName : undefined}
				>
					<div className="flex size-10 items-center justify-center rounded-2xl bg-gradient-brand text-sm font-semibold text-white">
						{activeWorkspace.workspaceName[0]}
					</div>
					<SidebarCopy
						collapsed={Boolean(compact)}
						className={compact ? undefined : "flex-1"}
					>
						<div className="truncate text-sm font-medium">
							{activeWorkspace.workspaceName}
						</div>
						<div className="text-xs text-muted-foreground">
							{activeWorkspace.roles.map((role) => role.label).join(" • ")}
						</div>
					</SidebarCopy>
					<ChevronDown
						className={cn(
							"h-4 shrink-0 overflow-hidden text-muted-foreground transition-[width,opacity,transform]",
							sidebarTransitionClass,
							compact
								? "lg:w-0 lg:scale-90 lg:opacity-0"
								: "w-4 opacity-100 scale-100",
						)}
						aria-hidden={compact ? true : undefined}
					/>
				</button>
			</DropdownMenuTrigger>
			<DropdownMenuContent
				align="start"
				className={cn(
					"rounded-[24px] p-2",
					compact
						? "min-w-56"
						: "w-(--radix-dropdown-menu-trigger-width) min-w-0",
				)}
			>
				{workspaces.map((workspace) => (
					<DropdownMenuItem
						key={workspace.workspaceId}
						onClick={() => setActiveWorkspaceId(workspace.workspaceId)}
						className="rounded-[18px] px-3 py-2.5"
					>
						{workspace.workspaceName}
					</DropdownMenuItem>
				))}
			</DropdownMenuContent>
		</DropdownMenu>
	);
}

function Sidebar({
	collapsed,
	mobileOpen,
	onClose,
}: {
	collapsed: boolean;
	mobileOpen: boolean;
	onClose: () => void;
}) {
	const location = useLocation();
	const navigate = useNavigate();
	const { customerSession, logoutCustomer, activeWorkspaceMembership } = useAuth();
	const currentUser = customerSession?.user;
	const currentRoles = activeWorkspaceMembership?.roles;

	if (!currentUser) {
		return null;
	}

	return (
		<>
			{mobileOpen ? (
				<button
					type="button"
					className="fixed inset-0 z-30 bg-black/30 lg:hidden"
					onClick={onClose}
					aria-label="Close sidebar"
				/>
			) : null}

			<aside
				className={cn(
					"dashboard-sidebar fixed inset-y-0 left-0 z-40 w-[286px] bg-[color-mix(in_srgb,var(--sidebar)_70%,transparent)] px-4 py-4 backdrop-blur-[30px] transition-[width,transform,padding] lg:static lg:z-0 lg:h-full lg:shrink-0 lg:bg-transparent lg:px-4 lg:py-4 lg:backdrop-blur-none",
					sidebarTransitionClass,
					collapsed && "lg:w-[92px]",
					mobileOpen ? "translate-x-0" : "-translate-x-full",
					"lg:translate-x-0",
				)}
			>
				<div className="relative z-10 flex h-full flex-col">
					<div className="flex items-center justify-between gap-3 px-3">
						<Link
							to="/dashboard"
							className={cn(
								"flex min-w-0 items-center py-2 transition-[padding,width]",
								sidebarTransitionClass,
								collapsed && "lg:mx-auto lg:w-10 lg:justify-center",
							)}
						>
							<SidebarBrand collapsed={collapsed} />
						</Link>
						<Button
							variant="ghost"
							size="icon-sm"
							className="lg:hidden"
							onClick={onClose}
						>
							<X className="size-4" />
						</Button>
					</div>

					<div className="mt-5">
						<WorkspaceSwitcher compact={collapsed} />
					</div>

					<nav className="mt-6 flex-1 space-y-1.5">
						{navigation.map((item) => {
							const active =
								item.href === "/dashboard"
									? location.pathname === item.href
									: location.pathname.startsWith(item.href);

							return (
								<Link
									key={item.href}
									to={item.href}
									onClick={onClose}
									aria-label={collapsed ? item.label : undefined}
									className={cn(
										"group flex w-full items-center gap-3 overflow-hidden rounded-[22px] px-3 py-3 text-sm transition-[width,gap,padding,background-color,color]",
										sidebarTransitionClass,
										active
											? "bg-primary text-primary-foreground shadow-[0_14px_30px_-18px_var(--brand-glow-strong)]"
											: "text-muted-foreground hover:bg-accent/60 hover:text-foreground",
										collapsed &&
											"lg:mx-auto lg:w-14 lg:justify-center lg:gap-0 lg:px-0",
									)}
								>
									<item.icon className="size-5 shrink-0" />
									<SidebarCopy
										collapsed={collapsed}
										className="whitespace-nowrap"
									>
										<span>{item.label}</span>
									</SidebarCopy>
								</Link>
							);
						})}
					</nav>

					<div className="mt-6">
						<DropdownMenu>
							<DropdownMenuTrigger asChild>
								<button
									type="button"
									className={cn(
										"flex w-full items-center gap-3 overflow-hidden rounded-[24px] border border-[var(--brand-border-soft)] bg-background/72 p-3 text-left transition-[width,gap,padding,background-color] hover:bg-accent/60",
										sidebarTransitionClass,
										collapsed &&
											"lg:mx-auto lg:size-16 lg:justify-center lg:gap-0",
									)}
									aria-label={collapsed ? currentUser.fullName : undefined}
								>
									<div className="flex size-10 items-center justify-center rounded-2xl bg-gradient-brand text-sm font-semibold text-white">
										{currentUser.fullName
											.split(" ")
											.map((part) => part[0])
											.join("")
											.slice(0, 2)}
									</div>
									<SidebarCopy
										collapsed={collapsed}
										className={collapsed ? undefined : "flex-1"}
									>
										<div className="truncate text-sm font-medium">
											{currentUser.fullName}
										</div>
										<div className="text-xs text-muted-foreground">
											{currentRoles?.map((role) => role.label).join(", ") ?? "Member"}
										</div>
									</SidebarCopy>
									<ChevronDown
										className={cn(
											"h-4 shrink-0 overflow-hidden text-muted-foreground transition-[width,opacity,transform]",
											sidebarTransitionClass,
											collapsed
												? "lg:w-0 lg:scale-90 lg:opacity-0"
												: "w-4 opacity-100 scale-100",
										)}
										aria-hidden={collapsed ? true : undefined}
									/>
								</button>
							</DropdownMenuTrigger>
							<DropdownMenuContent
								align="start"
								side="top"
								className={cn(
									"rounded-[24px] p-2",
									collapsed
										? "min-w-56"
										: "w-(--radix-dropdown-menu-trigger-width) min-w-0",
								)}
							>
								<div className="mb-1 border-b border-border px-3 py-3">
									<div className="text-sm font-medium">{currentUser.fullName}</div>
									<div className="mt-1 text-xs text-muted-foreground">
										{currentUser.email}
									</div>
								</div>
								<DropdownMenuItem
									asChild
									className="rounded-[18px] px-3 py-2.5"
								>
									<Link to="/dashboard/settings">
										<Settings className="size-4" />
										Account settings
									</Link>
								</DropdownMenuItem>
								<DropdownMenuItem className="rounded-[18px] px-3 py-2.5">
									<Command className="size-4" />
									Command menu
								</DropdownMenuItem>
								<DropdownMenuItem
									className="rounded-[18px] px-3 py-2.5"
									onSelect={() => {
										void logoutCustomer();
										onClose();
										navigate("/");
									}}
								>
									<LogOut className="size-4" />
									Sign out
								</DropdownMenuItem>
							</DropdownMenuContent>
						</DropdownMenu>
					</div>
				</div>
			</aside>
		</>
	);
}

function TopBar({
	collapsed,
	onOpenMobile,
	onToggleSidebar,
	onOpenAssistant,
}: {
	collapsed: boolean;
	onOpenMobile: () => void;
	onToggleSidebar: () => void;
	onOpenAssistant: () => void;
}) {
	const location = useLocation();
	const breadcrumbs = getDashboardBreadcrumbs(location.pathname);
	const previousCrumb = breadcrumbs.at(-2);
	const backTarget = previousCrumb?.href ?? "/dashboard";
	const showHomeBack = backTarget === "/dashboard";
	const atDashboardRoot =
		breadcrumbs.length === 1 && backTarget === "/dashboard";

	return (
		<header className="dashboard-topbar relative z-20 flex-none">
			<div className="relative z-10 flex h-[72px] items-center gap-4 px-3 sm:px-4 lg:pl-0 lg:pr-4">
				<div className="flex min-w-0 flex-1 items-center gap-2 sm:gap-3">
					<Button
						variant="outline"
						size="icon-sm"
						className="lg:hidden"
						onClick={onOpenMobile}
						aria-label="Open sidebar"
					>
						<Menu className="size-4" />
					</Button>
					<Button
						variant="outline"
						size="icon-sm"
						className="hidden lg:inline-flex"
						onClick={onToggleSidebar}
						aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
					>
						{collapsed ? (
							<PanelLeftOpen className="size-4" />
						) : (
							<PanelLeftClose className="size-4" />
						)}
					</Button>
					<Link
						to="/dashboard"
						className="inline-flex shrink-0 lg:hidden"
						aria-label="BrokeStack dashboard home"
					>
						<Logo size="sm" showText={false} />
					</Link>
					{atDashboardRoot ? (
						<Button
							variant="ghost"
							size="icon-sm"
							className="rounded-full"
							disabled
							aria-label="Go to dashboard home"
						>
							<Home className="size-4" />
						</Button>
					) : (
						<Button
							variant="ghost"
							size="icon-sm"
							className="rounded-full"
							asChild
							aria-label={showHomeBack ? "Go to dashboard home" : "Go back"}
						>
							<Link to={backTarget}>
								{showHomeBack ? (
									<Home className="size-4" />
								) : (
									<ChevronLeft className="size-4" />
								)}
							</Link>
						</Button>
					)}
					<Breadcrumb className="min-w-0">
						<BreadcrumbList className="flex-nowrap gap-1.5 overflow-hidden whitespace-nowrap">
							{breadcrumbs.map((crumb, index) => {
								const isCurrent = index === breadcrumbs.length - 1;

								return (
									<BreadcrumbItem key={crumb.href} className="shrink-0">
										{index > 0 ? <BreadcrumbSeparator /> : null}
										{isCurrent ? (
											<BreadcrumbPage className="truncate font-medium">
												{crumb.label}
											</BreadcrumbPage>
										) : (
											<BreadcrumbLink asChild className="truncate">
												<Link to={crumb.href}>{crumb.label}</Link>
											</BreadcrumbLink>
										)}
									</BreadcrumbItem>
								);
							})}
						</BreadcrumbList>
					</Breadcrumb>
				</div>

				<div className="ml-auto flex items-center gap-2 sm:gap-3">
					<div className="hidden w-[min(38vw,420px)] md:block">
						<SearchCommand
							onOpenAssistant={onOpenAssistant}
							className="w-full"
						/>
					</div>
					<ThemeToggle compact className="size-10" />
					<AlertInbox />
					<Button
						type="button"
						className="assistant-launch h-10 rounded-full px-4"
						onClick={onOpenAssistant}
					>
						<WandSparkles className="assistant-launch__icon size-4" />
						<span className="assistant-launch__title">Mira</span>
					</Button>
				</div>
			</div>
		</header>
	);
}

function defaultWorkspaceName(fullName: string) {
	const trimmedName = fullName.trim();
	if (!trimmedName) {
		return "My Workspace";
	}
	return trimmedName.toLowerCase().endsWith("s")
		? `${trimmedName}' Workspace`
		: `${trimmedName}'s Workspace`;
}

function DashboardOnboarding() {
	const navigate = useNavigate();
	const {
		customerSession,
		customerRequest,
		logoutCustomer,
		refreshCustomerSession,
	} = useAuth();
	const [workspaceName, setWorkspaceName] = useState(
		defaultWorkspaceName(customerSession?.user.fullName ?? ""),
	);
	const [submitting, setSubmitting] = useState(false);
	const [error, setError] = useState<string | null>(null);

	async function handleCreateWorkspace(event: React.FormEvent<HTMLFormElement>) {
		event.preventDefault();
		setSubmitting(true);
		setError(null);
		try {
			await customerRequest("/workspaces", {
				method: "POST",
				body: {
					name:
						workspaceName.trim() ||
						defaultWorkspaceName(customerSession?.user.fullName ?? ""),
				},
				workspaceId: null,
			});
			await refreshCustomerSession();
			navigate("/dashboard", { replace: true });
		} catch (createError) {
			setError(
				createError instanceof Error
					? createError.message
					: "Unable to create a workspace right now.",
			);
		} finally {
			setSubmitting(false);
		}
	}

	return (
		<div className="app-shell dashboard-shell h-[100dvh] overflow-hidden">
			<div className="dashboard-shell-surface relative flex h-full min-h-0 flex-col overflow-hidden">
				<main className="dashboard-main flex min-h-0 flex-1 flex-col px-3 py-3 sm:px-4 sm:py-4">
					<div className="dashboard-content-frame relative z-10 flex min-h-0 flex-1 flex-col rounded-[30px]">
						<div className="flex min-h-full flex-1 items-center justify-center px-4 py-8 sm:px-6 lg:px-8">
							<div className="w-full max-w-3xl rounded-[32px] border border-[var(--brand-border-soft)] bg-background/86 p-6 shadow-[0_28px_80px_-40px_var(--brand-shadow)] backdrop-blur-xl sm:p-8">
								<div className="inline-flex items-center gap-2 rounded-full border border-[var(--brand-border-soft)] bg-background/80 px-3 py-1.5 text-xs font-medium uppercase tracking-[0.18em] text-[var(--brand-accent)]">
									<WandSparkles className="size-3.5" />
									Workspace onboarding
								</div>
								<h1 className="mt-5 text-3xl font-semibold tracking-tight sm:text-4xl">
									Create your first workspace
								</h1>
								<p className="mt-4 max-w-2xl text-sm leading-7 text-muted-foreground sm:text-base">
									Your account is active, but there is no workspace attached yet.
									Every user can enter the client area, and staff access is
									simply layered on top. Create a workspace now to unlock runs,
									artifacts, workflows, and API usage views.
								</p>
								<form className="mt-8 space-y-4" onSubmit={handleCreateWorkspace}>
									<div className="space-y-2">
										<label className="text-sm font-medium" htmlFor="workspace-name">
											Workspace name
										</label>
										<Input
											id="workspace-name"
											value={workspaceName}
											onChange={(event) => setWorkspaceName(event.target.value)}
											placeholder="Acme Tools"
										/>
									</div>
									{error ? (
										<div className="rounded-[20px] border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-600 dark:text-red-300">
											{error}
										</div>
									) : null}
									<div className="flex flex-col gap-3 sm:flex-row">
										<Button
											type="submit"
											className="rounded-full bg-gradient-brand text-white border-0"
											disabled={submitting}
										>
											{submitting ? "Creating workspace..." : "Create workspace"}
										</Button>
										<Button
											type="button"
											variant="outline"
											className="rounded-full"
											onClick={() => {
												void logoutCustomer();
												navigate("/", { replace: true });
											}}
										>
											Sign out
										</Button>
									</div>
								</form>
							</div>
						</div>
					</div>
				</main>
			</div>
		</div>
	);
}

export function DashboardLayout() {
	const [collapsed, setCollapsed] = useState(false);
	const [mobileOpen, setMobileOpen] = useState(false);
	const [assistantOpen, setAssistantOpen] = useState(false);
	const location = useLocation();
	const { customerSession, activeWorkspaceMembership } = useAuth();
	const hasWorkspaceAccess =
		customerSession?.workspaceMemberships.some(
			(membership) =>
				membership.status === "active" && membership.workspaceStatus === "active",
		) ?? false;

	useEffect(() => {
		if (location.pathname) {
			setMobileOpen(false);
		}
	}, [location.pathname]);

	if (customerSession && !hasWorkspaceAccess) {
		return <DashboardOnboarding />;
	}

	return (
		<div className="app-shell dashboard-shell h-[100dvh] overflow-hidden">
			<div className="dashboard-shell-surface relative flex h-full min-h-0 flex-col overflow-hidden lg:flex-row">
				<Sidebar
					collapsed={collapsed}
					mobileOpen={mobileOpen}
					onClose={() => setMobileOpen(false)}
				/>
				<div className="relative flex min-h-0 min-w-0 flex-1 flex-col">
					<TopBar
						collapsed={collapsed}
						onOpenMobile={() => setMobileOpen(true)}
						onToggleSidebar={() => setCollapsed((value) => !value)}
						onOpenAssistant={() => setAssistantOpen(true)}
					/>
					<main className="dashboard-main flex min-h-0 flex-1 flex-col px-3 pt-0 pb-3 sm:px-4 sm:pt-0 sm:pb-4 lg:pl-0">
						<div className="dashboard-content-frame relative z-10 flex min-h-0 flex-1 flex-col rounded-[30px]">
							<ScrollArea
								type="scroll"
								scrollHideDelay={180}
								className="dashboard-content-scroll min-h-0 flex-1 rounded-[inherit]"
								scrollbarClassName="dashboard-content-scrollbar"
								thumbClassName="dashboard-content-scrollbar-thumb"
							>
								<div className="flex min-h-full flex-col px-4 py-6 sm:px-6 sm:pr-8 lg:px-8 lg:pr-10">
									{customerSession?.impersonator ? (
										<div className="mb-4 rounded-[24px] border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm text-amber-700 dark:text-amber-300">
											Support impersonation active. Acting as{" "}
											{customerSession.user.fullName} on behalf of{" "}
											{customerSession.impersonator.fullName}.
										</div>
									) : null}
									{customerSession?.assumedWorkspaceId ? (
										<div className="mb-6 rounded-[24px] border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm text-amber-700 dark:text-amber-300">
											Support access session active for{" "}
											{activeWorkspaceMembership?.workspaceName ?? "workspace"}.
										</div>
									) : null}
									<Outlet />
								</div>
							</ScrollArea>
						</div>
					</main>
				</div>
			</div>
			<MiraAssistant
				open={assistantOpen}
				onOpenChange={setAssistantOpen}
				workspaceName={activeWorkspaceMembership?.workspaceName ?? "Workspace"}
				currentUserName={customerSession?.user.fullName ?? "User"}
			/>
		</div>
	);
}
