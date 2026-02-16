#!/usr/bin/env python3
import asyncio
import os
import subprocess
import sys
import time
from pathlib import Path

from playwright.async_api import async_playwright

ROOT = Path(__file__).resolve().parents[1]
PUBLIC_DIR = ROOT / "public"
ARTIFACTS_DIR = ROOT / "artifacts" / "notifications-guard"
PORT = int(os.environ.get("NOTIFICATIONS_GUARD_PORT", "4173"))
BASE_URL = f"http://127.0.0.1:{PORT}/"


def start_server() -> subprocess.Popen:
    return subprocess.Popen(
        [sys.executable, "-m", "http.server", str(PORT), "--directory", str(PUBLIC_DIR)],
        stdout=subprocess.DEVNULL,
        stderr=subprocess.DEVNULL,
    )


async def wait_ready(playwright, timeout_s: float = 12.0) -> None:
    deadline = time.time() + timeout_s
    while time.time() < deadline:
        browser = None
        try:
            browser = await playwright.firefox.launch()
            page = await browser.new_page()
            resp = await page.goto(BASE_URL, wait_until="domcontentloaded")
            await browser.close()
            if resp and resp.ok:
                return
        except Exception:
            if browser:
                await browser.close()
            await asyncio.sleep(0.25)
    raise RuntimeError("Local static server did not become ready")


async def run_checks() -> None:
    ARTIFACTS_DIR.mkdir(parents=True, exist_ok=True)

    async with async_playwright() as p:
        await wait_ready(p)
        browser = await p.firefox.launch()

        # Mobile: hero remains visible when notifications open
        mobile = await browser.new_page(viewport={"width": 375, "height": 812})
        await mobile.goto(BASE_URL, wait_until="networkidle")
        await mobile.evaluate("localStorage.removeItem('ui.dismissedNotifications')")
        await mobile.reload(wait_until="networkidle")

        await mobile.screenshot(path=str(ARTIFACTS_DIR / "mobile-closed.png"), full_page=False)

        await mobile.click('[data-notifications-trigger="true"]')
        await mobile.screenshot(path=str(ARTIFACTS_DIR / "mobile-open.png"), full_page=False)

        hero = await mobile.locator(".hero").bounding_box()
        if not hero:
            raise AssertionError("Mobile guard failed: .hero bounding box not found")
        hero_visible = hero["y"] < 812 and (hero["y"] + hero["height"]) > 0
        if not hero_visible:
            raise AssertionError("Mobile guard failed: hero is not visible when notifications are open")

        # Desktop: header must not overlap hero top
        desktop = await browser.new_page(viewport={"width": 1440, "height": 900})
        await desktop.goto(BASE_URL, wait_until="networkidle")
        await desktop.evaluate("localStorage.removeItem('ui.dismissedNotifications')")
        await desktop.reload(wait_until="networkidle")

        await desktop.click('[data-notifications-trigger="true"]')
        await desktop.screenshot(path=str(ARTIFACTS_DIR / "desktop-open.png"), full_page=False)

        header_box = await desktop.locator("header").bounding_box()
        hero_box = await desktop.locator(".hero").bounding_box()
        if not header_box or not hero_box:
            raise AssertionError("Desktop guard failed: missing header/hero bounding box")

        if hero_box["y"] < header_box["y"] + header_box["height"] - 1:
            raise AssertionError(
                "Desktop guard failed: hero top overlaps header (header overlays content)"
            )

        await browser.close()


async def amain() -> int:
    server = start_server()
    try:
        await run_checks()
        print("notifications guard passed")
        return 0
    except Exception as exc:  # noqa: BLE001
        print(str(exc), file=sys.stderr)
        return 1
    finally:
        server.terminate()
        try:
            server.wait(timeout=3)
        except Exception:
            server.kill()


if __name__ == "__main__":
    raise SystemExit(asyncio.run(amain()))
