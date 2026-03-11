from __future__ import annotations

from fastapi import FastAPI, HTTPException

from brokestack_worker.models import HealthResponse, RunPreviewRequest, RunPreviewResponse, ToolDescriptor
from brokestack_worker.registry import list_tools, preview_run

app = FastAPI(
    title="BrokeStack Worker",
    version="0.1.0",
    description="Python execution worker for BrokeStack tools, workflows, and future scheduled jobs.",
)


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
