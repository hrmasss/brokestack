from __future__ import annotations

from dataclasses import dataclass, field
from pathlib import Path
from typing import Protocol

from brokestack_worker.models import LoginStatusSnapshot, RunProgressSnapshot


@dataclass(slots=True)
class ProviderAccountContext:
    provider_account_id: str
    workspace_id: str
    provider: str
    profile_key: str
    profile_dir: Path


@dataclass(slots=True)
class LoginSessionContext:
    login_session_id: str
    worker_session_id: str
    account: ProviderAccountContext


@dataclass(slots=True)
class RunSessionContext:
    run_id: str
    automation_id: str
    worker_run_id: str
    account: ProviderAccountContext
    prompt_text: str
    config: dict
    download_dir: Path
    final_output_dir: Path
    metadata: dict[str, str] = field(default_factory=dict)


class ProviderAdapter(Protocol):
    def start_login(self, context: LoginSessionContext) -> object:
        ...

    def poll_login(self, session: object) -> LoginStatusSnapshot:
        ...

    def start_run(self, context: RunSessionContext) -> object:
        ...

    def poll_run(self, session: object) -> RunProgressSnapshot:
        ...

    def cancel_run(self, session: object) -> None:
        ...
