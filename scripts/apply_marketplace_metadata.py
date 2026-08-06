from __future__ import annotations

import base64
import html
import io
import json
import re
from datetime import date
from pathlib import Path

from PIL import Image, ImageDraw, ImageEnhance, ImageFont

ROOT = Path(__file__).resolve().parents[1]
INDEX = ROOT / "index.html"
OG_IMAGE = ROOT / "og-marketplace.jpg"
VALIDATION = ROOT / "validation"

TITLE = "APROPOS Marketing Marketplace | Programs, Services and Opportunity"
DESCRIPTION = (
    "Explore APROPOS business-development programs, government contract intelligence, "
    "Analyze Fit services, free trials, proposal support, and partnership opportunities."
)
CANONICAL = "https://marketplace.aproposgroupllc.com/"
ROBOTS = "index,follow,max-image-preview:large,max-snippet:-1,max-video-preview:-1"
PRIMARY_MESSAGE = "Explore APROPOS programs, services, campaigns, and opportunity pathways."


def schema_graph() -> dict:
    organization_id = f"{CANONICAL}#organization"
    website_id = f"{CANONICAL}#website"
    return {
        "@context": "https://schema.org",
        "@graph": [
            {
                "@type": "Organization",
                "@id": organization_id,
                "name": "APROPOS Group LLC",
                "url": "https://aproposgroupllc.com/",
                "image": f"{CANONICAL}og-marketplace.jpg",
                "description": "APROPOS Group LLC develops business-development programs, government contract intelligence, proposal support, campaigns, and institutional partnership pathways.",
            },
            {
                "@type": "WebSite",
                "@id": website_id,
                "url": CANONICAL,
                "name": "APROPOS Marketing Marketplace",
                "publisher": {"@id": organization_id},
                "description": DESCRIPTION,
            },
            {
                "@type": "ItemList",
                "name": "APROPOS Product Pathways",
                "itemListOrder": "https://schema.org/ItemListOrderAscending",
                "numberOfItems": 3,
                "itemListElement": [
                    {
                        "@type": "ListItem",
                        "position": 1,
                        "name": "National Government Contract Center",
                        "url": "https://ngcc.aproposgroupllc.com/",
                    },
                    {
                        "@type": "ListItem",
                        "position": 2,
                        "name": "NAT-CORP Contract Exchange",
                        "url": "https://natcorp.aproposgroupllc.com/",
                    },
                    {
                        "@type": "ListItem",
                        "position": 3,
                        "name": "National Enterprise Business Center",
                        "url": "https://nebc.aproposgroupllc.com/",
                    },
                ],
            },
            {
                "@type": "Service",
                "name": "National Government Contract Center",
                "alternateName": "NGCC",
                "url": "https://ngcc.aproposgroupllc.com/",
                "provider": {"@id": organization_id},
                "description": "Government contract intelligence with a 14-day free trial followed by a $99 monthly subscription.",
                "offers": {
                    "@type": "Offer",
                    "name": "NGCC Monthly Subscription",
                    "url": "https://ngcc.aproposgroupllc.com/",
                    "price": "99.00",
                    "priceCurrency": "USD",
                    "category": "Monthly subscription",
                    "description": "14-day free trial, then $99 per month.",
                    "availability": "https://schema.org/InStock",
                },
            },
            {
                "@type": "Service",
                "name": "NAT-CORP Contract Exchange",
                "alternateName": "NAT-CORP",
                "url": "https://natcorp.aproposgroupllc.com/",
                "provider": {"@id": organization_id},
                "description": "Contractor opportunity access with a 14-day free trial followed by a $119 monthly subscription.",
                "offers": {
                    "@type": "Offer",
                    "name": "NAT-CORP Monthly Subscription",
                    "url": "https://natcorp.aproposgroupllc.com/",
                    "price": "119.00",
                    "priceCurrency": "USD",
                    "category": "Monthly subscription",
                    "description": "14-day free trial, then $119 per month.",
                    "availability": "https://schema.org/InStock",
                },
            },
            {
                "@type": "Service",
                "name": "National Enterprise Business Center",
                "alternateName": "NEBC",
                "url": "https://nebc.aproposgroupllc.com/",
                "provider": {"@id": organization_id},
                "description": "Business-development and readiness services with a 14-day free trial followed by a $39 monthly subscription.",
                "offers": {
                    "@type": "Offer",
                    "name": "NEBC Monthly Subscription",
                    "url": "https://nebc.aproposgroupllc.com/",
                    "price": "39.00",
                    "priceCurrency": "USD",
                    "category": "Monthly subscription",
                    "description": "14-day free trial, then $39 per month.",
                    "availability": "https://schema.org/InStock",
                },
            },
            {
                "@type": "Service",
                "name": "Additional Analyze Fit Report",
                "url": f"{CANONICAL}#verified-offers",
                "provider": {"@id": organization_id},
                "description": "An additional one-time opportunity-fit analysis report.",
                "offers": {
                    "@type": "Offer",
                    "name": "Additional Analyze Fit Report",
                    "price": "15.00",
                    "priceCurrency": "USD",
                    "category": "One-time service",
                    "description": "$15 one-time.",
                    "availability": "https://schema.org/InStock",
                },
            },
            {
                "@type": "Service",
                "name": "Concierge Contract Service",
                "url": f"{CANONICAL}#verified-offers",
                "provider": {"@id": organization_id},
                "description": "Concierge Contract Service pricing will be announced after final service scope and operating-cost validation.",
            },
        ],
    }


def metadata_block() -> str:
    structured_data = json.dumps(schema_graph(), ensure_ascii=False, separators=(",", ":"))
    return f'''<!-- APROPOS_METADATA_CORRECTION_START -->
<title>{TITLE}</title>
<meta name="description" content="{DESCRIPTION}">
<link rel="canonical" href="{CANONICAL}">
<meta name="robots" content="{ROBOTS}">
<meta property="og:type" content="website">
<meta property="og:site_name" content="APROPOS Marketing Marketplace">
<meta property="og:title" content="{TITLE}">
<meta property="og:description" content="Explore APROPOS programs, government contract intelligence, business-development services, free trials, Analyze Fit, and partnership pathways.">
<meta property="og:url" content="{CANONICAL}">
<meta property="og:image" content="{CANONICAL}og-marketplace.jpg">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta property="og:image:alt" content="APROPOS Marketing Marketplace programs and opportunity pathways">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="{TITLE}">
<meta name="twitter:description" content="Explore APROPOS products, free trials, Analyze Fit, proposal support, campaigns, and partnership opportunities.">
<meta name="twitter:image" content="{CANONICAL}og-marketplace.jpg">
<script type="application/ld+json">{structured_data}</script>
<!-- APROPOS_METADATA_CORRECTION_END -->'''


def remove_existing_metadata(head: str) -> str:
    head = re.sub(
        r"\s*<!-- APROPOS_METADATA_CORRECTION_START -->.*?<!-- APROPOS_METADATA_CORRECTION_END -->\s*",
        "\n",
        head,
        flags=re.I | re.S,
    )
    patterns = [
        r"\s*<title\b[^>]*>.*?</title>\s*",
        r"\s*<meta\b(?=[^>]*\bname\s*=\s*['\"]description['\"])[^>]*?/?>\s*",
        r"\s*<link\b(?=[^>]*\brel\s*=\s*['\"]canonical['\"])[^>]*?/?>\s*",
        r"\s*<meta\b(?=[^>]*\bname\s*=\s*['\"]robots['\"])[^>]*?/?>\s*",
        r"\s*<meta\b(?=[^>]*\bproperty\s*=\s*['\"]og:[^'\"]+['\"])[^>]*?/?>\s*",
        r"\s*<meta\b(?=[^>]*\bname\s*=\s*['\"]twitter:[^'\"]+['\"])[^>]*?/?>\s*",
        r"\s*<script\b(?=[^>]*\btype\s*=\s*['\"]application/ld\+json['\"])[^>]*>.*?</script>\s*",
    ]
    for pattern in patterns:
        head = re.sub(pattern, "\n", head, flags=re.I | re.S)
    return head


def offer_styles() -> str:
    return '''
/* APROPOS_VERIFIED_OFFERS_STYLES_START */
.marketplace-positioning-correction{max-width:760px;margin:1rem 0 0;color:var(--silver);font-size:1.05rem;}
.marketplace-offer-verification{padding:5rem 2rem;background:var(--paper,#fbfcfd);color:var(--paper-ink,#182238);border-top:1px solid var(--paper-line,rgba(14,29,54,.14));}
.marketplace-offer-shell{max-width:1180px;margin:0 auto;}
.marketplace-offer-shell h2{font-family:var(--disp,serif);font-size:clamp(2rem,4vw,3.25rem);line-height:1.05;margin-bottom:1rem;color:var(--paper-ink,#182238);}
.marketplace-offer-intro{max-width:760px;color:var(--paper-muted,#4d5b74);margin-bottom:2rem;}
.marketplace-offer-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:1rem;}
.marketplace-offer-card{background:#fff;border:1px solid var(--paper-line,rgba(14,29,54,.14));padding:1.5rem;display:flex;flex-direction:column;min-height:230px;box-shadow:0 10px 30px rgba(14,29,54,.06);}
.marketplace-offer-card h3{font-family:var(--disp,serif);font-size:1.55rem;line-height:1.15;color:var(--paper-ink,#182238);margin-bottom:.75rem;}
.marketplace-offer-card p{color:var(--paper-muted,#4d5b74);}
.marketplace-offer-price{font-weight:700;color:var(--paper-ink,#182238)!important;margin:.35rem 0 1rem;}
.marketplace-offer-card .btn-gold,.marketplace-offer-card .btn-navy{margin-top:auto;align-self:flex-start;}
@media(max-width:900px){.marketplace-offer-grid{grid-template-columns:repeat(2,minmax(0,1fr));}}
@media(max-width:620px){.marketplace-offer-verification{padding:3.5rem 1.2rem}.marketplace-offer-grid{grid-template-columns:1fr}.marketplace-offer-card{min-height:0}}
/* APROPOS_VERIFIED_OFFERS_STYLES_END */
'''


def offer_section() -> str:
    return '''<!-- APROPOS_VERIFIED_OFFERS_START -->
<section id="verified-offers" class="marketplace-offer-verification" aria-labelledby="verified-offers-heading">
  <div class="marketplace-offer-shell">
    <p class="eyebrow">CURRENT APROPOS OFFERS</p>
    <h2 id="verified-offers-heading">Programs, Services and Opportunity Pathways</h2>
    <p class="marketplace-offer-intro">Explore APROPOS programs, services, campaigns, and opportunity pathways. Subscription programs begin with a 14-day free trial.</p>
    <div class="marketplace-offer-grid">
      <article class="marketplace-offer-card">
        <h3>National Government Contract Center</h3>
        <p>Government contract intelligence and opportunity access.</p>
        <p class="marketplace-offer-price">NGCC — 14-day free trial, then $99/month</p>
        <a class="btn-gold" data-trial-cta="ngcc" href="https://ngcc.aproposgroupllc.com/">Start 14-Day Free Trial</a>
      </article>
      <article class="marketplace-offer-card">
        <h3>NAT-CORP Contract Exchange</h3>
        <p>Contract opportunity access and contractor pathways.</p>
        <p class="marketplace-offer-price">NAT-CORP — 14-day free trial, then $119/month</p>
        <a class="btn-gold" data-trial-cta="natcorp" href="https://natcorp.aproposgroupllc.com/">Start 14-Day Free Trial</a>
      </article>
      <article class="marketplace-offer-card">
        <h3>National Enterprise Business Center</h3>
        <p>Business-development, readiness, and support services.</p>
        <p class="marketplace-offer-price">NEBC — 14-day free trial, then $39/month</p>
        <a class="btn-gold" data-trial-cta="nebc" href="https://nebc.aproposgroupllc.com/">Start 14-Day Free Trial</a>
      </article>
      <article class="marketplace-offer-card">
        <h3>Additional Analyze Fit Report</h3>
        <p>Request an additional opportunity-fit analysis beyond included access.</p>
        <p class="marketplace-offer-price">$15 one-time</p>
      </article>
      <article class="marketplace-offer-card">
        <h3>Concierge Contract Service</h3>
        <p>Concierge Contract Service pricing will be announced after final service scope and operating-cost validation.</p>
      </article>
    </div>
  </div>
</section>
<!-- APROPOS_VERIFIED_OFFERS_END -->'''


def patch_html(source: str) -> tuple[str, dict]:
    before = {
        "forms": len(re.findall(r"<form\b", source, flags=re.I)),
        "links": len(re.findall(r"<a\b", source, flags=re.I)),
        "images": len(re.findall(r"<img\b", source, flags=re.I)),
        "bytes": len(source.encode("utf-8")),
    }

    match = re.search(r"(<head\b[^>]*>)(.*?)(</head>)", source, flags=re.I | re.S)
    if not match:
        raise RuntimeError("index.html has no head element")
    head = remove_existing_metadata(match.group(2))
    viewport = re.search(r"<meta\b(?=[^>]*\bname\s*=\s*['\"]viewport['\"])[^>]*?/?>", head, flags=re.I)
    if viewport:
        insertion = viewport.end()
        head = head[:insertion] + "\n" + metadata_block() + head[insertion:]
    else:
        head = "\n" + metadata_block() + "\n" + head
    source = source[: match.start()] + match.group(1) + head + match.group(3) + source[match.end() :]

    # Authorized identity and pricing corrections. Dollar-prefixed replacements cannot alter embedded base64 assets.
    replacements = {
        "National Business Contract Center": "APROPOS Marketing Marketplace",
        "The Marketplace for Opportunity": "Programs, Services and Opportunity",
        "$19.99": "$15",
        "$24.99": "$39",
    }
    for old, new in replacements.items():
        source = source.replace(old, new)
    source = re.sub(r"\bFree Access\b", "14-Day Free Trial", source, flags=re.I)

    # Ensure the required primary message is visibly present once in the opening content.
    source = re.sub(
        r"\s*<p\b[^>]*class=['\"][^'\"]*marketplace-positioning-correction[^'\"]*['\"][^>]*>.*?</p>",
        "",
        source,
        flags=re.I | re.S,
    )
    first_h1 = re.search(r"</h1>", source, flags=re.I)
    if first_h1:
        source = source[: first_h1.end()] + f'\n<p class="marketplace-positioning-correction">{PRIMARY_MESSAGE}</p>' + source[first_h1.end() :]

    # Replace prior correction section/styles on re-run, then append the authoritative offers before the footer.
    source = re.sub(
        r"\s*<!-- APROPOS_VERIFIED_OFFERS_START -->.*?<!-- APROPOS_VERIFIED_OFFERS_END -->\s*",
        "\n",
        source,
        flags=re.I | re.S,
    )
    source = re.sub(
        r"\s*/\* APROPOS_VERIFIED_OFFERS_STYLES_START \*/.*?/\* APROPOS_VERIFIED_OFFERS_STYLES_END \*/\s*",
        "\n",
        source,
        flags=re.I | re.S,
    )
    style_close = source.lower().find("</style>")
    if style_close >= 0:
        source = source[:style_close] + offer_styles() + source[style_close:]
    footer = re.search(r"<footer\b", source, flags=re.I)
    if footer:
        source = source[: footer.start()] + offer_section() + "\n" + source[footer.start() :]
    else:
        body_close = source.lower().rfind("</body>")
        if body_close < 0:
            raise RuntimeError("index.html has no body close tag")
        source = source[:body_close] + offer_section() + "\n" + source[body_close:]

    after = {
        "forms": len(re.findall(r"<form\b", source, flags=re.I)),
        "links": len(re.findall(r"<a\b", source, flags=re.I)),
        "images": len(re.findall(r"<img\b", source, flags=re.I)),
        "bytes": len(source.encode("utf-8")),
    }
    if after["forms"] != before["forms"]:
        raise RuntimeError(f"Form preservation failed: before={before['forms']} after={after['forms']}")
    if after["images"] != before["images"]:
        raise RuntimeError(f"Image preservation failed: before={before['images']} after={after['images']}")
    return source, {"before": before, "after": after}


def extract_embedded_image(source: str) -> Image.Image | None:
    candidates = re.findall(
        r"data:image/(?:webp|jpeg|jpg|png);base64,([A-Za-z0-9+/=\r\n]+)", source, flags=re.I
    )
    for payload in candidates:
        try:
            raw = base64.b64decode(re.sub(r"\s+", "", payload), validate=False)
            image = Image.open(io.BytesIO(raw)).convert("RGB")
            if image.width >= 600 and image.height >= 300:
                return image
        except Exception:
            continue
    return None


def cover(image: Image.Image, size: tuple[int, int]) -> Image.Image:
    width, height = size
    scale = max(width / image.width, height / image.height)
    resized = image.resize((round(image.width * scale), round(image.height * scale)), Image.Resampling.LANCZOS)
    left = max(0, (resized.width - width) // 2)
    top = max(0, (resized.height - height) // 2)
    return resized.crop((left, top, left + width, top + height))


def load_font(size: int, bold: bool = False) -> ImageFont.FreeTypeFont | ImageFont.ImageFont:
    candidates = [
        "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf" if bold else "/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf",
        "/usr/share/fonts/truetype/liberation2/LiberationSans-Bold.ttf" if bold else "/usr/share/fonts/truetype/liberation2/LiberationSans-Regular.ttf",
    ]
    for path in candidates:
        try:
            return ImageFont.truetype(path, size=size)
        except OSError:
            continue
    return ImageFont.load_default()


def create_social_image(source: str) -> None:
    hero = extract_embedded_image(source)
    if hero is None:
        hero = Image.new("RGB", (1200, 630), (9, 27, 53))
        draw = ImageDraw.Draw(hero)
        for x in range(1200):
            ratio = x / 1199
            draw.line((x, 0, x, 630), fill=(int(9 + 12 * ratio), int(27 + 20 * ratio), int(53 + 24 * ratio)))
    canvas = cover(hero, (1200, 630))
    canvas = ImageEnhance.Contrast(canvas).enhance(1.05)
    overlay = Image.new("RGBA", canvas.size, (0, 0, 0, 0))
    draw = ImageDraw.Draw(overlay)
    for x in range(1200):
        alpha = int(220 - 80 * (x / 1199))
        draw.line((x, 0, x, 630), fill=(5, 20, 42, alpha))
    draw.rectangle((0, 0, 1200, 18), fill=(200, 168, 75, 255))
    # Product-pathway motif.
    for index, label in enumerate(("NGCC", "NAT-CORP", "NEBC")):
        x0 = 760 + index * 138
        y0 = 420
        draw.rounded_rectangle((x0, y0, x0 + 118, y0 + 92), radius=8, fill=(9, 27, 53, 215), outline=(228, 200, 120, 255), width=2)
        font = load_font(19, bold=True)
        bbox = draw.textbbox((0, 0), label, font=font)
        draw.text((x0 + 59 - (bbox[2] - bbox[0]) / 2, y0 + 46 - (bbox[3] - bbox[1]) / 2), label, font=font, fill=(255, 255, 255, 255))
        if index < 2:
            draw.line((x0 + 120, y0 + 46, x0 + 136, y0 + 46), fill=(228, 200, 120, 255), width=3)
    canvas = Image.alpha_composite(canvas.convert("RGBA"), overlay)
    draw = ImageDraw.Draw(canvas)
    brand_font = load_font(34, bold=True)
    title_font = load_font(66, bold=True)
    body_font = load_font(28)
    draw.text((76, 82), "APROPOS GROUP LLC", font=brand_font, fill=(228, 200, 120, 255))
    draw.text((76, 164), "APROPOS", font=title_font, fill=(255, 255, 255, 255))
    draw.text((76, 242), "Marketing Marketplace", font=title_font, fill=(255, 255, 255, 255))
    draw.text((80, 356), "Programs • Services • Campaigns • Opportunity Pathways", font=body_font, fill=(224, 231, 241, 255))
    draw.text((80, 414), "Government contract intelligence, Analyze Fit, proposal support and partnerships", font=load_font(22), fill=(205, 215, 228, 255))
    canvas.convert("RGB").save(OG_IMAGE, "JPEG", quality=91, optimize=True, progressive=True)


def write_support_files(preservation: dict) -> None:
    (ROOT / "robots.txt").write_text(
        "User-agent: *\nAllow: /\n\nSitemap: https://marketplace.aproposgroupllc.com/sitemap.xml\n",
        encoding="utf-8",
    )
    today = date.today().isoformat()
    (ROOT / "sitemap.xml").write_text(
        f'''<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>{CANONICAL}</loc>
    <lastmod>{today}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>1.0</priority>
  </url>
</urlset>
''',
        encoding="utf-8",
    )
    VALIDATION.mkdir(exist_ok=True)
    (VALIDATION / "preservation-report.json").write_text(
        json.dumps({"status": "PASS", **preservation}, indent=2), encoding="utf-8"
    )


def main() -> None:
    source = INDEX.read_text(encoding="utf-8")
    patched, preservation = patch_html(source)
    INDEX.write_text(patched, encoding="utf-8")
    create_social_image(patched)
    write_support_files(preservation)
    print(json.dumps({"status": "PATCHED", "preservation": preservation, "og_image": str(OG_IMAGE)}, indent=2))


if __name__ == "__main__":
    main()
