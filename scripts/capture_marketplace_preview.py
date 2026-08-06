from __future__ import annotations

import contextlib
import http.server
import socketserver
import threading
import time
from pathlib import Path

from playwright.sync_api import sync_playwright

ROOT = Path(__file__).resolve().parents[1]
SCREENSHOTS = ROOT / "validation" / "screenshots"
PORT = 8765


class QuietHandler(http.server.SimpleHTTPRequestHandler):
    def log_message(self, format: str, *args: object) -> None:
        return


def main() -> None:
    SCREENSHOTS.mkdir(parents=True, exist_ok=True)
    handler = lambda *args, **kwargs: QuietHandler(*args, directory=str(ROOT), **kwargs)
    with socketserver.TCPServer(("127.0.0.1", PORT), handler) as server:
        thread = threading.Thread(target=server.serve_forever, daemon=True)
        thread.start()
        time.sleep(0.5)
        with sync_playwright() as playwright:
            browser = playwright.chromium.launch()
            for name, width, height in (
                ("desktop-homepage", 1440, 1100),
                ("mobile-homepage", 390, 844),
            ):
                page = browser.new_page(viewport={"width": width, "height": height}, device_scale_factor=1)
                page.goto(f"http://127.0.0.1:{PORT}/", wait_until="networkidle")
                page.screenshot(path=str(SCREENSHOTS / f"{name}.png"), full_page=True)
                overflow = page.evaluate("document.documentElement.scrollWidth > document.documentElement.clientWidth")
                if overflow:
                    raise RuntimeError(f"Horizontal overflow detected at {width}px")
                page.close()
            browser.close()
        server.shutdown()


if __name__ == "__main__":
    main()
