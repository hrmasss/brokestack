from __future__ import annotations

from typing import Any, Literal

from pydantic import BaseModel, Field


class ToolDescriptor(BaseModel):
    slug: str
    name: str
    category: str
    runtime: str
    description: str
    supports_scheduling: bool = Field(default=True)


class HealthResponse(BaseModel):
    status: str
    service: str
    tools_registered: int


class RunPreviewRequest(BaseModel):
    tool_slug: str
    mode: str = Field(default="workspace")
    input_count: int = Field(default=1, ge=1)


class RunPreviewResponse(BaseModel):
    status: str
    tool_slug: str
    accepted_by: str
    estimated_seconds: int
    queue: str
    notes: list[str]


class WorkerProtectedResponse(BaseModel):
    status: str


class StartLoginSessionRequest(BaseModel):
    login_session_id: str = Field(alias="loginSessionId")
    provider_account_id: str = Field(alias="providerAccountId")
    workspace_id: str = Field(alias="workspaceId")
    provider: str
    profile_key: str = Field(alias="profileKey")


class StartLoginSessionResponse(BaseModel):
    worker_session_id: str = Field(alias="workerSessionId")
    status: str


class StartAutomationRunRequest(BaseModel):
    run_id: str = Field(alias="runId")
    automation_id: str = Field(alias="automationId")
    provider_account_id: str = Field(alias="providerAccountId")
    workspace_id: str = Field(alias="workspaceId")
    provider: str
    profile_key: str = Field(alias="profileKey")
    prompt_text: str = Field(alias="promptText")
    config: dict[str, Any]
    metadata: dict[str, str] = Field(default_factory=dict)


class StartAutomationRunResponse(BaseModel):
    worker_run_id: str = Field(alias="workerRunId")
    status: str


class WorkerOutputPayload(BaseModel):
    id: str | None = None
    storage_path: str = Field(alias="storagePath")
    mime_type: str = Field(alias="mimeType")
    byte_size: int = Field(alias="byteSize")
    width: int
    height: int
    sha256: str
    provider_asset_url: str | None = Field(default=None, alias="providerAssetUrl")


class WorkerEvent(BaseModel):
    event_id: str = Field(alias="eventId")
    event_type: str = Field(alias="eventType")
    provider_account_id: str | None = Field(default=None, alias="providerAccountId")
    login_session_id: str | None = Field(default=None, alias="loginSessionId")
    run_id: str | None = Field(default=None, alias="runId")
    worker_run_id: str | None = Field(default=None, alias="workerRunId")
    status: str | None = None
    message: str | None = None
    provider_thread_url: str | None = Field(default=None, alias="providerThreadUrl")
    provider_thread_id: str | None = Field(default=None, alias="providerThreadId")
    output: WorkerOutputPayload | None = None


class LoginStatusSnapshot(BaseModel):
    kind: Literal["pending", "ready", "needs_reauth"]
    message: str | None = None


class RunProgressSnapshot(BaseModel):
    status: str
    done: bool = False
    failed: bool = False
    message: str | None = None
    provider_thread_url: str | None = None
    provider_thread_id: str | None = None
    outputs: list[WorkerOutputPayload] = Field(default_factory=list)
