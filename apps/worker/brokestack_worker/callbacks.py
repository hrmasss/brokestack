from __future__ import annotations

import uuid

import httpx

from brokestack_worker.config import WorkerSettings
from brokestack_worker.models import WorkerEvent, WorkerOutputPayload


class CallbackClient:
    def __init__(self, settings: WorkerSettings) -> None:
        self._settings = settings

    async def send(self, event: WorkerEvent) -> None:
        async with httpx.AsyncClient(timeout=30.0) as client:
            response = await client.post(
                f"{self._settings.api_base_url}/api/internal/worker/run-events",
                json=event.model_dump(mode="json", by_alias=True, exclude_none=True),
                headers={"X-Worker-Secret": self._settings.worker_shared_secret},
            )
            response.raise_for_status()

    async def emit_account_ready(self, *, provider_account_id: str, login_session_id: str) -> None:
        await self.send(
            WorkerEvent(
                eventId=str(uuid.uuid4()),
                eventType="account.ready",
                providerAccountId=provider_account_id,
                loginSessionId=login_session_id,
            )
        )

    async def emit_account_needs_reauth(
        self,
        *,
        provider_account_id: str,
        login_session_id: str,
        message: str,
    ) -> None:
        await self.send(
            WorkerEvent(
                eventId=str(uuid.uuid4()),
                eventType="account.needs_reauth",
                providerAccountId=provider_account_id,
                loginSessionId=login_session_id,
                message=message,
            )
        )

    async def emit_run_started(self, *, provider_account_id: str, run_id: str, worker_run_id: str, status: str) -> None:
        await self.send(
            WorkerEvent(
                eventId=str(uuid.uuid4()),
                eventType="run.started",
                providerAccountId=provider_account_id,
                runId=run_id,
                workerRunId=worker_run_id,
                status=status,
            )
        )

    async def emit_run_progress(
        self,
        *,
        provider_account_id: str,
        run_id: str,
        worker_run_id: str,
        status: str,
        message: str | None = None,
    ) -> None:
        await self.send(
            WorkerEvent(
                eventId=str(uuid.uuid4()),
                eventType="run.progress",
                providerAccountId=provider_account_id,
                runId=run_id,
                workerRunId=worker_run_id,
                status=status,
                message=message,
            )
        )

    async def emit_thread_detected(
        self,
        *,
        provider_account_id: str,
        run_id: str,
        worker_run_id: str,
        thread_url: str,
        thread_id: str | None,
    ) -> None:
        await self.send(
            WorkerEvent(
                eventId=str(uuid.uuid4()),
                eventType="run.thread_detected",
                providerAccountId=provider_account_id,
                runId=run_id,
                workerRunId=worker_run_id,
                providerThreadUrl=thread_url,
                providerThreadId=thread_id,
            )
        )

    async def emit_output_ready(
        self,
        *,
        provider_account_id: str,
        run_id: str,
        worker_run_id: str,
        output: WorkerOutputPayload,
    ) -> None:
        await self.send(
            WorkerEvent(
                eventId=str(uuid.uuid4()),
                eventType="run.output_ready",
                providerAccountId=provider_account_id,
                runId=run_id,
                workerRunId=worker_run_id,
                output=output,
            )
        )

    async def emit_run_completed(self, *, provider_account_id: str, run_id: str, worker_run_id: str) -> None:
        await self.send(
            WorkerEvent(
                eventId=str(uuid.uuid4()),
                eventType="run.completed",
                providerAccountId=provider_account_id,
                runId=run_id,
                workerRunId=worker_run_id,
                status="completed",
            )
        )

    async def emit_run_failed(
        self,
        *,
        provider_account_id: str,
        run_id: str,
        worker_run_id: str,
        message: str,
        status: str = "failed",
    ) -> None:
        await self.send(
            WorkerEvent(
                eventId=str(uuid.uuid4()),
                eventType="run.failed",
                providerAccountId=provider_account_id,
                runId=run_id,
                workerRunId=worker_run_id,
                status=status,
                message=message,
            )
        )
