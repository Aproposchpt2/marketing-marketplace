from __future__ import annotations

import base64
import hashlib
import io
import json
import re
import shutil
import textwrap
from dataclasses import dataclass
from pathlib import Path
from typing import Iterable

from PIL import Image, ImageDraw, ImageFont
import qrcode

ROOT = Path(__file__).resolve().parents[1]
PRODUCTION = "https://marketplace.aproposgroupllc.com"
BRANCH = "seo-marketing-marketplace-production-v1"

NAV = [
    ("Home", "/"),
    ("Programs", "/#featured-programs"),
    ("Promotions", "/#current-promotions"),
    ("Analyze Fit", "/campaigns/analyze-fit/"),
    ("Partnerships", "/partners/"),
    ("Events", "/events/las-vegas-business-expo-2026/"),
]

@dataclass(frozen=True)
class Page:
    path: str
    title: str
    description: str
    h1: str
    eyebrow: str
    body: str
    schema: list[dict]
    page_class: str = ""


def clean_dir(path: Path) -> None:
    if path.exists():
        shutil.rmtree(path)
    path.mkdir(parents=True, exist_ok=True)


def save_legacy_and_extract_assets() -> dict[str, str]:
    source = ROOT / "index.html"
    original = source.read_text(encoding="utf-8", errors="replace")
    legacy_dir = ROOT / "legacy"
    legacy_dir.mkdir(exist_ok=True)
    (legacy_dir / "index.html").write_text(original, encoding="utf-8")

    legacy_assets = ROOT / "assets" / "legacy"
    clean_dir(legacy_assets)

    pattern = re.compile(
        r"data:image/(?P<kind>png|jpe?g|webp|gif);base64,(?P<data>[A-Za-z0-9+/=\r\n]+)",
        re.IGNORECASE,
    )
    found: list[tuple[int, int, int, float, Path, str]] = []
    seen: set[str] = set()

    for index, match in enumerate(pattern.finditer(original), start=1):
        kind = match.group("kind").lower().replace("jpeg", "jpg")
        try:
            raw = base64.b64decode(re.sub(r"\s+", "", match.group("data")), validate=False)
        except Exception:
            continue
        digest = hashlib.sha256(raw).hexdigest()
        if digest in seen:
            continue
        seen.add(digest)
        ext = "jpg" if kind in {"jpg", "jpeg"} else kind
        target = legacy_assets / f"legacy-image-{len(found)+1:02d}.{ext}"
        target.write_bytes(raw)
        try:
            with Image.open(io.BytesIO(raw)) as img:
                width, height = img.size
        except Exception:
            width, height = 0, 0
        ratio = width / height if height else 0
        found.append((len(raw), width, height, ratio, target, digest))

    assets_dir = ROOT / "assets"
    assets_dir.mkdir(exist_ok=True)

    landscape = [item for item in found if item[1] >= 900 and item[3] >= 1.25]
    hero_record = max(landscape or found, key=lambda item: (item[1] * item[2], item[0]), default=None)

    portrait_candidates = [
        item for item in found
        if item[1] >= 300 and item[2] >= 300 and 0.58 <= item[3] <= 1.25
    ]
    portrait_record = max(
        portrait_candidates,
        key=lambda item: (item[1] * item[2], item[0]),
        default=None,
    )

    hero_web = ""
    portrait_web = ""
    if hero_record:
        hero_web = optimize_image(hero_record[4], assets_dir / "marketplace-hero.jpg", (1800, 1100), 90)
        create_og_image(hero_record[4], assets_dir / "og-marketplace.jpg")
    else:
        create_fallback_hero(assets_dir / "marketplace-hero.jpg")
        create_og_image(assets_dir / "marketplace-hero.jpg", assets_dir / "og-marketplace.jpg")
        hero_web = "/assets/marketplace-hero.jpg"

    if portrait_record and portrait_record != hero_record:
        portrait_web = optimize_image(portrait_record[4], assets_dir / "executive-presence.jpg", (900, 900), 90)

    manifest = {
        "source": "Existing embedded marketplace imagery",
        "preserved_original": "/legacy/index.html",
        "images_extracted": len(found),
        "hero": hero_web,
        "executive": portrait_web,
        "branch": BRANCH,
    }
    (assets_dir / "legacy-assets-manifest.json").write_text(json.dumps(manifest, indent=2), encoding="utf-8")
    return {"hero": hero_web, "executive": portrait_web}


def optimize_image(source: Path, target: Path, max_size: tuple[int, int], quality: int) -> str:
    with Image.open(source) as img:
        img = img.convert("RGB")
        img.thumbnail(max_size, Image.Resampling.LANCZOS)
        img.save(target, "JPEG", quality=quality, optimize=True, progressive=True)
    return "/" + target.relative_to(ROOT).as_posix()


def cover_crop(img: Image.Image, size: tuple[int, int]) -> Image.Image:
    target_ratio = size[0] / size[1]
    ratio = img.width / img.height
    if ratio > target_ratio:
        new_width = int(img.height * target_ratio)
        left = (img.width - new_width) // 2
        img = img.crop((left, 0, left + new_width, img.height))
    else:
        new_height = int(img.width / target_ratio)
        top = (img.height - new_height) // 2
        img = img.crop((0, top, img.width, top + new_height))
    return img.resize(size, Image.Resampling.LANCZOS)


def font(size: int, bold: bool = False) -> ImageFont.ImageFont:
    candidates = [
        "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf" if bold else "/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf",
        "/usr/share/fonts/truetype/liberation2/LiberationSans-Bold.ttf" if bold else "/usr/share/fonts/truetype/liberation2/LiberationSans-Regular.ttf",
    ]
    for candidate in candidates:
        if Path(candidate).exists():
            return ImageFont.truetype(candidate, size=size)
    return ImageFont.load_default()


def create_og_image(source: Path, target: Path) -> None:
    with Image.open(source) as img:
        canvas = cover_crop(img.convert("RGB"), (1200, 630))
    overlay = Image.new("RGBA", canvas.size, (2, 18, 40, 0))
    draw = ImageDraw.Draw(overlay)
    draw.rectangle((0, 0, 1200, 630), fill=(2, 18, 40, 182))
    draw.rectangle((70, 72, 82, 558), fill=(208, 169, 77, 255))
    draw.text((118, 128), "APROPOS", font=font(36, True), fill=(224, 194, 113, 255))
    lines = ["Marketing Marketplace", "Opportunity Begins Here."]
    draw.text((118, 220), lines[0], font=font(66, True), fill=(255, 255, 255, 255))
    draw.text((118, 326), lines[1], font=font(45, False), fill=(239, 229, 201, 255))
    draw.text((118, 470), "Programs • Services • Promotions • Partnerships", font=font(26), fill=(255, 255, 255, 230))
    result = Image.alpha_composite(canvas.convert("RGBA"), overlay).convert("RGB")
    result.save(target, "JPEG", quality=91, optimize=True, progressive=True)


def create_fallback_hero(target: Path) -> None:
    img = Image.new("RGB", (1800, 1100), (5, 25, 54))
    draw = ImageDraw.Draw(img)
    for x in range(0, 1800, 90):
        draw.line((x, 0, 1800 - x // 3, 1100), fill=(18, 52, 88), width=3)
    draw.rectangle((0, 850, 1800, 1100), fill=(12, 41, 72))
    img.save(target, "JPEG", quality=90, optimize=True)


def esc(value: str) -> str:
    return value.replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;").replace('"', "&quot;")


def nav_html() -> str:
    links = "".join(f'<a href="{href}">{esc(label)}</a>' for label, href in NAV)
    return f"""
    <a class="skip-link" href="#main">Skip to main content</a>
    <header class="site-header" data-site-header>
      <div class="container nav-shell">
        <a class="brand" href="/" aria-label="APROPOS Marketing Marketplace home">
          <span class="brand-mark" aria-hidden="true">A</span>
          <span><strong>APROPOS</strong><small>Marketing Marketplace</small></span>
        </a>
        <button class="nav-toggle" type="button" aria-expanded="false" aria-controls="primary-nav" data-nav-toggle>
          <span class="sr-only">Open navigation</span><span></span><span></span><span></span>
        </button>
        <nav id="primary-nav" class="primary-nav" aria-label="Primary navigation" data-primary-nav>{links}</nav>
      </div>
    </header>
    """


def footer_html() -> str:
    return """
    <footer class="site-footer">
      <div class="container footer-grid">
        <div>
          <a class="brand footer-brand" href="/"><span class="brand-mark" aria-hidden="true">A</span><span><strong>APROPOS</strong><small>Marketing Marketplace</small></span></a>
          <p>The centralized promotional, campaign, lead-generation, and conversion environment for the APROPOS ecosystem.</p>
        </div>
        <div><h2>Explore</h2><a href="/#featured-programs">Programs</a><a href="/#current-promotions">Promotions</a><a href="/partners/">Partnerships</a><a href="/events/las-vegas-business-expo-2026/">Events</a></div>
        <div><h2>Trust</h2><p>Operated by APROPOS Group LLC. APROPOS is not a government agency and is not endorsed by SAM.gov or issuing agencies.</p></div>
      </div>
      <div class="container footer-bottom"><span>© <span data-current-year></span> APROPOS Group LLC</span><a href="/legacy/">View preserved marketplace version</a></div>
    </footer>
    """


def page_head(title: str, description: str, canonical: str, schema: list[dict], body_class: str = "") -> str:
    schema_text = json.dumps({"@context": "https://schema.org", "@graph": schema}, ensure_ascii=False, separators=(",", ":"))
    return f"""<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>{esc(title)}</title>
  <meta name="description" content="{esc(description)}">
  <link rel="canonical" href="{canonical}">
  <meta name="robots" content="index,follow,max-image-preview:large,max-snippet:-1,max-video-preview:-1">
  <meta property="og:type" content="website">
  <meta property="og:site_name" content="APROPOS Marketing Marketplace">
  <meta property="og:title" content="{esc(title)}">
  <meta property="og:description" content="{esc(description)}">
  <meta property="og:url" content="{canonical}">
  <meta property="og:image" content="{PRODUCTION}/assets/og-marketplace.jpg">
  <meta property="og:image:width" content="1200">
  <meta property="og:image:height" content="630">
  <meta property="og:image:alt" content="APROPOS Marketing Marketplace — Opportunity Begins Here">
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="{esc(title)}">
  <meta name="twitter:description" content="{esc(description)}">
  <meta name="twitter:image" content="{PRODUCTION}/assets/og-marketplace.jpg">
  <meta name="theme-color" content="#061a33">
  <link rel="preload" href="/assets/marketplace-hero.jpg" as="image" fetchpriority="high">
  <link rel="stylesheet" href="/assets/styles.css">
  <script type="application/ld+json">{schema_text}</script>
  <script defer src="/assets/site.js"></script>
</head>
<body class="{esc(body_class)}">
{nav_html()}
"""


def write_page(page: Page) -> None:
    canonical = PRODUCTION + (page.path if page.path.startswith("/") else "/" + page.path)
    if canonical.endswith("/index.html"):
        canonical = canonical[:-10]
    html = page_head(page.title, page.description, canonical, page.schema, page.page_class)
    html += f"""
    <main id="main">
      <section class="page-hero compact-hero">
        <div class="container narrow">
          <p class="eyebrow">{esc(page.eyebrow)}</p>
          <h1>{esc(page.h1)}</h1>
          <p>{esc(page.description)}</p>
        </div>
      </section>
      {page.body}
    </main>
    {footer_html()}
</body>
</html>
"""
    target = ROOT / page.path.lstrip("/") / "index.html"
    target.parent.mkdir(parents=True, exist_ok=True)
    target.write_text(html, encoding="utf-8")


def org_schema() -> dict:
    return {
        "@type": "Organization",
        "@id": f"{PRODUCTION}/#organization",
        "name": "APROPOS Group LLC",
        "url": "https://aproposgroupllc.com",
        "logo": f"{PRODUCTION}/assets/og-marketplace.jpg",
        "description": "APROPOS Group LLC develops business-development and government contract intelligence programs, services, and partnership pathways.",
    }


def service_schema(name: str, description: str, url: str) -> dict:
    return {
        "@type": "Service",
        "name": name,
        "description": description,
        "url": url,
        "provider": {"@id": f"{PRODUCTION}/#organization"},
        "areaServed": "US",
    }


def offer(name: str, price: str, url: str, unit: str, trial: bool = False) -> dict:
    description = f"{name}."
    if trial:
        description += " Includes a 14-day free trial; product terms and billing disclosures apply."
    return {
        "@type": "Offer",
        "name": name,
        "url": url,
        "price": price,
        "priceCurrency": "USD",
        "description": description,
        "priceSpecification": {
            "@type": "UnitPriceSpecification",
            "price": price,
            "priceCurrency": "USD",
            "unitText": unit,
        },
        "seller": {"@id": f"{PRODUCTION}/#organization"},
    }


def homepage_schema() -> list[dict]:
    services = [
        ("National Government Contract Center", "Federal contract intelligence, guided onboarding, matched opportunities, and Analyze Fit support.", "https://ngcc.aproposgroupllc.com"),
        ("National Corporate Contract Exchange", "State and local public-sector contract intelligence across supported procurement markets.", "https://natcorp.aproposgroupllc.com"),
        ("National Enterprise Business Center", "Business readiness, personalized planning, and guided business-development support.", "https://nebc.aproposgroupllc.com"),
        ("Additional Analyze Fit Report", "Additional procurement decision intelligence for a selected opportunity.", f"{PRODUCTION}/campaigns/analyze-fit/"),
    ]
    graph: list[dict] = [
        org_schema(),
        {
            "@type": "WebSite",
            "@id": f"{PRODUCTION}/#website",
            "url": f"{PRODUCTION}/",
            "name": "APROPOS Marketing Marketplace",
            "publisher": {"@id": f"{PRODUCTION}/#organization"},
            "inLanguage": "en-US",
        },
        {
            "@type": "ItemList",
            "name": "Featured APROPOS Programs and Services",
            "itemListElement": [
                {"@type": "ListItem", "position": i, "url": url, "name": name}
                for i, (name, _, url) in enumerate(services, start=1)
            ],
        },
    ]
    graph.extend(service_schema(*service) for service in services)
    graph.extend([
        offer("NGCC Monthly Subscription", "99.00", "https://ngcc.aproposgroupllc.com", "MONTH", True),
        offer("NAT-CORP Monthly Subscription", "119.00", "https://natcorp.aproposgroupllc.com", "MONTH", True),
        offer("NEBC Monthly Subscription", "39.00", "https://nebc.aproposgroupllc.com", "MONTH", True),
        offer("Additional Analyze Fit Report", "15.00", f"{PRODUCTION}/campaigns/analyze-fit/", "EACH", False),
    ])
    return graph


def card(icon: str, title: str, copy: str, href: str, cta: str, track: str, extra: str = "") -> str:
    return f"""
    <article class="card pathway-card">
      <span class="card-icon" aria-hidden="true">{icon}</span>
      <h3>{esc(title)}</h3>
      <p>{esc(copy)}</p>
      {extra}
      <a class="text-link" href="{href}" data-track="{track}">{esc(cta)} <span aria-hidden="true">→</span></a>
    </article>
    """


def product_card(name: str, price: str, copy: str, href: str, label: str, track: str) -> str:
    return f"""
    <article class="card product-card">
      <p class="product-kicker">APROPOS PROGRAM</p>
      <h3>{esc(name)}</h3>
      <p>{esc(copy)}</p>
      <p class="price"><strong>{esc(price)}</strong><span>14-day free trial</span></p>
      <a class="button button-gold button-block" href="{href}" data-track="{track}" data-outbound-product="{esc(label)}">START YOUR 14-DAY FREE TRIAL</a>
      <p class="microcopy">Payment and product terms apply after the trial period.</p>
    </article>
    """


def homepage(hero: str, executive: str) -> str:
    description = "Explore APROPOS business-development programs, government contract intelligence, Analyze Fit services, free trials, proposal support, and partnership opportunities."
    hero_style = f" style=\"--hero-image:url('{hero}')\"" if hero else ""
    executive_markup = ""
    if executive:
        executive_markup = f'<img src="{executive}" width="720" height="720" loading="lazy" alt="APROPOS executive leadership presence">'

    audience_cards = "".join([
        card("01", "Registered Federal Contractor", "Receive personalized federal contract intelligence, guided onboarding, matched opportunities, and Analyze Fit support.", "https://ngcc.aproposgroupllc.com/?utm_source=marketplace&utm_medium=referral&utm_campaign=audience-routing&utm_content=federal-contractor", "EXPLORE NGCC", "audience_ngcc"),
        card("02", "Licensed Contractor", "Receive personalized state and local public-sector contract intelligence across supported procurement markets.", "https://natcorp.aproposgroupllc.com/?utm_source=marketplace&utm_medium=referral&utm_campaign=audience-routing&utm_content=licensed-contractor", "EXPLORE NAT-CORP", "audience_natcorp"),
        card("03", "Business Owner or Entrepreneur", "Begin with business readiness, personalized planning, and guided business-development support.", "https://nebc.aproposgroupllc.com/?utm_source=marketplace&utm_medium=referral&utm_campaign=audience-routing&utm_content=business-owner", "EXPLORE NEBC", "audience_nebc"),
        card("04", "Institution or Partner", "Explore sponsored contractor access, pilot programs, opportunity intelligence, white-label programs, and Community Economic Development partnerships.", "/partners/", "EXPLORE PARTNERSHIP OPPORTUNITIES", "audience_partner"),
        card("05", "APROPOS Event Visitor", "Continue from an APROPOS event, access resources, request a follow-up, or choose the pathway built for your next step.", "/events/las-vegas-business-expo-2026/", "CONTINUE YOUR EVENT JOURNEY", "audience_event"),
    ])

    products = "".join([
        product_card("National Government Contract Center", "$99 / month", "Federal contract intelligence for registered federal contractors.", "https://ngcc.aproposgroupllc.com/?utm_source=marketplace&utm_medium=referral&utm_campaign=free-trial&utm_content=ngcc", "NGCC", "trial_start_ngcc"),
        product_card("National Corporate Contract Exchange", "$119 / month", "State and local public-sector contract intelligence for licensed contractors.", "https://natcorp.aproposgroupllc.com/?utm_source=marketplace&utm_medium=referral&utm_campaign=free-trial&utm_content=natcorp", "NAT-CORP", "trial_start_natcorp"),
        product_card("National Enterprise Business Center", "$39 / month", "Business readiness, planning, and guided development support.", "https://nebc.aproposgroupllc.com/?utm_source=marketplace&utm_medium=referral&utm_campaign=free-trial&utm_content=nebc", "NEBC", "trial_start_nebc"),
    ])

    return page_head(
        "APROPOS Marketing Marketplace | Programs, Services and Opportunity",
        description,
        f"{PRODUCTION}/",
        homepage_schema(),
        "homepage",
    ) + f"""
<main id="main">
  <section class="hero"{hero_style}>
    <div class="hero-overlay"></div>
    <div class="container hero-grid">
      <div class="hero-copy">
        <p class="eyebrow">APROPOS MARKETING MARKETPLACE</p>
        <h1>Explore APROPOS Programs, Services, and Opportunity Pathways</h1>
        <p class="hero-lede">Find the APROPOS service designed for your business, contracting goals, or institutional mission.</p>
        <div class="button-row">
          <a class="button button-gold" href="#current-promotions" data-track="primary_explore_opportunities">EXPLORE CURRENT OPPORTUNITIES</a>
          <a class="button button-outline" href="#audience-pathways" data-track="secondary_find_service">FIND THE RIGHT APROPOS SERVICE</a>
        </div>
        <p class="hero-note">Opportunity Begins Here.</p>
      </div>
      <aside class="hero-panel" aria-label="Choose your pathway">
        <p class="panel-label">Start with your role</p>
        <a href="https://ngcc.aproposgroupllc.com/?utm_source=marketplace&utm_medium=referral&utm_campaign=hero-pathways&utm_content=federal-contractor" data-track="hero_federal">I Am a Registered Federal Contractor <span>→</span></a>
        <a href="https://natcorp.aproposgroupllc.com/?utm_source=marketplace&utm_medium=referral&utm_campaign=hero-pathways&utm_content=licensed-contractor" data-track="hero_licensed">I Am a Licensed Contractor <span>→</span></a>
        <a href="https://nebc.aproposgroupllc.com/?utm_source=marketplace&utm_medium=referral&utm_campaign=hero-pathways&utm_content=business-support" data-track="hero_business">I Need Business Support <span>→</span></a>
        <a href="/partners/" data-track="hero_organization">I Represent an Organization <span>→</span></a>
        <a href="/events/las-vegas-business-expo-2026/" data-track="hero_event">I Am Attending an APROPOS Event <span>→</span></a>
      </aside>
    </div>
  </section>

  <section id="audience-pathways" class="section section-light">
    <div class="container">
      <div class="section-heading"><p class="eyebrow">GUIDED MARKETPLACE</p><h2>Find the APROPOS Service Built for Your Next Step</h2><p>Choose the pathway that reflects your role and immediate objective. Each route leads to the specialized APROPOS platform or program designed for that need.</p></div>
      <div class="grid grid-3 audience-grid">{audience_cards}</div>
    </div>
  </section>

  <section id="featured-programs" class="section section-navy">
    <div class="container">
      <div class="section-heading light"><p class="eyebrow">FEATURED APROPOS PROGRAMS</p><h2>Government Contract Intelligence</h2><p>Purpose-built platforms connect contractors and businesses to the intelligence, readiness, and decision-support pathway aligned with their goals.</p></div>
      <div class="grid grid-3">{products}</div>
    </div>
  </section>

  <section id="current-promotions" class="section section-gold-wash">
    <div class="container split">
      <div><p class="eyebrow">CURRENT PROMOTIONS</p><h2>Begin with a 14-Day Free Trial</h2><p>Explore NGCC, NAT-CORP, or NEBC before the monthly subscription begins. Select the platform aligned with federal contracting, state and local contracting, or business-development needs.</p></div>
      <div class="promotion-list">
        <a href="https://ngcc.aproposgroupllc.com/?utm_source=marketplace&utm_medium=promotion&utm_campaign=current-promotions&utm_content=ngcc" data-track="promotion_ngcc"><strong>NGCC</strong><span>$99 monthly after trial</span><b>Explore →</b></a>
        <a href="https://natcorp.aproposgroupllc.com/?utm_source=marketplace&utm_medium=promotion&utm_campaign=current-promotions&utm_content=natcorp" data-track="promotion_natcorp"><strong>NAT-CORP</strong><span>$119 monthly after trial</span><b>Explore →</b></a>
        <a href="https://nebc.aproposgroupllc.com/?utm_source=marketplace&utm_medium=promotion&utm_campaign=current-promotions&utm_content=nebc" data-track="promotion_nebc"><strong>NEBC</strong><span>$39 monthly after trial</span><b>Explore →</b></a>
      </div>
    </div>
  </section>

  <section id="contract-intelligence" class="section section-light">
    <div class="container split align-center">
      <div class="visual-frame">{executive_markup}<div class="visual-caption"><span>APROPOS GROUP LLC</span><strong>Business-development and procurement intelligence leadership</strong></div></div>
      <div><p class="eyebrow">OPPORTUNITY INTELLIGENCE</p><h2>Government Contract Intelligence Offers</h2><p>APROPOS helps contractors identify opportunities aligned with their capabilities, organize decision intelligence, and move toward informed bid or no-bid action.</p><ul class="check-list"><li>Federal contract intelligence through NGCC</li><li>State and local contract intelligence through NAT-CORP</li><li>Additional Analyze Fit decision support</li><li>Proposal Development review for qualified pursuits</li></ul><a class="button button-navy" href="/campaigns/federal-contract-intelligence/" data-track="contract_intelligence_campaign">EXPLORE CONTRACT INTELLIGENCE</a></div>
    </div>
  </section>

  <section id="business-development" class="section section-slate">
    <div class="container split">
      <div><p class="eyebrow">BUSINESS DEVELOPMENT</p><h2>Business Development and Readiness</h2><p>NEBC provides a structured starting point for entrepreneurs and business owners who need readiness assessment, personalized planning, and guided business-development support.</p><a class="button button-gold" href="https://nebc.aproposgroupllc.com/?utm_source=marketplace&utm_medium=referral&utm_campaign=business-readiness&utm_content=section" data-track="business_readiness_nebc">EXPLORE NEBC</a></div>
      <div class="stat-panel"><div><strong>24/7</strong><span>Online business-center access</span></div><div><strong>1</strong><span>Guided readiness pathway</span></div><div><strong>Clear</strong><span>Next-step recommendations</span></div></div>
    </div>
  </section>

  <section id="analyze-fit" class="section section-light">
    <div class="container feature-band">
      <div><p class="eyebrow">ADDITIONAL DECISION INTELLIGENCE</p><h2>Understand the Opportunity Before You Commit</h2><p>Analyze Fit provides additional procurement decision intelligence for a selected opportunity. The report may identify apparent capability alignment, potential gaps, requirements requiring verification, important questions to investigate, and factors affecting a bid or no-bid decision.</p><p class="disclosure">Analyze Fit does not replace the official solicitation, establish eligibility, or guarantee a contract award.</p></div>
      <aside class="offer-box"><span>Additional Analyze Fit Report</span><strong>$15</strong><small>one-time</small><a class="button button-gold button-block" href="/campaigns/analyze-fit/" data-track="analyze_fit_purchase">PURCHASE AN ADDITIONAL ANALYZE FIT REPORT</a></aside>
    </div>
  </section>

  <section id="concierge" class="section section-navy">
    <div class="container split">
      <div><p class="eyebrow">CONCIERGE CONTRACT SERVICE</p><h2>Stay Informed with Concierge Contract Service</h2><p>A higher-touch opportunity pathway for contractors seeking prioritized matched-contract delivery, decision intelligence, and proposal-development access.</p><a class="button button-gold" href="/concierge-contract-service/" data-track="concierge_inquiry">LEARN ABOUT CONCIERGE CONTRACT SERVICE</a></div>
      <ul class="benefit-grid"><li>VIP Contractor Registry benefits</li><li>Top 10 matched contracts by email</li><li>10 Analyze Fit Reports per month</li><li>Automated matched-contract delivery</li><li>Priority opportunity notifications</li><li>Personalized dashboard intelligence</li><li>Access to Contract Proposal Development</li></ul>
    </div>
  </section>

  <section id="proposal-development" class="section section-light">
    <div class="container split align-center">
      <div><p class="eyebrow">CONTRACT PROPOSAL DEVELOPMENT</p><h2>Prepare to Compete</h2><p>Qualified contractors may request AI-intelligence-driven Contract Proposal Development after identifying an opportunity they intend to pursue.</p><p class="disclosure">Contract Proposal Development is separately scoped and priced.</p><a class="button button-navy" href="/contract-proposal-development/" data-track="proposal_development_inquiry">REQUEST A PROPOSAL DEVELOPMENT REVIEW</a></div>
      <div class="process-list"><span>01 Solicitation review</span><span>02 Requirement extraction</span><span>03 Compliance matrix</span><span>04 Proposal strategy</span><span>05 Narrative support</span><span>06 Final compliance review</span></div>
    </div>
  </section>

  <section id="partnerships" class="section section-gold-wash">
    <div class="container split align-center">
      <div><p class="eyebrow">INSTITUTIONAL PATHWAYS</p><h2>Expand Opportunity Through Partnership</h2><p>Organizations can explore sponsored contractor access, pilot programs, white-label opportunity intelligence, licensing, events, and Community Economic Development collaboration.</p><a class="button button-navy" href="/partners/" data-track="partner_inquiry">EXPLORE PARTNERSHIP OPPORTUNITIES</a></div>
      <div class="partner-types"><span>Economic-development organizations</span><span>Chambers and business centers</span><span>Colleges and universities</span><span>Supplier-development programs</span><span>Municipalities and associations</span><span>Institutional partners</span></div>
    </div>
  </section>

  <section id="events" class="section section-light">
    <div class="container campaign-banner">
      <div><p class="eyebrow">EVENT AND EXPO CAMPAIGNS</p><h2>Continue the Conversation After an APROPOS Event</h2><p>Access event-specific resources, save APROPOS contact information, request a demo, or select the service pathway built for your next step.</p></div>
      <a class="button button-gold" href="/events/las-vegas-business-expo-2026/" data-track="event_campaign_visit">VISIT THE LAS VEGAS BUSINESS EXPO CAMPAIGN</a>
    </div>
  </section>

  <section id="ecosystem" class="section section-slate">
    <div class="container">
      <div class="section-heading"><p class="eyebrow">ONE CONNECTED ECOSYSTEM</p><h2>Explore the APROPOS Ecosystem</h2><p>The marketplace attracts, educates, segments, and routes qualified users. Specialized product platforms deliver the service experience.</p></div>
      <div class="ecosystem-flow"><span>Marketplace Discovery</span><b>→</b><span>Audience Segmentation</span><b>→</b><span>Specialized APROPOS Platform</span><b>→</b><span>Guided Action</span></div>
    </div>
  </section>

  <section id="community" class="section section-community">
    <div class="container narrow center"><p class="eyebrow">COMMUNITY ECONOMIC DEVELOPMENT</p><h2>Opportunity Builds Business. Business Builds Community.</h2><p class="large-copy">Community economic development begins when qualified businesses gain meaningful access to opportunity. APROPOS turns that commitment into action by helping contractors identify government contracts aligned with their capabilities, understand the requirements before bidding, and pursue opportunities with greater clarity.</p><div class="impact-row"><span>Business Growth</span><span>Contractor Participation</span><span>Job Creation</span><span>Workforce Stability</span><span>Stronger Families</span><span>Stronger Communities</span></div></div>
  </section>

  <section id="faq" class="section section-light">
    <div class="container narrow"><div class="section-heading"><p class="eyebrow">FREQUENTLY ASKED QUESTIONS</p><h2>Questions Before You Choose a Pathway</h2></div>
      <div class="faq-list">
        <details><summary>Is APROPOS a government agency?</summary><p>No. APROPOS Group LLC is a private company. APROPOS platforms are not endorsed by SAM.gov or issuing agencies.</p></details>
        <details><summary>Does a match rating or Analyze Fit report guarantee eligibility or an award?</summary><p>No. Match ratings and Analyze Fit provide decision support. Contractors must verify the official solicitation, eligibility, deadlines, and submission requirements. No award is guaranteed.</p></details>
        <details><summary>Which platform should I choose?</summary><p>Registered federal contractors should begin with NGCC. Licensed contractors pursuing state and local opportunities should begin with NAT-CORP. Entrepreneurs and businesses needing readiness support should begin with NEBC.</p></details>
        <details><summary>Is Contract Proposal Development included in the subscription?</summary><p>No. Contract Proposal Development is separately scoped and priced after a qualified opportunity and service need are reviewed.</p></details>
        <details><summary>Can an organization sponsor access or explore a white-label program?</summary><p>Yes. Institutional partners can request information about sponsored access, pilots, licensing, white-label programs, and Community Economic Development collaboration.</p></details>
      </div>
    </div>
  </section>

  <section id="final-cta" class="section final-cta">
    <div class="container narrow center"><p class="eyebrow">YOUR NEXT STEP</p><h2>Opportunity Begins Here.</h2><p>Choose a current program, request institutional information, or continue your APROPOS event journey.</p><div class="button-row center"><a class="button button-gold" href="#audience-pathways" data-track="final_find_service">FIND THE RIGHT APROPOS SERVICE</a><a class="button button-outline" href="/partners/" data-track="final_partner">EXPLORE PARTNERSHIPS</a></div></div>
  </section>
</main>
{footer_html()}
</body>
</html>
"""


def inquiry_form(form_name: str, institutional: bool = False, event: bool = False, proposal: bool = False) -> str:
    if institutional:
        fields = """
        <div class="form-grid"><label>Name<input id="institution-name" name="name" autocomplete="name" required></label><label>Organization<input id="institution-organization" name="organization" autocomplete="organization" required></label></div>
        <div class="form-grid"><label>Title<input id="institution-title" name="title" autocomplete="organization-title" required></label><label>Email<input id="institution-email" name="email" type="email" autocomplete="email" required></label></div>
        <div class="form-grid"><label>Phone<input id="institution-phone" name="phone" type="tel" autocomplete="tel"></label><label>Organization type<select id="institution-type" name="organization_type" required><option value="">Select one</option><option>Economic-development organization</option><option>Chamber or business center</option><option>College or university</option><option>Supplier-development program</option><option>Municipality</option><option>Association</option><option>Other institution</option></select></label></div>
        <div class="form-grid"><label>Partnership interest<select id="partnership-interest" name="partnership_interest" required><option value="">Select one</option><option>Sponsored contractor access</option><option>Pilot program</option><option>White-label program</option><option>Licensing</option><option>Event partnership</option><option>Community Economic Development</option></select></label><label>Estimated contractor population<input id="contractor-population" name="estimated_contractor_population" inputmode="numeric"></label></div>
        <label>Message<textarea id="institution-message" name="message" rows="5" required></textarea></label>
        """
    else:
        extra_options = ""
        if event:
            extra_options = "<option>Event follow-up</option><option>Request a demo</option><option>Opportunity mailing list</option><option>Partnership inquiry</option>"
        if proposal:
            extra_options = "<option>Solicitation review</option><option>Proposal Development review</option><option>Compliance matrix support</option>"
        fields = f"""
        <div class="form-grid"><label>Name<input id="{form_name}-name" name="name" autocomplete="name" required></label><label>Business Name<input id="{form_name}-business" name="business_name" autocomplete="organization" required></label></div>
        <div class="form-grid"><label>Email<input id="{form_name}-email" name="email" type="email" autocomplete="email" required></label><label>Phone <span>(optional)</span><input id="{form_name}-phone" name="phone" type="tel" autocomplete="tel"></label></div>
        <div class="form-grid"><label>Contractor type<select id="{form_name}-contractor" name="contractor_type" required><option value="">Select one</option><option>Registered federal contractor</option><option>Licensed contractor</option><option>Business owner or entrepreneur</option><option>Institutional representative</option></select></label><label>Service interest<select id="{form_name}-service" name="service_interest" required><option value="">Select one</option><option>NGCC</option><option>NAT-CORP</option><option>NEBC</option><option>Analyze Fit</option><option>Concierge Contract Service</option><option>Contract Proposal Development</option>{extra_options}</select></label></div>
        <label>Message<textarea id="{form_name}-message" name="message" rows="5"></textarea></label>
        """
    return f"""
    <form class="lead-form" name="{form_name}" method="POST" action="/thank-you/" data-netlify="true" netlify-honeypot="bot-field" data-track-form="{form_name}">
      <input type="hidden" name="form-name" value="{form_name}">
      <p class="hidden"><label>Do not fill this out: <input name="bot-field"></label></p>
      <input type="hidden" name="utm_source" data-utm-field="utm_source">
      <input type="hidden" name="utm_medium" data-utm-field="utm_medium">
      <input type="hidden" name="utm_campaign" data-utm-field="utm_campaign">
      <input type="hidden" name="utm_content" data-utm-field="utm_content">
      {fields}
      <label class="consent"><input type="checkbox" name="consent" required> I agree that APROPOS Group LLC may contact me about this request.</label>
      <button class="button button-gold" type="submit">SUBMIT REQUEST</button>
    </form>
    """


def generate_subpages() -> None:
    partner_body = f"""
    <section class="section section-light"><div class="container split"><div><p class="eyebrow">INSTITUTIONAL COLLABORATION</p><h2>Expand Opportunity Through Partnership</h2><p>APROPOS works with organizations that serve contractors, businesses, entrepreneurs, and communities. Partnership pathways can align opportunity intelligence with an institution’s existing economic-development, supplier-development, education, or community mission.</p><div class="partner-types"><span>Sponsored contractor access</span><span>Pilot programs</span><span>Opportunity intelligence</span><span>White-label programs</span><span>Licensing</span><span>Event collaboration</span></div></div><aside class="card"><h2>Partnership Inquiry</h2><p>Provide concise information about your organization and the population you serve.</p>{inquiry_form('institutional-partnership-inquiry', institutional=True)}</aside></div></section>
    <section class="section section-community"><div class="container narrow center"><h2>Community Economic Development in Action</h2><p class="large-copy">Community economic development begins when qualified businesses gain meaningful access to opportunity. APROPOS turns that commitment into action by helping contractors identify government contracts aligned with their capabilities, understand the requirements before bidding, and pursue opportunities with greater clarity.</p></div></section>
    """
    write_page(Page(
        "partners",
        "APROPOS Partnership Opportunities | Sponsored Access and White-Label Programs",
        "Explore sponsored contractor access, pilot programs, opportunity intelligence, white-label programs, licensing, and Community Economic Development partnerships.",
        "Partnership Pathways for Institutions and Community Organizations",
        "APROPOS PARTNERSHIPS",
        partner_body,
        [org_schema(), service_schema("APROPOS Institutional Partnership Programs", "Sponsored contractor access, pilot, white-label, licensing, and Community Economic Development partnership pathways.", f"{PRODUCTION}/partners/")],
    ))

    concierge_body = f"""
    <section class="section section-light"><div class="container split"><div><h2>A Higher-Touch Contract Intelligence Pathway</h2><p>Concierge Contract Service is designed for contractors seeking a more proactive flow of matched opportunities and procurement decision intelligence.</p><ul class="check-list"><li>VIP Contractor Registry benefits</li><li>Top 10 matched contracts by email</li><li>10 Analyze Fit Reports per month</li><li>Automated matched-contract delivery</li><li>Priority opportunity notifications</li><li>Personalized dashboard intelligence</li><li>Access to Contract Proposal Development</li></ul><p class="disclosure">Pricing is provided only after service scope and current availability are verified.</p></div><aside class="card"><h2>Request Concierge Information</h2>{inquiry_form('concierge-contract-service-inquiry')}</aside></div></section>
    """
    write_page(Page(
        "concierge-contract-service",
        "Concierge Contract Service | APROPOS Marketing Marketplace",
        "Learn about VIP registry benefits, matched-contract delivery, Analyze Fit reports, priority notifications, and personalized dashboard intelligence.",
        "Stay Informed with Concierge Contract Service",
        "CONCIERGE CONTRACT SERVICE",
        concierge_body,
        [org_schema(), service_schema("Concierge Contract Service", "A higher-touch opportunity intelligence pathway with matched-contract delivery and decision support.", f"{PRODUCTION}/concierge-contract-service/")],
    ))

    proposal_body = f"""
    <section class="section section-light"><div class="container split"><div><h2>AI-Intelligence-Driven Proposal Support</h2><p>Qualified contractors may request Contract Proposal Development after identifying an opportunity they intend to pursue.</p><div class="process-list"><span>Solicitation review</span><span>Requirement extraction</span><span>Compliance matrix</span><span>Proposal strategy</span><span>Technical narrative support</span><span>Management narrative support</span><span>Past-performance positioning</span><span>Quality review</span><span>Final compliance review</span></div><p class="disclosure">Contract Proposal Development is separately scoped and priced. APROPOS does not guarantee eligibility, responsiveness, or award.</p></div><aside class="card"><h2>Request a Proposal Development Review</h2>{inquiry_form('proposal-development-review', proposal=True)}</aside></div></section>
    """
    write_page(Page(
        "contract-proposal-development",
        "Contract Proposal Development | APROPOS Marketing Marketplace",
        "Request a separately scoped proposal-development review with solicitation analysis, requirement extraction, compliance strategy, and narrative support.",
        "Ready to Pursue the Opportunity?",
        "CONTRACT PROPOSAL DEVELOPMENT",
        proposal_body,
        [org_schema(), service_schema("Contract Proposal Development", "Separately scoped proposal-development review and support for qualified contractor pursuits.", f"{PRODUCTION}/contract-proposal-development/")],
    ))

    event_body = f"""
    <section class="section section-light"><div class="container split"><div><h2>Continue Your Opportunity Journey</h2><p>Met APROPOS at the Las Vegas Business Expo? Continue your opportunity journey here.</p><div class="button-stack"><a class="button button-navy" href="/downloads/apropos-government-contract-intelligence-guide.html" download data-track="event_handout_download">DOWNLOAD THE GOVERNMENT CONTRACT HANDOUT</a><a class="button button-outline-dark" href="/downloads/apropos-group.vcf" download data-track="event_vcard_download">SAVE APROPOS CONTACT</a><a class="button button-outline-dark" href="?utm_source=las-vegas-business-expo&utm_medium=nfc&utm_campaign=expo-2026&utm_content=event-page" data-track="event_nfc_access">NFC EVENT ACCESS</a></div><div class="qr-card"><img src="/assets/las-vegas-business-expo-2026-qr.png" width="420" height="420" loading="lazy" alt="QR code for the APROPOS Las Vegas Business Expo campaign page"><p>Scan to reopen this event pathway.</p></div></div><aside class="card"><h2>Request a Follow-Up</h2><p>Request a demo, join the opportunity mailing list, or ask about partnership.</p>{inquiry_form('las-vegas-business-expo-2026-follow-up', event=True)}</aside></div></section>
    <section class="section section-navy"><div class="container"><div class="section-heading light"><h2>Choose Your APROPOS Pathway</h2></div><div class="grid grid-3">
      {card('F', 'Federal Contract Intelligence', 'For registered federal contractors seeking matched federal opportunity intelligence.', 'https://ngcc.aproposgroupllc.com/?utm_source=las-vegas-business-expo&utm_medium=event&utm_campaign=expo-2026&utm_content=ngcc', 'EXPLORE NGCC', 'event_ngcc')}
      {card('S', 'State and Local Opportunities', 'For licensed contractors pursuing state and local public-sector opportunities.', 'https://natcorp.aproposgroupllc.com/?utm_source=las-vegas-business-expo&utm_medium=event&utm_campaign=expo-2026&utm_content=natcorp', 'EXPLORE NAT-CORP', 'event_natcorp')}
      {card('B', 'Business Readiness', 'For entrepreneurs and businesses seeking planning and development support.', 'https://nebc.aproposgroupllc.com/?utm_source=las-vegas-business-expo&utm_medium=event&utm_campaign=expo-2026&utm_content=nebc', 'EXPLORE NEBC', 'event_nebc')}
    </div></div></section>
    """
    write_page(Page(
        "events/las-vegas-business-expo-2026",
        "Las Vegas Business Expo 2026 | APROPOS Event Pathway",
        "Continue your APROPOS opportunity journey after the Las Vegas Business Expo with resources, platform pathways, demos, follow-up, and partnership information.",
        "Met APROPOS at the Las Vegas Business Expo?",
        "LAS VEGAS BUSINESS EXPO 2026",
        event_body,
        [org_schema(), {"@type": "Event", "name": "Las Vegas Business Expo 2026 — APROPOS Campaign", "url": f"{PRODUCTION}/events/las-vegas-business-expo-2026/", "organizer": {"@id": f"{PRODUCTION}/#organization"}, "eventAttendanceMode": "https://schema.org/OfflineEventAttendanceMode", "eventStatus": "https://schema.org/EventScheduled", "description": "APROPOS event follow-up and opportunity pathway campaign."}],
        "event-page",
    ))

    campaigns = [
        ("federal-contract-intelligence", "Federal Contract Intelligence", "Federal opportunity intelligence for registered federal contractors.", "Explore NGCC", "https://ngcc.aproposgroupllc.com/?utm_source=marketplace&utm_medium=campaign&utm_campaign=federal-contract-intelligence&utm_content=primary-cta"),
        ("state-local-contract-opportunities", "State and Local Contract Opportunities", "State and local public-sector opportunity intelligence for licensed contractors.", "Explore NAT-CORP", "https://natcorp.aproposgroupllc.com/?utm_source=marketplace&utm_medium=campaign&utm_campaign=state-local-contract-opportunities&utm_content=primary-cta"),
        ("business-readiness", "Business Readiness", "Readiness assessment, personalized planning, and guided business-development support.", "Explore NEBC", "https://nebc.aproposgroupllc.com/?utm_source=marketplace&utm_medium=campaign&utm_campaign=business-readiness&utm_content=primary-cta"),
        ("analyze-fit", "Analyze Fit", "Additional procurement decision intelligence for a selected opportunity.", "Purchase an Additional Analyze Fit Report", "#campaign-form"),
        ("concierge-contract-service", "Concierge Contract Service", "A higher-touch path for prioritized matched opportunities and decision intelligence.", "Request Concierge Information", "/concierge-contract-service/"),
        ("proposal-development", "Contract Proposal Development", "Separately scoped proposal-development support for qualified pursuits.", "Request a Proposal Development Review", "/contract-proposal-development/"),
        ("community-economic-development", "Community Economic Development", "Connect business opportunity access to contractor participation, jobs, workforce stability, families, and communities.", "Explore Partnership Opportunities", "/partners/"),
        ("institutional-partnerships", "Institutional Partnerships", "Sponsored access, pilots, white-label programs, licensing, and institutional collaboration.", "Explore Partnership Opportunities", "/partners/"),
    ]
    for slug, name, copy, cta, href in campaigns:
        price_block = ""
        disclosure = ""
        if slug == "analyze-fit":
            price_block = '<div class="offer-box inline-offer"><span>Additional Analyze Fit Report</span><strong>$15</strong><small>one-time</small></div>'
            disclosure = '<p class="disclosure">Analyze Fit does not replace the official solicitation, establish eligibility, or guarantee a contract award.</p>'
        elif slug == "proposal-development":
            disclosure = '<p class="disclosure">Contract Proposal Development is separately scoped and priced.</p>'
        body = f"""
        <section class="section section-light"><div class="container narrow center"><p class="large-copy">{esc(copy)}</p>{price_block}{disclosure}<a class="button button-gold" href="{href}" data-track="campaign_primary_{slug}">{esc(cta).upper()}</a></div></section>
        <section id="campaign-form" class="section section-slate"><div class="container narrow"><div class="section-heading"><h2>Request Information</h2><p>Use this concise form to continue the {esc(name)} pathway.</p></div>{inquiry_form('campaign-' + slug)}</div></section>
        """
        write_page(Page(
            f"campaigns/{slug}",
            f"{name} | APROPOS Marketing Marketplace",
            copy,
            name,
            "APROPOS CAMPAIGN",
            body,
            [org_schema(), service_schema(name, copy, f"{PRODUCTION}/campaigns/{slug}/")],
            "campaign-page",
        ))

    thank_you = """
    <section class="section section-light"><div class="container narrow center"><div class="success-mark" aria-hidden="true">✓</div><h2>Your request was received.</h2><p>An APROPOS representative will review the information submitted through the selected pathway.</p><a class="button button-navy" href="/">RETURN TO THE MARKETPLACE</a></div></section>
    """
    write_page(Page(
        "thank-you",
        "Thank You | APROPOS Marketing Marketplace",
        "Thank you for contacting the APROPOS Marketing Marketplace.",
        "Thank You for Connecting with APROPOS",
        "REQUEST RECEIVED",
        thank_you,
        [org_schema()],
    ))


def write_downloads() -> None:
    downloads = ROOT / "downloads"
    downloads.mkdir(exist_ok=True)
    guide = """<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>APROPOS Government Contract Intelligence Guide</title><meta name="robots" content="noindex,follow"><style>body{font-family:Arial,sans-serif;color:#071b34;margin:0}.page{max-width:780px;margin:0 auto;padding:64px}h1{font-size:42px}h2{color:#9a6d13;margin-top:36px}li{margin:10px 0;line-height:1.5}.brand{font-weight:800;letter-spacing:.12em;color:#9a6d13}.note{border-left:5px solid #c9a54d;padding:18px;background:#f6f2e8}@media print{.page{padding:28px}}</style></head><body><main class="page"><p class="brand">APROPOS GROUP LLC</p><h1>Government Contract Intelligence: A Clearer Path to Opportunity</h1><p>APROPOS helps contractors identify opportunity pathways, understand requirements before bidding, and make more informed pursuit decisions.</p><h2>Choose the right pathway</h2><ul><li><strong>NGCC:</strong> federal contract intelligence for registered federal contractors.</li><li><strong>NAT-CORP:</strong> state and local public-sector contract intelligence for licensed contractors.</li><li><strong>NEBC:</strong> business readiness, planning, and guided development support.</li></ul><h2>Use decision intelligence responsibly</h2><p>Review the official solicitation. Verify eligibility, deadlines, instructions, required forms, and submission method. Match ratings and Analyze Fit provide decision support; they do not establish eligibility or guarantee award.</p><div class="note"><strong>Opportunity Begins Here.</strong><br>Visit marketplace.aproposgroupllc.com to select your APROPOS pathway.</div><h2>Community Economic Development</h2><p>Meaningful access to opportunity can strengthen businesses, contractor participation, jobs, workforce stability, families, and communities.</p><p><small>Operated by APROPOS Group LLC. APROPOS is not a government agency and is not endorsed by SAM.gov or issuing agencies.</small></p></main></body></html>"""
    (downloads / "apropos-government-contract-intelligence-guide.html").write_text(guide, encoding="utf-8")
    vcard = """BEGIN:VCARD
VERSION:3.0
FN:APROPOS Group LLC
ORG:APROPOS Group LLC
TITLE:Business Development and Procurement Intelligence
URL:https://marketplace.aproposgroupllc.com
NOTE:Opportunity Begins Here. Explore APROPOS programs, services, promotions, and partnership pathways.
END:VCARD
"""
    (downloads / "apropos-group.vcf").write_text(vcard, encoding="utf-8")


def write_qr() -> None:
    url = f"{PRODUCTION}/events/las-vegas-business-expo-2026/?utm_source=las-vegas-business-expo&utm_medium=qr&utm_campaign=expo-2026&utm_content=event-page"
    qr = qrcode.QRCode(version=None, error_correction=qrcode.constants.ERROR_CORRECT_Q, box_size=12, border=3)
    qr.add_data(url)
    qr.make(fit=True)
    img = qr.make_image(fill_color="#061a33", back_color="#ffffff").convert("RGB")
    img.save(ROOT / "assets" / "las-vegas-business-expo-2026-qr.png", "PNG", optimize=True)


def write_css() -> None:
    css = r"""
:root{--navy:#061a33;--navy-2:#0b2b4d;--slate:#eef2f5;--gold:#c9a54d;--gold-dark:#8f681a;--cream:#faf7ef;--ink:#132238;--muted:#5c6878;--white:#fff;--line:#d9e0e7;--shadow:0 18px 50px rgba(4,24,49,.12);--radius:20px;--max:1200px}
*{box-sizing:border-box}html{scroll-behavior:smooth}body{margin:0;font-family:Inter,ui-sans-serif,system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;color:var(--ink);background:#fff;line-height:1.65}img{max-width:100%;height:auto;display:block}a{color:inherit}button,input,select,textarea{font:inherit}.container{width:min(calc(100% - 40px),var(--max));margin-inline:auto}.narrow{max-width:840px}.center{text-align:center}.hidden{position:absolute!important;left:-10000px!important}.sr-only{position:absolute;width:1px;height:1px;padding:0;margin:-1px;overflow:hidden;clip:rect(0,0,0,0);white-space:nowrap;border:0}.skip-link{position:fixed;left:16px;top:-80px;background:#fff;color:var(--navy);padding:12px 18px;z-index:999;border-radius:8px}.skip-link:focus{top:16px}.site-header{position:sticky;top:0;z-index:100;background:rgba(6,26,51,.97);color:#fff;border-bottom:1px solid rgba(255,255,255,.1);backdrop-filter:blur(14px)}.nav-shell{min-height:76px;display:flex;align-items:center;justify-content:space-between;gap:28px}.brand{display:flex;align-items:center;gap:12px;text-decoration:none}.brand-mark{width:42px;height:42px;display:grid;place-items:center;border:1px solid var(--gold);color:var(--gold);font-family:Georgia,serif;font-size:27px}.brand strong{display:block;letter-spacing:.15em;font-size:.9rem}.brand small{display:block;color:#d9e0e8;font-size:.72rem}.primary-nav{display:flex;align-items:center;gap:24px}.primary-nav a{text-decoration:none;font-size:.85rem;font-weight:700;letter-spacing:.04em}.primary-nav a:hover,.primary-nav a:focus-visible{color:#efd88c}.nav-toggle{display:none;background:none;border:0;padding:8px}.nav-toggle span:not(.sr-only){display:block;width:26px;height:2px;background:white;margin:5px}.hero{position:relative;min-height:720px;display:flex;align-items:center;color:white;background-image:linear-gradient(90deg,rgba(3,18,38,.95) 0%,rgba(3,18,38,.82) 47%,rgba(3,18,38,.34) 100%),var(--hero-image);background-size:cover;background-position:center}.hero-overlay{position:absolute;inset:0;background:linear-gradient(180deg,transparent 55%,rgba(3,18,38,.38))}.hero-grid{position:relative;display:grid;grid-template-columns:1.25fr .75fr;gap:70px;align-items:center;padding-block:90px}.hero-copy h1{font-family:Georgia,"Times New Roman",serif;font-size:clamp(2.8rem,5vw,5rem);line-height:1.04;margin:.2em 0}.hero-lede{font-size:1.28rem;max-width:710px;color:#e9edf3}.hero-note{color:#efd88c;font-family:Georgia,serif;font-style:italic;font-size:1.25rem}.eyebrow{color:var(--gold-dark);font-size:.76rem;font-weight:900;letter-spacing:.17em;text-transform:uppercase;margin:0 0 14px}.hero .eyebrow,.section-navy .eyebrow,.section-community .eyebrow,.final-cta .eyebrow,.page-hero .eyebrow{color:#efd88c}.button-row{display:flex;flex-wrap:wrap;gap:14px;margin:30px 0}.button-row.center{justify-content:center}.button{display:inline-flex;justify-content:center;align-items:center;min-height:50px;padding:12px 22px;border-radius:8px;text-decoration:none;font-weight:900;letter-spacing:.04em;font-size:.82rem;border:2px solid transparent;transition:.2s ease;cursor:pointer}.button:hover{transform:translateY(-2px)}.button:focus-visible,.text-link:focus-visible,.primary-nav a:focus-visible,.promotion-list a:focus-visible{outline:3px solid #f1cf6e;outline-offset:3px}.button-gold{background:var(--gold);color:#061a33}.button-navy{background:var(--navy);color:#fff}.button-outline{border-color:rgba(255,255,255,.72);color:#fff}.button-outline-dark{border-color:var(--navy);color:var(--navy)}.button-block{width:100%}.hero-panel{background:rgba(6,26,51,.86);border:1px solid rgba(239,216,140,.35);padding:28px;border-radius:18px;box-shadow:var(--shadow)}.hero-panel .panel-label{color:#efd88c;font-size:.75rem;font-weight:900;letter-spacing:.15em;text-transform:uppercase}.hero-panel a{display:flex;justify-content:space-between;gap:20px;padding:15px 0;border-bottom:1px solid rgba(255,255,255,.13);text-decoration:none;font-weight:700}.hero-panel a:last-child{border:0}.hero-panel a:hover{color:#efd88c}.section{padding:96px 0}.section-light{background:#fff}.section-navy{background:var(--navy);color:#fff}.section-slate{background:var(--slate)}.section-gold-wash{background:var(--cream)}.section-community{background:linear-gradient(135deg,#071d38,#0b315a);color:#fff}.section-heading{max-width:760px;margin-bottom:42px}.section-heading h2,.split h2,.feature-band h2,.campaign-banner h2,.page-hero h1{font-family:Georgia,"Times New Roman",serif;font-size:clamp(2rem,4vw,3.45rem);line-height:1.12;margin:.15em 0}.section-heading p{color:var(--muted)}.section-heading.light p{color:#d7e0e9}.grid{display:grid;gap:24px}.grid-3{grid-template-columns:repeat(3,1fr)}.audience-grid .card:last-child{grid-column:2/3}.card{background:#fff;border:1px solid var(--line);border-radius:var(--radius);padding:30px;box-shadow:0 10px 35px rgba(8,29,53,.07);color:var(--ink)}.card h3{font-family:Georgia,serif;font-size:1.5rem;margin:.4em 0}.card-icon{display:inline-grid;place-items:center;width:48px;height:48px;border-radius:50%;background:var(--navy);color:#efd88c;font-weight:900}.text-link{display:inline-flex;gap:8px;color:var(--gold-dark);font-weight:900;text-decoration:none;margin-top:10px}.product-card{display:flex;flex-direction:column}.product-card p:nth-of-type(2){flex:1}.product-kicker{font-size:.72rem;color:var(--gold-dark);letter-spacing:.14em;font-weight:900}.price{display:flex;justify-content:space-between;align-items:end;border-top:1px solid var(--line);padding-top:20px}.price strong{font-size:1.6rem}.price span{font-size:.82rem;color:var(--muted)}.microcopy{font-size:.72rem;color:var(--muted);margin-bottom:0}.split{display:grid;grid-template-columns:1fr 1fr;gap:72px}.align-center{align-items:center}.promotion-list{display:grid;gap:12px}.promotion-list a{display:grid;grid-template-columns:1fr 1fr auto;gap:16px;align-items:center;background:#fff;padding:18px 20px;text-decoration:none;border:1px solid #eadfbd;border-radius:12px}.promotion-list a b{color:var(--gold-dark)}.visual-frame{position:relative;background:var(--navy);min-height:420px;border-radius:var(--radius);overflow:hidden}.visual-frame img{width:100%;height:520px;object-fit:cover}.visual-caption{position:absolute;left:20px;right:20px;bottom:20px;background:rgba(6,26,51,.9);color:#fff;padding:18px;border-left:5px solid var(--gold)}.visual-caption span{display:block;color:#efd88c;font-size:.72rem;letter-spacing:.13em}.visual-caption strong{display:block}.check-list{list-style:none;padding:0}.check-list li{position:relative;padding:8px 0 8px 32px}.check-list li:before{content:"✓";position:absolute;left:0;color:var(--gold-dark);font-weight:900}.stat-panel{display:grid;grid-template-columns:repeat(3,1fr);background:#fff;border-radius:var(--radius);padding:26px;box-shadow:var(--shadow)}.stat-panel div{text-align:center;padding:20px;border-right:1px solid var(--line)}.stat-panel div:last-child{border:0}.stat-panel strong{display:block;color:var(--navy);font-size:2.1rem;font-family:Georgia,serif}.stat-panel span{font-size:.8rem;color:var(--muted)}.feature-band{display:grid;grid-template-columns:1fr 330px;gap:60px;align-items:center}.offer-box{background:var(--navy);color:#fff;padding:30px;border-radius:var(--radius);text-align:center}.offer-box span,.offer-box small{display:block}.offer-box strong{display:block;font-family:Georgia,serif;font-size:4.2rem;color:#efd88c;line-height:1.2}.inline-offer{max-width:360px;margin:30px auto}.disclosure{font-size:.88rem;color:var(--muted);padding:16px;border-left:4px solid var(--gold);background:#f7f4ea}.section-navy .disclosure{color:#d8e1e9;background:rgba(255,255,255,.07)}.benefit-grid{list-style:none;margin:0;padding:0;display:grid;grid-template-columns:1fr 1fr;gap:12px}.benefit-grid li,.partner-types span{background:rgba(255,255,255,.08);border:1px solid rgba(255,255,255,.14);padding:16px;border-radius:10px}.process-list{display:grid;grid-template-columns:1fr 1fr;gap:12px}.process-list span{padding:17px;background:var(--slate);border-left:4px solid var(--gold);font-weight:700}.partner-types{display:grid;grid-template-columns:1fr 1fr;gap:12px}.section-gold-wash .partner-types span{background:#fff;border:1px solid #e7d8ae}.campaign-banner{display:flex;align-items:center;justify-content:space-between;gap:40px;padding:44px;border-radius:var(--radius);background:var(--navy);color:#fff}.campaign-banner .eyebrow{color:#efd88c}.ecosystem-flow{display:flex;align-items:center;justify-content:space-between;gap:12px}.ecosystem-flow span{background:#fff;border:1px solid var(--line);padding:18px;border-radius:12px;text-align:center;font-weight:800;flex:1}.ecosystem-flow b{color:var(--gold-dark);font-size:1.6rem}.large-copy{font-size:1.2rem;line-height:1.8}.impact-row{display:flex;flex-wrap:wrap;justify-content:center;gap:10px;margin-top:30px}.impact-row span{border:1px solid rgba(255,255,255,.25);padding:10px 14px;border-radius:999px}.faq-list details{border-top:1px solid var(--line);padding:20px 0}.faq-list summary{cursor:pointer;font-weight:900;font-size:1.08rem}.faq-list details p{color:var(--muted)}.final-cta{background:var(--navy);color:#fff}.site-footer{background:#031226;color:#d7e0e8;padding:70px 0 20px}.footer-grid{display:grid;grid-template-columns:2fr 1fr 1fr;gap:50px}.footer-grid h2{font-size:1rem;color:#efd88c}.footer-grid a{display:block;text-decoration:none;margin:8px 0}.footer-bottom{margin-top:45px;padding-top:18px;border-top:1px solid rgba(255,255,255,.12);display:flex;justify-content:space-between;font-size:.8rem}.page-hero{background:linear-gradient(135deg,#071a33,#0c345d);color:#fff}.compact-hero{padding:110px 0 90px}.compact-hero p:last-child{font-size:1.15rem;color:#dce5ed}.lead-form{display:grid;gap:18px}.form-grid{display:grid;grid-template-columns:1fr 1fr;gap:16px}.lead-form label{display:grid;gap:7px;font-weight:800;font-size:.88rem}.lead-form label span{font-weight:500;color:var(--muted)}.lead-form input,.lead-form select,.lead-form textarea{width:100%;border:1px solid #bfc9d4;border-radius:8px;padding:12px;background:#fff;color:var(--ink)}.lead-form input:focus,.lead-form select:focus,.lead-form textarea:focus{outline:3px solid rgba(201,165,77,.4);border-color:var(--gold-dark)}.consent{grid-template-columns:auto 1fr!important;align-items:start;font-weight:500!important}.consent input{width:auto}.button-stack{display:grid;gap:12px;margin:26px 0}.qr-card{max-width:270px;margin-top:30px}.qr-card img{border:10px solid #fff;box-shadow:var(--shadow)}.success-mark{width:80px;height:80px;display:grid;place-items:center;margin:0 auto 20px;border-radius:50%;background:var(--navy);color:#efd88c;font-size:2rem}
@media (max-width:960px){.primary-nav{position:absolute;left:0;right:0;top:76px;background:var(--navy);display:none;flex-direction:column;align-items:stretch;padding:20px 28px}.primary-nav.open{display:flex}.nav-toggle{display:block}.hero-grid,.split,.feature-band{grid-template-columns:1fr}.hero{min-height:auto}.hero-grid{gap:36px}.grid-3{grid-template-columns:1fr 1fr}.audience-grid .card:last-child{grid-column:auto}.campaign-banner{display:block}.campaign-banner .button{margin-top:20px}.ecosystem-flow{display:grid;grid-template-columns:1fr}.ecosystem-flow b{transform:rotate(90deg)}.footer-grid{grid-template-columns:1fr 1fr}.visual-frame{max-width:680px}.promotion-list a{grid-template-columns:1fr auto}.promotion-list a span{grid-row:2}.stat-panel{grid-template-columns:1fr}.stat-panel div{border-right:0;border-bottom:1px solid var(--line)}}
@media (max-width:640px){.container{width:min(calc(100% - 28px),var(--max))}.section{padding:70px 0}.hero-grid{padding-block:64px}.hero-copy h1{font-size:2.65rem}.grid-3,.form-grid,.benefit-grid,.process-list,.partner-types,.footer-grid{grid-template-columns:1fr}.button{width:100%}.promotion-list a{grid-template-columns:1fr}.stat-panel{padding:14px}.visual-frame img{height:420px}.feature-band{gap:30px}.ecosystem-flow b{display:none}.footer-bottom{display:grid;gap:10px}.compact-hero{padding:80px 0 70px}.section-heading h2,.split h2,.feature-band h2,.campaign-banner h2,.page-hero h1{font-size:2.35rem}}
@media (prefers-reduced-motion:reduce){*{scroll-behavior:auto!important;transition:none!important}}
"""
    (ROOT / "assets" / "styles.css").write_text(css.strip() + "\n", encoding="utf-8")


def write_js() -> None:
    js = r"""
(() => {
  'use strict';
  const allowedUtm = ['utm_source','utm_medium','utm_campaign','utm_content'];
  const params = new URLSearchParams(window.location.search);
  const stored = JSON.parse(sessionStorage.getItem('apropos_campaign') || '{}');
  allowedUtm.forEach((key) => { if (params.get(key)) stored[key] = params.get(key); });
  sessionStorage.setItem('apropos_campaign', JSON.stringify(stored));

  window.dataLayer = window.dataLayer || [];
  window.aproposAnalytics = window.aproposAnalytics || {
    track(event, detail = {}) {
      const payload = { event, page_path: location.pathname, ...stored, ...detail };
      window.dataLayer.push(payload);
      window.dispatchEvent(new CustomEvent('apropos:analytics', { detail: payload }));
      return payload;
    }
  };

  const seen = localStorage.getItem('apropos_marketplace_seen');
  window.aproposAnalytics.track(seen ? 'returning_visitor' : 'first_time_visitor');
  localStorage.setItem('apropos_marketplace_seen', new Date().toISOString());

  const medium = stored.utm_medium || params.get('utm_medium');
  if (medium === 'qr') window.aproposAnalytics.track('qr_traffic');
  if (medium === 'nfc') window.aproposAnalytics.track('nfc_traffic');
  if (document.body.classList.contains('event-page')) window.aproposAnalytics.track('event_page_visit');

  document.querySelectorAll('[data-track]').forEach((element) => {
    element.addEventListener('click', () => {
      const href = element.getAttribute('href') || '';
      const outbound = /^https?:\/\//.test(href) && !href.startsWith(location.origin);
      window.aproposAnalytics.track(element.dataset.track, {
        link_url: href,
        link_text: element.textContent.trim().replace(/\s+/g, ' '),
        outbound
      });
      if (outbound) window.aproposAnalytics.track('outbound_platform_click', { link_url: href });
    });
  });

  document.querySelectorAll('form[data-track-form]').forEach((form) => {
    allowedUtm.forEach((key) => {
      const field = form.querySelector(`[data-utm-field="${key}"]`);
      if (field) field.value = stored[key] || '';
    });
    form.addEventListener('submit', () => window.aproposAnalytics.track('form_completion', { form_name: form.dataset.trackForm }));
  });

  const navToggle = document.querySelector('[data-nav-toggle]');
  const nav = document.querySelector('[data-primary-nav]');
  if (navToggle && nav) {
    navToggle.addEventListener('click', () => {
      const open = nav.classList.toggle('open');
      navToggle.setAttribute('aria-expanded', String(open));
    });
  }
  document.querySelectorAll('[data-current-year]').forEach((el) => { el.textContent = String(new Date().getFullYear()); });
})();
"""
    (ROOT / "assets" / "site.js").write_text(js.strip() + "\n", encoding="utf-8")


def write_robots_sitemap_redirects() -> None:
    paths = [
        "/",
        "/partners/",
        "/concierge-contract-service/",
        "/contract-proposal-development/",
        "/events/las-vegas-business-expo-2026/",
        "/campaigns/federal-contract-intelligence/",
        "/campaigns/state-local-contract-opportunities/",
        "/campaigns/business-readiness/",
        "/campaigns/analyze-fit/",
        "/campaigns/concierge-contract-service/",
        "/campaigns/proposal-development/",
        "/campaigns/community-economic-development/",
        "/campaigns/institutional-partnerships/",
    ]
    sitemap = ['<?xml version="1.0" encoding="UTF-8"?>', '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">']
    for path in paths:
        priority = "1.0" if path == "/" else "0.8"
        sitemap.append(f"  <url><loc>{PRODUCTION}{path}</loc><changefreq>weekly</changefreq><priority>{priority}</priority></url>")
    sitemap.append("</urlset>")
    (ROOT / "sitemap.xml").write_text("\n".join(sitemap) + "\n", encoding="utf-8")
    (ROOT / "robots.txt").write_text(f"User-agent: *\nAllow: /\n\nSitemap: {PRODUCTION}/sitemap.xml\n", encoding="utf-8")
    (ROOT / "_redirects").write_text("/legacy /legacy/ 301\n/events/las-vegas-business-expo /events/las-vegas-business-expo-2026/ 301\n", encoding="utf-8")
    netlify = """[build]\n  publish = \".\"\n\n[[headers]]\n  for = \"/*\"\n  [headers.values]\n    X-Content-Type-Options = \"nosniff\"\n    Referrer-Policy = \"strict-origin-when-cross-origin\"\n    Permissions-Policy = \"camera=(), microphone=(), geolocation=()\"\n\n[[headers]]\n  for = \"/assets/*\"\n  [headers.values]\n    Cache-Control = \"public, max-age=31536000, immutable\"\n"""
    (ROOT / "netlify.toml").write_text(netlify, encoding="utf-8")


def write_404() -> None:
    body = """
    <section class="section section-light"><div class="container narrow center"><h2>This marketplace pathway was not found.</h2><p>Return to the APROPOS Marketing Marketplace and choose the service, campaign, event, or partnership pathway built for your next step.</p><a class="button button-navy" href="/">RETURN TO THE MARKETPLACE</a></div></section>
    """
    page = Page("404", "Page Not Found | APROPOS Marketing Marketplace", "Return to the APROPOS Marketing Marketplace.", "Page Not Found", "APROPOS MARKETPLACE", body, [org_schema()])
    canonical = f"{PRODUCTION}/404.html"
    html = page_head(page.title, page.description, canonical, page.schema) + f'<main id="main"><section class="page-hero compact-hero"><div class="container narrow"><p class="eyebrow">{page.eyebrow}</p><h1>{page.h1}</h1></div></section>{body}</main>{footer_html()}</body></html>'
    (ROOT / "404.html").write_text(html, encoding="utf-8")


def main() -> None:
    assets = ROOT / "assets"
    assets.mkdir(exist_ok=True)
    preserved = save_legacy_and_extract_assets()
    write_css()
    write_js()
    (ROOT / "index.html").write_text(homepage(preserved["hero"], preserved["executive"]), encoding="utf-8")
    generate_subpages()
    write_downloads()
    write_qr()
    write_robots_sitemap_redirects()
    write_404()
    print(json.dumps({"status": "implemented", "branch": BRANCH, "preservation": preserved}, indent=2))


if __name__ == "__main__":
    main()
