from __future__ import annotations

import asyncio
import tempfile
import unittest
from pathlib import Path
from unittest.mock import patch

from brokestack_worker.config import WorkerSettings
from brokestack_worker.models import StartImageJobRequest
from brokestack_worker.runtime import QueuedRun, WorkerRuntime, render_browser_embed_page


class CallbackRecorder:
    def __init__(self) -> None:
        self.events: list[tuple[str, dict]] = []

    async def emit_run_started(self, **kwargs) -> None:
        self.events.append(("started", kwargs))

    async def emit_run_progress(self, **kwargs) -> None:
        self.events.append(("progress", kwargs))

    async def emit_thread_detected(self, **kwargs) -> None:
        self.events.append(("thread", kwargs))

    async def emit_output_ready(self, **kwargs) -> None:
        self.events.append(("output", kwargs))

    async def emit_run_completed(self, **kwargs) -> None:
        self.events.append(("completed", kwargs))

    async def emit_run_failed(self, **kwargs) -> None:
        self.events.append(("failed", kwargs))


def make_settings(*, test_mode: bool = False) -> WorkerSettings:
    return WorkerSettings(
        worker_shared_secret="secret",
        api_base_url="http://localhost:8080",
        public_base_url="http://localhost:8091",
        browser_state_dir=Path(".tmp/browser-state"),
        outputs_dir=Path(".tmp/storage/outputs"),
        chrome_binary_path=None,
        chrome_headless=True,
        chatgpt_base_url="https://chatgpt.com",
        login_timeout_seconds=10,
        run_timeout_seconds=10,
        login_stable_polls=1,
        dom_poll_interval_seconds=0.01,
        test_mode=test_mode,
    )


def make_request(run_id: str, provider_account_id: str = "account-1") -> StartImageJobRequest:
    return StartImageJobRequest(
        runId=run_id,
        automationId="",
        providerAccountId=provider_account_id,
        workspaceId="workspace-1",
        provider="chatgpt",
        profileKey="profile-1",
        promptText=f"Generate fixture for {run_id}",
        config={
            "cooldownSeconds": 60,
            "jitterMinSeconds": 5,
            "jitterMaxSeconds": 20,
        },
    )


class WorkerRuntimeQueueTests(unittest.IsolatedAsyncioTestCase):
    def test_browser_embed_page_uses_iframe_relative_worker_paths(self) -> None:
        html = render_browser_embed_page("worker-session-1", "stream-token-1")

        self.assertIn('const sessionBasePath = window.location.pathname.replace(/\\/embed$/, "");', html)
        self.assertIn('fetch(sessionUrl("/status"))', html)
        self.assertIn('sessionUrl("/actions/click")', html)
        self.assertIn('sessionUrl("/frame")', html)

    async def test_calculate_next_ready_at_applies_cooldown_and_jitter(self) -> None:
        runtime = WorkerRuntime(make_settings())
        queued_run = QueuedRun(request=make_request("run-1"), worker_run_id="worker-1")
        loop = asyncio.get_running_loop()
        baseline = loop.time()

        with patch("brokestack_worker.runtime.random.randint", return_value=7):
            ready_at = runtime._calculate_next_ready_at(queued_run)

        self.assertAlmostEqual(ready_at - baseline, 67, delta=0.5)

    async def test_account_queue_waits_for_next_ready_time(self) -> None:
        runtime = WorkerRuntime(make_settings())
        execution_times: list[float] = []

        async def fake_execute(queued_run: QueuedRun) -> None:
            execution_times.append(asyncio.get_running_loop().time())

        delay_calls = {"count": 0}

        def fake_next_ready_at(_queued_run: QueuedRun) -> float:
            delay_calls["count"] += 1
            if delay_calls["count"] == 1:
                return asyncio.get_running_loop().time() + 0.05
            return asyncio.get_running_loop().time()

        runtime._execute_run = fake_execute  # type: ignore[method-assign]
        runtime._calculate_next_ready_at = fake_next_ready_at  # type: ignore[method-assign]

        await runtime.start_image_job(make_request("run-1"))
        await runtime.start_image_job(make_request("run-2"))
        await runtime._account_processors["account-1"]

        self.assertEqual(len(execution_times), 2)
        self.assertGreaterEqual(execution_times[1] - execution_times[0], 0.04)

    async def test_test_mode_generates_fixture_output(self) -> None:
        with tempfile.TemporaryDirectory() as temp_dir:
            settings = make_settings(test_mode=True)
            settings = WorkerSettings(
                worker_shared_secret=settings.worker_shared_secret,
                api_base_url=settings.api_base_url,
                public_base_url=settings.public_base_url,
                browser_state_dir=Path(temp_dir) / "browser",
                outputs_dir=Path(temp_dir) / "outputs",
                chrome_binary_path=settings.chrome_binary_path,
                chrome_headless=settings.chrome_headless,
                chatgpt_base_url=settings.chatgpt_base_url,
                login_timeout_seconds=settings.login_timeout_seconds,
                run_timeout_seconds=settings.run_timeout_seconds,
                login_stable_polls=settings.login_stable_polls,
                dom_poll_interval_seconds=settings.dom_poll_interval_seconds,
                test_mode=True,
            )
            runtime = WorkerRuntime(settings)
            recorder = CallbackRecorder()
            runtime._callbacks = recorder  # type: ignore[assignment]

            queued_run = QueuedRun(request=make_request("run-1"), worker_run_id="worker-1")
            await runtime._execute_run(queued_run)

            event_names = [name for name, _payload in recorder.events]
            self.assertEqual(event_names, ["started", "progress", "thread", "output", "completed"])
            output_payload = next(payload for name, payload in recorder.events if name == "output")
            self.assertTrue(Path(output_payload["output"].storage_path).exists())


if __name__ == "__main__":
    unittest.main()
