from __future__ import annotations

import os
from dataclasses import dataclass
from pathlib import Path


def _get_bool(name: str, default: bool) -> bool:
    value = os.getenv(name)
    if value is None:
        return default
    return value.strip().lower() in {"1", "true", "yes", "on"}


def _get_int(name: str, default: int) -> int:
    value = os.getenv(name)
    if value is None:
        return default
    try:
        return int(value)
    except ValueError:
        return default


def _get_float(name: str, default: float) -> float:
    value = os.getenv(name)
    if value is None:
        return default
    try:
        return float(value)
    except ValueError:
        return default


@dataclass(slots=True)
class WorkerSettings:
    worker_shared_secret: str
    api_base_url: str
    public_base_url: str
    browser_state_dir: Path
    outputs_dir: Path
    chrome_binary_path: str | None
    chrome_headless: bool
    chatgpt_base_url: str
    login_timeout_seconds: int
    run_timeout_seconds: int
    login_stable_polls: int
    dom_poll_interval_seconds: float
    test_mode: bool


def load_settings() -> WorkerSettings:
    browser_state_dir = Path(os.getenv("WORKER_BROWSER_STATE_DIR", ".tmp/browser-state")).resolve()
    outputs_dir = Path(os.getenv("WORKER_OUTPUTS_DIR", ".tmp/storage/outputs")).resolve()
    return WorkerSettings(
        worker_shared_secret=os.getenv("WORKER_SHARED_SECRET", "brokestack-worker-local-secret"),
        api_base_url=os.getenv("WORKER_API_BASE_URL", "http://127.0.0.1:8080").rstrip("/"),
        public_base_url=os.getenv("WORKER_PUBLIC_BASE_URL", "http://127.0.0.1:8091").rstrip("/"),
        browser_state_dir=browser_state_dir,
        outputs_dir=outputs_dir,
        chrome_binary_path=(os.getenv("WORKER_CHROME_BINARY") or "").strip() or None,
        chrome_headless=_get_bool("WORKER_CHROME_HEADLESS", False),
        chatgpt_base_url=os.getenv("WORKER_CHATGPT_BASE_URL", "https://chatgpt.com").rstrip("/"),
        login_timeout_seconds=_get_int("WORKER_LOGIN_TIMEOUT_SECONDS", 600),
        run_timeout_seconds=_get_int("WORKER_RUN_TIMEOUT_SECONDS", 900),
        login_stable_polls=max(1, _get_int("WORKER_LOGIN_STABLE_POLLS", 3)),
        dom_poll_interval_seconds=max(0.5, _get_float("WORKER_DOM_POLL_INTERVAL_SECONDS", 2.0)),
        test_mode=_get_bool("WORKER_TEST_MODE", False),
    )
