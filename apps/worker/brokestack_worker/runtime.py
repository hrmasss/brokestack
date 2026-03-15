from __future__ import annotations

import asyncio
import uuid
from collections import defaultdict, deque
from dataclasses import dataclass, field

from brokestack_worker.callbacks import CallbackClient
from brokestack_worker.config import WorkerSettings
from brokestack_worker.models import StartAutomationRunRequest, StartAutomationRunResponse, StartLoginSessionRequest, StartLoginSessionResponse
from brokestack_worker.providers.base import LoginSessionContext, ProviderAccountContext, RunSessionContext
from brokestack_worker.providers.chatgpt import ChatGPTProviderAdapter


@dataclass(slots=True)
class QueuedRun:
    request: StartAutomationRunRequest
    worker_run_id: str


@dataclass(slots=True)
class ActiveLogin:
    account_id: str
    provider: str
    worker_session_id: str
    login_session_id: str
    provider_session: object | None = None


@dataclass(slots=True)
class ActiveRun:
    queued_run: QueuedRun
    provider: str
    provider_session: object
    sent_outputs: set[str] = field(default_factory=set)
    last_status: str = ""
    last_message: str | None = None


class WorkerRuntime:
    def __init__(self, settings: WorkerSettings) -> None:
        self._settings = settings
        self._callbacks = CallbackClient(settings)
        self._adapters = {"chatgpt": ChatGPTProviderAdapter(settings)}
        self._account_queues: dict[str, deque[QueuedRun]] = defaultdict(deque)
        self._account_processors: dict[str, asyncio.Task[None]] = {}
        self._active_login_accounts: set[str] = set()
        self._active_run_accounts: set[str] = set()

    def registered_tools(self) -> int:
        return 1

    async def start_login_session(self, request: StartLoginSessionRequest) -> StartLoginSessionResponse:
        account_id = request.provider_account_id
        if account_id in self._active_login_accounts or account_id in self._active_run_accounts or self._account_queues[account_id]:
            raise ValueError("provider account is busy with another login or run")

        adapter = self._resolve_adapter(request.provider)
        account = self._account_context(
            provider_account_id=request.provider_account_id,
            workspace_id=request.workspace_id,
            provider=request.provider,
            profile_key=request.profile_key,
        )
        worker_session_id = str(uuid.uuid4())
        login_context = LoginSessionContext(
            login_session_id=request.login_session_id,
            worker_session_id=worker_session_id,
            account=account,
        )

        active_login = ActiveLogin(
            account_id=account_id,
            provider=request.provider,
            worker_session_id=worker_session_id,
            login_session_id=request.login_session_id,
        )
        self._active_login_accounts.add(account_id)
        asyncio.create_task(self._launch_and_watch_login(active_login, login_context))
        return StartLoginSessionResponse(workerSessionId=worker_session_id, status="pending_login")

    async def start_automation_run(self, request: StartAutomationRunRequest) -> StartAutomationRunResponse:
        worker_run_id = str(uuid.uuid4())
        account_id = request.provider_account_id
        queued_run = QueuedRun(request=request, worker_run_id=worker_run_id)
        self._account_queues[account_id].append(queued_run)

        if account_id not in self._account_processors:
            self._account_processors[account_id] = asyncio.create_task(self._process_account_queue(account_id))

        return StartAutomationRunResponse(workerRunId=worker_run_id, status="queued")

    async def _launch_and_watch_login(self, active_login: ActiveLogin, login_context: LoginSessionContext) -> None:
        adapter = self._resolve_adapter(active_login.provider)
        try:
            active_login.provider_session = await asyncio.to_thread(adapter.start_login, login_context)
            await self._watch_login(active_login)
        except Exception as exc:
            await self._safe_emit_account_needs_reauth(
                provider_account_id=active_login.account_id,
                login_session_id=active_login.login_session_id,
                message=f"ChatGPT login session failed: {exc}",
            )
        finally:
            try:
                if active_login.provider_session is not None:
                    await asyncio.to_thread(adapter.cancel_run, active_login.provider_session)
            finally:
                self._active_login_accounts.discard(active_login.account_id)

    async def _watch_login(self, active_login: ActiveLogin) -> None:
        adapter = self._resolve_adapter(active_login.provider)
        if active_login.provider_session is None:
            raise RuntimeError("login browser session was not initialized")

        while True:
            snapshot = await asyncio.to_thread(adapter.poll_login, active_login.provider_session)
            if snapshot.kind == "ready":
                await self._safe_emit_account_ready(
                    provider_account_id=active_login.account_id,
                    login_session_id=active_login.login_session_id,
                )
                return
            if snapshot.kind == "needs_reauth":
                await self._safe_emit_account_needs_reauth(
                    provider_account_id=active_login.account_id,
                    login_session_id=active_login.login_session_id,
                    message=snapshot.message or "ChatGPT login requires user attention.",
                )
                return
            await asyncio.sleep(self._settings.dom_poll_interval_seconds)

    async def _safe_emit_account_ready(self, *, provider_account_id: str, login_session_id: str) -> None:
        last_error: Exception | None = None
        for _ in range(3):
            try:
                await self._callbacks.emit_account_ready(
                    provider_account_id=provider_account_id,
                    login_session_id=login_session_id,
                )
                return
            except Exception as exc:
                last_error = exc
                await asyncio.sleep(1)
        if last_error is not None:
            raise last_error

    async def _safe_emit_account_needs_reauth(self, *, provider_account_id: str, login_session_id: str, message: str) -> None:
        last_error: Exception | None = None
        for _ in range(3):
            try:
                await self._callbacks.emit_account_needs_reauth(
                    provider_account_id=provider_account_id,
                    login_session_id=login_session_id,
                    message=message,
                )
                return
            except Exception as exc:
                last_error = exc
                await asyncio.sleep(1)
        if last_error is not None:
            raise last_error

    async def _process_account_queue(self, account_id: str) -> None:
        try:
            while self._account_queues[account_id]:
                queued_run = self._account_queues[account_id].popleft()
                self._active_run_accounts.add(account_id)
                await self._execute_run(queued_run)
        finally:
            self._active_run_accounts.discard(account_id)
            self._account_processors.pop(account_id, None)

    async def _execute_run(self, queued_run: QueuedRun) -> None:
        request = queued_run.request
        adapter = self._resolve_adapter(request.provider)
        account = self._account_context(
            provider_account_id=request.provider_account_id,
            workspace_id=request.workspace_id,
            provider=request.provider,
            profile_key=request.profile_key,
        )
        download_dir = self._settings.outputs_dir / "staging" / request.run_id
        final_output_dir = self._settings.outputs_dir / "workspaces" / request.workspace_id / request.run_id
        context = RunSessionContext(
            run_id=request.run_id,
            automation_id=request.automation_id,
            worker_run_id=queued_run.worker_run_id,
            account=account,
            prompt_text=request.prompt_text,
            config=request.config,
            download_dir=download_dir,
            final_output_dir=final_output_dir,
            metadata=request.metadata,
        )

        try:
            provider_session = await asyncio.to_thread(adapter.start_run, context)
            active_run = ActiveRun(
                queued_run=queued_run,
                provider=request.provider,
                provider_session=provider_session,
            )
            await self._callbacks.emit_run_started(
                provider_account_id=request.provider_account_id,
                run_id=request.run_id,
                worker_run_id=queued_run.worker_run_id,
                status="starting",
            )

            while True:
                snapshot = await asyncio.to_thread(adapter.poll_run, provider_session)
                if snapshot.provider_thread_url:
                    thread_key = snapshot.provider_thread_url
                    if getattr(provider_session, "thread_reported", False) is False:
                        setattr(provider_session, "thread_reported", True)
                        await self._callbacks.emit_thread_detected(
                            provider_account_id=request.provider_account_id,
                            run_id=request.run_id,
                            worker_run_id=queued_run.worker_run_id,
                            thread_url=thread_key,
                            thread_id=snapshot.provider_thread_id,
                        )

                for output in snapshot.outputs:
                    key = output.sha256 or output.storage_path
                    if key in active_run.sent_outputs:
                        continue
                    active_run.sent_outputs.add(key)
                    await self._callbacks.emit_output_ready(
                        provider_account_id=request.provider_account_id,
                        run_id=request.run_id,
                        worker_run_id=queued_run.worker_run_id,
                        output=output,
                    )

                message = snapshot.message
                if snapshot.status != active_run.last_status or message != active_run.last_message:
                    active_run.last_status = snapshot.status
                    active_run.last_message = message
                    await self._callbacks.emit_run_progress(
                        provider_account_id=request.provider_account_id,
                        run_id=request.run_id,
                        worker_run_id=queued_run.worker_run_id,
                        status=snapshot.status,
                        message=message,
                    )

                if snapshot.failed:
                    await self._callbacks.emit_run_failed(
                        provider_account_id=request.provider_account_id,
                        run_id=request.run_id,
                        worker_run_id=queued_run.worker_run_id,
                        message=snapshot.message or "ChatGPT image generation failed.",
                        status=snapshot.status,
                    )
                    return
                if snapshot.done:
                    await self._callbacks.emit_run_completed(
                        provider_account_id=request.provider_account_id,
                        run_id=request.run_id,
                        worker_run_id=queued_run.worker_run_id,
                    )
                    return
                await asyncio.sleep(self._settings.dom_poll_interval_seconds)
        except Exception as exc:
            await self._callbacks.emit_run_failed(
                provider_account_id=request.provider_account_id,
                run_id=request.run_id,
                worker_run_id=queued_run.worker_run_id,
                message=f"Worker run failed: {exc}",
            )
        finally:
            try:
                if "provider_session" in locals():
                    await asyncio.to_thread(adapter.cancel_run, provider_session)
            except Exception:
                pass

    def _resolve_adapter(self, provider: str):
        normalized = provider.strip().lower()
        adapter = self._adapters.get(normalized)
        if adapter is None:
            raise ValueError(f"Unsupported provider: {provider}")
        return adapter

    def _account_context(self, *, provider_account_id: str, workspace_id: str, provider: str, profile_key: str) -> ProviderAccountContext:
        profile_dir = self._settings.browser_state_dir / workspace_id / provider_account_id
        return ProviderAccountContext(
            provider_account_id=provider_account_id,
            workspace_id=workspace_id,
            provider=provider,
            profile_key=profile_key,
            profile_dir=profile_dir,
        )
