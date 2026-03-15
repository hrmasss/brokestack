package database

import (
	"time"

	"github.com/google/uuid"
	"github.com/uptrace/bun"
)

type User struct {
	bun.BaseModel `bun:"table:users"`

	ID           uuid.UUID `bun:"id,pk,type:uuid"`
	Email        string    `bun:"email,notnull"`
	FullName     string    `bun:"full_name,notnull"`
	PasswordHash string    `bun:"password_hash,notnull"`
	Status       string    `bun:"status,notnull"`
	CreatedAt    time.Time `bun:"created_at,notnull"`
	UpdatedAt    time.Time `bun:"updated_at,notnull"`
}

type Workspace struct {
	bun.BaseModel `bun:"table:workspaces"`

	ID        uuid.UUID `bun:"id,pk,type:uuid"`
	Name      string    `bun:"name,notnull"`
	Slug      string    `bun:"slug,notnull"`
	Status    string    `bun:"status,notnull"`
	CreatedAt time.Time `bun:"created_at,notnull"`
	UpdatedAt time.Time `bun:"updated_at,notnull"`
}

type WorkspaceMembership struct {
	bun.BaseModel `bun:"table:workspace_memberships"`

	ID              uuid.UUID  `bun:"id,pk,type:uuid"`
	WorkspaceID     uuid.UUID  `bun:"workspace_id,notnull,type:uuid"`
	UserID          uuid.UUID  `bun:"user_id,notnull,type:uuid"`
	Status          string     `bun:"status,notnull"`
	InvitedByUserID *uuid.UUID `bun:"invited_by_user_id,type:uuid"`
	CreatedAt       time.Time  `bun:"created_at,notnull"`
	UpdatedAt       time.Time  `bun:"updated_at,notnull"`
}

type Role struct {
	bun.BaseModel `bun:"table:roles"`

	ID        uuid.UUID `bun:"id,pk,type:uuid"`
	Code      string    `bun:"code,notnull"`
	Label     string    `bun:"label,notnull"`
	Scope     string    `bun:"scope,notnull"`
	System    bool      `bun:"system,notnull"`
	CreatedAt time.Time `bun:"created_at,notnull"`
}

type Permission struct {
	bun.BaseModel `bun:"table:permissions"`

	ID          uuid.UUID `bun:"id,pk,type:uuid"`
	Code        string    `bun:"code,notnull"`
	Label       string    `bun:"label,notnull"`
	Scope       string    `bun:"scope,notnull"`
	Description string    `bun:"description,notnull"`
	CreatedAt   time.Time `bun:"created_at,notnull"`
}

type RolePermission struct {
	bun.BaseModel `bun:"table:role_permissions"`

	RoleID       uuid.UUID `bun:"role_id,pk,type:uuid"`
	PermissionID uuid.UUID `bun:"permission_id,pk,type:uuid"`
}

type WorkspaceMembershipRole struct {
	bun.BaseModel `bun:"table:workspace_membership_roles"`

	MembershipID uuid.UUID `bun:"membership_id,pk,type:uuid"`
	RoleID       uuid.UUID `bun:"role_id,pk,type:uuid"`
}

type PlatformUserRole struct {
	bun.BaseModel `bun:"table:platform_user_roles"`

	UserID uuid.UUID `bun:"user_id,pk,type:uuid"`
	RoleID uuid.UUID `bun:"role_id,pk,type:uuid"`
}

type WorkspaceInvite struct {
	bun.BaseModel `bun:"table:workspace_invites"`

	ID              uuid.UUID  `bun:"id,pk,type:uuid"`
	WorkspaceID     uuid.UUID  `bun:"workspace_id,notnull,type:uuid"`
	Email           string     `bun:"email,notnull"`
	TokenHash       string     `bun:"token_hash,notnull"`
	Status          string     `bun:"status,notnull"`
	InvitedByUserID *uuid.UUID `bun:"invited_by_user_id,type:uuid"`
	ExpiresAt       time.Time  `bun:"expires_at,notnull"`
	AcceptedAt      *time.Time `bun:"accepted_at"`
	CreatedAt       time.Time  `bun:"created_at,notnull"`
	UpdatedAt       time.Time  `bun:"updated_at,notnull"`
}

type WorkspaceInviteRole struct {
	bun.BaseModel `bun:"table:workspace_invite_roles"`

	InviteID uuid.UUID `bun:"invite_id,pk,type:uuid"`
	RoleID   uuid.UUID `bun:"role_id,pk,type:uuid"`
}

type AuthSession struct {
	bun.BaseModel `bun:"table:auth_sessions"`

	ID                 uuid.UUID  `bun:"id,pk,type:uuid"`
	UserID             uuid.UUID  `bun:"user_id,notnull,type:uuid"`
	ImpersonatorUserID *uuid.UUID `bun:"impersonator_user_id,type:uuid"`
	Scope              string     `bun:"scope,notnull"`
	RefreshTokenHash   string     `bun:"refresh_token_hash,notnull"`
	ExpiresAt          time.Time  `bun:"expires_at,notnull"`
	RevokedAt          *time.Time `bun:"revoked_at"`
	AssumedWorkspaceID *uuid.UUID `bun:"assumed_workspace_id,type:uuid"`
	CreatedAt          time.Time  `bun:"created_at,notnull"`
	UpdatedAt          time.Time  `bun:"updated_at,notnull"`
}

type AuditLog struct {
	bun.BaseModel `bun:"table:audit_logs"`

	ID          uuid.UUID  `bun:"id,pk,type:uuid"`
	ActorUserID *uuid.UUID `bun:"actor_user_id,type:uuid"`
	Action      string     `bun:"action,notnull"`
	TargetType  string     `bun:"target_type,notnull"`
	TargetID    string     `bun:"target_id"`
	WorkspaceID *uuid.UUID `bun:"workspace_id,type:uuid"`
	Metadata    string     `bun:"metadata,notnull"`
	CreatedAt   time.Time  `bun:"created_at,notnull"`
}

type ProviderAccount struct {
	bun.BaseModel `bun:"table:provider_accounts"`

	ID              uuid.UUID  `bun:"id,pk,type:uuid"`
	WorkspaceID     uuid.UUID  `bun:"workspace_id,notnull,type:uuid"`
	Provider        string     `bun:"provider,notnull"`
	Label           string     `bun:"label,notnull"`
	Status          string     `bun:"status,notnull"`
	ProfileKey      string     `bun:"profile_key,notnull"`
	LastValidatedAt *time.Time `bun:"last_validated_at"`
	LastError       string     `bun:"last_error"`
	CreatedAt       time.Time  `bun:"created_at,notnull"`
	UpdatedAt       time.Time  `bun:"updated_at,notnull"`
}

type ProviderLoginSession struct {
	bun.BaseModel `bun:"table:provider_login_sessions"`

	ID                 uuid.UUID  `bun:"id,pk,type:uuid"`
	ProviderAccountID  uuid.UUID  `bun:"provider_account_id,notnull,type:uuid"`
	WorkspaceID        uuid.UUID  `bun:"workspace_id,notnull,type:uuid"`
	ConnectionMode     string     `bun:"connection_mode,notnull"`
	SessionStatus      string     `bun:"session_status,notnull"`
	Status             string     `bun:"status,notnull"`
	BrowserInstanceID  string     `bun:"browser_instance_id"`
	StreamSessionToken string     `bun:"stream_session_token"`
	StreamURL          string     `bun:"stream_url"`
	FallbackRequired   bool       `bun:"fallback_required,notnull"`
	WorkerSessionID    string     `bun:"worker_session_id"`
	StartedAt          time.Time  `bun:"started_at,notnull"`
	CompletedAt        *time.Time `bun:"completed_at"`
	ExpiresAt          time.Time  `bun:"expires_at,notnull"`
	LastError          string     `bun:"last_error"`
}

type BrowserInstance struct {
	bun.BaseModel `bun:"table:browser_instances"`

	ID                uuid.UUID  `bun:"id,pk,type:uuid"`
	WorkspaceID       uuid.UUID  `bun:"workspace_id,notnull,type:uuid"`
	ProviderAccountID uuid.UUID  `bun:"provider_account_id,notnull,type:uuid"`
	Provider          string     `bun:"provider,notnull"`
	Status            string     `bun:"status,notnull"`
	RuntimeType       string     `bun:"runtime_type,notnull"`
	ProfileMountPath  string     `bun:"profile_mount_path,notnull"`
	StartedAt         time.Time  `bun:"started_at,notnull"`
	EndedAt           *time.Time `bun:"ended_at"`
	LastHeartbeatAt   *time.Time `bun:"last_heartbeat_at"`
	Region            string     `bun:"region"`
	NodeName          string     `bun:"node_name"`
	LastError         string     `bun:"last_error"`
}

type LocalBridgeSession struct {
	bun.BaseModel `bun:"table:local_bridge_sessions"`

	ID                     uuid.UUID  `bun:"id,pk,type:uuid"`
	ProviderLoginSessionID uuid.UUID  `bun:"provider_login_session_id,notnull,type:uuid"`
	WorkspaceID            uuid.UUID  `bun:"workspace_id,notnull,type:uuid"`
	Status                 string     `bun:"status,notnull"`
	ChallengeToken         string     `bun:"challenge_token,notnull"`
	ConnectedAt            *time.Time `bun:"connected_at"`
	CompletedAt            *time.Time `bun:"completed_at"`
	LastError              string     `bun:"last_error"`
	CreatedAt              time.Time  `bun:"created_at,notnull"`
}

type Automation struct {
	bun.BaseModel `bun:"table:automations"`

	ID                uuid.UUID `bun:"id,pk,type:uuid"`
	WorkspaceID       uuid.UUID `bun:"workspace_id,notnull,type:uuid"`
	Kind              string    `bun:"kind,notnull"`
	ProviderAccountID uuid.UUID `bun:"provider_account_id,notnull,type:uuid"`
	Name              string    `bun:"name,notnull"`
	Status            string    `bun:"status,notnull"`
	ConfigJSON        string    `bun:"config_json,notnull"`
	CreatedAt         time.Time `bun:"created_at,notnull"`
	UpdatedAt         time.Time `bun:"updated_at,notnull"`
}

type AutomationRun struct {
	bun.BaseModel `bun:"table:automation_runs"`

	ID                uuid.UUID  `bun:"id,pk,type:uuid"`
	AutomationID      uuid.UUID  `bun:"automation_id,notnull,type:uuid"`
	WorkspaceID       uuid.UUID  `bun:"workspace_id,notnull,type:uuid"`
	Status            string     `bun:"status,notnull"`
	PromptText        string     `bun:"prompt_text,notnull"`
	WorkerRunID       string     `bun:"worker_run_id"`
	ProviderThreadURL string     `bun:"provider_thread_url"`
	ProviderThreadID  string     `bun:"provider_thread_id"`
	QueuedAt          time.Time  `bun:"queued_at,notnull"`
	StartedAt         *time.Time `bun:"started_at"`
	CompletedAt       *time.Time `bun:"completed_at"`
	LastError         string     `bun:"last_error"`
}

type AutomationRunOutput struct {
	bun.BaseModel `bun:"table:automation_run_outputs"`

	ID               uuid.UUID `bun:"id,pk,type:uuid"`
	RunID            uuid.UUID `bun:"run_id,notnull,type:uuid"`
	WorkspaceID      uuid.UUID `bun:"workspace_id,notnull,type:uuid"`
	StoragePath      string    `bun:"storage_path,notnull"`
	MimeType         string    `bun:"mime_type,notnull"`
	ByteSize         int64     `bun:"byte_size,notnull"`
	Width            int       `bun:"width,notnull"`
	Height           int       `bun:"height,notnull"`
	SHA256           string    `bun:"sha256,notnull"`
	ProviderAssetURL string    `bun:"provider_asset_url"`
	CreatedAt        time.Time `bun:"created_at,notnull"`
}

type WorkerEvent struct {
	bun.BaseModel `bun:"table:worker_events"`

	EventID   string    `bun:"event_id,pk"`
	EventType string    `bun:"event_type,notnull"`
	CreatedAt time.Time `bun:"created_at,notnull"`
}
