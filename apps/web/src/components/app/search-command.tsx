import {
	CalendarRange,
	FileSearch,
	FileStack,
	FolderKanban,
	Home,
	LineChart,
	Search,
	Settings,
	Users2,
	WandSparkles,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router";

import {
	CommandDialog,
	CommandEmpty,
	CommandGroup,
	CommandInput,
	CommandItem,
	CommandList,
	Command as CommandMenu,
	CommandSeparator,
	CommandShortcut,
} from "@/components/ui/command";
import { Kbd, KbdGroup } from "@/components/ui/kbd";
import { cn } from "@/lib/utils";

type SearchCommandProps = {
	className?: string;
	onOpenAssistant: () => void;
};

type CommandEntry = {
	id: string;
	icon: typeof Home;
	keywords: string[];
	label: string;
	onSelect: () => void;
	section: "navigate" | "search" | "assistant";
	shortcut?: string;
	subtitle: string;
};

export function SearchCommand({
	className,
	onOpenAssistant,
}: SearchCommandProps) {
	const location = useLocation();
	const navigate = useNavigate();
	const [open, setOpen] = useState(false);

	useEffect(() => {
		function handleKeyDown(event: KeyboardEvent) {
			const target = event.target as HTMLElement | null;
			const isTypingTarget =
				target instanceof HTMLInputElement ||
				target instanceof HTMLTextAreaElement ||
				target?.isContentEditable;

			if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
				event.preventDefault();
				setOpen((current) => !current);
				return;
			}

			if (isTypingTarget) {
				return;
			}

			if (event.key === "/") {
				event.preventDefault();
				setOpen(true);
			}
		}

		window.addEventListener("keydown", handleKeyDown);

		return () => window.removeEventListener("keydown", handleKeyDown);
	}, []);

	function navigateTo(path: string) {
		setOpen(false);
		navigate(path);
	}

	const entries: CommandEntry[] = [
		{
			id: "nav-overview",
			icon: Home,
			label: "Overview",
			subtitle: "Open the workspace control room.",
			keywords: ["dashboard", "overview", "home", "summary", "control room"],
			section: "navigate",
			onSelect: () => navigateTo("/dashboard"),
		},
		{
			id: "nav-posts",
			icon: FileStack,
			label: "Runs",
			subtitle: "Browse queued, active, and completed tool runs.",
			keywords: ["runs", "jobs", "queue", "tools", "executions"],
			section: "navigate",
			onSelect: () => navigateTo("/dashboard/posts"),
		},
		{
			id: "nav-calendar",
			icon: CalendarRange,
			label: "Calendar",
			subtitle: "Inspect scheduled executions and recurring jobs.",
			keywords: ["calendar", "schedule", "dates", "timeline", "jobs"],
			section: "navigate",
			onSelect: () => navigateTo("/dashboard/calendar"),
		},
		{
			id: "nav-analytics",
			icon: LineChart,
			label: "Usage",
			subtitle: "Review workspace usage, latency, and API demand.",
			keywords: ["usage", "metrics", "performance", "reporting", "api"],
			section: "navigate",
			onSelect: () => navigateTo("/dashboard/analytics"),
		},
		{
			id: "nav-images",
			icon: WandSparkles,
			label: "Images",
			subtitle: "Review generated images from the web flow and API.",
			keywords: ["images", "generation", "art", "batch", "prompts"],
			section: "navigate",
			onSelect: () => navigateTo("/dashboard/images"),
		},
		{
			id: "nav-api",
			icon: Settings,
			label: "API",
			subtitle: "Manage workspace API keys, quotas, and docs.",
			keywords: ["api", "keys", "docs", "quotas", "integrations"],
			section: "navigate",
			onSelect: () => navigateTo("/dashboard/api"),
		},
		{
			id: "nav-library",
			icon: FolderKanban,
			label: "Artifacts",
			subtitle: "Find outputs, templates, prompts, and uploaded files.",
			keywords: ["artifacts", "assets", "files", "templates", "outputs"],
			section: "navigate",
			onSelect: () => navigateTo("/dashboard/library"),
		},
		{
			id: "nav-team",
			icon: Users2,
			label: "Team",
			subtitle: "Inspect owners, load, and operational risks.",
			keywords: ["team", "owners", "workload", "staffing", "operations"],
			section: "navigate",
			onSelect: () => navigateTo("/dashboard/team"),
		},
		{
			id: "nav-settings",
			icon: Settings,
			label: "Settings",
			subtitle: "Manage workspace defaults, limits, and notification rules.",
			keywords: ["settings", "preferences", "notifications", "workspace", "limits"],
			section: "navigate",
			onSelect: () => navigateTo("/dashboard/settings"),
		},
		{
			id: "search-runs",
			icon: Search,
			label: "Find runs",
			subtitle: "Jump into tool runs and execution history.",
			keywords: ["search runs", "jobs", "executions", "tools"],
			section: "search",
			onSelect: () => navigateTo("/dashboard/posts"),
			shortcut: "Runs",
		},
		{
			id: "search-assets",
			icon: FileSearch,
			label: "Find files and outputs",
			subtitle: "Open the artifact library to inspect generated results.",
			keywords: ["search files", "artifacts", "outputs", "library"],
			section: "search",
			onSelect: () => navigateTo("/dashboard/library"),
			shortcut: "Artifacts",
		},
		{
			id: "search-images",
			icon: WandSparkles,
			label: "Find image jobs",
			subtitle: "Open the Images table to inspect web and API generations.",
			keywords: ["images", "jobs", "generation", "api", "web"],
			section: "search",
			onSelect: () => navigateTo("/dashboard/images"),
			shortcut: "Images",
		},
		{
			id: "search-teammates",
			icon: Users2,
			label: "Find teammates",
			subtitle: "Review team ownership and capacity.",
			keywords: ["teammates", "people", "owners", "team"],
			section: "search",
			onSelect: () => navigateTo("/dashboard/team"),
			shortcut: "Team",
		},
		{
			id: "assistant-open",
			icon: WandSparkles,
			label: "Open Mira",
			subtitle: "Ask Mira about the current dashboard view.",
			keywords: ["mira", "assistant", "copilot", "chat"],
			section: "assistant",
			onSelect: () => {
				setOpen(false);
				onOpenAssistant();
			},
			shortcut: "M",
		},
	];

	const currentPathLabel =
		entries.find(
			(entry) =>
				entry.section === "navigate" && location.pathname === getPath(entry.id),
		)?.label ?? "Workspace";

	return (
		<>
			<button
				type="button"
				onClick={() => setOpen(true)}
				className={cn(
					"flex h-10 w-full items-center justify-between gap-3 rounded-full border border-[color-mix(in_srgb,var(--brand-border-strong)_82%,transparent)] bg-background/42 px-4 text-left backdrop-blur-sm transition-colors hover:bg-accent/35",
					className,
				)}
				aria-label="Open search and command menu"
			>
				<div className="flex min-w-0 items-center gap-3">
					<Search className="size-4 shrink-0 text-muted-foreground" />
					<div className="min-w-0">
						<div className="truncate text-sm text-muted-foreground">
							Search runs, artifacts, or teammates
						</div>
					</div>
				</div>
				<KbdGroup className="hidden shrink-0 items-center sm:inline-flex">
					<Kbd className="min-w-6 bg-background/70 px-1.5">Ctrl</Kbd>
					<Kbd className="min-w-5 bg-background/70 px-1.5">K</Kbd>
				</KbdGroup>
			</button>

			<CommandDialog
				open={open}
				onOpenChange={setOpen}
				showCloseButton={false}
				title="Global search"
				description="Search navigation, workspace targets, and assistant actions."
				className="top-[18%] translate-y-0 rounded-[28px]! border border-[var(--brand-border-soft)] bg-[linear-gradient(180deg,color-mix(in_srgb,var(--card)_98%,transparent)_0%,color-mix(in_srgb,var(--brand-highlight)_8%,var(--card)_92%)_100%)] p-0 sm:max-w-[680px]"
			>
				<CommandMenu className="rounded-[28px]! bg-transparent p-0">
					<div className="border-b border-[var(--brand-border-soft)] px-4 py-4">
						<div className="mb-3 flex items-center justify-between gap-3">
							<div>
								<div className="text-sm font-semibold tracking-tight">
									Search and command
								</div>
								<div className="text-xs text-muted-foreground">
									Current view: {currentPathLabel}
								</div>
							</div>
							<KbdGroup className="hidden sm:inline-flex">
								<Kbd className="bg-background/80 px-1.5">Ctrl</Kbd>
								<Kbd className="bg-background/80 px-1.5">K</Kbd>
							</KbdGroup>
						</div>
						<CommandInput placeholder="Search pages, runs, files, teammates, or Mira..." />
					</div>
					<CommandList className="max-h-[420px] px-2 pb-3 pt-2">
						<CommandEmpty className="py-10 text-sm text-muted-foreground">
							No matching command.
						</CommandEmpty>

						<CommandGroup heading="Navigate">
							{entries
								.filter((entry) => entry.section === "navigate")
								.map((entry) => (
									<CommandPaletteItem key={entry.id} entry={entry} />
								))}
						</CommandGroup>

						<CommandSeparator className="mx-2 my-1" />

						<CommandGroup heading="Search workspace">
							{entries
								.filter((entry) => entry.section === "search")
								.map((entry) => (
									<CommandPaletteItem key={entry.id} entry={entry} />
								))}
						</CommandGroup>

						<CommandSeparator className="mx-2 my-1" />

						<CommandGroup heading="Assistant">
							{entries
								.filter((entry) => entry.section === "assistant")
								.map((entry) => (
									<CommandPaletteItem key={entry.id} entry={entry} />
								))}
						</CommandGroup>
					</CommandList>
				</CommandMenu>
			</CommandDialog>
		</>
	);
}

function CommandPaletteItem({ entry }: { entry: CommandEntry }) {
	return (
		<CommandItem
			value={[entry.label, entry.subtitle, ...entry.keywords].join(" ")}
			onSelect={entry.onSelect}
			className="rounded-[18px]! px-3 py-3"
		>
			<div className="flex size-9 shrink-0 items-center justify-center rounded-2xl bg-[color-mix(in_srgb,var(--brand-highlight)_14%,transparent)] text-[var(--brand-primary)]">
				<entry.icon className="size-4" />
			</div>
			<div className="min-w-0">
				<div className="text-sm font-medium">{entry.label}</div>
				<div className="mt-0.5 truncate text-xs text-muted-foreground">
					{entry.subtitle}
				</div>
			</div>
			{entry.shortcut ? (
				<CommandShortcut className="tracking-[0.14em]">
					{entry.shortcut}
				</CommandShortcut>
			) : null}
		</CommandItem>
	);
}

function getPath(entryId: string) {
	switch (entryId) {
		case "nav-overview":
			return "/dashboard";
		case "nav-posts":
			return "/dashboard/posts";
		case "nav-calendar":
			return "/dashboard/calendar";
		case "nav-analytics":
			return "/dashboard/analytics";
		case "nav-images":
			return "/dashboard/images";
		case "nav-api":
			return "/dashboard/api";
		case "nav-library":
			return "/dashboard/library";
		case "nav-team":
			return "/dashboard/team";
		case "nav-settings":
			return "/dashboard/settings";
		default:
			return "";
	}
}
