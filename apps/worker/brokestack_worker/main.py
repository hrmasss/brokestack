from __future__ import annotations

from fastapi import Depends, FastAPI, Header, HTTPException, status

from brokestack_worker.config import WorkerSettings, load_settings
from brokestack_worker.models import (
    HealthResponse,
    RunPreviewRequest,
    RunPreviewResponse,
    StartAutomationRunRequest,
    StartAutomationRunResponse,
    StartLoginSessionRequest,
    StartLoginSessionResponse,
    ToolDescriptor,
)
from brokestack_worker.registry import list_tools, preview_run
from brokestack_worker.runtime import WorkerRuntime

settings: WorkerSettings = load_settings()
runtime = WorkerRuntime(settings)

app = FastAPI(
    title="BrokeStack Worker",
    version="0.2.0",
    description="Python execution worker for BrokeStack tools, workflows, and scheduled jobs.",
)


def require_worker_secret(x_worker_secret: str | None = Header(default=None)) -> None:
    if x_worker_secret != settings.worker_shared_secret:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Unauthorized")


@app.get("/health", response_model=HealthResponse)
async def health() -> HealthResponse:
    return HealthResponse(
        status="healthy",
        service="brokestack-worker",
        tools_registered=len(list_tools()),
    )


@app.get("/tools", response_model=list[ToolDescriptor])
async def tools() -> list[ToolDescriptor]:
    return list_tools()


@app.post("/runs/preview", response_model=RunPreviewResponse)
async def runs_preview(payload: RunPreviewRequest) -> RunPreviewResponse:
    try:
        return preview_run(payload)
    except ValueError as exc:
        raise HTTPException(status_code=404, detail=str(exc)) from exc


@app.post(
    "/provider-accounts/login-sessions",
    response_model=StartLoginSessionResponse,
    dependencies=[Depends(require_worker_secret)],
)
async def provider_account_login_sessions(payload: StartLoginSessionRequest) -> StartLoginSessionResponse:
    try:
        return await runtime.start_login_session(payload)
    except ValueError as exc:
        raise HTTPException(status_code=409, detail=str(exc)) from exc
    except RuntimeError as exc:
        raise HTTPException(status_code=502, detail=str(exc)) from exc


@app.post(
    "/automation-runs",
    response_model=StartAutomationRunResponse,
    dependencies=[Depends(require_worker_secret)],
)
async def automation_runs(payload: StartAutomationRunRequest) -> StartAutomationRunResponse:
    try:
        return await runtime.start_automation_run(payload)
    except ValueError as exc:
        raise HTTPException(status_code=409, detail=str(exc)) from exc
    except RuntimeError as exc:
        raise HTTPException(status_code=502, detail=str(exc)) from exc
