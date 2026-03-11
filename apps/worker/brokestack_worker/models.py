from __future__ import annotations

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
