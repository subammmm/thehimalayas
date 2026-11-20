# The Himalayas

Interactive atlas of 127 Khasa Malla historical sites (87 with coordinates, shown on the map).
Vite + React 19 + TypeScript + Tailwind. Live at https://thehimalayas.vercel.app.

## Setup

Requires Node 22 (see `.nvmrc`; Vite 7 needs Node >= 20.19).

```bash
npm install
cp .env.example .env   # then fill in the values below
npm run dev
```

| Variable | Needed for |
| --- | --- |
| `VITE_MAPBOX_TOKEN` | The base map on `/map`. Without it the map area shows a notice; search, filters and the site list still work. |
| `VITE_CESIUM_TOKEN` | Terrain and imagery in the 3D view. Without it the 3D view shows a notice. |
| `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY` | Optional. Leave unset to use the bundled data. |

Never commit `.env`. Production values live in the Vercel project settings.

## Data

The site data ships with the app in `src/data/sites.json`, generated from
`scripts/khasa-malla-data-part*.sql` by:

```bash
npm run data   # build-sites-json.py, then validate-data.py
```

The same run writes the open-data downloads served at `/data/` (`public/data/sites.json`,
`sites.geojson`, `sites.csv`, `datapackage.json`), `CITATION.cff` and `public/sitemap.xml`.
Commit the regenerated files.
The script parses coordinates into `latitude`/`longitude`, fails if a point falls outside the
survey region, and derives `site_categories` from `site_type` (the recorded text is kept).

Author, licence and coordinate datum are set in one place, `src/data/project.json`; its `todo`
entries mark the values the author still has to confirm. The app, `CITATION.cff`,
`datapackage.json` and the JSON-LD on `/data` all read from it.

No site photographs are published, so the app shows a plain header instead of a picture. To add
one, put the file in `public/images/sites/` and add it to `IMAGES` in
`scripts/build-sites-json.py` (with `src`, `alt`, `credit` and `licence`), then run `npm run data`.
`POSSIBLY_RELATED` in the same script holds the "possibly related" cross-references; the script
also prints candidate duplicates (same place name and type within 50 m) for the author to review.

`python3 scripts/export-wikimedia.py` writes draft Wikidata and Commons exports to `exports/` for
manual review (see `exports/README.md`). It uploads nothing.

If Supabase is configured and reachable, its `historical_sites` table replaces the bundled copy
at runtime; otherwise the bundled copy is used.

## Checks

```bash
npx tsc -b
npm run lint
npm test        # node --test: tests/*.test.mjs
npm run build   # tsc, vite build, then scripts/prerender.mjs
```

GitHub Actions runs the same checks plus the data validator on every push and pull request
(`.github/workflows/ci.yml`).

`scripts/prerender.mjs` writes a static `index.html` into `dist/` for `/`, `/map`, `/browse`,
`/atlas`, `/data`, `/about` and each site page, with that page's title, description, canonical
and Open Graph tags and a `<noscript>` summary, so crawlers and link previews see the record. The
app still loads and renders as a single-page app.

## Routes

- `/` home and search
- `/map` map, filters, site list, 3D view. The view is linkable:
  `/map?q=<search>&type=<category>&district=<district>&site=<id>` (`type` and `district` may repeat)
- `/browse` every site as a list, by district or by type (`?by=type`)
- `/data` downloads, data dictionary, citation
- `/atlas` statistics
- `/locations/:id` site details (ids look like `site-12`); prints as a clean record
- `/embed` read-only map for an `<iframe>`, with the same `type` and `district` parameters as `/map`;
  the embed code is on `/data`
- `/about`

Older setup and deployment notes are kept in `docs/archive/` for reference; they are out of date.
