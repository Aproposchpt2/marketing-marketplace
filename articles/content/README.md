# APROPOS Marketplace Article Content

The Marketplace article engine reads one JSON file per published article from this directory.

Required fields:

- `slug`
- `title`
- `description`
- `category`
- `publishedDate` (`YYYY-MM-DD`)
- `updatedDate` (`YYYY-MM-DD`)
- `sections` (array)

Optional fields:

- `sources` — array of `{ "label": "...", "url": "..." }`
- `pathway` — contextual APROPOS handoff with `heading`, `description`, `label`, `url`, and `destination`
- `related` — array of related article slugs
- `published` — set to `false` to keep a draft out of generated pages and sitemap

Each section uses:

```json
{
  "heading": "Section heading",
  "paragraphs": ["Plain-language paragraph."],
  "bullets": ["Optional bullet"]
}
```

Marketplace articles own broad educational intent. Specialized operational depth belongs to RFCP, NAT-CORP, NEBC, or APROPOS Group LLC as appropriate.
