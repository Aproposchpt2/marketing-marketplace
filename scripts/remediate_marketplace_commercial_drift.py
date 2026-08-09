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

# Change only a paid-product Join Free CTA. Prefer an NGCC-linked anchor; if the
# deployed source has only one Join Free CTA, Issue #5 identifies it as the paid
# subscription CTA and it is safe to correct.
cta_pattern = re.compile(
    r"(<a\b(?=[^>]*href=[\"'][^\"']*ngcc[^\"']*[\"'])[^>]*>)\s*Join Free\s*(</a>)",
    re.IGNORECASE,
)
source, cta_count = cta_pattern.subn(r"\1Start Your 14-Day Free Trial\2", source)
if cta_count == 0:
    all_join_free = len(re.findall(r"\bJoin Free\b", source, flags=re.IGNORECASE))
    if all_join_free == 1:
        source, cta_count = re.subn(
            r"\bJoin Free\b", "Start Your 14-Day Free Trial", source, count=1, flags=re.IGNORECASE
        )
    else:
        raise SystemExit(
            f"Could not safely identify paid-product Join Free CTA; remaining occurrences={all_join_free}"
        )
replacement_counts["paid_trial_cta"] = cta_count

INDEX.write_text(source, encoding="utf-8")
after_hash = hashlib.sha256(source.encode()).hexdigest()
after_dom = dom_signature(source)

soup = BeautifulSoup(source, "html.parser")n