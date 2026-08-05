from pathlib import Path
from playwright.sync_api import sync_playwright

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / "validation" / "screenshots"
OUT.mkdir(parents=True, exist_ok=True)

with sync_playwright() as p:
    browser = p.chromium.launch()
    desktop = browser.new_page(viewport={"width": 1440, "height": 1000}, device_scale_factor=1)
    desktop.goto("http://127.0.0.1:4173/", wait_until="networkidle")
    desktop.screenshot(path=str(OUT / "desktop-homepage.png"), full_page=True)
    desktop.goto("http://127.0.0.1:4173/events/las-vegas-business-expo-2026/", wait_until="networkidle")
    desktop.screenshot(path=str(OUT / "desktop-event-page.png"), full_page=True)

    mobile = browser.new_page(viewport={"width": 390, "height": 844}, device_scale_factor=1)
    mobile.goto("http://127.0.0.1:4173/", wait_until="networkidle")
    mobile.screenshot(path=str(OUT / "mobile-homepage.png"), full_page=True)
    mobile.goto("http://127.0.0.1:4173/partners/", wait_until="networkidle")
    mobile.screenshot(path=str(OUT / "mobile-partners-page.png"), full_page=True)
    browser.close()

print(f"Screenshots written to {OUT}")
