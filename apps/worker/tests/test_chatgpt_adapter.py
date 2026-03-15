from __future__ import annotations

import tempfile
import unittest
from pathlib import Path
from unittest.mock import patch

from brokestack_worker.config import WorkerSettings
from brokestack_worker.providers.chatgpt import (
    ChatGPTProviderAdapter,
    detect_chrome_major_version,
    html_indicates_generation_in_progress,
    html_indicates_login_ready,
    html_indicates_logged_out_homepage,
    html_indicates_reauth,
    resolve_chrome_binary_path,
)


class ChatGPTAdapterParsingTests(unittest.TestCase):
    def test_login_ready_marker_detection(self) -> None:
        html = "<html><body><textarea id='prompt-textarea'></textarea></body></html>"
        self.assertTrue(html_indicates_login_ready(html))

    def test_generation_marker_detection(self) -> None:
        html = "<html><body><button>Stop generating</button></body></html>"
        self.assertTrue(html_indicates_generation_in_progress(html))

    def test_reauth_marker_detection(self) -> None:
        html = "<html><body><h1>Log in to ChatGPT</h1></body></html>"
        self.assertTrue(html_indicates_reauth(html, "https://chatgpt.com/auth/login"))

    def test_logged_out_homepage_is_not_treated_as_ready(self) -> None:
        html = "<html><body>Log in to get answers based on saved chats. Sign up for free.</body></html>"
        self.assertTrue(html_indicates_logged_out_homepage(html))
        self.assertFalse(html_indicates_login_ready(html))


class ChatGPTAdapterFileTests(unittest.TestCase):
    def test_downloads_finished_when_partial_files_are_gone(self) -> None:
        settings = WorkerSettings(
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
            dom_poll_interval_seconds=0.5,
        )
        adapter = ChatGPTProviderAdapter(settings)

        with tempfile.TemporaryDirectory() as temp_dir:
            download_dir = Path(temp_dir)
            (download_dir / "image.png").write_bytes(b"image")
            session = type(
                "Session",
                (),
                {
                    "context": type(
                        "Context",
                        (),
                        {"download_dir": download_dir, "final_output_dir": download_dir},
                    )(),
                    "outputs": [],
                },
            )()
            self.assertTrue(adapter._downloads_finished(session))

    def test_downloads_finished_when_files_already_moved_to_final_output_dir(self) -> None:
        settings = WorkerSettings(
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
            dom_poll_interval_seconds=0.5,
        )
        adapter = ChatGPTProviderAdapter(settings)

        with tempfile.TemporaryDirectory() as temp_dir:
            staging_dir = Path(temp_dir) / "staging"
            final_dir = Path(temp_dir) / "final"
            staging_dir.mkdir(parents=True, exist_ok=True)
            final_dir.mkdir(parents=True, exist_ok=True)
            (final_dir / "content").write_bytes(b"image")
            session = type(
                "Session",
                (),
                {
                    "context": type(
                        "Context",
                        (),
                        {"download_dir": staging_dir, "final_output_dir": final_dir},
                    )(),
                    "outputs": [object()],
                },
            )()
            self.assertTrue(adapter._downloads_finished(session))

    def test_detect_chrome_major_version_parses_binary_version_output(self) -> None:
        completed = type("CompletedProcess", (), {"stdout": "Google Chrome 145.0.7632.160\n", "stderr": ""})()
        with patch("brokestack_worker.providers.chatgpt.subprocess.run", return_value=completed):
            self.assertEqual(detect_chrome_major_version("/tmp/chrome"), 145)

    def test_resolve_chrome_binary_path_prefers_existing_configured_path(self) -> None:
        with tempfile.TemporaryDirectory() as temp_dir:
            fake_binary = Path(temp_dir) / "chrome.exe"
            fake_binary.write_bytes(b"")
            self.assertEqual(resolve_chrome_binary_path(str(fake_binary)), str(fake_binary.resolve()))


if __name__ == "__main__":
    unittest.main()
