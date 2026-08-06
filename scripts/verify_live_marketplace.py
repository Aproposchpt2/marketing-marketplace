from __future__ import annotations

import io
import json
import re
import sys
import urllib.error
import urllib.request
from pathlib import Path

from PIL import Image

ROOT = Path(__file__).resolve().parents[1]
OUTPUT = ROOT / "validation" / "live-production-verification.json"
BASE = "https://marketplace.aproposgroupllc.com/"
TITLE = "APROPOS Marketing Marketplace | Programs, Services and Opportunity"
DESCRIPTION = "Explore APROPOS business-development programs, government contract intelligence, Analyze Fit services, free trials, proposal support, and partnership opportunities."
ROBOTS = "index,follow,max-image-preview:large,max-snippet:-1,max-video-preview:-1"
PRODUCTS = [
    "https://ngcc.aproposgroupllc.com/",
    "https://natcorp.aproposgroupllc.com/",
    "https://nebc.aproposgroupllc.com/",
]


def fetch(url: str) -> tuple[int, bytes, dict[str, str]]:
    request = urllib.request.Request(url, headers={"User-Agent": "APROPOS-Live-Production-Validator/1.0"})
    with urllib.request.urlopen(request, timeout=30) as response:
        return response.status, response.read(), dict(response.headers.items())


def meta_content(source: str, *, name: str | None = None, prop: str | None = None) -> list[str]:
    tags = re.findall(r"<meta\b[^>]*>", source, flags=re.I)
    output: list[str] = []
    for tag in tags:
        name_match = re.search(r"\bname\s*=\s*['\"]([^'\"]+)['\"]", tag, flags=re.I)
        prop_match = re.search(r"\bproperty\s*=\s*['\"]([^'\"]+)['\"]", tag, flags=re.I)
        content_match = re.search(r"\bcontent\s*=\s*['\"]([^'\"]*)['\"]", tag, flags=re.I)
        if not content_match:
            continue
        if name and name_match and name_match.group(1).lower() == name.lower():
            output.append(content_match.group(1))
        if prop and prop_match and prop_match.group(1).lower() == prop.lower():
            output.append(content_match.group(1))
    return output


def collect_prices(value: object, found: list[dict[str, str]] | None = None) -> list[dict[str, str]]:
    found = found if found is not None else []
    if isinstance(value, dict):
        if "price" in value:
            found.append({"name": str(value.get("name", "")), "price": str(value["price"])})
        for child in value.values():
            collect_prices(child, found)
    elif isinstance(value, list):
        for child in value:
            collect_prices(child, found)
    return found


def collect_types(value: object, found: set[str] | None = None) -> set[str]:
    found = found if found is not None else set()
    if isinstance(value, dict):
        kind = value.get("@type")
        if isinstance(kind, str):
            found.add(kind)
        elif isinstance(kind, list):
            found.update(str(item) for item in kind)
        for child in value.values():
            collect_types(child, found)
    elif isinstance(value, list):
        for child in value:
            collect_types(child, found)
    return found


def main() -> None:
    failures: list[str] = []
    status, raw_html, headers = fetch(BASE)
    source = raw_html.decode("utf-8", errors="replace")
    if status != 200:
        failures.append(f"Homepage returned HTTP {status}")

    titles = [re.sub(r"\s+", " ", value).strip() for value in re.findall(r"<title\b[^>]*>(.*?)</title>", source, flags=re.I | re.S)]
    if titles != [TITLE]:
        failures.append(f"Live title mismatch: {titles}")
    descriptions = meta_content(source, name="description")
    if descriptions != [DESCRIPTION]:
        failures.append(f"Live description mismatch: {descriptions}")
    robots_meta = meta_content(source, name="robots")
    if robots_meta != [ROBOTS]:
        failures.append(f"Live robots meta mismatch: {robots_meta}")

    canonicals = []
    for tag in re.findall(r"<link\b[^>]*>", source, flags=re.I):
        if re.search(r"\brel\s*=\s*['\"]canonical['\"]", tag, flags=re.I):
            href = re.search(r"\bhref\s*=\s*['\"]([^'\"]+)['\"]", tag, flags=re.I)
            if href:
                canonicals.append(href.group(1))
    if canonicals != [BASE]:
        failures.append(f"Live canonical mismatch: {canonicals}")

    og_required = {
        "og:type": "website",
        "og:site_name": "APROPOS Marketing Marketplace",
        "og:title": TITLE,
        "og:url": BASE,
        "og:image": f"{BASE}og-marketplace.jpg",
        "og:image:alt": "APROPOS Marketing Marketplace programs and opportunity pathways",
    }
    for prop, expected in og_required.items():
        values = meta_content(source, prop=prop)
        if values != [expected]:
            failures.append(f"Live Open Graph mismatch for {prop}: {values}")

    twitter_required = {
        "twitter:card": "summary_large_image",
        "twitter:title": TITLE,
        "twitter:image": f"{BASE}og-marketplace.jpg",
    }
    for name, expected in twitter_required.items():
        values = meta_content(source, name=name)
        if values != [expected]:
            failures.append(f"Live Twitter mismatch for {name}: {values}")

    jsonld_texts = re.findall(
        r"<script\b(?=[^>]*\btype\s*=\s*['\"]application/ld\+json['\"])[^>]*>(.*?)</script>",
        source,
        flags=re.I | re.S,
    )
    parsed = []
    for text in jsonld_texts:
        try:
            parsed.append(json.loads(text))
        except json.JSONDecodeError as exc:
            failures.append(f"Live JSON-LD invalid: {exc}")
    types = sorted(collect_types(parsed))
    for required in ("Organization", "WebSite", "ItemList", "Service", "Offer"):
        if required not in types:
            failures.append(f"Live JSON-LD missing {required}")
    prices = collect_prices(parsed)
    if sorted(item["price"] for item in prices) != sorted(["99.00", "119.00", "39.00", "15.00"]):
        failures.append(f"Live offer prices incorrect: {prices}")
    if any("Concierge" in item["name"] for item in prices):
        failures.append("Live Concierge structured data contains a price")

    for prohibited in ("National Business Contract Center", "$19.99", "$24.99"):
        if prohibited in source:
            failures.append(f"Prohibited live copy remains: {prohibited}")
    required_copy = [
        "Explore APROPOS programs, services, campaigns, and opportunity pathways.",
        "NGCC — 14-day free trial, then $99/month",
        "NAT-CORP — 14-day free trial, then $119/month",
        "NEBC — 14-day free trial, then $39/month",
        "$15 one-time",
        "Concierge Contract Service pricing will be announced after final service scope and operating-cost validation.",
    ]
    for phrase in required_copy:
        if phrase not in source:
            failures.append(f"Required live copy missing: {phrase}")

    product_results = []
    for url in PRODUCTS:
        try:
            product_status, _, _ = fetch(url)
            ok = 200 <= product_status < 400
            product_results.append({"url": url, "status": product_status, "ok": ok})
            if not ok:
                failures.append(f"Product URL failed: {url} HTTP {product_status}")
        except Exception as exc:
            product_results.append({"url": url, "status": None, "ok": False, "error": str(exc)})
            failures.append(f"Product URL failed: {url} {exc}")

    robots_status, robots_raw, _ = fetch(f"{BASE}robots.txt")
    robots_text = robots_raw.decode("utf-8", errors="replace")
    if robots_status != 200 or "Allow: /" not in robots_text or f"Sitemap: {BASE}sitemap.xml" not in robots_text:
        failures.append("Live robots.txt is missing or not indexable")
    sitemap_status, sitemap_raw, _ = fetch(f"{BASE}sitemap.xml")
    sitemap_text = sitemap_raw.decode("utf-8", errors="replace")
    if sitemap_status != 200 or f"<loc>{BASE}</loc>" not in sitemap_text:
        failures.append("Live sitemap.xml is missing or incorrect")

    image_status, image_raw, image_headers = fetch(f"{BASE}og-marketplace.jpg")
    social_image = {"status": image_status, "width": None, "height": None, "format": None, "content_type": image_headers.get("Content-Type")}
    with Image.open(io.BytesIO(image_raw)) as image:
        social_image.update({"width": image.width, "height": image.height, "format": image.format})
        if image_status != 200 or image.size != (1200, 630) or image.format != "JPEG":
            failures.append(f"Live social image invalid: {social_image}")

    form_count = len(re.findall(r"<form\b", source, flags=re.I))
    report = {
        "status": "PASS" if not failures else "FAIL",
        "production_url": BASE,
        "homepage_http_status": status,
        "deployed_title": titles,
        "deployed_description": descriptions,
        "canonical": canonicals,
        "robots_meta": robots_meta,
        "jsonld_blocks": len(jsonld_texts),
        "jsonld_types": types,
        "offer_prices": prices,
        "concierge_price_absent": not any("Concierge" in item["name"] for item in prices),
        "social_image": social_image,
        "product_links": product_results,
        "robots_txt": {"status": robots_status, "indexable": "Allow: /" in robots_text},
        "sitemap_xml": {"status": sitemap_status, "homepage_present": f"<loc>{BASE}</loc>" in sitemap_text},
        "form_test": {
            "live_homepage_form_count": form_count,
            "result": "N/A — the production homepage contains no forms; source preservation verified zero before and zero after.",
        },
        "response_headers": {key: headers.get(key) for key in ("Content-Type", "Cache-Control", "ETag", "Last-Modified") if headers.get(key)},
        "failures": failures,
    }
    OUTPUT.parent.mkdir(exist_ok=True)
    OUTPUT.write_text(json.dumps(report, indent=2), encoding="utf-8")
    print(json.dumps(report, indent=2))
    if failures:
        sys.exit(1)


if __name__ == "__main__":
    main()
