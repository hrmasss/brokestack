from __future__ import annotations

import uuid

import httpx

from brokestack_worker.config import WorkerSettings
from brokestack_worker.models import WorkerEvent, WorkerOutputPayload


class CallbackClient:
    def __init__(self, settings: WorkerSettings) -> None:
        self._settings = settings

    async def send(self, event: WorkerEvent, *, path: str = "/api/internal/worker/run-events") -> None:
        async with httpx.AsyncClient(timeout=30.0) as client:
            response = await client.post(
                f"{self._settings.api_base_url}{path}",
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

    async def emit_browser_ready_for_user(
        self,
        *,
        provider_account_id: str,
        login_session_id: str,
        browser_instance_id: str,
        session_status: str,
        stream_session_token: str,
        stream_url: str,
        runtime_type: str,
        profile_mount_path: str,
        region: str,
        node_name: str,
    ) -> None:
        await self.send(
            WorkerEvent(
                eventId=str(uuid.uuid4()),
                eventType="browser.ready_for_user",
                providerAccountId=provider_account_id,
                loginSessionId=login_session_id,
                browserInstanceId=browser_instance_id,
                sessionStatus=session_status,
                streamSessionToken=stream_session_token,
                streamUrl=stream_url,
                runtimeType=runtime_type,
                profileMountPath=profile_mount_path,
                region=region,
                nodeName=node_name,
            ),
            path="/api/internal/worker/browser-events",
        )

    async def emit_browser_auth_detected(
        self,
        *,
        provider_account_id: str,
        login_session_id: str,
        browser_instance_id: str,
    ) -> None:
        await self.send(
            WorkerEvent(
                eventId=str(uuid.uuid4()),
                eventType="browser.auth_detected",
                providerAccountId=provider_account_id,
                loginSessionId=login_session_id,
                browserInstanceId=browser_instance_id,
                sessionStatus="auth_in_progress",
            ),
            path="/api/internal/worker/browser-events",
        )

    async def emit_browser_fallback_required(
        self,
        *,
        provider_account_id: str,
        login_session_id: str,
        browser_instance_id: str,
        message: str,
    ) -> None:
        await self.send(
            WorkerEvent(
                eventId=str(uuid.uuid4()),
                eventType="browser.fallback_required",
                providerAccountId=provider_account_id,
                loginSessionId=login_session_id,
                browserInstanceId=browser_instance_id,
                sessionStatus="auth_in_progress",
                fallbackRequired=True,
                message=message,
            ),
            path="/api/internal/worker/browser-events",
        )

    async def emit_browser_failed(
        self,
        *,
        provider_account_id: str,
        login_session_id: str,
        browser_instance_id: str,
        message: str,
    ) -> None:
        await self.send(
            WorkerEvent(
                eventId=str(uuid.uuid4()),
                eventType="browser.failed",
                providerAccountId=provider_account_id,
                loginSessionId=login_session_id,
                browserInstanceId=browser_instance_id,
                sessionStatus="failed",
                message=message,
            ),
            path="/api/internal/worker/browser-events",
        )

    async def emit_browser_closed(
        self,
        *,
        provider_account_id: str,
        login_session_id: str,
        browser_instance_id: str,
        message: str | None = None,
    ) -> None:
        await self.send(
            WorkerEvent(
                eventId=str(uuid.uuid4()),
                eventType="browser.closed",
                providerAccountId=provider_account_id,
                loginSessionId=login_session_id,
                browserInstanceId=browser_instance_id,
                message=message,
            ),
            path="/api/internal/worker/browser-events",
        )
