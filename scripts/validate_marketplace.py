from __future__ import annotations

import json
import re
import sys
from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import urlparse
from urllib.request import Request, urlopen

ROOT = Path(__file__).resolve().parents[1]
PRODUCTION = "https://marketplace.aproposgroupllc.com"


class Inspector(HTMLParser):
    def __init__(self) -> None:
        super().__init__()
        self.tags: list[tuple[str, dict[str, str]]] = []
        self.h1 = 0
        self.labels_for: set[str] = set()
        self.inputs: set[str] = set()
        self.links: list[str] = []
        self.images: list[dict[str, str]] = []
        self.forms: list[dict[str, str]] = []
        self.scripts_jsonld: list[str] = []
        self._jsonld = False
        self._json_buffer: list[str] = []
        self.title_text = ""
        self._title = False

    def handle_starttag(self, tag: str, attrs: list[tuple[str, str | None]]) -> None:
        data = {k: (v or "") for k, v in attrs}
        self.tags.append((tag, data))
        if tag == "h1":
            self.h1 += 1
        if tag == "label" and data.get("for"):
            self.labels_for.add(data["for"])
        if tag in {"input", "select", "textarea"} and data.get("id"):
            self.inputs.add(data["id"])
        if tag == "a" and data.get("href"):
            self.links.append(data["href"])
        if tag == "img":
            self.images.append(data)
        if tag == "form":
            self.forms.append(data)
        if tag == "script" and data.get("type") == "application/ld+json":
            self._jsonld = True
            self._json_buffer = []
        if tag == "title":
            self._title = True

    def handle_endtag(self, tag: str) -> None:
        if tag == "script" and self._jsonld:
            self.scripts_jsonld.append("".join(self._json_buffer).strip())
            self._jsonld = False
        if tag == "title":
            self._title = False

    def handle_data(self, data: str) -> None:
        if self._jsonld:
            self._json_buffer.append(data)
        if self._title:
            self.title_text += data


def page_target(page: Path, href: str) -> Path | None:
    if not href or href.startswith(("#", "mailto:", "tel:", "javascript:")):
        return None
    parsed = urlparse(href)
    if parsed.scheme in {"http", "https"}:
        if parsed.netloc != "marketplace.aproposgroupllc.com":
            return None
        path = parsed.path
    else:
        path = parsed.path
    if not path:
        return None
    if path.startswith("/"):
        candidate = ROOT / path.lstrip("/")
    else:
        candidate = page.parent / path
    if candidate.suffix:
        return candidate
    return candidate / "index.html"


def check_external(url: str) -> dict:
    try:
        req = Request(url, method="HEAD", headers={"User-Agent": "APROPOS-Marketplace-Validator/1.0"})
        with urlopen(req, timeout=12) as response:
            return {"url": url, "status": response.status, "ok": 200 <= response.status < 400}
    except Exception as exc:
        return {"url": url, "status": None, "ok": False, "warning": str(exc)[:180]}


def main() -> int:
    html_files = sorted(
        p for p in ROOT.rglob("*.html")
        if ".git" not in p.parts and "legacy" not in p.parts and "downloads" not in p.parts
    )
    checks: list[dict] = []
    internal_broken: list[dict] = []
    schema_errors: list[dict] = []
    metadata_errors: list[dict] = []
    form_errors: list[dict] = []
    heading_errors: list[dict] = []
    image_errors: list[dict] = []

    for path in html_files:
        source = path.read_text(encoding="utf-8")
        inspector = Inspector()
        inspector.feed(source)
        relative = path.relative_to(ROOT).as_posix()

        title_ok = bool(inspector.title_text.strip())
        description_ok = bool(re.search(r'<meta\s+name="description"\s+content="[^"]+"', source, re.I))
        canonical_ok = bool(re.search(r'<link\s+rel="canonical"\s+href="https://marketplace\.aproposgroupllc\.com[^"]*"', source, re.I))
        robots_ok = 'name="robots" content="index,follow,max-image-preview:large,max-snippet:-1,max-video-preview:-1"' in source
        og_ok = all(token in source for token in ['property="og:title"', 'property="og:description"', 'property="og:image"'])
        twitter_ok = all(token in source for token in ['name="twitter:card"', 'name="twitter:title"', 'name="twitter:image"'])
        if not all([title_ok, description_ok, canonical_ok, robots_ok, og_ok, twitter_ok]):
            metadata_errors.append({"page": relative, "title": title_ok, "description": description_ok, "canonical": canonical_ok, "robots": robots_ok, "open_graph": og_ok, "twitter": twitter_ok})

        if inspector.h1 != 1:
            heading_errors.append({"page": relative, "h1_count": inspector.h1})

        for raw in inspector.scripts_jsonld:
            try:
                payload = json.loads(raw)
                if "@context" not in payload or "@graph" not in payload:
                    schema_errors.append({"page": relative, "error": "JSON-LD missing @context or @graph"})
            except Exception as exc:
                schema_errors.append({"page": relative, "error": str(exc)})
        if not inspector.scripts_jsonld:
            schema_errors.append({"page": relative, "error": "No JSON-LD block"})

        for href in inspector.links:
            target = page_target(path, href)
            if target is not None and not target.exists():
                internal_broken.append({"page": relative, "href": href, "expected": target.relative_to(ROOT).as_posix()})

        for form in inspector.forms:
            if not form.get("name") or form.get("method", "").upper() != "POST" or form.get("data-netlify") != "true" or not form.get("action"):
                form_errors.append({"page": relative, "form": form})
        unlabeled = sorted(inspector.inputs - inspector.labels_for)
        # Inputs nested inside labels are valid; only flag IDs when no wrapping label is present.
        for element_id in unlabeled:
            if not re.search(rf'<label[^>]*>.*?id="{re.escape(element_id)}"', source, re.I | re.S):
                form_errors.append({"page": relative, "unlabeled_control": element_id})

        for image in inspector.images:
            if not image.get("alt") or not image.get("width") or not image.get("height"):
                image_errors.append({"page": relative, "image": image.get("src", ""), "has_alt": bool(image.get("alt")), "has_width": bool(image.get("width")), "has_height": bool(image.get("height"))})

        checks.append({
            "page": relative,
            "metadata": all([title_ok, description_ok, canonical_ok, robots_ok, og_ok, twitter_ok]),
            "h1_count": inspector.h1,
            "jsonld_blocks": len(inspector.scripts_jsonld),
            "forms": len(inspector.forms),
            "links": len(inspector.links),
            "images": len(inspector.images),
        })

    homepage = (ROOT / "index.html").read_text(encoding="utf-8")
    required_homepage = [
        "Explore APROPOS Programs, Services, and Opportunity Pathways",
        "Find the APROPOS Service Built for Your Next Step",
        "Government Contract Intelligence",
        "Business Development and Readiness",
        "Understand the Opportunity Before You Commit",
        "Stay Informed with Concierge Contract Service",
        "Prepare to Compete",
        "Expand Opportunity Through Partnership",
        "Opportunity Builds Business. Business Builds Community.",
        "$99 / month",
        "$119 / month",
        "$39 / month",
        "Additional Analyze Fit Report",
        "$15",
    ]
    required_homepage_missing = [item for item in required_homepage if item not in homepage]

    js = (ROOT / "assets" / "site.js").read_text(encoding="utf-8")
    analytics_events = [
        "outbound_platform_click", "returning_visitor", "qr_traffic", "nfc_traffic",
        "event_page_visit", "form_completion", "trial_start_ngcc", "trial_start_natcorp",
        "trial_start_nebc", "analyze_fit_purchase", "concierge_inquiry",
        "proposal_development_inquiry", "partner_inquiry",
    ]
    analytics_missing = [event for event in analytics_events if event not in (js + homepage)]

    external = [
        check_external("https://ngcc.aproposgroupllc.com"),
        check_external("https://natcorp.aproposgroupllc.com"),
        check_external("https://nebc.aproposgroupllc.com"),
    ]

    required_files = [
        "robots.txt", "sitemap.xml", "netlify.toml", "_redirects",
        "assets/og-marketplace.jpg", "assets/marketplace-hero.jpg",
        "assets/legacy-assets-manifest.json", "legacy/index.html",
        "events/las-vegas-business-expo-2026/index.html",
        "partners/index.html", "concierge-contract-service/index.html",
        "contract-proposal-development/index.html",
    ]
    missing_files = [file for file in required_files if not (ROOT / file).exists()]

    critical_failures = {
        "metadata": metadata_errors,
        "schema": schema_errors,
        "headings": heading_errors,
        "internal_links": internal_broken,
        "forms": form_errors,
        "images": image_errors,
        "required_homepage_content": required_homepage_missing,
        "analytics": analytics_missing,
        "required_files": missing_files,
    }
    passed = not any(critical_failures.values())

    report = {
        "status": "PASS" if passed else "FAIL",
        "branch": "seo-marketing-marketplace-production-v1",
        "production_modified": False,
        "pages_validated": len(html_files),
        "page_results": checks,
        "metadata_validation": "PASS" if not metadata_errors else "FAIL",
        "schema_validation": "PASS" if not schema_errors else "FAIL",
        "link_validation": {
            "internal": "PASS" if not internal_broken else "FAIL",
            "broken_internal": internal_broken,
            "external_platform_checks": external,
            "note": "External HEAD failures are warnings because some production sites may reject automated HEAD requests.",
        },
        "form_validation": "PASS" if not form_errors else "FAIL",
        "analytics_event_validation": "PASS" if not analytics_missing else "FAIL",
        "image_validation": "PASS" if not image_errors else "FAIL",
        "critical_failures": critical_failures,
    }

    validation = ROOT / "validation"
    validation.mkdir(exist_ok=True)
    (validation / "validation-report.json").write_text(json.dumps(report, indent=2), encoding="utf-8")

    md = [
        "# APROPOS Marketing Marketplace Validation Report",
        "",
        f"**Overall:** {report['status']}",
        f"**Pages validated:** {len(html_files)}",
        "**Production modified:** No",
        "",
        "| Validation | Result |",
        "|---|---|",
        f"| Metadata | {report['metadata_validation']} |",
        f"| JSON-LD schema syntax and graph structure | {report['schema_validation']} |",
        f"| Internal links | {report['link_validation']['internal']} |",
        f"| Form markup and accessible labeling | {report['form_validation']} |",
        f"| Analytics event instrumentation | {report['analytics_event_validation']} |",
        f"| Image attributes | {report['image_validation']} |",
        "",
        "## External platform endpoint checks",
    ]
    for check in external:
        md.append(f"- `{check['url']}` — status `{check.get('status')}` — {'reachable' if check.get('ok') else 'automated HEAD warning'}")
    if passed:
        md.extend(["", "No critical static-validation blockers were detected."])
    else:
        md.extend(["", "## Critical failures", "", "```json", json.dumps(critical_failures, indent=2), "```"])
    (validation / "validation-report.md").write_text("\n".join(md) + "\n", encoding="utf-8")

    print(json.dumps(report, indent=2))
    return 0 if passed else 1


if __name__ == "__main__":
    sys.exit(main())
