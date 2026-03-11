from __future__ import annotations

from brokestack_worker.models import RunPreviewRequest, RunPreviewResponse, ToolDescriptor


TOOLS = [
    ToolDescriptor(
        slug="logo-generator",
        name="Logo Generator",
        category="image",
        runtime="python",
        description="Generate logo directions and output-ready assets from prompts and references.",
    ),
    ToolDescriptor(
        slug="png-to-svg",
        name="PNG to SVG",
        category="conversion",
        runtime="python",
        description="Convert raster artwork into simplified vector outputs for downstream use.",
    ),
    ToolDescriptor(
        slug="available-domain-finder",
        name="Available Domain Finder",
        category="domains",
        runtime="python",
        description="Generate candidate names and check domain availability across configured TLDs.",
    ),
]


def list_tools() -> list[ToolDescriptor]:
    return TOOLS


def preview_run(payload: RunPreviewRequest) -> RunPreviewResponse:
    tool = next((item for item in TOOLS if item.slug == payload.tool_slug), None)
    if tool is None:
        raise ValueError(f"Unknown tool slug: {payload.tool_slug}")

    estimated_seconds = max(15, payload.input_count * 12)
    notes = [
        f"Mode: {payload.mode}",
        f"Inputs queued: {payload.input_count}",
        "Execution is handled by the Python worker while tenancy and orchestration stay in the Go API.",
    ]

    return RunPreviewResponse(
        status="accepted",
        tool_slug=tool.slug,
        accepted_by="brokestack-worker",
        estimated_seconds=estimated_seconds,
        queue="default",
        notes=notes,
    )
