ALTER TABLE provider_accounts
    ADD COLUMN IF NOT EXISTS cooldown_seconds integer NOT NULL DEFAULT 60,
    ADD COLUMN IF NOT EXISTS jitter_min_seconds integer NOT NULL DEFAULT 5,
    ADD COLUMN IF NOT EXISTS jitter_max_seconds integer NOT NULL DEFAULT 20,
    ADD COLUMN IF NOT EXISTS is_default_for_api boolean NOT NULL DEFAULT false;

CREATE TABLE IF NOT EXISTS workspace_api_keys (
    id uuid PRIMARY KEY,
    workspace_id uuid NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
    name text NOT NULL,
    key_prefix text NOT NULL,
    key_hash text NOT NULL,
    status text NOT NULL DEFAULT 'active',
    scopes_json jsonb NOT NULL DEFAULT '[]'::jsonb,
    requests_per_minute integer NOT NULL DEFAULT 60,
    daily_image_quota integer NOT NULL DEFAULT 500,
    last_used_at timestamptz,
    last_used_ip text NOT NULL DEFAULT '',
    created_by_user_id uuid REFERENCES users(id) ON DELETE SET NULL,
    revoked_at timestamptz,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_workspace_api_keys_hash
    ON workspace_api_keys(key_hash);

CREATE INDEX IF NOT EXISTS idx_workspace_api_keys_workspace_id
    ON workspace_api_keys(workspace_id, created_at DESC);

CREATE TABLE IF NOT EXISTS image_batches (
    id uuid PRIMARY KEY,
    workspace_id uuid NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
    provider_account_id uuid NOT NULL REFERENCES provider_accounts(id) ON DELETE CASCADE,
    title text NOT NULL DEFAULT '',
    prompt_template text NOT NULL DEFAULT '',
    placeholder_name text NOT NULL DEFAULT 'item',
    source text NOT NULL DEFAULT 'web',
    status text NOT NULL DEFAULT 'queued',
    created_by_user_id uuid REFERENCES users(id) ON DELETE SET NULL,
    api_key_id uuid REFERENCES workspace_api_keys(id) ON DELETE SET NULL,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_image_batches_workspace_id
    ON image_batches(workspace_id, created_at DESC);

CREATE TABLE IF NOT EXISTS image_jobs (
    id uuid PRIMARY KEY,
    workspace_id uuid NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
    provider_account_id uuid NOT NULL REFERENCES provider_accounts(id) ON DELETE CASCADE,
    batch_id uuid REFERENCES image_batches(id) ON DELETE SET NULL,
    api_key_id uuid REFERENCES workspace_api_keys(id) ON DELETE SET NULL,
    source text NOT NULL DEFAULT 'web',
    request_type text NOT NULL DEFAULT 'single',
    title text NOT NULL DEFAULT '',
    prompt_text text NOT NULL DEFAULT '',
    aspect_ratio text NOT NULL DEFAULT '',
    status text NOT NULL DEFAULT 'queued',
    worker_run_id text NOT NULL DEFAULT '',
    provider_thread_url text NOT NULL DEFAULT '',
    provider_thread_id text NOT NULL DEFAULT '',
    queued_at timestamptz NOT NULL DEFAULT now(),
    started_at timestamptz,
    completed_at timestamptz,
    last_error text NOT NULL DEFAULT '',
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_image_jobs_workspace_id
    ON image_jobs(workspace_id, queued_at DESC);

CREATE INDEX IF NOT EXISTS idx_image_jobs_provider_account_id
    ON image_jobs(provider_account_id, queued_at DESC);

CREATE INDEX IF NOT EXISTS idx_image_jobs_batch_id
    ON image_jobs(batch_id, queued_at ASC);

CREATE TABLE IF NOT EXISTS image_outputs (
    id uuid PRIMARY KEY,
    image_job_id uuid NOT NULL REFERENCES image_jobs(id) ON DELETE CASCADE,
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

CREATE INDEX IF NOT EXISTS idx_image_outputs_job_id
    ON image_outputs(image_job_id, created_at ASC);

INSERT INTO image_jobs (
    id,
    workspace_id,
    provider_account_id,
    source,
    request_type,
    title,
    prompt_text,
    aspect_ratio,
    status,
    worker_run_id,
    provider_thread_url,
    provider_thread_id,
    queued_at,
    started_at,
    completed_at,
    last_error,
    created_at,
    updated_at
)
SELECT
    ar.id,
    ar.workspace_id,
    a.provider_account_id,
    'web',
    CASE
        WHEN COALESCE((a.config_json ->> 'imageCount')::integer, 1) > 1 THEN 'batch'
        ELSE 'single'
    END,
    a.name,
    ar.prompt_text,
    COALESCE(a.config_json ->> 'aspectRatio', ''),
    ar.status,
    ar.worker_run_id,
    ar.provider_thread_url,
    ar.provider_thread_id,
    ar.queued_at,
    ar.started_at,
    ar.completed_at,
    ar.last_error,
    ar.queued_at,
    COALESCE(ar.completed_at, ar.started_at, ar.queued_at)
FROM automation_runs ar
JOIN automations a ON a.id = ar.automation_id
ON CONFLICT (id) DO NOTHING;

INSERT INTO image_outputs (
    id,
    image_job_id,
    workspace_id,
    storage_path,
    mime_type,
    byte_size,
    width,
    height,
    sha256,
    provider_asset_url,
    created_at
)
SELECT
    aro.id,
    aro.run_id,
    aro.workspace_id,
    aro.storage_path,
    aro.mime_type,
    aro.byte_size,
    aro.width,
    aro.height,
    aro.sha256,
    aro.provider_asset_url,
    aro.created_at
FROM automation_run_outputs aro
ON CONFLICT (id) DO NOTHING;

WITH default_accounts AS (
    SELECT DISTINCT ON (workspace_id)
        id,
        workspace_id
    FROM provider_accounts
    ORDER BY workspace_id, created_at ASC
)
UPDATE provider_accounts pa
SET is_default_for_api = true
FROM default_accounts da
WHERE pa.id = da.id
  AND pa.is_default_for_api = false;
