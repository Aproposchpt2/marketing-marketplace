from __future__ import annotations

import hashlib
import json
import re
from collections import Counter
from pathlib import Path
from urllib.request import Request, urlopen

from bs4 import BeautifulSoup

ROOT = Path(__file__).resolve().parents[1]
INDEX = ROOT / "index.html"
ROBOTS = ROOT / "robots.txt"
SITEMAP = ROOT / "sitemap.xml"
REPORT = Path("/tmp/commercial-drift-validation.json")

APPROVED_H1 = "The Government Contract Marketplace for Business Opportunity"
APPROVED_SUPPORT = (
    "Discover APROPOS government contract services, federal and state opportunity pathways, "
    "business readiness resources, contractor participation, proposal development services, "
    "and business growth solutions through the APROPOS Marketing Marketplace."
)
APPROVED_BRAND = "Where government contracts finally meet the businesses built to fulfill them."
CANONICAL = "https://marketplace.aproposgroupllc.com/"

REPLACEMENTS = [
    (
        "Every system in this layer is free to access.",
        "APROPOS provides guided government-contract opportunity pathways through subscription services that begin with 14-day free trials, connecting procurement intelligence to the service path appropriate for each business.",
        "contract_intelligence",
    ),
    (
        "14-Day Free Trial. No Trial Required.",
        "Start With a 14-Day Free Trial.",
        "membership_heading",
    ),
    (
        "NGCC, the state procurement systems, the Sub-Contractor Registry, and the Partnership Portal are free to the public — no subscription needed to join.",
        "Visitors can begin applicable APROPOS subscription services through the 14-day free trial and continue through the approved monthly subscription. Free participation remains limited to registry or partnership pathways that are specifically identified as free.",
        "membership_description",
    ),
]

PROHIBITED = [
    "Every system in this layer is free to access.",
    "14-Day Free Trial. No Trial Required.",
    "free to the public — no subscription needed to join",
]

PRODUCT_URLS = {
    "NGCC": "https://ngcc.aproposgroupllc.com/",
    "NAT-CORP": "https://natcorp.aproposgroupllc.com/",
    "NEBC": "https://nebc.aproposgroupllc.com/",
}


def normalize(text: str) -> str:
    return " ".join(text.split())


def replace_flexible(source: str, old: str, new: str) -> tuple[str, int]:
    count = source.count(old)
    if count:
        return source.replace(old, new), count
    pattern = re.escape(old).replace(r"\ ", r"\s+")
    source2, count2 = re.subn(pattern, new, source, flags=re.IGNORECASE)
    return source2, count2


def dom_signature(html: str) -> Counter:
    soup = BeautifulSoup(html, "html.parser")
    return Counter(tag.name for tag in soup.find_all(True))


def recursive_dicts(obj):
    if isinstance(obj, dict):
        yield obj
        for value in obj.values():
            yield from recursive_dicts(value)
    elif isinstance(obj, list):
        for value in obj:
            yield from recursive_dicts(value)


def contains_price(obj) -> bool:
    if isinstance(obj, dict):
        if "price" in obj:
            return True
        return any(contains_price(v) for v in obj.values())
    if isinstance(obj, list):
        return any(contains_price(v) for v in obj)
    return False


def http_get_status(url: str) -> tuple[int, str]:
    req = Request(url, headers={"User-Agent": "APROPOS-Marketplace-Validation/1.0"})
    with urlopen(req, timeout=25) as resp:
        resp.read(1024)
        return int(resp.status), resp.geturl()


source = INDEX.read_text(encoding="utf-8")
before_hash = hashlib.sha256(source.encode()).hexdigest()
before_dom = dom_signature(source)
replacement_counts: dict[str, int] = {}

for old, new, key in REPLACEMENTS:
    source, count = replace_flexible(source, old, new)
    if count < 1:
        raise SystemExit(f"Required deployed drift phrase not found: {key}")
    replacement_counts[key] = count

# Correct only the paid NGCC CTA while preserving its existing onboarding route
# and visual arrow treatment.
cta_pattern = re.compile(
    r"(<a\b(?=[^>]*href=[\"'][^\"']*ngcc[^\"']*[\"'])[^>]*>)\s*Join Free(?:\s*&rarr;|\s*→)?\s*(</a>)",
    re.IGNORECASE,
)
source, cta_count = cta_pattern.subn(
    r"\1Start Your 14-Day Free Trial &rarr;\2", source
)
if cta_count == 0:
    all_join_free = len(re.findall(r"\bJoin Free\b", source, flags=re.IGNORECASE))
    if all_join_free == 1:
        source, cta_count = re.subn(
            r"\bJoin Free\b(?:\s*&rarr;|\s*→)?",
            "Start Your 14-Day Free Trial &rarr;",
            source,
            count=1,
            flags=re.IGNORECASE,
        )
    else:
        raise SystemExit(
            f"Could not safely identify paid-product Join Free CTA; remaining occurrences={all_join_free}"
        )
replacement_counts["paid_trial_cta"] = cta_count

INDEX.write_text(source, encoding="utf-8")
after_hash = hashlib.sha256(source.encode()).hexdigest()
after_dom = dom_signature(source)

soup = BeautifulSoup(source, "html.parser")
page_text = normalize(soup.get_text(" ", strip=True))
failures: list[str] = []

# Preservation: approved hero and DOM structure.
h1_values = [normalize(tag.get_text(" ", strip=True)) for tag in soup.find_all("h1")]
if APPROVED_H1 not in h1_values:
    failures.append("Approved hero H1 changed or missing")
if APPROVED_SUPPORT not in page_text:
    failures.append("Approved hero supporting description changed or missing")
if APPROVED_BRAND not in page_text:
    failures.append("Approved brand statement changed or missing")
if before_dom != after_dom:
    failures.append("DOM element structure changed during text-only remediation")

# Prohibited drift must be absent.
for phrase in PROHIBITED:
    if phrase.lower() in source.lower():
        failures.append(f"Prohibited commercial drift remains: {phrase}")

# Detect paid-product free-public claims using bounded product context.
for product in ("NGCC", "NAT-CORP", "NEBC"):
    for m in re.finditer(re.escape(product), page_text, flags=re.IGNORECASE):
        context = page_text[max(0, m.start() - 180): m.end() + 220].lower()
        if "permanently free" in context or "no subscription needed" in context:
            failures.append(f"Obsolete free-access implication remains near {product}")

# Corrected membership/CTA language.
if "Start With a 14-Day Free Trial." not in page_text:
    failures.append("Corrected 14-day trial heading missing")
if "subscription services through the 14-day free trial" not in page_text:
    failures.append("Corrected membership subscription language missing")

trial_ctas = []
for a in soup.find_all("a", href=True):
    text = normalize(a.get_text(" ", strip=True))
    if text.startswith("Start Your 14-Day Free Trial") or text.startswith("Start Your 14 Day Free Trial"):
        trial_ctas.append({"text": text, "href": a["href"]})
ngcc_trial_ctas = [c for c in trial_ctas if "ngcc.aproposgroupllc.com" in c["href"].lower()]
if not ngcc_trial_ctas:
    failures.append("Corrected trial CTA does not preserve the NGCC onboarding/trial route")

cta_link_tests = []
for cta in ngcc_trial_ctas:
    try:
        status, final_url = http_get_status(cta["href"])
        ok = 200 <= status < 400
        cta_link_tests.append({"url": cta["href"], "status": status, "final_url": final_url, "ok": ok})
        if not ok:
            failures.append(f"NGCC trial CTA returned HTTP {status}: {cta['href']}")
    except Exception as exc:
        cta_link_tests.append({"url": cta["href"], "status": None, "ok": False, "error": str(exc)})
        failures.append(f"NGCC trial CTA failed: {exc}")

# Canonical and robots preservation.
canonicals = [tag.get("href") for tag in soup.find_all("link", rel=lambda v: v and "canonical" in v)]
if canonicals != [CANONICAL]:
    failures.append(f"Canonical mismatch: {canonicals}")
robots_meta = soup.find("meta", attrs={"name": re.compile(r"^robots$", re.I)})
robots_content = (robots_meta.get("content", "") if robots_meta else "").lower().replace(" ", "")
if "index" not in robots_content or "follow" not in robots_content:
    failures.append("Robots meta is not index/follow")

# robots.txt and sitemap.xml preservation.
if not ROBOTS.exists():
    failures.append("robots.txt missing")
else:
    robots_txt = ROBOTS.read_text(encoding="utf-8").lower()
    if "disallow: /\n" in robots_txt:
        failures.append("robots.txt appears to block crawling")
if not SITEMAP.exists():
    failures.append("sitemap.xml missing")
else:
    sitemap_text = SITEMAP.read_text(encoding="utf-8")
    if CANONICAL not in sitemap_text:
        failures.append("Homepage canonical missing from sitemap.xml")

# JSON-LD validity, offer-price baseline, and Concierge price withholding.
jsonld = []
for script in soup.find_all("script", attrs={"type": "application/ld+json"}):
    raw = script.string or script.get_text()
    try:
        jsonld.append(json.loads(raw))
    except Exception as exc:
        failures.append(f"Invalid JSON-LD: {exc}")

all_dicts = [d for block in jsonld for d in recursive_dicts(block)]
price_values = []
for d in all_dicts:
    if "price" in d:
        try:
            price_values.append(float(d["price"]))
        except (TypeError, ValueError):
            failures.append(f"Non-numeric structured-data price: {d.get('price')}")
required_prices = {99.0, 119.0, 39.0, 15.0}
if not required_prices.issubset(set(price_values)):
    failures.append(f"Required structured-data prices missing; found={price_values}")
if 19.99 in price_values or 24.99 in price_values:
    failures.append("Obsolete Analyze Fit or NEBC price remains in structured data")
for d in all_dicts:
    if "concierge contract service" in str(d.get("name", "")).lower() and contains_price(d):
        failures.append("Concierge Contract Service has an unauthorized structured-data price")

# Visible pricing baseline. The existing verified-offer section must remain intact.
visible_price_checks = {
    "NGCC": "$99",
    "NAT-CORP": "$119",
    "NEBC": "$39",
    "Analyze Fit": "$15",
}
for label, token in visible_price_checks.items():
    if token not in page_text:
        failures.append(f"Visible {label} pricing token missing: {token}")
if "$19.99" in page_text or "$24.99" in page_text:
    failures.append("Obsolete visible pricing remains")
if "Concierge Contract Service" not in page_text:
    failures.append("Concierge Contract Service reference missing")

# Product destination validation over live connected APROPOS properties.
link_results = []
for product, url in PRODUCT_URLS.items():
    try:
        status, final_url = http_get_status(url)
        ok = 200 <= status < 400
        link_results.append({"product": product, "url": url, "status": status, "final_url": final_url, "ok": ok})
        if not ok:
            failures.append(f"{product} destination returned HTTP {status}")
    except Exception as exc:
        link_results.append({"product": product, "url": url, "status": None, "ok": False, "error": str(exc)})
        failures.append(f"{product} destination failed: {exc}")

report = {
    "status": "PASS" if not failures else "FAIL",
    "base_commit": "555ddd3a27726884b3d21d5c03c7facd9879602c",
    "before_sha256": before_hash,
    "after_sha256": after_hash,
    "replacement_counts": replacement_counts,
    "approved_h1": APPROVED_H1,
    "hero_preserved": APPROVED_H1 in h1_values and APPROVED_SUPPORT in page_text and APPROVED_BRAND in page_text,
    "dom_structure_preserved": before_dom == after_dom,
    "canonical": canonicals,
    "robots_meta": robots_content,
    "jsonld_blocks": len(jsonld),
    "structured_prices": sorted(set(price_values)),
    "concierge_price_withheld": not any(
        "concierge contract service" in str(d.get("name", "")).lower() and contains_price(d)
        for d in all_dicts
    ),
    "trial_ctas": trial_ctas,
    "cta_link_tests": cta_link_tests,
    "product_link_tests": link_results,
    "failures": failures,
}
REPORT.write_text(json.dumps(report, indent=2), encoding="utf-8")
print(json.dumps(report, indent=2))

if failures:
    raise SystemExit("Commercial drift validation failed")
