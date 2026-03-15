import {
	Bot,
	Download,
	ImageIcon,
	Link as LinkIcon,
	LoaderCircle,
	PlayCircle,
	RefreshCw,
	ShieldCheck,
	Sparkles,
	WandSparkles,
} from "lucide-react";
import { type FormEvent, useEffect, useMemo, useRef, useState } from "react";

import { SurfaceCard } from "@/components/app/brand";
import {
	DashboardPageHeader,
	DashboardPanel,
} from "@/components/app/dashboard";
import { Button } from "@/components/ui/button";
import { EmptyState, ErrorState, LoadingState } from "@/components/ui/states";
import { Input } from "@/components/ui/input";
import {
	NativeSelect,
	NativeSelectOption,
} from "@/components/ui/native-select";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/lib/auth-context";
import type {
	ApiListResponse,
	Automation,
	AutomationRun,
	AutomationRunOutput,
	LocalBridgeSession,
	ProviderAccount,
	ProviderLoginSession,
} from "@/lib/api-types";
import { cn } from "@/lib/utils";

const activeRunStates = new Set([
	"queued",
	"starting",
	"awaiting_login",
	"navigating",
	"submitting_prompt",
	"generating",
	"downloading",
]);

const accountStatusStyles: Record<string, string> = {
	ready: "pill pill-success",
	busy: "pill pill-warning",
	pending_login: "pill pill-info",
	needs_reauth: "pill pill-warning",
	error:
		"rounded-full border border-destructive/20 bg-destructive/10 px-3 py-1 text-xs font-medium text-destructive",
};

const runStatusStyles: Record<string, string> = {
	completed: "pill pill-success",
	failed:
		"rounded-full border border-destructive/20 bg-destructive/10 px-3 py-1 text-xs font-medium text-destructive",
	queued: "pill pill-info",
	starting: "pill pill-info",
	awaiting_login: "pill pill-warning",
	navigating: "pill pill-info",
	submitting_prompt: "pill pill-info",
	generating: "pill pill-warning",
	downloading: "pill pill-info",
};

const loginSessionStatusStyles: Record<string, string> = {
	launching: "pill pill-info",
	ready_for_user: "pill pill-info",
	auth_in_progress: "pill pill-warning",
	ready: "pill pill-success",
	failed:
		"rounded-full border border-destructive/20 bg-destructive/10 px-3 py-1 text-xs font-medium text-destructive",
	expired:
		"rounded-full border border-destructive/20 bg-destructive/10 px-3 py-1 text-xs font-medium text-destructive",
};

function resolveApiBase() {
	const configuredBase = import.meta.env.VITE_API_URL?.trim();
	if (import.meta.env.DEV) {
		return "";
	}
	return configuredBase?.endsWith("/")
		? configuredBase.slice(0, -1)
		: (configuredBase ?? "");
}

const apiBase = resolveApiBase();

function formatDate(value?: string) {
	if (!value) {
		return "Pending";
	}
	return new Intl.DateTimeFormat(undefined, {
		month: "short",
		day: "numeric",
		hour: "numeric",
		minute: "2-digit",
	}).format(new Date(value));
}

function isLoginSessionTerminal(session: ProviderLoginSession | null) {
	if (!session) {
		return true;
	}
	return (
		session.sessionStatus === "ready" ||
		session.sessionStatus === "failed" ||
		session.sessionStatus === "expired" ||
		Boolean(session.completedAt)
	);
}

export function DashboardAutomations() {
	const { activeWorkspaceId, customerRequest, customerSession } = useAuth();
	const [accounts, setAccounts] = useState<ProviderAccount[]>([]);
	const [automations, setAutomations] = useState<Automation[]>([]);
	const [runs, setRuns] = useState<AutomationRun[]>([]);
	const [selectedRunId, setSelectedRunId] = useState<string | null>(null);
	const [outputs, setOutputs] = useState<AutomationRunOutput[]>([]);
	const [outputUrls, setOutputUrls] = useState<Record<string, string>>({});
	const [outputLoadStates, setOutputLoadStates] = useState<
		Record<string, "loading" | "ready" | "failed">
	>({});
	const outputUrlsRef = useRef<Record<string, string>>({});
	const [activeLoginSession, setActiveLoginSession] =
		useState<ProviderLoginSession | null>(null);
	const [showLoginPanel, setShowLoginPanel] = useState(false);
	const [localBridgeSession, setLocalBridgeSession] =
		useState<LocalBridgeSession | null>(null);
	const [startingLocalBridge, setStartingLocalBridge] = useState(false);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [submittingConnection, setSubmittingConnection] = useState(false);
	const [startingLogin, setStartingLogin] = useState<string | null>(null);
	const [creatingAutomation, setCreatingAutomation] = useState(false);
	const [runningAutomationId, setRunningAutomationId] = useState<string | null>(
		null,
	);
	const [connectionLabel, setConnectionLabel] = useState("Main ChatGPT");
	const [automationName, setAutomationName] = useState("");
	const [automationPrompt, setAutomationPrompt] = useState("");
	const [automationImageCount, setAutomationImageCount] = useState("1");
	const [automationAspectRatio, setAutomationAspectRatio] = useState("");
	const [selectedProviderAccountId, setSelectedProviderAccountId] =
		useState("");
	const loginStorageKey = activeWorkspaceId
		? `brokestack:login-session:${activeWorkspaceId}`
		: null;

	const accountMap = useMemo(
		() => new Map(accounts.map((account) => [account.id, account])),
		[accounts],
	);
	const selectedRun = useMemo(
		() => runs.find((run) => run.id === selectedRunId) ?? null,
		[runs, selectedRunId],
	);
	const selectedProviderAccount =
		accountMap.get(selectedProviderAccountId) ?? null;
	const isPolling =
		Boolean(activeLoginSession && !isLoginSessionTerminal(activeLoginSession)) ||
		runs.some((run) => activeRunStates.has(run.status));

	async function loadWorkspaceData() {
		if (!activeWorkspaceId) {
			return;
		}
		const [accountResponse, automationResponse, runResponse] =
			await Promise.all([
				customerRequest<ApiListResponse<ProviderAccount>>(
					`/workspaces/${activeWorkspaceId}/provider-accounts`,
				),
				customerRequest<ApiListResponse<Automation>>(
					`/workspaces/${activeWorkspaceId}/automations`,
				),
				customerRequest<ApiListResponse<AutomationRun>>(
					`/workspaces/${activeWorkspaceId}/automation-runs`,
				),
			]);
		setAccounts(accountResponse.items);
		setAutomations(automationResponse.items);
		setRuns(runResponse.items);
		setSelectedProviderAccountId((current) => {
			if (
				current &&
				accountResponse.items.some((account) => account.id === current)
			) {
				return current;
			}
			return accountResponse.items[0]?.id ?? "";
		});
		setSelectedRunId((current) => {
			if (current && runResponse.items.some((run) => run.id === current)) {
				return current;
			}
			return runResponse.items[0]?.id ?? null;
		});
	}

	async function loadOutputs(runId: string) {
		const response = await customerRequest<
			ApiListResponse<AutomationRunOutput>
		>(`/automation-runs/${runId}/outputs`, { workspaceId: null });
		setOutputs(response.items);
	}

	async function loadPage() {
		if (!activeWorkspaceId) {
			return;
		}
		setLoading(true);
		setError(null);
		try {
			await loadWorkspaceData();
		} catch (loadError) {
			setError(
				loadError instanceof Error
					? loadError.message
					: "Unable to load image automation data.",
			);
		} finally {
			setLoading(false);
		}
	}

	useEffect(() => {
		void loadPage();
	}, [activeWorkspaceId]);

	useEffect(() => {
		if (!loginStorageKey) {
			return;
		}
		const stored = window.localStorage.getItem(loginStorageKey);
		if (!stored) {
			return;
		}
		try {
			const session = JSON.parse(stored) as ProviderLoginSession;
			setActiveLoginSession(session);
		} catch {
			window.localStorage.removeItem(loginStorageKey);
		}
	}, [loginStorageKey]);

	useEffect(() => {
		if (!selectedRunId) {
			setOutputs([]);
			return;
		}
		void loadOutputs(selectedRunId).catch(() => {
			setOutputs([]);
		});
	}, [selectedRunId]);

	useEffect(() => {
		if (!activeLoginSession) {
			return;
		}
		if (isLoginSessionTerminal(activeLoginSession)) {
			return;
		}
		const interval = window.setInterval(() => {
			void customerRequest<ProviderLoginSession>(
				`/provider-accounts/${activeLoginSession.providerAccountId}/login-sessions/${activeLoginSession.id}`,
				{ workspaceId: null },
			).then((session) => {
				setActiveLoginSession(session);
				if (session.sessionStatus === "ready") {
					setShowLoginPanel(false);
				}
				void loadWorkspaceData();
			});
		}, 3000);
		return () => window.clearInterval(interval);
	}, [activeLoginSession, customerRequest]);

	useEffect(() => {
		if (!loginStorageKey) {
			return;
		}
		if (!activeLoginSession || isLoginSessionTerminal(activeLoginSession)) {
			window.localStorage.removeItem(loginStorageKey);
			return;
		}
		window.localStorage.setItem(loginStorageKey, JSON.stringify(activeLoginSession));
	}, [activeLoginSession, loginStorageKey]);

	useEffect(() => {
		if (!isPolling || !activeWorkspaceId) {
			return;
		}
		const interval = window.setInterval(() => {
			void loadWorkspaceData();
			if (selectedRunId) {
				void loadOutputs(selectedRunId);
			}
		}, 3000);
		return () => window.clearInterval(interval);
	}, [isPolling, activeWorkspaceId, selectedRunId]);

	useEffect(() => {
		const token = customerSession?.accessToken;
		if (!token || outputs.length === 0) {
			for (const value of Object.values(outputUrlsRef.current)) {
				URL.revokeObjectURL(value);
			}
			outputUrlsRef.current = {};
			setOutputUrls({});
			setOutputLoadStates({});
			return;
		}

		const controller = new AbortController();
		let cancelled = false;
		setOutputLoadStates(
			Object.fromEntries(outputs.map((output) => [output.id, "loading"])),
		);

		void (async () => {
			const nextUrls: Record<string, string> = {};
			const nextStates: Record<string, "loading" | "ready" | "failed"> = {};
			for (const output of outputs) {
				try {
					const response = await fetch(`${apiBase}${output.contentUrl}`, {
						headers: { Authorization: `Bearer ${token}` },
						credentials: "include",
						signal: controller.signal,
					});
					if (!response.ok) {
						nextStates[output.id] = "failed";
						continue;
					}
					const blob = await response.blob();
					nextUrls[output.id] = URL.createObjectURL(blob);
					nextStates[output.id] = "ready";
				} catch {
					nextStates[output.id] = "failed";
					continue;
				}
			}
			if (cancelled) {
				for (const value of Object.values(nextUrls)) {
					URL.revokeObjectURL(value);
				}
				return;
			}
			for (const value of Object.values(outputUrlsRef.current)) {
				URL.revokeObjectURL(value);
			}
			outputUrlsRef.current = nextUrls;
			setOutputUrls(nextUrls);
			setOutputLoadStates(nextStates);
		})();

		return () => {
			cancelled = true;
			controller.abort();
		};
	}, [outputs, customerSession?.accessToken]);

	useEffect(() => {
		return () => {
			for (const value of Object.values(outputUrlsRef.current)) {
				URL.revokeObjectURL(value);
			}
		};
	}, []);

	async function createConnection() {
		if (!activeWorkspaceId) {
			return;
		}
		setSubmittingConnection(true);
		setError(null);
		try {
			const account = await customerRequest<ProviderAccount>(
				`/workspaces/${activeWorkspaceId}/provider-accounts`,
				{
					method: "POST",
					body: {
						provider: "chatgpt",
						label: connectionLabel,
					},
				},
			);
			setSelectedProviderAccountId(account.id);
			await loadWorkspaceData();
		} catch (submitError) {
			setError(
				submitError instanceof Error
					? submitError.message
					: "Unable to create the ChatGPT connection.",
			);
		} finally {
			setSubmittingConnection(false);
		}
	}

	async function startLogin(accountId: string) {
		setStartingLogin(accountId);
		setError(null);
		setLocalBridgeSession(null);
		try {
			const session = await customerRequest<ProviderLoginSession>(
				`/provider-accounts/${accountId}/login-sessions`,
				{
					method: "POST",
					body: {},
					workspaceId: null,
				},
			);
			setActiveLoginSession(session);
			setShowLoginPanel(true);
			await loadWorkspaceData();
		} catch (loginError) {
			const message =
				loginError instanceof Error
					? loginError.message
					: "Unable to start the browser login flow.";
			setError(
				message.includes("status 409")
					? "A browser login session is already active for this ChatGPT connection. Reopen the live connection panel instead of starting another one."
					: message,
			);
		} finally {
			setStartingLogin(null);
		}
	}

	async function refreshLoginStream() {
		if (!activeLoginSession) {
			return;
		}
		setError(null);
		try {
			const session = await customerRequest<ProviderLoginSession>(
				`/provider-accounts/${activeLoginSession.providerAccountId}/login-sessions/${activeLoginSession.id}/refresh-stream`,
				{
					method: "POST",
					body: {},
					workspaceId: null,
				},
			);
			setActiveLoginSession(session);
			setShowLoginPanel(true);
		} catch (refreshError) {
			setError(
				refreshError instanceof Error
					? refreshError.message
					: "Unable to refresh the embedded browser stream.",
			);
		}
	}

	async function startLocalBridge() {
		if (!activeLoginSession) {
			return;
		}
		setStartingLocalBridge(true);
		setError(null);
		try {
			const response = await customerRequest<{
				localBridgeSession: LocalBridgeSession;
				loginSession: ProviderLoginSession;
			}>(
				`/provider-accounts/${activeLoginSession.providerAccountId}/login-sessions/${activeLoginSession.id}/local-bridge`,
				{
					method: "POST",
					body: {},
					workspaceId: null,
				},
			);
			setLocalBridgeSession(response.localBridgeSession);
			setActiveLoginSession(response.loginSession);
		} catch (bridgeError) {
			setError(
				bridgeError instanceof Error
					? bridgeError.message
					: "Unable to start the local-device bridge handoff.",
			);
		} finally {
			setStartingLocalBridge(false);
		}
	}

	async function createAutomation(event: FormEvent<HTMLFormElement>) {
		event.preventDefault();
		if (!activeWorkspaceId || !selectedProviderAccountId) {
			return;
		}
		setCreatingAutomation(true);
		setError(null);
		try {
			await customerRequest<Automation>(
				`/workspaces/${activeWorkspaceId}/automations`,
				{
					method: "POST",
					body: {
						name: automationName,
						providerAccountId: selectedProviderAccountId,
						config: {
							promptTemplate: automationPrompt,
							imageCount: Number.parseInt(automationImageCount, 10) || 1,
							aspectRatio: automationAspectRatio || undefined,
							provider: "chatgpt",
						},
					},
				},
			);
			setAutomationName("");
			setAutomationPrompt("");
			setAutomationImageCount("1");
			setAutomationAspectRatio("");
			await loadWorkspaceData();
		} catch (createError) {
			setError(
				createError instanceof Error
					? createError.message
					: "Unable to save the automation.",
			);
		} finally {
			setCreatingAutomation(false);
		}
	}

	async function runAutomation(automationId: string) {
		setRunningAutomationId(automationId);
		setError(null);
		try {
			const run = await customerRequest<AutomationRun>(
				`/automations/${automationId}/runs`,
				{
					method: "POST",
					body: {},
					workspaceId: null,
				},
			);
			setSelectedRunId(run.id);
			await loadWorkspaceData();
			await loadOutputs(run.id);
		} catch (runError) {
			setError(
				runError instanceof Error
					? runError.message
					: "Unable to queue the image generation run.",
			);
		} finally {
			setRunningAutomationId(null);
		}
	}

	if (loading) {
		return <LoadingState variant="page" />;
	}

	return (
		<div className="space-y-6">
			<DashboardPageHeader
				eyebrow="AI Image Automation"
				title="Image Automations"
				description="Connect a workspace ChatGPT profile, save reusable image prompts, and monitor browser-backed generation runs without an API key."
				actions={
					<Button
						variant="outline"
						className="rounded-full"
						onClick={() => void loadPage()}
					>
						<RefreshCw className="size-4" />
						Refresh
					</Button>
				}
			/>

			{error ? (
				<ErrorState
					title="Automation error"
					description={error}
					onRetry={() => void loadPage()}
				/>
			) : null}

			{activeLoginSession &&
			!showLoginPanel &&
			!isLoginSessionTerminal(activeLoginSession) ? (
				<SurfaceCard tone="muted" className="flex flex-col gap-3 p-5 lg:flex-row lg:items-center lg:justify-between">
					<div className="space-y-1">
						<div className="text-sm font-medium">Browser session still running</div>
						<div className="text-sm text-muted-foreground">
							The embedded connection flow is active for this workspace profile.
						</div>
					</div>
					<Button
						variant="outline"
						className="rounded-full"
						onClick={() => setShowLoginPanel(true)}
					>
						Resume browser session
					</Button>
				</SurfaceCard>
			) : null}

			{activeLoginSession && showLoginPanel ? (
				<SurfaceCard tone="muted" className="p-5">
					<div className="space-y-5">
						<div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
							<div className="space-y-2">
								<div className="text-sm font-medium">Embedded browser connection</div>
								<div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
									<span
										className={
											loginSessionStatusStyles[activeLoginSession.sessionStatus] ??
											"pill pill-info"
										}
									>
										{activeLoginSession.sessionStatus.replaceAll("_", " ")}
									</span>
									<span
										className={
											accountStatusStyles[activeLoginSession.status] ?? "pill"
										}
									>
										Account {activeLoginSession.status.replaceAll("_", " ")}
									</span>
									{activeLoginSession.connectionMode ? (
										<span className="pill pill-info">
											{activeLoginSession.connectionMode.replaceAll("_", " ")}
										</span>
									) : null}
								</div>
								<div className="text-sm text-muted-foreground">
									Use the embedded session below to complete ChatGPT login without
									touching the worker host directly.
								</div>
								{activeLoginSession.lastError ? (
									<div className="text-sm text-destructive">
										{activeLoginSession.lastError}
									</div>
								) : null}
							</div>
							<div className="flex flex-wrap gap-2">
								<Button
									variant="outline"
									className="rounded-full"
									disabled={isLoginSessionTerminal(activeLoginSession)}
									onClick={() => void refreshLoginStream()}
								>
									<RefreshCw className="size-4" />
									Refresh stream
								</Button>
								<Button
									variant="ghost"
									className="rounded-full"
									onClick={() => setShowLoginPanel(false)}
								>
									Close panel
								</Button>
							</div>
						</div>

						<div className="grid gap-4 xl:grid-cols-[1.45fr_0.8fr]">
							<div className="overflow-hidden rounded-[28px] border border-[var(--brand-border-soft)] bg-black/40">
								{activeLoginSession.streamUrl &&
								!isLoginSessionTerminal(activeLoginSession) ? (
									<iframe
										title="Remote browser session"
										src={activeLoginSession.streamUrl}
										className="h-[680px] w-full border-0 bg-black"
										allow="clipboard-read; clipboard-write"
									/>
								) : (
									<div className="flex h-[420px] items-center justify-center px-6 text-center text-sm text-muted-foreground">
										{activeLoginSession.sessionStatus === "ready"
											? "This browser session finished successfully. BrokeStack will reuse the saved workspace profile for future runs."
											: "The embedded browser stream is not available right now. Refresh the stream or restart the connection session."}
									</div>
								)}
							</div>

							<div className="space-y-4">
								<SurfaceCard tone="muted" className="space-y-3 p-4">
									<div className="text-sm font-medium">Session lifecycle</div>
									<div className="text-sm text-muted-foreground">
										Started {formatDate(activeLoginSession.startedAt)}
									</div>
									<div className="text-sm text-muted-foreground">
										Expires {formatDate(activeLoginSession.expiresAt)}
									</div>
									<div className="text-sm text-muted-foreground">
										Browser instance:{" "}
										<span className="font-mono text-[11px] text-foreground">
											{activeLoginSession.browserInstanceId ?? "pending"}
										</span>
									</div>
								</SurfaceCard>

								<SurfaceCard tone="muted" className="space-y-3 p-4">
									<div className="text-sm font-medium">Fallback</div>
									<div className="text-sm text-muted-foreground">
										If ChatGPT or the identity provider demands a device-bound
										step, switch this connection session into a local-device
										bridge.
									</div>
									<Button
										variant="outline"
										className="rounded-full"
										disabled={startingLocalBridge}
										onClick={() => void startLocalBridge()}
									>
										{startingLocalBridge ? (
											<LoaderCircle className="size-4 animate-spin" />
										) : (
											<ShieldCheck className="size-4" />
										)}
										Continue on this device
									</Button>
									{activeLoginSession.fallbackRequired ? (
										<div className="rounded-[20px] border border-amber-300/20 bg-amber-300/10 p-3 text-sm text-amber-100">
											This session has flagged that a local-device fallback may be
											required.
										</div>
									) : null}
									{localBridgeSession ? (
										<div className="rounded-[20px] border border-[var(--brand-border-soft)] bg-background/50 p-3 text-sm text-muted-foreground">
											Local bridge token:{" "}
											<span className="font-mono text-[11px] text-foreground">
												{localBridgeSession.challengeToken}
											</span>
										</div>
									) : null}
								</SurfaceCard>
							</div>
						</div>
					</div>
				</SurfaceCard>
			) : null}

			<DashboardPanel
				title="Connections"
				description="Each workspace keeps its own persistent Chrome profile. Start a remote browser connection session whenever ChatGPT needs to be connected or refreshed."
			>
				<div className="grid gap-4 lg:grid-cols-[1.2fr_2fr]">
					<SurfaceCard tone="muted" className="space-y-4 p-5">
						<div className="flex items-center gap-3">
							<div className="flex size-11 items-center justify-center rounded-2xl bg-primary/10 text-primary">
								<Bot className="size-5" />
							</div>
							<div>
								<div className="font-medium">Add ChatGPT connection</div>
								<div className="text-sm text-muted-foreground">
									Create a reusable workspace profile before logging in.
								</div>
							</div>
						</div>

						<label className="block space-y-2">
							<span className="text-sm font-medium">Connection label</span>
							<Input
								className="h-10 rounded-2xl"
								value={connectionLabel}
								onChange={(event) => setConnectionLabel(event.target.value)}
								placeholder="Main ChatGPT"
							/>
						</label>

						<Button
							className="rounded-full bg-gradient-brand border-0 text-white"
							disabled={submittingConnection}
							onClick={() => void createConnection()}
						>
							{submittingConnection ? (
								<LoaderCircle className="size-4 animate-spin" />
							) : (
								<WandSparkles className="size-4" />
							)}
							Create connection
						</Button>
					</SurfaceCard>

					{accounts.length === 0 ? (
						<SurfaceCard tone="muted" className="p-5">
							<EmptyState
								icon={ShieldCheck}
								title="No provider accounts yet"
								description="Create the first ChatGPT workspace connection, then start the browser login flow."
							/>
						</SurfaceCard>
					) : (
						<div className="grid gap-4">
							{accounts.map((account) => {
								const loginBusy = startingLogin === account.id;
								const loginInProgress =
									activeLoginSession?.providerAccountId === account.id &&
									!isLoginSessionTerminal(activeLoginSession);
								const canRun =
									account.status === "ready" || account.status === "busy";
								return (
									<SurfaceCard key={account.id} className="p-5">
										<div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
											<div className="space-y-2">
												<div className="flex items-center gap-3">
													<div className="font-medium">{account.label}</div>
													<span
														className={
															accountStatusStyles[account.status] ??
															"pill pill-info"
														}
													>
														{account.status.replaceAll("_", " ")}
													</span>
												</div>
												<div className="text-sm text-muted-foreground">
													Provider: {account.provider} · Profile key:{" "}
													{account.profileKey}
												</div>
												<div className="text-sm text-muted-foreground">
													{account.lastValidatedAt
														? `Last validated ${formatDate(account.lastValidatedAt)}`
														: "This profile has not completed login yet."}
												</div>
												{account.lastError ? (
													<div className="text-sm text-destructive">
														{account.lastError}
													</div>
												) : null}
											</div>

											<div className="flex flex-wrap gap-2">
												<Button
													variant="outline"
													className="rounded-full"
													disabled={loginBusy}
													onClick={() =>
														loginInProgress
															? setShowLoginPanel(true)
															: void startLogin(account.id)
													}
												>
													{loginBusy ? (
														<LoaderCircle className="size-4 animate-spin" />
													) : (
														<RefreshCw className="size-4" />
													)}
													{loginInProgress
														? "Resume browser"
														: account.status === "ready"
															? "Reconnect"
															: "Connect"}
												</Button>
												<Button
													variant="ghost"
													className="rounded-full"
													onClick={() =>
														setSelectedProviderAccountId(account.id)
													}
												>
													{canRun ? "Use for automations" : "Inspect"}
												</Button>
											</div>
										</div>
									</SurfaceCard>
								);
							})}
						</div>
					)}
				</div>
			</DashboardPanel>

			<DashboardPanel
				title="New image automation"
				description="Save a reusable ChatGPT image prompt and run it on demand from this workspace."
			>
				<form
					className="grid gap-4 lg:grid-cols-[1.1fr_1.4fr]"
					onSubmit={(event) => void createAutomation(event)}
				>
					<SurfaceCard tone="muted" className="space-y-4 p-5">
						<label className="block space-y-2">
							<span className="text-sm font-medium">Automation name</span>
							<Input
								className="h-10 rounded-2xl"
								value={automationName}
								onChange={(event) => setAutomationName(event.target.value)}
								placeholder="Hero concept generator"
								required
							/>
						</label>

						<label className="block space-y-2">
							<span className="text-sm font-medium">Provider account</span>
							<NativeSelect
								className="w-full"
								value={selectedProviderAccountId}
								onChange={(event) =>
									setSelectedProviderAccountId(event.target.value)
								}
								required
							>
								<NativeSelectOption value="" disabled>
									Select a ChatGPT connection
								</NativeSelectOption>
								{accounts.map((account) => (
									<NativeSelectOption key={account.id} value={account.id}>
										{account.label} ({account.status})
									</NativeSelectOption>
								))}
							</NativeSelect>
						</label>

						<div className="grid gap-4 md:grid-cols-2">
							<label className="block space-y-2">
								<span className="text-sm font-medium">Image count</span>
								<Input
									type="number"
									min="1"
									max="4"
									className="h-10 rounded-2xl"
									value={automationImageCount}
									onChange={(event) =>
										setAutomationImageCount(event.target.value)
									}
								/>
							</label>

							<label className="block space-y-2">
								<span className="text-sm font-medium">Aspect ratio</span>
								<NativeSelect
									className="w-full"
									value={automationAspectRatio}
									onChange={(event) =>
										setAutomationAspectRatio(event.target.value)
									}
								>
									<NativeSelectOption value="">Default</NativeSelectOption>
									<NativeSelectOption value="1:1">1:1</NativeSelectOption>
									<NativeSelectOption value="4:5">4:5</NativeSelectOption>
									<NativeSelectOption value="16:9">16:9</NativeSelectOption>
									<NativeSelectOption value="9:16">9:16</NativeSelectOption>
								</NativeSelect>
							</label>
						</div>

						<div className="rounded-[22px] border border-[var(--brand-border-soft)] bg-background/60 p-4 text-sm text-muted-foreground">
							Runs are blocked until the selected ChatGPT connection reaches
							`ready` or `busy`. Current status:{" "}
							<span className="font-medium text-foreground">
								{selectedProviderAccount?.status ?? "No account selected"}
							</span>
						</div>

						<Button
							type="submit"
							className="rounded-full bg-gradient-brand border-0 text-white"
							disabled={
								creatingAutomation ||
								!selectedProviderAccountId ||
								selectedProviderAccount?.status === "pending_login"
							}
						>
							{creatingAutomation ? (
								<LoaderCircle className="size-4 animate-spin" />
							) : (
								<Sparkles className="size-4" />
							)}
							Save automation
						</Button>
					</SurfaceCard>

					<SurfaceCard tone="muted" className="space-y-4 p-5">
						<label className="block space-y-2">
							<span className="text-sm font-medium">Prompt template</span>
							<Textarea
								className="min-h-[220px] rounded-[26px]"
								value={automationPrompt}
								onChange={(event) => setAutomationPrompt(event.target.value)}
								placeholder="Generate a polished SaaS hero illustration with layered lighting, a subtle editorial texture, and space for product typography."
								required
							/>
						</label>
						<div className="rounded-[22px] border border-dashed border-[var(--brand-border-soft)] p-4 text-sm text-muted-foreground">
							V1 keeps each run on a fresh ChatGPT thread so BrokeStack can
							reliably track completion and downloads.
						</div>
					</SurfaceCard>
				</form>
			</DashboardPanel>

			<div className="grid gap-6 xl:grid-cols-[1.25fr_0.95fr]">
				<DashboardPanel
					title="Saved automations"
					description="Run any saved prompt now and watch the browser-backed execution status move through the queue."
				>
					{automations.length === 0 ? (
						<EmptyState
							icon={Sparkles}
							title="No automations saved"
							description="Create the first image automation to start generating assets from a reusable ChatGPT prompt."
						/>
					) : (
						<div className="grid gap-4">
							{automations.map((automation) => {
								const account = accountMap.get(automation.providerAccountId);
								const canRun =
									account?.status === "ready" || account?.status === "busy";
								const isRunning = runningAutomationId === automation.id;
								return (
									<SurfaceCard key={automation.id} className="p-5">
										<div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
											<div className="space-y-2">
												<div className="flex items-center gap-3">
													<div className="font-medium">{automation.name}</div>
													<span className="pill pill-info">
														{automation.config.provider}
													</span>
												</div>
												<div className="text-sm text-muted-foreground">
													{automation.config.promptTemplate}
												</div>
												<div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
													<span className="pill">
														{automation.config.imageCount} image
														{automation.config.imageCount > 1 ? "s" : ""}
													</span>
													{automation.config.aspectRatio ? (
														<span className="pill">
															{automation.config.aspectRatio}
														</span>
													) : null}
													{automation.lastRun ? (
														<span
															className={
																runStatusStyles[automation.lastRun.status] ??
																"pill pill-info"
															}
														>
															Last run: {automation.lastRun.status}
														</span>
													) : null}
												</div>
											</div>

											<div className="flex flex-wrap gap-2">
												<Button
													className="rounded-full bg-gradient-brand border-0 text-white"
													disabled={!canRun || isRunning}
													onClick={() => void runAutomation(automation.id)}
												>
													{isRunning ? (
														<LoaderCircle className="size-4 animate-spin" />
													) : (
														<PlayCircle className="size-4" />
													)}
													Run now
												</Button>
												{automation.lastRun ? (
													<Button
														variant="outline"
														className="rounded-full"
														onClick={() =>
															setSelectedRunId(automation.lastRun?.id ?? null)
														}
													>
														View run
													</Button>
												) : null}
											</div>
										</div>
									</SurfaceCard>
								);
							})}
						</div>
					)}
				</DashboardPanel>

				<DashboardPanel
					title="Run history"
					description="Recent browser-backed runs update live while ChatGPT is generating or downloading outputs."
				>
					{runs.length === 0 ? (
						<EmptyState
							icon={PlayCircle}
							title="No runs yet"
							description="Queue an automation to start building the first image run history for this workspace."
						/>
					) : (
						<div className="space-y-3">
							{runs.map((run) => (
								<button
									key={run.id}
									type="button"
									onClick={() => setSelectedRunId(run.id)}
									className={cn(
										"w-full rounded-[24px] border border-[var(--brand-border-soft)] bg-card/80 p-4 text-left transition hover:bg-accent/30",
										selectedRunId === run.id &&
											"border-primary/40 bg-primary/5",
									)}
								>
									<div className="flex items-center justify-between gap-3">
										<div className="font-medium">
											{automations.find(
												(automation) => automation.id === run.automationId,
											)?.name ?? "Image automation"}
										</div>
										<span
											className={
												runStatusStyles[run.status] ?? "pill pill-info"
											}
										>
											{run.status.replaceAll("_", " ")}
										</span>
									</div>
									<div className="mt-2 line-clamp-2 text-sm text-muted-foreground">
										{run.promptText}
									</div>
									<div className="mt-3 flex items-center justify-between text-xs text-muted-foreground">
										<span>Queued {formatDate(run.queuedAt)}</span>
										<span>
											{run.completedAt
												? `Finished ${formatDate(run.completedAt)}`
												: "Live"}
										</span>
									</div>
								</button>
							))}
						</div>
					)}
				</DashboardPanel>
			</div>

			<DashboardPanel
				title="Run detail"
				description="Inspect the tracked ChatGPT thread, review any execution errors, and preview generated images inside BrokeStack."
			>
				{selectedRun ? (
					<div className="grid gap-6 xl:grid-cols-[0.95fr_1.45fr]">
						<SurfaceCard tone="muted" className="space-y-4 p-5">
							<div>
								<div className="text-sm font-medium">Current state</div>
								<div className="mt-2">
									<span
										className={
											runStatusStyles[selectedRun.status] ?? "pill pill-info"
										}
									>
										{selectedRun.status.replaceAll("_", " ")}
									</span>
								</div>
							</div>

							<div className="space-y-1 text-sm text-muted-foreground">
								<div>Queued: {formatDate(selectedRun.queuedAt)}</div>
								<div>Started: {formatDate(selectedRun.startedAt)}</div>
								<div>Completed: {formatDate(selectedRun.completedAt)}</div>
							</div>

							<div>
								<div className="text-sm font-medium">Prompt</div>
								<div className="mt-2 rounded-[22px] border border-[var(--brand-border-soft)] bg-background/60 p-4 text-sm text-muted-foreground">
									{selectedRun.promptText}
								</div>
							</div>

							{selectedRun.providerThreadUrl ? (
								<a
									href={selectedRun.providerThreadUrl}
									target="_blank"
									rel="noreferrer"
									className="inline-flex w-fit items-center gap-2 text-sm text-primary hover:underline"
								>
									<LinkIcon className="size-4" />
									Open ChatGPT thread
								</a>
							) : (
								<div className="text-sm text-muted-foreground">
									Thread URL will appear once the worker detects the fresh
									ChatGPT conversation.
								</div>
							)}

							{selectedRun.lastError ? (
								<div className="rounded-[22px] border border-destructive/20 bg-destructive/5 p-4 text-sm text-destructive">
									{selectedRun.lastError}
								</div>
							) : null}
						</SurfaceCard>

						<SurfaceCard tone="muted" className="p-5">
							{outputs.length === 0 ? (
								<EmptyState
									icon={ImageIcon}
									title="No downloaded outputs yet"
									description="Generated images will appear here once ChatGPT finishes and the worker downloads the files."
								/>
							) : (
								<div className="grid gap-4 md:grid-cols-2">
									{outputs.map((output) => (
										<div
											key={output.id}
											className="overflow-hidden rounded-[26px] border border-[var(--brand-border-soft)] bg-background/70"
										>
											<div className="aspect-square overflow-hidden bg-muted">
												{outputUrls[output.id] ? (
													<a
														href={outputUrls[output.id]}
														target="_blank"
														rel="noreferrer"
													>
														<img
															src={outputUrls[output.id]}
															alt="Generated output"
															className="h-full w-full object-cover"
														/>
													</a>
												) : outputLoadStates[output.id] === "failed" ? (
													<div className="flex h-full flex-col items-center justify-center gap-2 px-4 text-center text-sm text-muted-foreground">
														<ImageIcon className="size-5" />
														<span>Preview unavailable</span>
													</div>
												) : (
													<div className="flex h-full items-center justify-center text-muted-foreground">
														<LoaderCircle className="size-5 animate-spin" />
													</div>
												)}
											</div>
											<div className="space-y-3 p-4">
												<div className="flex items-center justify-between gap-3">
													<div className="text-sm font-medium">
														{output.width > 0 && output.height > 0
															? `${output.width} × ${output.height}`
															: "Generated image"}
													</div>
													<div className="text-xs text-muted-foreground">
														{Math.max(1, Math.round(output.byteSize / 1024))} KB
													</div>
												</div>
												<div className="flex flex-wrap gap-2">
													<a
														href={outputUrls[output.id] ?? "#"}
														target="_blank"
														rel="noreferrer"
														className="inline-flex"
													>
														<Button variant="outline" className="rounded-full">
															<ImageIcon className="size-4" />
															Open
														</Button>
													</a>
													<a
														href={outputUrls[output.id] ?? "#"}
														download
														target="_blank"
														rel="noreferrer"
														className="inline-flex"
													>
														<Button variant="outline" className="rounded-full">
															<Download className="size-4" />
															Download
														</Button>
													</a>
												</div>
											</div>
										</div>
									))}
								</div>
							)}
						</SurfaceCard>
					</div>
				) : (
					<EmptyState
						icon={PlayCircle}
						title="Select a run"
						description="Choose a run from the history list to inspect its ChatGPT thread and generated image outputs."
					/>
				)}
			</DashboardPanel>
		</div>
	);
}
