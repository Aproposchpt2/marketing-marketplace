from __future__ import annotations

import json
import re
import sys
import urllib.error
import urllib.request
from html.parser import HTMLParser
from pathlib import Path

from PIL import Image

ROOT = Path(__file__).resolve().parents[1]
INDEX = ROOT / "index.html"
VALIDATION = ROOT / "validation"
REPORT_PATH = VALIDATION / "metadata-validation.json"

EXPECTED = {
    "title": "APROPOS Marketing Marketplace | Programs, Services and Opportunity",
    "description": "Explore APROPOS business-development programs, government contract intelligence, Analyze Fit services, free trials, proposal support, and partnership opportunities.",
    "canonical": "https://marketplace.aproposgroupllc.com/",
    "robots": "index,follow,max-image-preview:large,max-snippet:-1,max-video-preview:-1",
    "og_site_name": "APROPOS Marketing Marketplace",
    "og_description": "Explore APROPOS programs, government contract intelligence, business-development services, free trials, Analyze Fit, and partnership pathways.",
    "twitter_description": "Explore APROPOS products, free trials, Analyze Fit, proposal support, campaigns, and partnership opportunities.",
}
PRODUCT_URLS = [
    "https://ngcc.aproposgroupllc.com/",
    "https://natcorp.aproposgroupllc.com/",
    "https://nebc.aproposgroupllc.com/",
]


class DocumentParser(HTMLParser):
    def __init__(self) -> None:
        super().__init__(convert_charrefs=True)
        self.titles: list[str] = []
        self._in_title = False
        self.meta: list[dict[str, str]] = []
        self.links: list[dict[str, str]] = []
        self.anchors: list[dict[str, str]] = []
        self.forms: list[dict[str, str]] = []
        self.scripts: list[dict[str, str | list[str]]] = []
        self._script_type = ""
        self._script_data: list[str] = []
        self._anchor: dict[str, str] | None = None

    def handle_starttag(self, tag: str, attrs: list[tuple[str, str | None]]) -> None:
        data = {k.lower(): (v or "") for k, v in attrs}
        tag = tag.lower()
        if tag == "title":
            self._in_title = True
        elif tag == "meta":
            self.meta.append(data)
        elif tag == "link":
            self.links.append(data)
        elif tag == "a":
            self._anchor = {**data, "text": ""}
            self.anchors.append(self._anchor)
        elif tag == "form":
            self.forms.append(data)
        elif tag == "script":
            self._script_type = data.get("type", "")
            self._script_data = []

    def handle_endtag(self, tag: str) -> None:
        tag = tag.lower()
        if tag == "title":
            self._in_title = False
        elif tag == "a":
            self._anchor = None
        elif tag == "script":
            if self._script_type:
                self.scripts.append({"type": self._script_type, "data": "".join(self._script_data)})
            self._script_type = ""
            self._script_data = []

    def handle_data(self, data: str) -> None:
        if self._in_title:
            self.titles.append(data)
        if self._script_type:
            self._script_data.append(data)
        if self._anchor is not None:
            self._anchor["text"] += data


def one_meta(parser: DocumentParser, *, name: str | None = None, prop: str | None = None) -> list[dict[str, str]]:
    if name is not None:
        return [item for item in parser.meta if item.get("name", "").lower() == name.lower()]
    return [item for item in parser.meta if item.get("property", "").lower() == (prop or "").lower()]


def validate_external(url: str) -> dict[str, object]:
    request = urllib.request.Request(url, headers={"User-Agent": "APROPOS-Marketplace-SEO-Validator/1.0"})
    try:
        with urllib.request.urlopen(request, timeout=25) as response:
            return {"url": url, "status": response.status, "ok": 200 <= response.status < 400}
    except urllib.error.HTTPError as exc:
        return {"url": url, "status": exc.code, "ok": 200 <= exc.code < 400, "error": str(exc)}
    except Exception as exc:
        return {"url": url, "status": None, "ok": False, "error": str(exc)}


def flatten_types(value: object) -> list[str]:
    found: list[str] = []
    if isinstance(value, dict):
        item_type = value.get("@type")
        if isinstance(item_type, str):
            found.append(item_type)
        elif isinstance(item_type, list):
            found.extend(str(item) for item in item_type)
        for child in value.values():
            found.extend(flatten_types(child))
    elif isinstance(value, list):
        for child in value:
            found.extend(flatten_types(child))
    return found


def collect_prices(value: object, path: str = "$", output: list[dict[str, str]] | None = None) -> list[dict[str, str]]:
    output = output if output is not None else []
    if isinstance(value, dict):
        if "price" in value:
            output.append({"path": path, "name": str(value.get("name", "")), "price": str(value["price"])})
        for key, child in value.items():
            collect_prices(child, f"{path}.{key}", output)
    elif isinstance(value, list):
        for index, child in enumerate(value):
            collect_prices(child, f"{path}[{index}]", output)
    return output


def main() -> None:
    html = INDEX.read_text(encoding="utf-8")
    parser = DocumentParser()
    parser.feed(html)
    failures: list[str] = []

    title_values = [value.strip() for value in parser.titles if value.strip()]
    if title_values != [EXPECTED["title"]]:
        failures.append(f"Expected one exact title, got {title_values!r}")

    description = one_meta(parser, name="description")
    if len(description) != 1 or description[0].get("content") != EXPECTED["description"]:
        failures.append("Meta description is missing, duplicated, or incorrect")

    canonical = [item for item in parser.links if "canonical" in item.get("rel", "").lower().split()]
    if len(canonical) != 1 or canonical[0].get("href") != EXPECTED["canonical"]:
        failures.append("Canonical link is missing, duplicated, or incorrect")

    robots = one_meta(parser, name="robots")
    if len(robots) != 1 or robots[0].get("content") != EXPECTED["robots"]:
        failures.append("Robots meta is missing, duplicated, or incorrect")

    required_og = {
        "og:type": "website",
        "og:site_name": EXPECTED["og_site_name"],
        "og:title": EXPECTED["title"],
        "og:description": EXPECTED["og_description"],
        "og:url": EXPECTED["canonical"],
        "og:image": "https://marketplace.aproposgroupllc.com/og-marketplace.jpg",
        "og:image:alt": "APROPOS Marketing Marketplace programs and opportunity pathways",
    }
    for prop, expected in required_og.items():
        values = one_meta(parser, prop=prop)
        if len(values) != 1 or values[0].get("content") != expected:
            failures.append(f"Open Graph field {prop} is missing, duplicated, or incorrect")

    required_twitter = {
        "twitter:card": "summary_large_image",
        "twitter:title": EXPECTED["title"],
        "twitter:description": EXPECTED["twitter_description"],
        "twitter:image": "https://marketplace.aproposgroupllc.com/og-marketplace.jpg",
    }
    for name, expected in required_twitter.items():
        values = one_meta(parser, name=name)
        if len(values) != 1 or values[0].get("content") != expected:
            failures.append(f"Twitter field {name} is missing, duplicated, or incorrect")

    jsonld_blocks = [item for item in parser.scripts if str(item.get("type", "")).lower() == "application/ld+json"]
    parsed_jsonld: list[object] = []
    for block in jsonld_blocks:
        try:
            parsed_jsonld.append(json.loads(str(block["data"])))
        except json.JSONDecodeError as exc:
            failures.append(f"Invalid JSON-LD: {exc}")
    types = sorted(set(flatten_types(parsed_jsonld)))
    for required_type in ("Organization", "WebSite", "ItemList", "Service", "Offer"):
        if required_type not in types:
            failures.append(f"JSON-LD type missing: {required_type}")

    serialized_schema = json.dumps(parsed_jsonld, ensure_ascii=False)
    for url in PRODUCT_URLS:
        if url not in serialized_schema:
            failures.append(f"ItemList/service URL missing from JSON-LD: {url}")

    prices = collect_prices(parsed_jsonld)
    price_values = sorted(item["price"] for item in prices)
    expected_prices = sorted(["15.00", "39.00", "99.00", "119.00"])
    if price_values != expected_prices:
        failures.append(f"JSON-LD prices incorrect: expected {expected_prices}, got {price_values}")
    if any("Concierge" in item["name"] for item in prices):
        failures.append("Concierge Contract Service must not contain a JSON-LD price")

    required_visible = [
        "APROPOS Marketing Marketplace",
        "Explore APROPOS programs, services, campaigns, and opportunity pathways.",
        "NGCC — 14-day free trial, then $99/month",
        "NAT-CORP — 14-day free trial, then $119/month",
        "NEBC — 14-day free trial, then $39/month",
        "Additional Analyze Fit Report",
        "$15 one-time",
        "Concierge Contract Service pricing will be announced after final service scope and operating-cost validation.",
    ]
    for phrase in required_visible:
        if phrase not in html:
            failures.append(f"Required visible copy missing: {phrase}")
    for prohibited in ("National Business Contract Center", "$19.99", "$24.99"):
        if prohibited in html:
            failures.append(f"Prohibited legacy copy remains: {prohibited}")

    trial_ctas = [
        anchor
        for anchor in parser.anchors
        if anchor.get("data-trial-cta") and "Start 14-Day Free Trial" in anchor.get("text", "")
    ]
    if len(trial_ctas) != 3:
        failures.append(f"Expected three verified trial CTAs, got {len(trial_ctas)}")
    if sorted(anchor.get("href", "") for anchor in trial_ctas) != sorted(PRODUCT_URLS):
        failures.append("Trial CTA destinations do not match the verified product URLs")

    preservation_path = VALIDATION / "preservation-report.json"
    preservation = json.loads(preservation_path.read_text(encoding="utf-8"))
    if preservation.get("status") != "PASS" or preservation["before"]["forms"] != preservation["after"]["forms"]:
        failures.append("Form preservation report failed")
    if preservation["before"]["images"] != preservation["after"]["images"]:
        failures.append("Image preservation report failed")

    if not (ROOT / "robots.txt").exists():
        failures.append("robots.txt is missing")
    else:
        robots_text = (ROOT / "robots.txt").read_text(encoding="utf-8")
        if "Allow: /" not in robots_text or "Sitemap: https://marketplace.aproposgroupllc.com/sitemap.xml" not in robots_text:
            failures.append("robots.txt does not establish indexable production rules")
    if not (ROOT / "sitemap.xml").exists():
        failures.append("sitemap.xml is missing")
    elif EXPECTED["canonical"] not in (ROOT / "sitemap.xml").read_text(encoding="utf-8"):
        failures.append("sitemap.xml does not contain the production homepage")

    image_path = ROOT / "og-marketplace.jpg"
    social_image = {"exists": image_path.exists(), "width": None, "height": None, "format": None}
    if image_path.exists():
        with Image.open(image_path) as image:
            social_image.update({"width": image.width, "height": image.height, "format": image.format})
            if image.size != (1200, 630) or image.format != "JPEG":
                failures.append(f"Social image must be a 1200x630 JPEG, got {image.size} {image.format}")
    else:
        failures.append("og-marketplace.jpg is missing")

    link_results = [validate_external(url) for url in PRODUCT_URLS]
    for result in link_results:
        if not result["ok"]:
            failures.append(f"Product link failed: {result}")

    report = {
        "status": "PASS" if not failures else "FAIL",
        "title": title_values,
        "description": description[0].get("content") if description else None,
        "canonical": canonical[0].get("href") if canonical else None,
        "robots": robots[0].get("content") if robots else None,
        "jsonld_blocks": len(jsonld_blocks),
        "jsonld_types": types,
        "offer_prices": prices,
        "concierge_price_absent": not any("Concierge" in item["name"] for item in prices),
        "social_image": social_image,
        "product_link_tests": link_results,
        "trial_ctas": trial_ctas,
        "forms_preserved": preservation,
        "robots_txt": (ROOT / "robots.txt").exists(),
        "sitemap_xml": (ROOT / "sitemap.xml").exists(),
        "production_indexable": len(robots) == 1 and robots[0].get("content", "").startswith("index,follow"),
        "failures": failures,
    }
    VALIDATION.mkdir(exist_ok=True)
    REPORT_PATH.write_text(json.dumps(report, indent=2), encoding="utf-8")
    print(json.dumps(report, indent=2))
    if failures:
        sys.exit(1)


if __name__ == "__main__":
    main()
