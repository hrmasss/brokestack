CREATE TABLE IF NOT EXISTS users (
    id uuid PRIMARY KEY,
    email text NOT NULL UNIQUE,
    full_name text NOT NULL,
    password_hash text NOT NULL,
    status text NOT NULL DEFAULT 'active',
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS workspaces (
    id uuid PRIMARY KEY,
    name text NOT NULL,
    slug text NOT NULL UNIQUE,
    status text NOT NULL DEFAULT 'active',
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS workspace_memberships (
    id uuid PRIMARY KEY,
    workspace_id uuid NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
    user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    status text NOT NULL DEFAULT 'active',
    invited_by_user_id uuid REFERENCES users(id) ON DELETE SET NULL,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now(),
    UNIQUE (workspace_id, user_id)
);

CREATE TABLE IF NOT EXISTS roles (
    id uuid PRIMARY KEY,
    code text NOT NULL UNIQUE,
    label text NOT NULL,
    scope text NOT NULL,
    system boolean NOT NULL DEFAULT true,
    created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS permissions (
    id uuid PRIMARY KEY,
    code text NOT NULL UNIQUE,
    label text NOT NULL,
    scope text NOT NULL,
    description text NOT NULL DEFAULT '',
    created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS role_permissions (
    role_id uuid NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
    permission_id uuid NOT NULL REFERENCES permissions(id) ON DELETE CASCADE,
    PRIMARY KEY (role_id, permission_id)
);

CREATE TABLE IF NOT EXISTS workspace_membership_roles (
    membership_id uuid NOT NULL REFERENCES workspace_memberships(id) ON DELETE CASCADE,
    role_id uuid NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
    PRIMARY KEY (membership_id, role_id)
);

CREATE TABLE IF NOT EXISTS platform_user_roles (
    user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    role_id uuid NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
    PRIMARY KEY (user_id, role_id)
);

CREATE TABLE IF NOT EXISTS workspace_invites (
    id uuid PRIMARY KEY,
    workspace_id uuid NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
    email text NOT NULL,
    token_hash text NOT NULL UNIQUE,
    status text NOT NULL DEFAULT 'pending',
    invited_by_user_id uuid REFERENCES users(id) ON DELETE SET NULL,
    expires_at timestamptz NOT NULL,
    accepted_at timestamptz,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS workspace_invite_roles (
    invite_id uuid NOT NULL REFERENCES workspace_invites(id) ON DELETE CASCADE,
    role_id uuid NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
    PRIMARY KEY (invite_id, role_id)
);

CREATE TABLE IF NOT EXISTS auth_sessions (
    id uuid PRIMARY KEY,
    user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    impersonator_user_id uuid REFERENCES users(id) ON DELETE SET NULL,
    scope text NOT NULL,
    refresh_token_hash text NOT NULL UNIQUE,
    expires_at timestamptz NOT NULL,
    revoked_at timestamptz,
    assumed_workspace_id uuid REFERENCES workspaces(id) ON DELETE CASCADE,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS audit_logs (
    id uuid PRIMARY KEY,
    actor_user_id uuid REFERENCES users(id) ON DELETE SET NULL,
    action text NOT NULL,
    target_type text NOT NULL,
    target_id text,
    workspace_id uuid REFERENCES workspaces(id) ON DELETE SET NULL,
    metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
    created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS provider_accounts (
    id uuid PRIMARY KEY,
    workspace_id uuid NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
    provider text NOT NULL,
    label text NOT NULL,
    status text NOT NULL DEFAULT 'pending_login',
    profile_key text NOT NULL,
    last_validated_at timestamptz,
    last_error text NOT NULL DEFAULT '',
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_provider_accounts_workspace_id
    ON provider_accounts(workspace_id);

CREATE UNIQUE INDEX IF NOT EXISTS idx_provider_accounts_workspace_profile_key
    ON provider_accounts(workspace_id, profile_key);

CREATE TABLE IF NOT EXISTS provider_login_sessions (
    id uuid PRIMARY KEY,
    provider_account_id uuid NOT NULL REFERENCES provider_accounts(id) ON DELETE CASCADE,
    workspace_id uuid NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
    connection_mode text NOT NULL DEFAULT 'remote_browser',
    session_status text NOT NULL DEFAULT 'launching',
    status text NOT NULL DEFAULT 'pending_login',
    browser_instance_id text NOT NULL DEFAULT '',
    stream_session_token text NOT NULL DEFAULT '',
    stream_url text NOT NULL DEFAULT '',
    fallback_required boolean NOT NULL DEFAULT false,
    worker_session_id text NOT NULL DEFAULT '',
    started_at timestamptz NOT NULL DEFAULT now(),
    completed_at timestamptz,
    expires_at timestamptz NOT NULL,
    last_error text NOT NULL DEFAULT ''
);

CREATE INDEX IF NOT EXISTS idx_provider_login_sessions_account_id
    ON provider_login_sessions(provider_account_id, started_at DESC);

CREATE TABLE IF NOT EXISTS browser_instances (
    id uuid PRIMARY KEY,
    workspace_id uuid NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
    provider_account_id uuid NOT NULL REFERENCES provider_accounts(id) ON DELETE CASCADE,
    provider text NOT NULL,
    status text NOT NULL DEFAULT 'launching',
    runtime_type text NOT NULL DEFAULT 'embedded_stream',
    profile_mount_path text NOT NULL DEFAULT '',
    started_at timestamptz NOT NULL DEFAULT now(),
    ended_at timestamptz,
    last_heartbeat_at timestamptz,
    region text NOT NULL DEFAULT '',
    node_name text NOT NULL DEFAULT '',
    last_error text NOT NULL DEFAULT ''
);

CREATE INDEX IF NOT EXISTS idx_browser_instances_account_id
    ON browser_instances(provider_account_id, started_at DESC);

CREATE TABLE IF NOT EXISTS local_bridge_sessions (
    id uuid PRIMARY KEY,
    provider_login_session_id uuid NOT NULL REFERENCES provider_login_sessions(id) ON DELETE CASCADE,
    workspace_id uuid NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
    status text NOT NULL DEFAULT 'queued',
    challenge_token text NOT NULL,
    connected_at timestamptz,
    completed_at timestamptz,
    last_error text NOT NULL DEFAULT '',
    created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_local_bridge_sessions_login_session_id
    ON local_bridge_sessions(provider_login_session_id, created_at DESC);

CREATE TABLE IF NOT EXISTS automations (
    id uuid PRIMARY KEY,
    workspace_id uuid NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
    kind text NOT NULL,
    provider_account_id uuid NOT NULL REFERENCES provider_accounts(id) ON DELETE CASCADE,
    name text NOT NULL,
    status text NOT NULL DEFAULT 'active',
    config_json jsonb NOT NULL DEFAULT '{}'::jsonb,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_automations_workspace_id
    ON automations(workspace_id);

CREATE TABLE IF NOT EXISTS automation_runs (
    id uuid PRIMARY KEY,
    automation_id uuid NOT NULL REFERENCES automations(id) ON DELETE CASCADE,
    workspace_id uuid NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
    status text NOT NULL DEFAULT 'queued',
    prompt_text text NOT NULL DEFAULT '',
    worker_run_id text NOT NULL DEFAULT '',
    provider_thread_url text NOT NULL DEFAULT '',
    provider_thread_id text NOT NULL DEFAULT '',
    queued_at timestamptz NOT NULL DEFAULT now(),
    started_at timestamptz,
    completed_at timestamptz,
    last_error text NOT NULL DEFAULT ''
);

CREATE INDEX IF NOT EXISTS idx_automation_runs_automation_id
    ON automation_runs(automation_id, queued_at DESC);

CREATE INDEX IF NOT EXISTS idx_automation_runs_workspace_id
    ON automation_runs(workspace_id, queued_at DESC);

CREATE TABLE IF NOT EXISTS automation_run_outputs (
    id uuid PRIMARY KEY,
    run_id uuid NOT NULL REFERENCES automation_runs(id) ON DELETE CASCADE,
    workspace_id uuid NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
    storage_path text NOT NULL,
    mime_type text NOT NULL DEFAULT 'application/octet-stream',
    byte_size bigint NOT NULL DEFAULT 0,
    width integer NOT NULL DEFAULT 0,
    height integer NOT NULL DEFAULT 0,
    sha256 text NOT NULL DEFAULT '',
    provider_asset_url text NOT NULL DEFAULT '',
    created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_automation_run_outputs_run_id
    ON automation_run_outputs(run_id, created_at ASC);

CREATE TABLE IF NOT EXISTS worker_events (
    event_id text PRIMARY KEY,
    event_type text NOT NULL,
    created_at timestamptz NOT NULL DEFAULT now()
);
