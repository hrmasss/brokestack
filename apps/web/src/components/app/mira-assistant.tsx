import { ChevronDown, Clock3, Plus, WandSparkles, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useLocation } from "react-router";

import { getDashboardContextLabel } from "@/components/app/dashboard-context";
import { Button } from "@/components/ui/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
	Sheet,
	SheetClose,
	SheetContent,
	SheetDescription,
	SheetHeader,
	SheetTitle,
} from "@/components/ui/sheet";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

const assistantProfile = {
	name: "Mira",
	description: "Workspace copilot for the page you are viewing.",
	status: "In workspace context",
};

const threadToolbarControlClasses =
	"h-10 rounded-full border-[var(--brand-border-soft)] bg-background/88 px-4 text-sm font-medium leading-none shadow-none";

type AssistantMessage = {
	id: string;
	role: "assistant" | "user";
	content: string;
	timestamp: string;
};

type AssistantSuggestion = {
	id: string;
	label: string;
	detail: string;
	prompt: string;
};

type AssistantThread = {
	id: string;
	title: string;
	contextLabel: string;
	contextPath: string;
	updatedAt: string;
	isDraft: boolean;
	messages: AssistantMessage[];
	suggestions: AssistantSuggestion[];
};

function createLocalId(prefix: string) {
	return `${prefix}-${Math.random().toString(36).slice(2, 8)}-${Date.now().toString(36)}`;
}

function createAssistantSuggestions(
	pathname: string,
	contextLabel: string,
): AssistantSuggestion[] {
	if (pathname.startsWith("/dashboard/team")) {
		return [
			{
				id: "team-load",
				label: "Load balance",
				detail: "Spot who needs relief first.",
				prompt:
					"Based on the Team page, who looks overloaded and what should I rebalance first?",
			},
			{
				id: "team-note",
				label: "Draft manager note",
				detail: "Turn the page into a quick handoff.",
				prompt:
					"Draft a short manager note from the Team page about load balancing and ownership gaps.",
			},
			{
				id: "team-risks",
				label: "Risk scan",
				detail: "Find the staffing risk signals.",
				prompt:
					"Summarize the main staffing and ownership risks visible on the Team page.",
			},
		];
	}

	if (pathname.startsWith("/dashboard/calendar")) {
		return [
			{
				id: "calendar-priority",
				label: "Next 48 hours",
				detail: "Prioritize the schedule pressure points.",
				prompt:
					"What should I focus on in the next 48 hours from the Calendar view?",
			},
			{
				id: "calendar-bottleneck",
				label: "Review bottlenecks",
				detail: "Surface schedule and dependency collisions.",
				prompt:
					"Which review bottlenecks are most likely to cause slippage from the Calendar page?",
			},
			{
				id: "calendar-brief",
				label: "Daily brief",
				detail: "Generate a planning snapshot.",
				prompt: "Turn the Calendar page into a concise daily planning brief.",
			},
		];
	}

	if (pathname.startsWith("/dashboard/analytics")) {
		return [
			{
				id: "analytics-read",
				label: "Read the numbers",
				detail: "Explain the story behind the metrics.",
				prompt:
					"What is the clearest story in the Usage view, and what should I investigate next?",
			},
			{
				id: "analytics-brief",
				label: "Executive summary",
				detail: "Condense performance into action.",
				prompt:
					"Write a short executive summary based on the Usage page with two clear follow-ups.",
			},
			{
				id: "analytics-gap",
				label: "Performance gaps",
				detail: "Highlight weak spots fast.",
				prompt:
					"Point out the main operational gaps suggested by the Usage page.",
			},
		];
	}

	if (pathname.startsWith("/dashboard/posts")) {
		return [
			{
				id: "posts-review",
				label: "Execution queue",
				detail: "Sort what needs attention first.",
				prompt:
					"From the Runs page, which items should I review or unblock first today?",
			},
			{
				id: "posts-draft",
				label: "Ops update",
				detail: "Turn page state into an execution brief.",
				prompt:
					"Draft a short team update about the current run queue and what needs intervention.",
			},
			{
				id: "posts-risks",
				label: "Execution risks",
				detail: "Catch what might fail or slip.",
				prompt:
					"Summarize the main execution risks implied by the Runs page.",
			},
		];
	}

	return [
		{
			id: "overview-risks",
			label: "Risk summary",
			detail: `Scan the ${contextLabel} view for urgency.`,
			prompt: `Summarize the biggest risks visible from the ${contextLabel} page.`,
		},
		{
			id: "overview-brief",
			label: "Standup brief",
			detail: "Turn signals into a quick team note.",
			prompt: `Turn the ${contextLabel} page into a standup brief for the team.`,
		},
		{
			id: "overview-next",
			label: "Next three moves",
			detail: "Get concrete interventions, not commentary.",
			prompt: `From the ${contextLabel} view, what are the next three interventions I should make?`,
		},
	];
}

function createDraftThread(pathname: string): AssistantThread {
	const contextLabel = getDashboardContextLabel(pathname);

	return {
		id: createLocalId("thread"),
		title: "New thread",
		contextLabel,
		contextPath: pathname,
		updatedAt: "Ready",
		isDraft: true,
		messages: [],
		suggestions: createAssistantSuggestions(pathname, contextLabel),
	};
}

function createHistoryThread({
	title,
	contextPath,
	updatedAt,
	messages,
}: {
	title: string;
	contextPath: string;
	updatedAt: string;
	messages: AssistantMessage[];
}): AssistantThread {
	return {
		id: createLocalId("thread"),
		title,
		contextLabel: getDashboardContextLabel(contextPath),
		contextPath,
		updatedAt,
		isDraft: false,
		messages,
		suggestions: createAssistantSuggestions(
			contextPath,
			getDashboardContextLabel(contextPath),
		),
	};
}

function createInitialAssistantThreads(pathname: string): AssistantThread[] {
	return [
		createDraftThread(pathname),
		createHistoryThread({
			title: "Morning risk sweep",
			contextPath: "/dashboard",
			updatedAt: "12m ago",
			messages: [
				{
					id: createLocalId("msg"),
					role: "user",
					content:
						"What should I clear first from the Overview page this morning?",
					timestamp: "12:08 AM",
				},
				{
					id: createLocalId("msg"),
					role: "assistant",
					content:
						"Start with anything already blocked by external review, then move to owners carrying both review-stage and urgent launch work. That clears operational pressure fastest.",
					timestamp: "12:09 AM",
				},
			],
		}),
		createHistoryThread({
			title: "Team handoff note",
			contextPath: "/dashboard/team",
			updatedAt: "Yesterday",
			messages: [
				{
					id: createLocalId("msg"),
					role: "user",
					content:
						"Draft a quick handoff note for the team leads based on workload pressure.",
					timestamp: "Yesterday",
				},
				{
					id: createLocalId("msg"),
					role: "assistant",
					content:
						"Draft: Team leads, please flag any owner carrying simultaneous review and launch-critical work today. Reassign follow-up tasks where possible and note blockers before the noon checkpoint.",
					timestamp: "Yesterday",
				},
			],
		}),
	];
}

function createThreadTitleFromPrompt(prompt: string, fallback: string) {
	const cleaned = prompt.replace(/\s+/g, " ").trim();

	if (!cleaned) {
		return fallback;
	}

	return cleaned.length > 32 ? `${cleaned.slice(0, 32).trimEnd()}...` : cleaned;
}

function getThreadPreview(thread: AssistantThread) {
	if (thread.messages.length === 0) {
		return `Suggestions ready for ${thread.contextLabel}`;
	}

	return (
		thread.messages.at(-1)?.content ?? `Conversation for ${thread.contextLabel}`
	);
}

function getThreadMetaLabel(thread: AssistantThread) {
	if (thread.isDraft) {
		return `${thread.contextLabel} draft`;
	}

	return `${thread.contextLabel} · ${thread.updatedAt}`;
}

function getContextMetaLine(contextLabel: string, workspaceName: string) {
	return `${contextLabel} • ${workspaceName} • ${assistantProfile.status}`;
}

function buildAssistantReply(input: string, contextLabel: string) {
	const normalized = input.toLowerCase();

	if (
		normalized.includes("risk") ||
		normalized.includes("slip") ||
		normalized.includes("block")
	) {
		return `Highest risk in ${contextLabel}: runs that are blocked on credentials or upstream dependencies. Clear those first, then review anything repeatedly failing on the same worker path.`;
	}

	if (
		normalized.includes("draft") ||
		normalized.includes("write") ||
		normalized.includes("message")
	) {
		return "Draft: Team, quick pulse check before end of day: flag any tool run missing credentials, provider quota, or input files. If a job is at risk, include owner, blocker, and the next unblock step.";
	}

	if (
		normalized.includes("calendar") ||
		normalized.includes("schedule") ||
		normalized.includes("timeline")
	) {
		return `For ${contextLabel}, I would review anything due in the next 48 hours, group it by worker dependency, and move low-risk runs earlier so the execution queue stays breathable.`;
	}

	if (
		normalized.includes("team") ||
		normalized.includes("owner") ||
		normalized.includes("workload")
	) {
		return "Two useful checks: look for owners attached to both failed runs and live incidents, then rebalance anything that needs same-day follow-up. That usually reduces avoidable churn fastest.";
	}

	if (
		normalized.includes("analytics") ||
		normalized.includes("performance") ||
		normalized.includes("metric")
	) {
		return "I would read usage in three passes: run volume, latency trend, then failure pockets. If volume is stable but latency climbs, the bottleneck is probably operational rather than demand-driven.";
	}

	return `I am reading the ${contextLabel} view. Ask for a summary, a draft message, or the next three interventions to turn this page into an action list.`;
}

type MiraAssistantProps = {
	currentUserName: string;
	open: boolean;
	onOpenChange: (open: boolean) => void;
	workspaceName: string;
};

export function MiraAssistant({
	currentUserName,
	open,
	onOpenChange,
	workspaceName,
}: MiraAssistantProps) {
	const location = useLocation();
	const [threads, setThreads] = useState<AssistantThread[]>(() =>
		createInitialAssistantThreads(location.pathname),
	);
	const [currentThreadId, setCurrentThreadId] = useState(() =>
		createLocalId("pending"),
	);
	const [draft, setDraft] = useState("");
	const [thinkingThreadId, setThinkingThreadId] = useState<string | null>(null);
	const bottomRef = useRef<HTMLDivElement | null>(null);
	const timeoutRef = useRef<number | null>(null);
	const hasMountedRef = useRef(false);
	const previousScrollStateRef = useRef({
		threadId: "",
		messageCount: 0,
		isThinking: false,
	});
	const currentThread =
		threads.find((thread) => thread.id === currentThreadId) ?? threads[0];
	const isCurrentThreadThinking = thinkingThreadId === currentThread?.id;

	useEffect(() => {
		if (currentThreadId.startsWith("pending") && threads[0]) {
			setCurrentThreadId(threads[0].id);
		}
	}, [currentThreadId, threads]);

	useEffect(() => {
		if (!currentThread) {
			return;
		}

		const shouldScroll =
			hasMountedRef.current &&
			(previousScrollStateRef.current.threadId !== currentThread.id ||
				previousScrollStateRef.current.messageCount !==
					currentThread.messages.length ||
				previousScrollStateRef.current.isThinking !== isCurrentThreadThinking);

		previousScrollStateRef.current = {
			threadId: currentThread.id,
			messageCount: currentThread.messages.length,
			isThinking: isCurrentThreadThinking,
		};

		if (!hasMountedRef.current) {
			hasMountedRef.current = true;
			return;
		}

		if (!shouldScroll) {
			return;
		}

		const frame = window.requestAnimationFrame(() => {
			bottomRef.current?.scrollIntoView({ behavior: "smooth" });
		});

		return () => window.cancelAnimationFrame(frame);
	});

	useEffect(() => {
		if (!currentThread) {
			return;
		}

		if (!currentThread.isDraft || currentThread.messages.length > 0) {
			return;
		}

		if (currentThread.contextPath === location.pathname) {
			return;
		}

		const nextContextLabel = getDashboardContextLabel(location.pathname);

		setThreads((current) =>
			current.map((thread) =>
				thread.id === currentThread.id
					? {
							...thread,
							contextPath: location.pathname,
							contextLabel: nextContextLabel,
							suggestions: createAssistantSuggestions(
								location.pathname,
								nextContextLabel,
							),
						}
					: thread,
			),
		);
	}, [currentThread, location.pathname]);

	useEffect(() => {
		return () => {
			if (timeoutRef.current) {
				window.clearTimeout(timeoutRef.current);
			}
		};
	}, []);

	function updateThread(
		threadId: string,
		updater: (thread: AssistantThread) => AssistantThread,
	) {
		setThreads((current) => {
			const target = current.find((thread) => thread.id === threadId);

			if (!target) {
				return current;
			}

			const updated = updater(target);

			return [updated, ...current.filter((thread) => thread.id !== threadId)];
		});
	}

	function selectThread(threadId: string) {
		setCurrentThreadId(threadId);
		setDraft("");
	}

	function createNewThread() {
		const nextThread = createDraftThread(location.pathname);

		setThreads((current) => [nextThread, ...current]);
		setCurrentThreadId(nextThread.id);
		setDraft("");
	}

	function submitMessage(rawValue: string) {
		const value = rawValue.trim();

		if (!value || !currentThread || isCurrentThreadThinking) {
			return;
		}

		const targetThreadId = currentThread.id;
		const fallbackTitle = currentThread.contextLabel;
		const timestamp = new Intl.DateTimeFormat("en", {
			hour: "numeric",
			minute: "2-digit",
		}).format(new Date());

		updateThread(targetThreadId, (thread) => ({
			...thread,
			title: thread.isDraft
				? createThreadTitleFromPrompt(value, fallbackTitle)
				: thread.title,
			updatedAt: timestamp,
			isDraft: false,
			messages: [
				...thread.messages,
				{
					id: createLocalId("msg"),
					role: "user",
					content: value,
					timestamp,
				},
			],
		}));
		setDraft("");
		setThinkingThreadId(targetThreadId);

		timeoutRef.current = window.setTimeout(() => {
			updateThread(targetThreadId, (thread) => ({
				...thread,
				updatedAt: "Just now",
				messages: [
					...thread.messages,
					{
						id: createLocalId("msg"),
						role: "assistant",
						content: buildAssistantReply(value, thread.contextLabel),
						timestamp: "Just now",
					},
				],
			}));
			setThinkingThreadId((current) =>
				current === targetThreadId ? null : current,
			);
			timeoutRef.current = null;
		}, 520);
	}

	if (!currentThread) {
		return null;
	}

	return (
		<Sheet open={open} onOpenChange={onOpenChange}>
			<SheetContent
				side="right"
				showCloseButton={false}
				className="w-full gap-0 border-l-0 bg-[color-mix(in_srgb,var(--background)_95%,white_5%)] p-0 sm:max-w-[680px] sm:border-l sm:border-[var(--brand-border-soft)]"
			>
				<SheetHeader className="gap-4 border-b border-[var(--brand-border-soft)] px-4 py-4 sm:px-5">
					<div className="flex items-start justify-between gap-4">
						<div className="flex min-w-0 items-start gap-3">
							<div className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-gradient-brand text-white shadow-[0_18px_40px_-26px_var(--brand-glow-strong)]">
								<WandSparkles className="size-4" />
							</div>
							<div className="min-w-0 max-w-[34rem]">
								<SheetTitle className="text-lg tracking-tight">
									{assistantProfile.name}
								</SheetTitle>
								<SheetDescription className="mt-0.5 text-sm leading-5">
									{assistantProfile.description}
								</SheetDescription>
							</div>
						</div>

						<SheetClose asChild>
							<Button
								type="button"
								variant="ghost"
								size="icon-sm"
								className="shrink-0 rounded-full text-muted-foreground hover:bg-accent/70 hover:text-foreground"
								aria-label="Close assistant"
							>
								<X className="size-4" />
							</Button>
						</SheetClose>
					</div>

					<div className="flex flex-col gap-3 sm:flex-row sm:items-center">
						<DropdownMenu>
							<DropdownMenuTrigger asChild>
								<Button
									type="button"
									variant="outline"
									className={cn(
										threadToolbarControlClasses,
										"flex min-w-0 flex-1 justify-between gap-3 text-left hover:bg-accent/60 sm:min-w-0",
									)}
								>
									<div className="flex min-w-0 items-center gap-2.5">
										<div className="truncate text-sm font-medium">
											{currentThread.title}
										</div>
										<div className="hidden h-1 w-1 shrink-0 rounded-full bg-border sm:block" />
										<div className="hidden truncate text-[11px] text-muted-foreground sm:block">
											{getThreadMetaLabel(currentThread)}
										</div>
									</div>
									<ChevronDown className="size-4 shrink-0 text-muted-foreground" />
								</Button>
							</DropdownMenuTrigger>
							<DropdownMenuContent align="start" className="rounded-[24px] p-2">
								<DropdownMenuLabel className="px-3 py-2 text-[11px] font-semibold uppercase tracking-[0.18em]">
									{threads.length} threads
								</DropdownMenuLabel>
								<DropdownMenuSeparator />
								{threads.map((thread) => (
									<DropdownMenuItem
										key={thread.id}
										onClick={() => selectThread(thread.id)}
										className="rounded-[18px] px-3 py-3"
									>
										<div className="min-w-0">
											<div className="flex items-start justify-between gap-3">
												<div className="min-w-0">
													<div className="truncate text-sm font-medium">
														{thread.title}
													</div>
													<div className="mt-1 truncate text-[11px] uppercase tracking-[0.14em] text-muted-foreground">
														{thread.contextLabel}
													</div>
												</div>
												{thread.id === currentThread.id ? (
													<div className="mt-1 size-2 rounded-full bg-primary" />
												) : null}
											</div>
											<div className="mt-2 line-clamp-2 text-xs leading-5 text-muted-foreground">
												{getThreadPreview(thread)}
											</div>
											<div className="mt-2 flex items-center gap-1.5 text-[11px] text-muted-foreground">
												<Clock3 className="size-3" />
												<span>{thread.updatedAt}</span>
											</div>
										</div>
									</DropdownMenuItem>
								))}
							</DropdownMenuContent>
						</DropdownMenu>

						<Button
							type="button"
							variant="outline"
							className={cn(
								threadToolbarControlClasses,
								"shrink-0 sm:min-w-[148px]",
							)}
							onClick={createNewThread}
						>
							<Plus className="size-4" />
							New thread
						</Button>
					</div>

					<div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
						<span className="rounded-full bg-[color-mix(in_srgb,var(--brand-highlight)_16%,transparent)] px-2.5 py-1 text-[11px] font-medium text-[var(--brand-accent)]">
							Live context
						</span>
						<span>
							{getContextMetaLine(currentThread.contextLabel, workspaceName)}
						</span>
					</div>
				</SheetHeader>

				<div className="flex min-h-0 flex-1 flex-col">
					<ScrollArea className="min-h-0 flex-1 px-4 py-4 sm:px-5">
						<div className="space-y-4">
							{currentThread.messages.length === 0 ? (
								<div className="rounded-[24px] border border-[var(--brand-border-soft)] bg-background/78 px-4 py-4 shadow-[0_20px_50px_-42px_rgba(61,26,14,0.34)]">
									<div className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[var(--brand-accent)]">
										Start with current context
									</div>
									<p className="mt-2 max-w-[46ch] text-sm leading-6 text-muted-foreground">
										Choose a starter prompt for {currentThread.contextLabel} or
										ask your own question below.
									</p>
									<div className="mt-4 flex flex-wrap gap-2.5">
										{currentThread.suggestions.map((suggestion) => (
											<button
												key={suggestion.id}
												type="button"
												className="rounded-full border border-[var(--brand-border-soft)] bg-background px-4 py-2.5 text-sm font-medium transition-colors hover:bg-accent/60"
												onClick={() => submitMessage(suggestion.prompt)}
												title={suggestion.detail}
											>
												{suggestion.label}
											</button>
										))}
									</div>
								</div>
							) : null}

							{currentThread.messages.map((message) => (
								<div
									key={message.id}
									className={cn(
										"flex",
										message.role === "user" ? "justify-end" : "justify-start",
									)}
								>
									<div
										className={cn(
											"max-w-[85%] rounded-[24px] px-4 py-3.5 shadow-[0_18px_40px_-34px_rgba(15,23,42,0.45)] sm:max-w-[78%]",
											message.role === "user"
												? "rounded-br-md bg-primary text-primary-foreground"
												: "rounded-bl-md border border-[var(--brand-border-soft)] bg-background/90 text-foreground",
										)}
									>
										<div className="text-sm leading-6">{message.content}</div>
										<div
											className={cn(
												"mt-2 text-[11px]",
												message.role === "user"
													? "text-primary-foreground/75"
													: "text-muted-foreground",
											)}
										>
											{message.role === "assistant"
												? assistantProfile.name
												: currentUserName}
											{" · "}
											{message.timestamp}
										</div>
									</div>
								</div>
							))}

							{isCurrentThreadThinking ? (
								<div className="flex justify-start">
									<div className="max-w-[85%] rounded-[24px] rounded-bl-md border border-[var(--brand-border-soft)] bg-background/90 px-4 py-3.5 text-sm text-muted-foreground sm:max-w-[78%]">
										<div className="flex items-center gap-2">
											<div className="flex items-center gap-1">
												<span className="size-1.5 rounded-full bg-[var(--brand-accent)] opacity-70" />
												<span className="size-1.5 rounded-full bg-[var(--brand-accent)] opacity-50" />
												<span className="size-1.5 rounded-full bg-[var(--brand-accent)] opacity-35" />
											</div>
											<span>
												{assistantProfile.name} is mapping the next move...
											</span>
										</div>
									</div>
								</div>
							) : null}
							<div ref={bottomRef} />
						</div>
					</ScrollArea>

					<div className="border-t border-[var(--brand-border-soft)] px-4 py-4 sm:px-5">
						<div className="rounded-[24px] border border-[var(--brand-border-soft)] bg-background/90 px-3 py-3 shadow-[0_20px_50px_-42px_rgba(15,23,42,0.4)]">
							<Textarea
								value={draft}
								onChange={(event) => setDraft(event.target.value)}
								onKeyDown={(event) => {
									if (event.key === "Enter" && !event.shiftKey) {
										event.preventDefault();
										submitMessage(draft);
									}
								}}
								placeholder={`Ask ${assistantProfile.name} about ${currentThread.contextLabel.toLowerCase()}...`}
								className="min-h-[4.75rem] resize-none border-0 bg-transparent px-1 py-1 shadow-none focus-visible:ring-0"
							/>
							<div className="mt-3 flex items-center justify-between gap-3">
								<div className="text-xs text-muted-foreground">
									Enter to send. Shift+Enter adds a line.
								</div>
								<Button
									type="button"
									className="rounded-full border-0 bg-gradient-brand px-4 text-white"
									onClick={() => submitMessage(draft)}
									disabled={!draft.trim() || isCurrentThreadThinking}
								>
									<WandSparkles className="size-4" />
									Send
								</Button>
							</div>
						</div>
					</div>
				</div>
			</SheetContent>
		</Sheet>
	);
}
