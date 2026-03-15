export type Permission = {
	code: string;
	label: string;
	scope: string;
	description: string;
};

export type Role = {
	id: string;
	code: string;
	label: string;
	scope: string;
	permissions: Permission[];
};

export type User = {
	id: string;
	email: string;
	fullName: string;
	status: string;
	createdAt: string;
};

export type WorkspaceMembershipSummary = {
	id: string;
	workspaceId: string;
	workspaceName: string;
	workspaceSlug: string;
	workspaceStatus: string;
	status: string;
	roles: Role[];
};

export type AuthSession = {
	portal: "customer" | "platform";
	accessToken?: string;
	user: User;
	impersonator?: User;
	platformRoles: Role[];
	platformPermissions: Permission[];
	workspaceMemberships: WorkspaceMembershipSummary[];
	assumedWorkspaceId?: string;
};

export type WorkspaceSummary = {
	id: string;
	name: string;
	slug: string;
	status: string;
	capabilities: Permission[];
	membership?: WorkspaceMembershipSummary;
};

export type WorkspaceMemberRecord = {
	membershipId: string;
	user: User;
	status: string;
	roles: Role[];
};

export type WorkspaceInvite = {
	id: string;
	email: string;
	status: string;
	expiresAt: string;
	createdAt: string;
	roles: Role[];
};

export type PlatformUserRecord = {
	user: User;
	platformRoles: Role[];
	workspaceCount: number;
	workspaceMemberships?: WorkspaceMembershipSummary[];
};

export type PlatformWorkspaceRecord = {
	id: string;
	name: string;
	slug: string;
	status: string;
	memberCount: number;
	activeMemberCount: number;
};

export type ApiListResponse<T> = {
	items: T[];
};

export type ProviderAccount = {
	id: string;
	workspaceId: string;
	provider: string;
	label: string;
	status: string;
	profileKey: string;
	lastValidatedAt?: string;
	lastError?: string;
	createdAt: string;
	updatedAt: string;
};

export type ProviderLoginSession = {
	id: string;
	providerAccountId: string;
	workspaceId: string;
	connectionMode: string;
	sessionStatus: string;
	status: string;
	browserInstanceId?: string;
	streamSessionToken?: string;
	streamUrl?: string;
	fallbackRequired: boolean;
	workerSessionId?: string;
	startedAt: string;
	completedAt?: string;
	expiresAt: string;
	lastError?: string;
};

export type LocalBridgeSession = {
	id: string;
	providerLoginSessionId: string;
	workspaceId: string;
	status: string;
	challengeToken: string;
	connectedAt?: string;
	completedAt?: string;
	lastError?: string;
	createdAt: string;
};

export type AutomationConfig = {
	promptTemplate: string;
	imageCount: number;
	aspectRatio?: string;
	provider: string;
};

export type AutomationRun = {
	id: string;
	automationId: string;
	workspaceId: string;
	status: string;
	promptText: string;
	workerRunId?: string;
	providerThreadUrl?: string;
	providerThreadId?: string;
	queuedAt: string;
	startedAt?: string;
	completedAt?: string;
	lastError?: string;
};

export type Automation = {
	id: string;
	workspaceId: string;
	kind: string;
	providerAccountId: string;
	name: string;
	status: string;
	config: AutomationConfig;
	createdAt: string;
	updatedAt: string;
	lastRun?: AutomationRun;
};

export type AutomationRunOutput = {
	id: string;
	runId: string;
	workspaceId: string;
	storagePath: string;
	mimeType: string;
	byteSize: number;
	width: number;
	height: number;
	sha256: string;
	providerAssetUrl?: string;
	createdAt: string;
	contentUrl: string;
};
