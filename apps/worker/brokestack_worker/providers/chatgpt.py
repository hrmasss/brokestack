from __future__ import annotations

import hashlib
import mimetypes
import os
import re
import shutil
import subprocess
import time
import uuid
from dataclasses import dataclass, field
from pathlib import Path
from urllib.parse import urlparse

import httpx
import undetected_chromedriver as uc
from PIL import Image
from selenium.common.exceptions import NoSuchElementException, SessionNotCreatedException, TimeoutException, WebDriverException
from selenium.webdriver import Chrome
from selenium.webdriver.common.action_chains import ActionChains
from selenium.webdriver.common.by import By
from selenium.webdriver.common.keys import Keys

from brokestack_worker.config import WorkerSettings
from brokestack_worker.models import LoginStatusSnapshot, RunProgressSnapshot, WorkerOutputPayload
from brokestack_worker.providers.base import LoginSessionContext, RunSessionContext


PROMPT_SELECTORS = [
    "div#prompt-textarea[contenteditable='true']",
    "div.ProseMirror#prompt-textarea",
    "textarea#prompt-textarea",
    "textarea[data-testid='prompt-textarea']",
    "textarea",
    "div[contenteditable='true'][data-testid='prompt-textarea']",
    "div[contenteditable='true'][aria-label*='prompt']",
]

IMAGE_SRC_SCRIPT = """
return Array.from(document.images)
  .map((image) => ({
    src: image.currentSrc || image.src || "",
    width: image.naturalWidth || image.width || 0,
    height: image.naturalHeight || image.height || 0,
  }))
  .filter((image) => image.src && image.width >= 256 && image.height >= 256);
"""

BLOCKING_MODAL_BUTTON_XPATH = (
    "//button[@data-testid='close-button' "
    "or contains(translate(@aria-label,'ABCDEFGHIJKLMNOPQRSTUVWXYZ','abcdefghijklmnopqrstuvwxyz'),'close') "
    "or contains(translate(normalize-space(.),'ABCDEFGHIJKLMNOPQRSTUVWXYZ','abcdefghijklmnopqrstuvwxyz'),'not now') "
    "or contains(translate(normalize-space(.),'ABCDEFGHIJKLMNOPQRSTUVWXYZ','abcdefghijklmnopqrstuvwxyz'),'skip') "
    "or contains(translate(normalize-space(.),'ABCDEFGHIJKLMNOPQRSTUVWXYZ','abcdefghijklmnopqrstuvwxyz'),'maybe later') "
    "or contains(translate(normalize-space(.),'ABCDEFGHIJKLMNOPQRSTUVWXYZ','abcdefghijklmnopqrstuvwxyz'),'done') "
    "or contains(translate(normalize-space(.),'ABCDEFGHIJKLMNOPQRSTUVWXYZ','abcdefghijklmnopqrstuvwxyz'),'okay')]"
)

WINDOWS_CHROME_PATHS = (
    r"C:\Program Files\Google\Chrome\Application\chrome.exe",
    r"C:\Program Files (x86)\Google\Chrome\Application\chrome.exe",
    r"%LOCALAPPDATA%\Google\Chrome\Application\chrome.exe",
    r"%PROGRAMFILES%\BraveSoftware\Brave-Browser\Application\brave.exe",
    r"%LOCALAPPDATA%\Chromium\Application\chrome.exe",
)

PROFILE_LOCK_FILENAMES = (
    "SingletonLock",
    "SingletonCookie",
    "SingletonSocket",
)


@dataclass(slots=True)
class ActiveLoginSession:
    context: LoginSessionContext
    driver: Chrome
    started_at: float
    ready_streak: int = 0


@dataclass(slots=True)
class ActiveRunSession:
    context: RunSessionContext
    driver: Chrome
    started_at: float
    prompt_submitted: bool = False
    thread_url: str | None = None
    thread_id: str | None = None
    thread_reported: bool = False
    download_triggered: bool = False
    completed_paths: set[str] = field(default_factory=set)
    outputs: list[WorkerOutputPayload] = field(default_factory=list)
    failed_message: str | None = None
    last_status: str = "starting"


def html_indicates_login_ready(html: str) -> bool:
    lowered = html.lower()
    if html_indicates_logged_out_homepage(html):
        return False
    return "prompt-textarea" in lowered or "chatgpt can make mistakes" in lowered


def html_indicates_generation_in_progress(html: str) -> bool:
    lowered = html.lower()
    return any(
        marker in lowered
        for marker in (
            "stop generating",
            "creating image",
            "generating image",
            "cancel generation",
            "stop response",
        )
    )


def html_indicates_logged_out_homepage(html: str) -> bool:
    lowered = html.lower()
    return (
        "log in to get answers based on saved chats" in lowered
        or "sign up for free" in lowered
        or ">log in<" in lowered
    )


def html_indicates_reauth(html: str, current_url: str) -> bool:
    lowered = html.lower()
    return (
        "/auth/login" in current_url
        or "log in to chatgpt" in lowered
        or "continue with google" in lowered
        or "verify you are human" in lowered
        or "captcha" in lowered
        or html_indicates_logged_out_homepage(html)
    )


def resolve_chrome_binary_path(configured_path: str | None) -> str | None:
    candidates: list[str] = []
    if configured_path:
        candidates.append(configured_path)
    env_binary = os.getenv("CHROME_BINARY")
    if env_binary:
        candidates.append(env_binary)
    candidates.extend(WINDOWS_CHROME_PATHS)

    for candidate in candidates:
        expanded = os.path.expandvars(candidate)
        if expanded and Path(expanded).is_file():
            return str(Path(expanded).resolve())
    return None


def detect_chrome_major_version(binary_path: str | None) -> int | None:
    if not binary_path:
        return None
    version_output = ""
    try:
        completed = subprocess.run(
            [binary_path, "--version"],
            check=True,
            capture_output=True,
            text=True,
            timeout=10,
        )
        version_output = (completed.stdout or completed.stderr).strip()
    except (FileNotFoundError, subprocess.SubprocessError, OSError):
        version_output = ""

    if (not version_output or re.search(r"(\d+)\.", version_output) is None) and os.name == "nt":
        try:
            escaped_path = binary_path.replace("'", "''")
            completed = subprocess.run(
                [
                    "powershell",
                    "-NoProfile",
                    "-Command",
                    f"(Get-Item '{escaped_path}').VersionInfo.ProductVersion",
                ],
                check=True,
                capture_output=True,
                text=True,
                timeout=10,
            )
            version_output = (completed.stdout or completed.stderr).strip()
        except (FileNotFoundError, subprocess.SubprocessError, OSError):
            version_output = ""

    match = re.search(r"(\d+)\.", version_output)
    if match is None:
        return None
    try:
        return int(match.group(1))
    except ValueError:
        return None


def profile_appears_locked(profile_dir: Path) -> bool:
    return any((profile_dir / filename).exists() for filename in PROFILE_LOCK_FILENAMES)


class ChatGPTProviderAdapter:
    def __init__(self, settings: WorkerSettings) -> None:
        self._settings = settings

    def start_login(self, context: LoginSessionContext) -> ActiveLoginSession:
        driver = self._build_driver(profile_dir=context.account.profile_dir)
        try:
            driver.get(self._settings.chatgpt_base_url)
        except TimeoutException:
            pass
        return ActiveLoginSession(
            context=context,
            driver=driver,
            started_at=time.monotonic(),
        )

    def poll_login(self, session: ActiveLoginSession) -> LoginStatusSnapshot:
        if time.monotonic() - session.started_at > self._settings.login_timeout_seconds:
            return LoginStatusSnapshot(kind="needs_reauth", message="Timed out waiting for the ChatGPT login to finish.")

        try:
            html = session.driver.page_source
            current_url = session.driver.current_url
        except WebDriverException as exc:
            return LoginStatusSnapshot(kind="needs_reauth", message=f"Browser session ended unexpectedly: {exc}")

        is_logged_out = html_indicates_reauth(html, current_url)
        if not is_logged_out and (self._has_prompt_box(session.driver) or html_indicates_login_ready(html)):
            session.ready_streak += 1
            if session.ready_streak >= self._settings.login_stable_polls:
                return LoginStatusSnapshot(kind="ready")
            return LoginStatusSnapshot(kind="pending", message="Waiting for the login state to stabilize.")

        session.ready_streak = 0
        if is_logged_out:
            return LoginStatusSnapshot(kind="pending", message="Waiting for the user to finish logging into ChatGPT.")
        return LoginStatusSnapshot(kind="pending", message="Browser session is open and waiting for login.")

    def start_run(self, context: RunSessionContext) -> ActiveRunSession:
        driver = self._build_driver(profile_dir=context.account.profile_dir, download_dir=context.download_dir)
        try:
            driver.get(self._settings.chatgpt_base_url)
        except TimeoutException:
            pass
        return ActiveRunSession(
            context=context,
            driver=driver,
            started_at=time.monotonic(),
        )

    def poll_run(self, session: ActiveRunSession) -> RunProgressSnapshot:
        if session.failed_message:
            return RunProgressSnapshot(status="failed", done=True, failed=True, message=session.failed_message)

        if time.monotonic() - session.started_at > self._settings.run_timeout_seconds:
            session.failed_message = "Timed out waiting for ChatGPT to finish generating the image."
            self._write_debug_artifacts(session, "timeout")
            return RunProgressSnapshot(status="failed", done=True, failed=True, message=session.failed_message)

        try:
            html = session.driver.page_source
            current_url = session.driver.current_url
        except WebDriverException as exc:
            session.failed_message = f"Browser session ended unexpectedly: {exc}"
            return RunProgressSnapshot(status="failed", done=True, failed=True, message=session.failed_message)

        if not session.prompt_submitted:
            if html_indicates_reauth(html, current_url):
                return RunProgressSnapshot(
                    status="awaiting_login",
                    message="ChatGPT is not logged in for this workspace profile yet.",
                )
            if not self._submit_prompt(session):
                return RunProgressSnapshot(status="navigating", message="Waiting for the ChatGPT composer to become available.")
            session.prompt_submitted = True
            session.last_status = "submitting_prompt"
            return RunProgressSnapshot(status="submitting_prompt", message="Submitted the image prompt to ChatGPT.")

        if not session.thread_reported:
            session.thread_url = self._extract_thread_url(session.driver.current_url)
            session.thread_id = self._extract_thread_id(session.thread_url)
            if session.thread_url:
                return RunProgressSnapshot(
                    status="generating",
                    message="Chat thread detected.",
                    provider_thread_url=session.thread_url,
                    provider_thread_id=session.thread_id,
                )

        if html_indicates_generation_in_progress(html):
            session.last_status = "generating"
            return RunProgressSnapshot(
                status="generating",
                message="ChatGPT is still generating the image output.",
                provider_thread_url=session.thread_url,
                provider_thread_id=session.thread_id,
            )

        if not session.download_triggered:
            images_present = self._visible_image_sources(session.driver)
            if not images_present:
                session.last_status = "generating"
                return RunProgressSnapshot(
                    status="generating",
                    message="Waiting for image cards to appear in the chat thread.",
                    provider_thread_url=session.thread_url,
                    provider_thread_id=session.thread_id,
                )
            self._trigger_downloads(session, images_present)
            session.download_triggered = True
            session.last_status = "downloading"
            return RunProgressSnapshot(
                status="downloading",
                message="Downloading image output from ChatGPT.",
                provider_thread_url=session.thread_url,
                provider_thread_id=session.thread_id,
            )

        new_outputs = self._collect_outputs(session)
        if new_outputs:
            session.outputs.extend(new_outputs)

        if self._downloads_finished(session) and session.outputs:
            self.cancel_run(session)
            return RunProgressSnapshot(
                status="completed",
                done=True,
                outputs=session.outputs,
                provider_thread_url=session.thread_url,
                provider_thread_id=session.thread_id,
            )

        return RunProgressSnapshot(
            status="downloading",
            message="Waiting for downloaded files to finish writing.",
            outputs=new_outputs,
            provider_thread_url=session.thread_url,
            provider_thread_id=session.thread_id,
        )

    def cancel_run(self, session: ActiveRunSession | ActiveLoginSession) -> None:
        try:
            session.driver.quit()
        except Exception:
            return

    def _build_driver(self, *, profile_dir: Path, download_dir: Path | None = None) -> Chrome:
        profile_dir = profile_dir.resolve()
        profile_dir.mkdir(parents=True, exist_ok=True)
        if download_dir is not None:
            download_dir = download_dir.resolve()
            download_dir.mkdir(parents=True, exist_ok=True)

        chrome_binary_path = resolve_chrome_binary_path(self._settings.chrome_binary_path)
        chrome_major_version = detect_chrome_major_version(chrome_binary_path)
        options = uc.ChromeOptions()
        options.page_load_strategy = "eager"
        options.add_argument(f"--user-data-dir={profile_dir}")
        options.add_argument("--disable-blink-features=AutomationControlled")
        options.add_argument("--disable-dev-shm-usage")
        options.add_argument("--disable-gpu")
        options.add_argument("--hide-scrollbars")
        options.add_argument("--lang=en-US")
        options.add_argument("--no-default-browser-check")
        options.add_argument("--no-sandbox")
        options.add_argument("--window-size=1440,960")
        if chrome_binary_path:
            options.binary_location = chrome_binary_path
        if self._settings.chrome_headless:
            options.add_argument("--headless=new")
        if download_dir is not None:
            options.add_experimental_option(
                "prefs",
                {
                    "download.default_directory": str(download_dir.resolve()),
                    "download.prompt_for_download": False,
                    "download.directory_upgrade": True,
                    "safebrowsing.enabled": True,
                },
            )

        chrome_kwargs = {
            "options": options,
            "headless": self._settings.chrome_headless,
            "use_subprocess": True,
        }
        if chrome_binary_path:
            chrome_kwargs["browser_executable_path"] = chrome_binary_path
        if chrome_major_version is not None:
            chrome_kwargs["version_main"] = chrome_major_version

        last_error: Exception | None = None
        for attempt in range(3):
            try:
                driver = uc.Chrome(**chrome_kwargs)
                break
            except SessionNotCreatedException as exc:
                last_error = exc
                if attempt == 2:
                    details = []
                    if chrome_binary_path:
                        details.append(f"binary={chrome_binary_path}")
                    if chrome_major_version is not None:
                        details.append(f"major={chrome_major_version}")
                    detail_suffix = f" ({', '.join(details)})" if details else ""
                    extra_hint = ""
                    lowered_message = exc.msg.lower()
                    if "chrome not reachable" in lowered_message or profile_appears_locked(profile_dir):
                        extra_hint = (
                            " The workspace Chrome profile appears to already be open in another Chrome window. "
                            "Close that window and retry so only one Chrome instance uses the profile at a time."
                        )
                    raise RuntimeError(
                        f"Unable to start Chrome for ChatGPT automation{detail_suffix}: {exc.msg}{extra_hint}"
                    ) from exc
                time.sleep(2)
        else:
            raise RuntimeError(f"Unable to start Chrome for ChatGPT automation: {last_error}")
        driver.set_page_load_timeout(30)
        if download_dir is not None:
            try:
                driver.execute_cdp_cmd(
                    "Page.setDownloadBehavior",
                    {"behavior": "allow", "downloadPath": str(download_dir.resolve())},
                )
            except Exception:
                pass
        return driver

    def _has_prompt_box(self, driver: Chrome) -> bool:
        for selector in PROMPT_SELECTORS:
            try:
                elements = driver.find_elements(By.CSS_SELECTOR, selector)
            except WebDriverException:
                continue
            if elements:
                return True
        return False

    def _find_prompt_element(self, driver: Chrome):
        for selector in PROMPT_SELECTORS:
            try:
                elements = driver.find_elements(By.CSS_SELECTOR, selector)
            except WebDriverException:
                continue
            for element in elements:
                if self._is_interactable_prompt_element(element):
                    return element
        return None

    def _is_interactable_prompt_element(self, element) -> bool:
        try:
            if not element.is_displayed() or not element.is_enabled():
                return False
            size = element.size or {}
            if size.get("width", 0) <= 0 or size.get("height", 0) <= 0:
                return False
            return True
        except (NoSuchElementException, WebDriverException):
            return False

    def _focus_prompt_element(self, session: ActiveRunSession, prompt_element) -> bool:
        try:
            session.driver.execute_script(
                """
                arguments[0].scrollIntoView({ block: 'center', inline: 'nearest' });
                arguments[0].focus();
                """,
                prompt_element,
            )
            return True
        except WebDriverException:
            try:
                prompt_element.click()
                return True
            except (NoSuchElementException, WebDriverException):
                return False
        return False

    def _submit_prompt(self, session: ActiveRunSession) -> bool:
        self._dismiss_blocking_overlays(session.driver)
        prompt_element = self._find_prompt_element(session.driver)
        if prompt_element is None:
            return False

        prompt = self._build_prompt(session.context.prompt_text, session.context.config)
        try:
            if not self._focus_prompt_element(session, prompt_element):
                session.failed_message = "Unable to focus the ChatGPT prompt composer."
                self._write_debug_artifacts(session, "prompt-focus-failed")
                return False
            self._type_prompt_text(session.driver, prompt_element, prompt)
            prompt_element.send_keys(Keys.ENTER)
            return True
        except WebDriverException as exc:
            session.failed_message = f"Unable to submit the prompt in ChatGPT: {exc}"
            self._write_debug_artifacts(session, "submit-failed")
            return False

    def _dismiss_blocking_overlays(self, driver: Chrome) -> None:
        try:
            buttons = driver.find_elements(By.XPATH, BLOCKING_MODAL_BUTTON_XPATH)
        except WebDriverException:
            buttons = []

        for button in buttons:
            if not self._is_interactable_prompt_element(button):
                continue
            try:
                driver.execute_script("arguments[0].click();", button)
                time.sleep(0.5)
                return
            except WebDriverException:
                continue

        try:
            active = driver.switch_to.active_element
            active.send_keys(Keys.ESCAPE)
            time.sleep(0.2)
        except WebDriverException:
            return

    def _type_prompt_text(self, driver: Chrome, prompt_element, prompt: str) -> None:
        lines = prompt.splitlines()
        if not lines:
            lines = [prompt]

        actions = ActionChains(driver)
        for index, line in enumerate(lines):
            if line:
                actions.send_keys_to_element(prompt_element, line)
            if index < len(lines) - 1:
                actions.key_down(Keys.SHIFT).send_keys_to_element(prompt_element, Keys.ENTER).key_up(Keys.SHIFT)
        actions.perform()

    def _build_prompt(self, prompt_text: str, config: dict) -> str:
        parts = [prompt_text.strip()]
        aspect_ratio = str(config.get("aspectRatio", "")).strip()
        image_count = max(1, int(config.get("imageCount", 1)))
        if image_count > 1:
            parts.append(f"Return {image_count} image variations.")
        if aspect_ratio:
            parts.append(f"Use an aspect ratio of {aspect_ratio}.")
        return " ".join(part for part in parts if part)

    def _extract_thread_url(self, current_url: str) -> str | None:
        if "/c/" not in current_url:
            return None
        return current_url

    def _extract_thread_id(self, current_url: str | None) -> str | None:
        if not current_url:
            return None
        match = re.search(r"/c/([^/?#]+)", current_url)
        if match:
            return match.group(1)
        return None

    def _visible_image_sources(self, driver: Chrome) -> list[dict]:
        try:
            images = driver.execute_script(IMAGE_SRC_SCRIPT)
        except WebDriverException:
            return []
        if not isinstance(images, list):
            return []
        return [image for image in images if isinstance(image, dict) and image.get("src")]

    def _trigger_downloads(self, session: ActiveRunSession, image_sources: list[dict]) -> None:
        download_buttons = []
        try:
            download_buttons = session.driver.find_elements(
                By.XPATH,
                "//button[contains(translate(@aria-label,'DOWNLOAD','download'),'download') or contains(translate(normalize-space(.),'DOWNLOAD','download'),'download')]",
            )
        except WebDriverException:
            download_buttons = []

        clicked = False
        for button in download_buttons:
            try:
                session.driver.execute_script("arguments[0].click();", button)
                clicked = True
                time.sleep(0.4)
            except WebDriverException:
                continue

        if clicked:
            return

        for image in image_sources:
            source = str(image.get("src", ""))
            if source.startswith("blob:"):
                continue
            try:
                self._download_with_session_cookies(session, source)
            except Exception:
                continue

    def _download_with_session_cookies(self, session: ActiveRunSession, source: str) -> None:
        parsed = urlparse(source)
        if parsed.scheme not in {"http", "https"}:
            return
        target_name = Path(parsed.path).name or f"{uuid.uuid4()}.png"
        target_path = session.context.download_dir / target_name
        if target_path.exists():
            return

        cookies = {cookie["name"]: cookie["value"] for cookie in session.driver.get_cookies()}
        with httpx.Client(follow_redirects=True, timeout=60.0, cookies=cookies) as client:
            response = client.get(source)
            response.raise_for_status()
            target_path.write_bytes(response.content)

    def _downloads_finished(self, session: ActiveRunSession) -> bool:
        partials = list(session.context.download_dir.glob("*.crdownload"))
        if partials:
            return False
        if session.outputs:
            return True
        try:
            return any(session.context.download_dir.iterdir()) or any(session.context.final_output_dir.iterdir())
        except FileNotFoundError:
            return False

    def _collect_outputs(self, session: ActiveRunSession) -> list[WorkerOutputPayload]:
        outputs: list[WorkerOutputPayload] = []
        for path in session.context.download_dir.iterdir():
            if not path.is_file() or path.suffix == ".crdownload":
                continue
            resolved = str(path.resolve())
            if resolved in session.completed_paths:
                continue

            final_path = session.context.final_output_dir / path.name
            final_path.parent.mkdir(parents=True, exist_ok=True)
            shutil.move(str(path), final_path)
            payload = self._output_payload_from_path(final_path)
            outputs.append(payload)
            session.completed_paths.add(resolved)
        return outputs

    def _output_payload_from_path(self, path: Path) -> WorkerOutputPayload:
        width = 0
        height = 0
        try:
            with Image.open(path) as image:
                width, height = image.size
        except Exception:
            width = 0
            height = 0

        sha256 = hashlib.sha256(path.read_bytes()).hexdigest()
        mime_type = mimetypes.guess_type(path.name)[0] or "application/octet-stream"
        return WorkerOutputPayload(
            id=str(uuid.uuid4()),
            storagePath=str(path.resolve()),
            mimeType=mime_type,
            byteSize=path.stat().st_size,
            width=width,
            height=height,
            sha256=sha256,
        )

    def _write_debug_artifacts(self, session: ActiveRunSession, reason: str) -> None:
        debug_dir = session.context.final_output_dir / "debug"
        debug_dir.mkdir(parents=True, exist_ok=True)
        try:
            session.driver.save_screenshot(str(debug_dir / f"{reason}.png"))
        except Exception:
            pass
        try:
            (debug_dir / f"{reason}.html").write_text(session.driver.page_source, encoding="utf-8")
        except Exception:
            pass
