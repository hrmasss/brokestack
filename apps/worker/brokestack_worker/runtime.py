from __future__ import annotations

import asyncio
import base64
import hashlib
import html
import random
import socket
import uuid
from collections import defaultdict, deque
from dataclasses import dataclass, field
from typing import Any

from selenium.webdriver.common.action_chains import ActionChains
from selenium.webdriver.common.keys import Keys

from brokestack_worker.callbacks import CallbackClient
from brokestack_worker.config import WorkerSettings
from brokestack_worker.models import (
    RefreshLoginSessionStreamResponse,
    StartAutomationRunRequest,
    StartAutomationRunResponse,
    StartImageJobRequest,
    StartImageJobResponse,
    StartLoginSessionRequest,
    StartLoginSessionResponse,
    WorkerOutputPayload,
)
from brokestack_worker.providers.base import LoginSessionContext, ProviderAccountContext, RunSessionContext
from brokestack_worker.providers.chatgpt import ChatGPTProviderAdapter

FAKE_PNG_BYTES = base64.b64decode(
    "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO2Z6l8AAAAASUVORK5CYII="
)


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
    browser_instance_id: str
    stream_session_token: str
    stream_url: str
    runtime_type: str
    profile_mount_path: str
    region: str
    node_name: str
    provider_session: object | None = None
    session_status: str = "launching"
    auth_detected_emitted: bool = False
    lock: asyncio.Lock = field(default_factory=asyncio.Lock)


@dataclass(slots=True)
class ActiveRun:
    queued_run: QueuedRun
    provider: str
    provider_session: object
    sent_outputs: set[str] = field(default_factory=set)
    last_status: str = ""
    last_message: str | None = None


def render_browser_embed_page(worker_session_id: str, token: str) -> str:
    escaped_session_id = html.escape(worker_session_id, quote=True)
    escaped_token = html.escape(token, quote=True)
    return f"""<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Memofi Remote Browser</title>
  <style>
    :root {{
      color-scheme: dark;
      --bg: #102318;
      --panel: #173324;
      --panel-strong: #0e1e15;
      --border: rgba(196, 230, 206, 0.12);
      --text: #edf7ef;
      --muted: #a3c2ac;
      --accent: #6dd4a7;
      --danger: #ff8e8e;
    }}
    * {{ box-sizing: border-box; }}
    body {{
      margin: 0;
      min-height: 100vh;
      background:
        radial-gradient(circle at top, rgba(109, 212, 167, 0.18), transparent 32%),
        linear-gradient(180deg, #112519 0%, #0b1812 100%);
      color: var(--text);
      font: 14px/1.4 "Segoe UI", sans-serif;
    }}
    .layout {{
      display: grid;
      grid-template-columns: minmax(0, 1fr) 320px;
      min-height: 100vh;
    }}
    .stage {{
      padding: 18px;
    }}
    .screen-shell {{
      height: calc(100vh - 36px);
      border-radius: 26px;
      background: rgba(7, 16, 11, 0.86);
      border: 1px solid var(--border);
      overflow: hidden;
      position: relative;
      display: flex;
      align-items: center;
      justify-content: center;
    }}
    #screen {{
      width: 100%;
      height: 100%;
      object-fit: contain;
      user-select: none;
      cursor: crosshair;
      background: #070f0a;
    }}
    .sidebar {{
      border-left: 1px solid var(--border);
      background: rgba(9, 18, 13, 0.92);
      padding: 20px;
      display: flex;
      flex-direction: column;
      gap: 16px;
    }}
    .card {{
      border: 1px solid var(--border);
      background: var(--panel);
      border-radius: 22px;
      padding: 14px;
    }}
    .eyebrow {{
      color: var(--muted);
      font-size: 12px;
      letter-spacing: 0.08em;
      text-transform: uppercase;
    }}
    .value {{
      margin-top: 4px;
      font-size: 15px;
      font-weight: 600;
    }}
    .hint {{
      font-size: 12px;
      color: var(--muted);
    }}
    .danger {{
      color: var(--danger);
    }}
    textarea {{
      width: 100%;
      min-height: 120px;
      border-radius: 18px;
      border: 1px solid var(--border);
      background: var(--panel-strong);
      color: var(--text);
      padding: 12px;
      resize: vertical;
      font: inherit;
    }}
    button {{
      border: 0;
      border-radius: 999px;
      background: rgba(109, 212, 167, 0.14);
      color: var(--text);
      padding: 10px 14px;
      cursor: pointer;
      font: inherit;
    }}
    button.primary {{
      background: linear-gradient(135deg, #67d2a3 0%, #2da978 100%);
      color: #092115;
      font-weight: 700;
    }}
    .button-row {{
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
    }}
    @media (max-width: 980px) {{
      .layout {{ grid-template-columns: 1fr; }}
      .sidebar {{ border-left: 0; border-top: 1px solid var(--border); }}
      .screen-shell {{ height: 60vh; }}
    }}
  </style>
</head>
<body>
  <div class="layout">
    <div class="stage">
      <div class="screen-shell">
        <img id="screen" alt="Remote browser viewport" />
      </div>
    </div>
    <aside class="sidebar">
      <div class="card">
        <div class="eyebrow">Session status</div>
        <div class="value" id="session-status">Launching browser...</div>
        <div class="hint" id="session-message">The browser stream will connect automatically.</div>
      </div>
      <div class="card">
        <div class="eyebrow">Browser</div>
        <div class="value" id="page-title">Loading...</div>
        <div class="hint" id="page-url">Waiting for page data...</div>
      </div>
      <div class="card">
        <div class="eyebrow">Type into focused field</div>
        <textarea id="text-input" placeholder="Paste email, password, or codes here after clicking the field in the browser."></textarea>
        <div class="button-row" style="margin-top: 12px;">
          <button class="primary" id="send-text" type="button">Send text</button>
          <button id="clear-text" type="button">Clear</button>
        </div>
      </div>
      <div class="card">
        <div class="eyebrow">Quick keys</div>
        <div class="button-row" style="margin-top: 10px;">
          <button data-key="Tab" type="button">Tab</button>
          <button data-key="Shift+Tab" type="button">Shift+Tab</button>
          <button data-key="Enter" type="button">Enter</button>
          <button data-key="Backspace" type="button">Backspace</button>
          <button data-key="Escape" type="button">Escape</button>
        </div>
      </div>
      <div class="card">
        <div class="eyebrow">Tips</div>
        <div class="hint">Click inside the browser first, then type. If a passkey or device-bound prompt appears, return to Memofi and choose the local-device fallback.</div>
      </div>
    </aside>
  </div>
  <script>
    const workerSessionId = "{escaped_session_id}";
    const token = "{escaped_token}";
    const screen = document.getElementById("screen");
    const sessionStatus = document.getElementById("session-status");
    const sessionMessage = document.getElementById("session-message");
    const pageTitle = document.getElementById("page-title");
    const pageUrl = document.getElementById("page-url");
    const textInput = document.getElementById("text-input");

    async function post(path, body) {{
      const response = await fetch(path, {{
        method: "POST",
        headers: {{ "Content-Type": "application/json" }},
        body: JSON.stringify(body),
      }});
      if (!response.ok) {{
        throw new Error("Action failed");
      }}
    }}

    async function refreshStatus() {{
      try {{
        const response = await fetch(`/browser-sessions/${{workerSessionId}}/status?token=${{encodeURIComponent(token)}}`);
        if (!response.ok) {{
          throw new Error("status");
        }}
        const payload = await response.json();
        sessionStatus.textContent = payload.sessionStatus.replaceAll("_", " ");
        sessionMessage.textContent = payload.message || "The remote browser is ready for interaction.";
        sessionMessage.className = payload.failed ? "hint danger" : "hint";
        pageTitle.textContent = payload.title || "Untitled page";
        pageUrl.textContent = payload.currentUrl || "Waiting for page data...";
      }} catch (_error) {{
        sessionStatus.textContent = "disconnected";
        sessionMessage.textContent = "This browser session is no longer available. Return to Memofi and refresh the connection state.";
        sessionMessage.className = "hint danger";
      }}
    }}

    function refreshFrame() {{
      screen.src = `/browser-sessions/${{workerSessionId}}/frame?token=${{encodeURIComponent(token)}}&ts=${{Date.now()}}`;
    }}

    screen.addEventListener("click", async (event) => {{
      const bounds = screen.getBoundingClientRect();
      const naturalWidth = screen.naturalWidth || bounds.width;
      const naturalHeight = screen.naturalHeight || bounds.height;
      const x = Math.max(0, Math.round((event.clientX - bounds.left) * (naturalWidth / bounds.width)));
      const y = Math.max(0, Math.round((event.clientY - bounds.top) * (naturalHeight / bounds.height)));
      try {{
        await post(`/browser-sessions/${{workerSessionId}}/actions/click?token=${{encodeURIComponent(token)}}`, {{ x, y }});
        window.setTimeout(refreshFrame, 120);
      }} catch (_error) {{
        sessionMessage.textContent = "Unable to send the click to the remote browser.";
        sessionMessage.className = "hint danger";
      }}
    }});

    screen.addEventListener("wheel", async (event) => {{
      event.preventDefault();
      try {{
        await post(`/browser-sessions/${{workerSessionId}}/actions/scroll?token=${{encodeURIComponent(token)}}`, {{ deltaY: event.deltaY }});
        window.setTimeout(refreshFrame, 120);
      }} catch (_error) {{
        sessionMessage.textContent = "Unable to scroll the remote browser.";
        sessionMessage.className = "hint danger";
      }}
    }}, {{ passive: false }});

    document.getElementById("send-text").addEventListener("click", async () => {{
      const text = textInput.value;
      if (!text.trim()) {{
        return;
      }}
      try {{
        await post(`/browser-sessions/${{workerSessionId}}/actions/type?token=${{encodeURIComponent(token)}}`, {{ text }});
        window.setTimeout(refreshFrame, 120);
      }} catch (_error) {{
        sessionMessage.textContent = "Unable to type into the remote browser.";
        sessionMessage.className = "hint danger";
      }}
    }});

    document.getElementById("clear-text").addEventListener("click", () => {{
      textInput.value = "";
    }});

    for (const button of document.querySelectorAll("[data-key]")) {{
      button.addEventListener("click", async () => {{
        try {{
          await post(`/browser-sessions/${{workerSessionId}}/actions/key?token=${{encodeURIComponent(token)}}`, {{ key: button.getAttribute("data-key") }});
          window.setTimeout(refreshFrame, 120);
        }} catch (_error) {{
          sessionMessage.textContent = "Unable to send that key to the remote browser.";
          sessionMessage.className = "hint danger";
        }}
      }});
    }}

    refreshStatus();
    refreshFrame();
    window.setInterval(refreshStatus, 1500);
    window.setInterval(refreshFrame, 1200);
  </script>
</body>
</html>"""


class WorkerRuntime:
    def __init__(self, settings: WorkerSettings) -> None:
        self._settings = settings
        self._callbacks = CallbackClient(settings)
        self._adapters = {"chatgpt": ChatGPTProviderAdapter(settings)}
        self._account_queues: dict[str, deque[QueuedRun]] = defaultdict(deque)
        self._account_processors: dict[str, asyncio.Task[None]] = {}
        self._active_login_accounts: set[str] = set()
        self._active_run_accounts: set[str] = set()
        self._active_logins_by_worker_session: dict[str, ActiveLogin] = {}
        self._account_next_run_ready_at: dict[str, float] = {}
        self._node_name = socket.gethostname()

    def registered_tools(self) -> int:
        return 1

    async def start_login_session(self, request: StartLoginSessionRequest) -> StartLoginSessionResponse:
        account_id = request.provider_account_id
        if account_id in self._active_login_accounts or account_id in self._active_run_accounts or self._account_queues[account_id]:
            raise ValueError("provider account is busy with another login or run")

        worker_session_id = str(uuid.uuid4())
        browser_instance_id = str(uuid.uuid4())
        stream_session_token = str(uuid.uuid4())
        stream_url = self._stream_url(worker_session_id, stream_session_token)
        account = self._account_context(
            provider_account_id=request.provider_account_id,
            workspace_id=request.workspace_id,
            provider=request.provider,
            profile_key=request.profile_key,
        )
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
            browser_instance_id=browser_instance_id,
            stream_session_token=stream_session_token,
            stream_url=stream_url,
            runtime_type="embedded_stream",
            profile_mount_path=str(account.profile_dir),
            region="local",
            node_name=self._node_name,
        )

        self._active_login_accounts.add(account_id)
        self._active_logins_by_worker_session[worker_session_id] = active_login
        asyncio.create_task(self._launch_and_watch_login(active_login, login_context))

        return StartLoginSessionResponse(
            workerSessionId=worker_session_id,
            browserInstanceId=browser_instance_id,
            status="pending_login",
            sessionStatus="launching",
            streamSessionToken=stream_session_token,
            streamUrl=stream_url,
            runtimeType=active_login.runtime_type,
            profileMountPath=active_login.profile_mount_path,
            region=active_login.region,
            nodeName=active_login.node_name,
        )

    async def refresh_login_session_stream(self, worker_session_id: str) -> RefreshLoginSessionStreamResponse:
        active_login = self._active_logins_by_worker_session.get(worker_session_id)
        if active_login is None:
            raise ValueError("browser session is no longer active")
        active_login.stream_session_token = str(uuid.uuid4())
        active_login.stream_url = self._stream_url(active_login.worker_session_id, active_login.stream_session_token)
        return RefreshLoginSessionStreamResponse(
            streamSessionToken=active_login.stream_session_token,
            streamUrl=active_login.stream_url,
        )

    async def get_login_browser_status(self, worker_session_id: str, token: str) -> dict[str, Any]:
        active_login = self._require_active_login(worker_session_id, token)
        if active_login.provider_session is None:
            return {
                "sessionStatus": active_login.session_status,
                "title": "Launching browser",
                "currentUrl": "",
                "message": self._session_status_message(active_login.session_status),
                "failed": False,
            }

        def collect(provider_session: object) -> dict[str, Any]:
            driver = provider_session.driver
            try:
                return {
                    "sessionStatus": active_login.session_status,
                    "title": driver.title,
                    "currentUrl": driver.current_url,
                    "message": self._session_status_message(active_login.session_status),
                    "failed": active_login.session_status in {"failed", "expired"},
                }
            except Exception as exc:  # pragma: no cover
                return {
                    "sessionStatus": "failed",
                    "title": "Browser unavailable",
                    "currentUrl": "",
                    "message": f"Remote browser became unavailable: {exc}",
                    "failed": True,
                }

        return await self._with_login_session(active_login, collect)

    async def capture_login_browser_frame(self, worker_session_id: str, token: str) -> bytes:
        active_login = self._require_active_login(worker_session_id, token)
        if active_login.provider_session is None:
            raise RuntimeError("browser session is still launching")

        def capture(provider_session: object) -> bytes:
            return provider_session.driver.get_screenshot_as_png()

        return await self._with_login_session(active_login, capture)

    async def click_login_browser(self, worker_session_id: str, token: str, x: int, y: int) -> None:
        active_login = self._require_active_login(worker_session_id, token)
        await self._mark_auth_detected(active_login)
        if active_login.provider_session is None:
            raise RuntimeError("browser session is still launching")

        def perform(provider_session: object) -> None:
            provider_session.driver.execute_script(
                """
                const x = arguments[0];
                const y = arguments[1];
                const target = document.elementFromPoint(x, y);
                if (!target) {
                    return false;
                }
                if (typeof target.focus === "function") {
                    target.focus({ preventScroll: true });
                }
                for (const type of ["mouseover", "mousemove", "mousedown", "mouseup", "click"]) {
                    target.dispatchEvent(new MouseEvent(type, {
                        bubbles: true,
                        cancelable: true,
                        clientX: x,
                        clientY: y,
                        button: 0,
                    }));
                }
                return true;
                """,
                x,
                y,
            )

        await self._with_login_session(active_login, perform)

    async def type_into_login_browser(self, worker_session_id: str, token: str, text: str) -> None:
        active_login = self._require_active_login(worker_session_id, token)
        await self._mark_auth_detected(active_login)
        if active_login.provider_session is None:
            raise RuntimeError("browser session is still launching")

        def perform(provider_session: object) -> None:
            ActionChains(provider_session.driver).send_keys(text).perform()

        await self._with_login_session(active_login, perform)

    async def send_login_browser_key(self, worker_session_id: str, token: str, key: str) -> None:
        active_login = self._require_active_login(worker_session_id, token)
        await self._mark_auth_detected(active_login)
        if active_login.provider_session is None:
            raise RuntimeError("browser session is still launching")

        key_mapping = {
            "Tab": Keys.TAB,
            "Shift+Tab": Keys.SHIFT + Keys.TAB,
            "Enter": Keys.ENTER,
            "Backspace": Keys.BACKSPACE,
            "Escape": Keys.ESCAPE,
        }
        resolved = key_mapping.get(key, key)

        def perform(provider_session: object) -> None:
            ActionChains(provider_session.driver).send_keys(resolved).perform()

        await self._with_login_session(active_login, perform)

    async def scroll_login_browser(self, worker_session_id: str, token: str, delta_y: float) -> None:
        active_login = self._require_active_login(worker_session_id, token)
        await self._mark_auth_detected(active_login)
        if active_login.provider_session is None:
            raise RuntimeError("browser session is still launching")

        def perform(provider_session: object) -> None:
            provider_session.driver.execute_script("window.scrollBy(0, arguments[0]);", delta_y)

        await self._with_login_session(active_login, perform)

    async def start_automation_run(self, request: StartAutomationRunRequest) -> StartAutomationRunResponse:
        worker_run_id = str(uuid.uuid4())
        account_id = request.provider_account_id
        queued_run = QueuedRun(request=request, worker_run_id=worker_run_id)
        self._account_queues[account_id].append(queued_run)

        if account_id not in self._account_processors:
            self._account_processors[account_id] = asyncio.create_task(self._process_account_queue(account_id))

        return StartAutomationRunResponse(workerRunId=worker_run_id, status="queued")

    async def start_image_job(self, request: StartImageJobRequest) -> StartImageJobResponse:
        return await self.start_automation_run(request)

    async def _launch_and_watch_login(self, active_login: ActiveLogin, login_context: LoginSessionContext) -> None:
        adapter = self._resolve_adapter(active_login.provider)
        closed_message: str | None = None
        try:
            active_login.provider_session = await asyncio.to_thread(adapter.start_login, login_context)
            active_login.session_status = "ready_for_user"
            await self._callbacks.emit_browser_ready_for_user(
                provider_account_id=active_login.account_id,
                login_session_id=active_login.login_session_id,
                browser_instance_id=active_login.browser_instance_id,
                session_status=active_login.session_status,
                stream_session_token=active_login.stream_session_token,
                stream_url=active_login.stream_url,
                runtime_type=active_login.runtime_type,
                profile_mount_path=active_login.profile_mount_path,
                region=active_login.region,
                node_name=active_login.node_name,
            )
            await self._watch_login(active_login)
        except Exception as exc:
            active_login.session_status = "failed"
            closed_message = f"Browser login session failed: {exc}"
            await self._safe_emit_browser_failed(active_login, closed_message)
        finally:
            try:
                if active_login.provider_session is not None:
                    await asyncio.to_thread(adapter.cancel_run, active_login.provider_session)
            finally:
                await self._safe_emit_browser_closed(active_login, closed_message)
                self._active_login_accounts.discard(active_login.account_id)
                self._active_logins_by_worker_session.pop(active_login.worker_session_id, None)

    async def _watch_login(self, active_login: ActiveLogin) -> None:
        adapter = self._resolve_adapter(active_login.provider)
        if active_login.provider_session is None:
            raise RuntimeError("login browser session was not initialized")

        while True:
            snapshot = await self._with_login_session(
                active_login,
                lambda provider_session: adapter.poll_login(provider_session),
            )
            if snapshot.kind == "ready":
                active_login.session_status = "ready"
                await self._safe_emit_account_ready(
                    provider_account_id=active_login.account_id,
                    login_session_id=active_login.login_session_id,
                )
                return
            if snapshot.kind == "needs_reauth":
                active_login.session_status = "failed"
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
            except Exception as exc:  # pragma: no cover
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
            except Exception as exc:  # pragma: no cover
                last_error = exc
                await asyncio.sleep(1)
        if last_error is not None:
            raise last_error

    async def _safe_emit_browser_failed(self, active_login: ActiveLogin, message: str) -> None:
        last_error: Exception | None = None
        for _ in range(3):
            try:
                await self._callbacks.emit_browser_failed(
                    provider_account_id=active_login.account_id,
                    login_session_id=active_login.login_session_id,
                    browser_instance_id=active_login.browser_instance_id,
                    message=message,
                )
                return
            except Exception as exc:  # pragma: no cover
                last_error = exc
                await asyncio.sleep(1)
        if last_error is not None:
            raise last_error

    async def _safe_emit_browser_closed(self, active_login: ActiveLogin, message: str | None) -> None:
        try:
            await self._callbacks.emit_browser_closed(
                provider_account_id=active_login.account_id,
                login_session_id=active_login.login_session_id,
                browser_instance_id=active_login.browser_instance_id,
                message=message,
            )
        except Exception:
            return

    async def _mark_auth_detected(self, active_login: ActiveLogin) -> None:
        if active_login.auth_detected_emitted:
            return
        active_login.auth_detected_emitted = True
        active_login.session_status = "auth_in_progress"
        try:
            await self._callbacks.emit_browser_auth_detected(
                provider_account_id=active_login.account_id,
                login_session_id=active_login.login_session_id,
                browser_instance_id=active_login.browser_instance_id,
            )
        except Exception:
            return

    async def _process_account_queue(self, account_id: str) -> None:
        try:
            while self._account_queues[account_id]:
                while account_id in self._active_login_accounts:
                    await asyncio.sleep(self._settings.dom_poll_interval_seconds)
                next_ready_at = self._account_next_run_ready_at.get(account_id)
                if next_ready_at is not None:
                    remaining = next_ready_at - asyncio.get_running_loop().time()
                    if remaining > 0:
                        await asyncio.sleep(remaining)
                queued_run = self._account_queues[account_id].popleft()
                self._active_run_accounts.add(account_id)
                try:
                    await self._execute_run(queued_run)
                finally:
                    self._account_next_run_ready_at[account_id] = self._calculate_next_ready_at(queued_run)
        finally:
            self._active_run_accounts.discard(account_id)
            self._account_next_run_ready_at.pop(account_id, None)
            self._account_processors.pop(account_id, None)

    async def _execute_run(self, queued_run: QueuedRun) -> None:
        request = queued_run.request
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
        if self._settings.test_mode:
            await self._execute_fake_run(context)
            return

        adapter = self._resolve_adapter(request.provider)

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

    async def _execute_fake_run(self, context: RunSessionContext) -> None:
        await self._callbacks.emit_run_started(
            provider_account_id=context.account.provider_account_id,
            run_id=context.run_id,
            worker_run_id=context.worker_run_id,
            status="starting",
        )
        await self._callbacks.emit_run_progress(
            provider_account_id=context.account.provider_account_id,
            run_id=context.run_id,
            worker_run_id=context.worker_run_id,
            status="running",
            message="Deterministic test mode is generating a fixture image.",
        )
        await asyncio.sleep(0.1)

        context.download_dir.mkdir(parents=True, exist_ok=True)
        context.final_output_dir.mkdir(parents=True, exist_ok=True)
        output_path = context.final_output_dir / f"{context.run_id}-fixture.png"
        output_path.write_bytes(FAKE_PNG_BYTES)
        output = WorkerOutputPayload(
            id=str(uuid.uuid4()),
            storagePath=str(output_path),
            mimeType="image/png",
            byteSize=len(FAKE_PNG_BYTES),
            width=1,
            height=1,
            sha256=hashlib.sha256(FAKE_PNG_BYTES).hexdigest(),
            providerAssetUrl=f"https://chatgpt.com/c/{context.run_id}",
        )

        await self._callbacks.emit_thread_detected(
            provider_account_id=context.account.provider_account_id,
            run_id=context.run_id,
            worker_run_id=context.worker_run_id,
            thread_url=f"https://chatgpt.com/c/{context.run_id}",
            thread_id=context.run_id,
        )
        await self._callbacks.emit_output_ready(
            provider_account_id=context.account.provider_account_id,
            run_id=context.run_id,
            worker_run_id=context.worker_run_id,
            output=output,
        )
        await self._callbacks.emit_run_completed(
            provider_account_id=context.account.provider_account_id,
            run_id=context.run_id,
            worker_run_id=context.worker_run_id,
        )

    def _calculate_next_ready_at(self, queued_run: QueuedRun) -> float:
        config = queued_run.request.config or {}
        cooldown_seconds = max(0, int(config.get("cooldownSeconds", 60) or 60))
        jitter_min_seconds = max(0, int(config.get("jitterMinSeconds", 5) or 5))
        jitter_max_seconds = max(jitter_min_seconds, int(config.get("jitterMaxSeconds", 20) or 20))
        jitter_seconds = random.randint(jitter_min_seconds, jitter_max_seconds) if jitter_max_seconds > 0 else 0
        return asyncio.get_running_loop().time() + cooldown_seconds + jitter_seconds

    def _stream_url(self, worker_session_id: str, stream_session_token: str) -> str:
        return f"{self._settings.public_base_url}/browser-sessions/{worker_session_id}/embed?token={stream_session_token}"

    def _require_active_login(self, worker_session_id: str, token: str) -> ActiveLogin:
        active_login = self._active_logins_by_worker_session.get(worker_session_id)
        if active_login is None:
            raise ValueError("browser session is no longer active")
        if active_login.stream_session_token != token:
            raise PermissionError("invalid browser session token")
        return active_login

    async def _with_login_session(self, active_login: ActiveLogin, operation):
        async with active_login.lock:
            if active_login.provider_session is None:
                raise RuntimeError("browser session is unavailable")
            return await asyncio.to_thread(operation, active_login.provider_session)

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

    @staticmethod
    def _session_status_message(session_status: str) -> str:
        messages = {
            "launching": "Starting an isolated browser for this workspace profile.",
            "ready_for_user": "The embedded browser is ready. Complete the provider login flow here.",
            "auth_in_progress": "Authentication is in progress. Keep following the provider prompts.",
            "ready": "Connection completed. Memofi is closing the interactive browser.",
            "failed": "The browser session failed. Return to the app to retry or choose a fallback.",
            "expired": "This browser session expired before login finished.",
        }
        return messages.get(session_status, "Browser session is active.")
