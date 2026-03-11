import {
	createContext,
	type PropsWithChildren,
	useContext,
	useEffect,
	useMemo,
	useState,
} from "react";

import { ApiError, apiRequest } from "@/lib/api-client";
import type {
	AuthSession,
	Permission,
	WorkspaceMembershipSummary,
} from "@/lib/api-types";

const CUSTOMER_TOKEN_KEY = "brokestack:customer-access-token";
const PLATFORM_TOKEN_KEY = "brokestack:platform-access-token";
const ACTIVE_WORKSPACE_KEY = "brokestack:active-workspace-id";

type AuthContextValue = {
	bootstrapping: boolean;
	customerSession: AuthSession | null;
	platformSession: AuthSession | null;
	activeWorkspaceId: string | null;
	activeWorkspaceMembership: WorkspaceMembershipSummary | null;
	signInCustomer: (payload: { email: string; password: string }) => Promise<AuthSession>;
	signUpCustomer: (payload: {
		fullName: string;
		email: string;
		password: string;
		workspaceName: string;
	}) => Promise<AuthSession>;
	signInPlatform: (payload: { email: string; password: string }) => Promise<AuthSession>;
	startPlatformCustomerAccess: () => Promise<AuthSession>;
	logoutCustomer: () => Promise<void>;
	logoutPlatform: () => Promise<void>;
	refreshCustomerSession: () => Promise<AuthSession>;
	setActiveWorkspaceId: (workspaceId: string) => void;
	hasCustomerPermission: (code: string, capabilities?: Permission[]) => boolean;
	hasPlatformPermission: (code: string) => boolean;
	customerRequest: <T>(path: string, options?: { method?: string; body?: unknown; workspaceId?: string | null }) => Promise<T>;
	platformRequest: <T>(path: string, options?: { method?: string; body?: unknown }) => Promise<T>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

function readStorage(key: string) {
	if (typeof window === "undefined") {
		return null;
	}
	return window.localStorage.getItem(key);
}

function writeStorage(key: string, value: string | null) {
	if (typeof window === "undefined") {
		return;
	}
	if (value === null) {
		window.localStorage.removeItem(key);
		return;
	}
	window.localStorage.setItem(key, value);
}

export function AuthProvider({ children }: PropsWithChildren) {
	const [bootstrapping, setBootstrapping] = useState(true);
	const [customerSession, setCustomerSession] = useState<AuthSession | null>(null);
	const [platformSession, setPlatformSession] = useState<AuthSession | null>(null);
	const [customerToken, setCustomerToken] = useState<string | null>(readStorage(CUSTOMER_TOKEN_KEY));
	const [platformToken, setPlatformToken] = useState<string | null>(readStorage(PLATFORM_TOKEN_KEY));
	const [activeWorkspaceId, setActiveWorkspaceIdState] = useState<string | null>(
		readStorage(ACTIVE_WORKSPACE_KEY),
	);

	function applyCustomerSession(session: AuthSession) {
		setCustomerSession(session);
		setCustomerToken(session.accessToken ?? null);
		writeStorage(CUSTOMER_TOKEN_KEY, session.accessToken ?? null);
		const preferredWorkspace =
			readStorage(ACTIVE_WORKSPACE_KEY) ??
			session.assumedWorkspaceId ??
			session.workspaceMemberships.find((item) => item.status === "active")?.workspaceId ??
			null;
		setActiveWorkspaceIdState(preferredWorkspace);
		writeStorage(ACTIVE_WORKSPACE_KEY, preferredWorkspace);
	}

	function applyPlatformSession(session: AuthSession) {
		setPlatformSession(session);
		setPlatformToken(session.accessToken ?? null);
		writeStorage(PLATFORM_TOKEN_KEY, session.accessToken ?? null);
	}

	useEffect(() => {
		const pathname =
			typeof window === "undefined" ? "/" : window.location.pathname;
		const storedCustomerToken = readStorage(CUSTOMER_TOKEN_KEY);
		const storedPlatformToken = readStorage(PLATFORM_TOKEN_KEY);
		const shouldRefreshCustomer =
			!pathname.startsWith("/admin") || Boolean(storedCustomerToken);
		const shouldRefreshPlatform =
			pathname.startsWith("/admin") || Boolean(storedPlatformToken);

		async function hydrateCustomerSession() {
			if (!shouldRefreshCustomer) {
				return null;
			}
			try {
				return await apiRequest<AuthSession>("/auth/refresh", { method: "POST" });
			} catch {
				if (!storedCustomerToken) {
					return null;
				}
			}
			try {
				return await apiRequest<AuthSession>("/auth/me", {
					token: storedCustomerToken,
				});
			} catch {
				writeStorage(CUSTOMER_TOKEN_KEY, null);
				writeStorage(ACTIVE_WORKSPACE_KEY, null);
				return null;
			}
		}

		async function hydratePlatformSession() {
			if (!shouldRefreshPlatform) {
				return null;
			}
			try {
				return await apiRequest<AuthSession>("/platform/auth/refresh", {
					method: "POST",
				});
			} catch {
				if (!storedPlatformToken) {
					return null;
				}
			}
			try {
				return await apiRequest<AuthSession>("/platform/me", {
					token: storedPlatformToken,
				});
			} catch {
				writeStorage(PLATFORM_TOKEN_KEY, null);
				return null;
			}
		}

		void Promise.all([
			hydrateCustomerSession(),
			hydratePlatformSession(),
		]).then(([customer, platform]) => {
			if (customer) {
				applyCustomerSession(customer);
			}
			if (platform) {
				applyPlatformSession(platform);
			}
			setBootstrapping(false);
		});
	}, []);

	const activeWorkspaceMembership = useMemo(() => {
		if (!customerSession || !activeWorkspaceId) {
			return null;
		}
		return (
			customerSession.workspaceMemberships.find(
				(item) => item.workspaceId === activeWorkspaceId,
			) ?? null
		);
	}, [customerSession, activeWorkspaceId]);

	async function signInCustomer(payload: { email: string; password: string }) {
		const session = await apiRequest<AuthSession>("/auth/login", {
			method: "POST",
			body: payload,
		});
		applyCustomerSession(session);
		return session;
	}

	async function signUpCustomer(payload: {
		fullName: string;
		email: string;
		password: string;
		workspaceName: string;
	}) {
		const session = await apiRequest<AuthSession>("/auth/register", {
			method: "POST",
			body: payload,
		});
		applyCustomerSession(session);
		return session;
	}

	async function signInPlatform(payload: { email: string; password: string }) {
		const session = await apiRequest<AuthSession>("/platform/auth/login", {
			method: "POST",
			body: payload,
		});
		applyPlatformSession(session);
		return session;
	}

	async function startPlatformCustomerAccess() {
		const session = await platformRequest<AuthSession>("/platform/customer-access", {
			method: "POST",
		});
		applyCustomerSession(session);
		return session;
	}

	async function logoutCustomer() {
		await apiRequest<void>("/auth/logout", { method: "POST" });
		setCustomerSession(null);
		setCustomerToken(null);
		setActiveWorkspaceIdState(null);
		writeStorage(CUSTOMER_TOKEN_KEY, null);
		writeStorage(ACTIVE_WORKSPACE_KEY, null);
	}

	async function logoutPlatform() {
		await apiRequest<void>("/platform/auth/logout", { method: "POST" });
		setPlatformSession(null);
		setPlatformToken(null);
		writeStorage(PLATFORM_TOKEN_KEY, null);
	}

	async function refreshCustomer() {
		const session = await apiRequest<AuthSession>("/auth/refresh", { method: "POST" });
		applyCustomerSession(session);
		return session;
	}

	async function refreshPlatform() {
		const session = await apiRequest<AuthSession>("/platform/auth/refresh", {
			method: "POST",
		});
		applyPlatformSession(session);
		return session;
	}

	async function customerRequest<T>(
		path: string,
		options: { method?: string; body?: unknown; workspaceId?: string | null } = {},
	): Promise<T> {
		try {
			return await apiRequest<T>(path, {
				method: options.method,
				body: options.body,
				token: customerToken,
				workspaceId: options.workspaceId ?? activeWorkspaceId,
			});
		} catch (error) {
			if (error instanceof ApiError && error.status === 401) {
				const session = await refreshCustomer();
				return apiRequest<T>(path, {
					method: options.method,
					body: options.body,
					token: session.accessToken ?? null,
					workspaceId: options.workspaceId ?? activeWorkspaceId,
				});
			}
			throw error;
		}
	}

	async function platformRequest<T>(
		path: string,
		options: { method?: string; body?: unknown } = {},
	): Promise<T> {
		try {
			return await apiRequest<T>(path, {
				method: options.method,
				body: options.body,
				token: platformToken,
			});
		} catch (error) {
			if (error instanceof ApiError && error.status === 401) {
				const session = await refreshPlatform();
				return apiRequest<T>(path, {
					method: options.method,
					body: options.body,
					token: session.accessToken ?? null,
				});
			}
			throw error;
		}
	}

	function setActiveWorkspaceId(workspaceId: string) {
		setActiveWorkspaceIdState(workspaceId);
		writeStorage(ACTIVE_WORKSPACE_KEY, workspaceId);
	}

	function hasCustomerPermission(code: string, capabilities: Permission[] = []) {
		return capabilities.some((permission) => permission.code === code);
	}

	function hasPlatformPermission(code: string) {
		return (
			platformSession?.platformPermissions.some(
				(permission) => permission.code === code,
			) ?? false
		);
	}

	const value = useMemo<AuthContextValue>(
		() => ({
			bootstrapping,
			customerSession,
			platformSession,
			activeWorkspaceId,
			activeWorkspaceMembership,
			signInCustomer,
			signUpCustomer,
			signInPlatform,
			startPlatformCustomerAccess,
			logoutCustomer,
			logoutPlatform,
			refreshCustomerSession: refreshCustomer,
			setActiveWorkspaceId,
			hasCustomerPermission,
			hasPlatformPermission,
			customerRequest,
			platformRequest,
		}),
		[
			bootstrapping,
			customerSession,
			platformSession,
			activeWorkspaceId,
			activeWorkspaceMembership,
		],
	);

	return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
	const context = useContext(AuthContext);
	if (!context) {
		throw new Error("useAuth must be used inside AuthProvider");
	}
	return context;
}
