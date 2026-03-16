import {
	Bot,
	LoaderCircle,
	RefreshCw,
	Settings2,
	ShieldCheck,
	WandSparkles,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";

import { DashboardPageHeader, DashboardPanel } from "@/components/app/dashboard";
import { SurfaceCard } from "@/components/app/brand";
import { Button } from "@/components/ui/button";
import { EmptyState, ErrorState } from "@/components/ui/states";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/lib/auth-context";
import type {
	ApiListResponse,
	LocalBridgeSession,
	ProviderAccount,
	ProviderLoginSession,
} from "@/lib/api-types";
import {
	accountStatusStyles,
	formatDashboardDate,
	isLoginSessionTerminal,
	loginSessionStatusStyles,
} from "@/pages/dashboard/images-shared";

export function DashboardImageConnections() {
	const { activeWorkspaceId, customerRequest } = useAuth();
	const [accounts, setAccounts] = useState<ProviderAccount[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [connectionLabel, setConnectionLabel] = useState("Main ChatGPT");
	const [submittingConnection, setSubmittingConnection] = useState(false);
	const [startingLogin, setStartingLogin] = useState<string | null>(null);
	const [activeLoginSession, setActiveLoginSession] =
		useState<ProviderLoginSession | null>(null);
	const [localBridgeSession, setLocalBridgeSession] =
		useState<LocalBridgeSession | null>(null);
	const [startingLocalBridge, setStartingLocalBridge] = useState(false);
	const [showLoginPanel, setShowLoginPanel] = useState(false);
	const loginStorageKey = activeWorkspaceId
		? `brokestack:login-session:${activeWorkspaceId}`
		: null;

	const isPolling =
		Boolean(activeLoginSession && !isLoginSessionTerminal(activeLoginSession)) ||
		accounts.some((account) => account.status === "busy");

	async function loadAccounts() {
		if (!activeWorkspaceId) {
			return;
		}
		setLoading(true);
		setError(null);
		try {
			const accountResponse = await customerRequest<ApiListResponse<ProviderAccount>>(
				`/workspaces/${activeWorkspaceId}/provider-accounts`,
			);
			setAccounts(accountResponse.items);
		} catch (loadError) {
			setError(
				loadError instanceof Error
					? loadError.message
					: "Unable to load provider accounts.",
			);
		} finally {
			setLoading(false);
		}
	}

	useEffect(() => {
		void loadAccounts();
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
			setActiveLoginSession(JSON.parse(stored) as ProviderLoginSession);
		} catch {
			window.localStorage.removeItem(loginStorageKey);
		}
	}, [loginStorageKey]);

	useEffect(() => {
		if (!activeLoginSession || isLoginSessionTerminal(activeLoginSession)) {
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
				void loadAccounts();
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
		if (!isPolling) {
			return;
		}
		const interval = window.setInterval(() => {
			void loadAccounts();
		}, 3000);
		return () => window.clearInterval(interval);
	}, [isPolling]);

	const activeAccountId = useMemo(
		() => activeLoginSession?.providerAccountId ?? "",
		[activeLoginSession],
	);

	async function createConnection() {
		if (!activeWorkspaceId) {
			return;
		}
		setSubmittingConnection(true);
		setError(null);
		try {
			await customerRequest<ProviderAccount>(
				`/workspaces/${activeWorkspaceId}/provider-accounts`,
				{
					method: "POST",
					body: {
						provider: "chatgpt",
						label: connectionLabel,
					},
				},
			);
			await loadAccounts();
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
			await loadAccounts();
		} catch (loginError) {
			setError(
				loginError instanceof Error
					? loginError.message
					: "Unable to start the browser login flow.",
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

	async function saveAccountSettings(account: ProviderAccount) {
		setError(null);
		try {
			await customerRequest<ProviderAccount>(
				`/provider-accounts/${account.id}/image-settings`,
				{
					method: "PATCH",
					body: {
						cooldownSeconds: account.cooldownSeconds,
						jitterMinSeconds: account.jitterMinSeconds,
						jitterMaxSeconds: account.jitterMaxSeconds,
						isDefaultForApi: account.isDefaultForApi,
					},
					workspaceId: null,
				},
			);
			await loadAccounts();
		} catch (saveError) {
			setError(
				saveError instanceof Error
					? saveError.message
					: "Unable to update the connection image settings.",
			);
		}
	}

	return (
		<div className="space-y-6">
			<DashboardPageHeader
				eyebrow="Provider connections"
				title="Image connections"
				description="Connect ChatGPT in a dedicated browser page and tune per-account cooldown plus jitter for queued jobs."
				actions={
					<Button
						variant="outline"
						className="rounded-full"
						onClick={() => void loadAccounts()}
					>
						<RefreshCw className="size-4" />
						Refresh
					</Button>
				}
			/>

			{error ? (
				<ErrorState
					title="Connection error"
					description={error}
					onRetry={() => void loadAccounts()}
				/>
			) : null}

			{activeLoginSession && showLoginPanel ? (
				<SurfaceCard tone="muted" className="p-5">
					<div className="space-y-5">
						<div className="flex flex-wrap items-center justify-between gap-3">
							<div className="space-y-2">
								<div className="text-sm font-medium">Embedded browser connection</div>
								<div className="flex flex-wrap gap-2 text-sm text-muted-foreground">
									<span
										className={
											loginSessionStatusStyles[activeLoginSession.sessionStatus] ??
											"pill pill-info"
										}
									>
										{activeLoginSession.sessionStatus.replaceAll("_", " ")}
									</span>
									<span
										className={accountStatusStyles[activeLoginSession.status] ?? "pill"}
									>
										Account {activeLoginSession.status.replaceAll("_", " ")}
									</span>
								</div>
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
										This browser session is no longer live. Refresh the stream or
										start a new connection session.
									</div>
								)}
							</div>

							<div className="space-y-4">
								<SurfaceCard tone="muted" className="space-y-3 p-4">
									<div className="text-sm font-medium">Session lifecycle</div>
									<div className="text-sm text-muted-foreground">
										Started {formatDashboardDate(activeLoginSession.startedAt)}
									</div>
									<div className="text-sm text-muted-foreground">
										Expires {formatDashboardDate(activeLoginSession.expiresAt)}
									</div>
								</SurfaceCard>
								<SurfaceCard tone="muted" className="space-y-3 p-4">
									<div className="text-sm font-medium">Fallback</div>
									<div className="text-sm text-muted-foreground">
										Start a local-device bridge if login requires device-bound
										verification.
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
									{localBridgeSession ? (
										<div className="rounded-[20px] border border-[var(--brand-border-soft)] bg-background/50 p-3 text-sm text-muted-foreground">
											Local bridge token:{" "}
											<span className="font-mono text-foreground">
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
				title="Add connection"
				description="Each workspace keeps its own persistent browser profile for image generation."
			>
				<div className="grid gap-4 lg:grid-cols-[1fr_1.8fr]">
					<SurfaceCard tone="muted" className="space-y-4 p-5">
						<div className="flex items-center gap-3">
							<div className="flex size-11 items-center justify-center rounded-2xl bg-primary/10 text-primary">
								<Bot className="size-5" />
							</div>
							<div>
								<div className="font-medium">Add ChatGPT connection</div>
								<div className="text-sm text-muted-foreground">
									Create a reusable account profile before logging in.
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

					{accounts.length === 0 && !loading ? (
						<SurfaceCard tone="muted" className="p-5">
							<EmptyState
								icon={Bot}
								title="No provider connections yet"
								description="Create the first ChatGPT workspace connection, then start the browser login flow."
							/>
						</SurfaceCard>
					) : (
						<div className="grid gap-4">
							{accounts.map((account) => {
								const loginBusy = startingLogin === account.id;
								const loginInProgress =
									activeAccountId === account.id &&
									activeLoginSession &&
									!isLoginSessionTerminal(activeLoginSession);
								return (
									<SurfaceCard key={account.id} className="space-y-4 p-5">
										<div className="flex flex-wrap items-start justify-between gap-4">
											<div className="space-y-2">
												<div className="flex items-center gap-3">
													<div className="font-medium">{account.label}</div>
													<span
														className={accountStatusStyles[account.status] ?? "pill"}
													>
														{account.status.replaceAll("_", " ")}
													</span>
													{account.isDefaultForApi ? (
														<span className="pill pill-info">Default API</span>
													) : null}
												</div>
												<div className="text-sm text-muted-foreground">
													Provider: {account.provider} · Profile key {account.profileKey}
												</div>
												<div className="text-sm text-muted-foreground">
													{account.lastValidatedAt
														? `Last validated ${formatDashboardDate(account.lastValidatedAt)}`
														: "This profile has not completed login yet."}
												</div>
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
													{loginInProgress ? "Resume browser" : "Connect"}
												</Button>
											</div>
										</div>

										<div className="grid gap-4 md:grid-cols-4">
											<label className="block space-y-2">
												<span className="text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground">
													Cooldown
												</span>
												<Input
													type="number"
													min="0"
													className="h-10 rounded-2xl"
													value={account.cooldownSeconds}
													onChange={(event) =>
														setAccounts((current) =>
															current.map((item) =>
																item.id === account.id
																	? {
																			...item,
																			cooldownSeconds:
																				Number(event.target.value) || 0,
																	  }
																	: item,
															),
														)
													}
												/>
											</label>
											<label className="block space-y-2">
												<span className="text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground">
													Jitter min
												</span>
												<Input
													type="number"
													min="0"
													className="h-10 rounded-2xl"
													value={account.jitterMinSeconds}
													onChange={(event) =>
														setAccounts((current) =>
															current.map((item) =>
																item.id === account.id
																	? {
																			...item,
																			jitterMinSeconds:
																				Number(event.target.value) || 0,
																	  }
																	: item,
															),
														)
													}
												/>
											</label>
											<label className="block space-y-2">
												<span className="text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground">
													Jitter max
												</span>
												<Input
													type="number"
													min="0"
													className="h-10 rounded-2xl"
													value={account.jitterMaxSeconds}
													onChange={(event) =>
														setAccounts((current) =>
															current.map((item) =>
																item.id === account.id
																	? {
																			...item,
																			jitterMaxSeconds:
																				Number(event.target.value) || 0,
																	  }
																	: item,
															),
														)
													}
												/>
											</label>
											<div className="flex items-end gap-2">
												<Button
													variant={account.isDefaultForApi ? "default" : "outline"}
													className="rounded-full"
													onClick={() =>
														setAccounts((current) =>
															current.map((item) => ({
																...item,
																isDefaultForApi: item.id === account.id,
															})),
														)
													}
												>
													<Settings2 className="size-4" />
													Default API
												</Button>
												<Button
													variant="outline"
													className="rounded-full"
													onClick={() => void saveAccountSettings(account)}
												>
													Save
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
		</div>
	);
}
