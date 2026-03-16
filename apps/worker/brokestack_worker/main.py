from __future__ import annotations

from fastapi import Depends, FastAPI, Header, HTTPException, Query, Response, status
from fastapi.responses import HTMLResponse

from brokestack_worker.config import WorkerSettings, load_settings
from brokestack_worker.models import (
    HealthResponse,
    RefreshLoginSessionStreamRequest,
    RefreshLoginSessionStreamResponse,
    RunPreviewRequest,
    RunPreviewResponse,
    StartAutomationRunRequest,
    StartAutomationRunResponse,
    StartImageJobRequest,
    StartImageJobResponse,
    StartLoginSessionRequest,
    StartLoginSessionResponse,
    ToolDescriptor,
)
from brokestack_worker.registry import list_tools, preview_run
from brokestack_worker.runtime import WorkerRuntime, render_browser_embed_page

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
        response = await runtime.start_login_session(payload)
        return response.model_dump(by_alias=True)
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
        response = await runtime.start_automation_run(payload)
        return response.model_dump(by_alias=True)
    except ValueError as exc:
        raise HTTPException(status_code=409, detail=str(exc)) from exc
    except RuntimeError as exc:
        raise HTTPException(status_code=502, detail=str(exc)) from exc


@app.post(
    "/image-jobs",
    response_model=StartImageJobResponse,
    dependencies=[Depends(require_worker_secret)],
)
async def image_jobs(payload: StartImageJobRequest) -> StartImageJobResponse:
    try:
        response = await runtime.start_image_job(payload)
        return response.model_dump(by_alias=True)
    except ValueError as exc:
        raise HTTPException(status_code=409, detail=str(exc)) from exc
    except RuntimeError as exc:
        raise HTTPException(status_code=502, detail=str(exc)) from exc


@app.post(
    "/provider-accounts/login-sessions/{worker_session_id}/refresh-stream",
    response_model=RefreshLoginSessionStreamResponse,
    dependencies=[Depends(require_worker_secret)],
)
async def provider_account_login_session_refresh_stream(
    worker_session_id: str,
    payload: RefreshLoginSessionStreamRequest,
) -> RefreshLoginSessionStreamResponse:
    if payload.worker_session_id != worker_session_id:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Worker session mismatch")
    try:
        response = await runtime.refresh_login_session_stream(worker_session_id)
        return response.model_dump(by_alias=True)
    except ValueError as exc:
        raise HTTPException(status_code=404, detail=str(exc)) from exc


@app.get("/browser-sessions/{worker_session_id}/embed", response_class=HTMLResponse)
async def browser_session_embed(worker_session_id: str, token: str = Query(default="")) -> HTMLResponse:
    try:
        runtime._require_active_login(worker_session_id, token)
    except PermissionError as exc:
        raise HTTPException(status_code=401, detail=str(exc)) from exc
    except ValueError as exc:
        raise HTTPException(status_code=404, detail=str(exc)) from exc
    return HTMLResponse(render_browser_embed_page(worker_session_id, token))


@app.get("/browser-sessions/{worker_session_id}/status")
async def browser_session_status(worker_session_id: str, token: str = Query(default="")) -> dict:
    try:
        return await runtime.get_login_browser_status(worker_session_id, token)
    except PermissionError as exc:
        raise HTTPException(status_code=401, detail=str(exc)) from exc
    except ValueError as exc:
        raise HTTPException(status_code=404, detail=str(exc)) from exc
    except RuntimeError as exc:
        raise HTTPException(status_code=409, detail=str(exc)) from exc


@app.get("/browser-sessions/{worker_session_id}/frame")
async def browser_session_frame(worker_session_id: str, token: str = Query(default="")) -> Response:
    try:
        payload = await runtime.capture_login_browser_frame(worker_session_id, token)
    except PermissionError as exc:
        raise HTTPException(status_code=401, detail=str(exc)) from exc
    except ValueError as exc:
        raise HTTPException(status_code=404, detail=str(exc)) from exc
    except RuntimeError as exc:
        raise HTTPException(status_code=409, detail=str(exc)) from exc
    return Response(content=payload, media_type="image/png")


@app.post("/browser-sessions/{worker_session_id}/actions/click")
async def browser_session_click(worker_session_id: str, token: str = Query(default=""), payload: dict | None = None) -> dict:
    body = payload or {}
    try:
        await runtime.click_login_browser(
            worker_session_id,
            token,
            int(body.get("x", 0)),
            int(body.get("y", 0)),
        )
    except PermissionError as exc:
        raise HTTPException(status_code=401, detail=str(exc)) from exc
    except ValueError as exc:
        raise HTTPException(status_code=404, detail=str(exc)) from exc
    except RuntimeError as exc:
        raise HTTPException(status_code=409, detail=str(exc)) from exc
    return {"status": "ok"}


@app.post("/browser-sessions/{worker_session_id}/actions/type")
async def browser_session_type(worker_session_id: str, token: str = Query(default=""), payload: dict | None = None) -> dict:
    body = payload or {}
    try:
        await runtime.type_into_login_browser(worker_session_id, token, str(body.get("text", "")))
    except PermissionError as exc:
        raise HTTPException(status_code=401, detail=str(exc)) from exc
    except ValueError as exc:
        raise HTTPException(status_code=404, detail=str(exc)) from exc
    except RuntimeError as exc:
        raise HTTPException(status_code=409, detail=str(exc)) from exc
    return {"status": "ok"}


@app.post("/browser-sessions/{worker_session_id}/actions/key")
async def browser_session_key(worker_session_id: str, token: str = Query(default=""), payload: dict | None = None) -> dict:
    body = payload or {}
    try:
        await runtime.send_login_browser_key(worker_session_id, token, str(body.get("key", "")))
    except PermissionError as exc:
        raise HTTPException(status_code=401, detail=str(exc)) from exc
    except ValueError as exc:
        raise HTTPException(status_code=404, detail=str(exc)) from exc
    except RuntimeError as exc:
        raise HTTPException(status_code=409, detail=str(exc)) from exc
    return {"status": "ok"}


@app.post("/browser-sessions/{worker_session_id}/actions/scroll")
async def browser_session_scroll(worker_session_id: str, token: str = Query(default=""), payload: dict | None = None) -> dict:
    body = payload or {}
    try:
        await runtime.scroll_login_browser(worker_session_id, token, float(body.get("deltaY", 0)))
    except PermissionError as exc:
        raise HTTPException(status_code=401, detail=str(exc)) from exc
    except ValueError as exc:
        raise HTTPException(status_code=404, detail=str(exc)) from exc
    except RuntimeError as exc:
        raise HTTPException(status_code=409, detail=str(exc)) from exc
    return {"status": "ok"}
