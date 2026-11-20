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
`sites.geojson`, `sites.csv`) and `public/sitemap.xml`. Commit the regenerated files.
The script parses coordinates into `latitude`/`longitude`, fails if a point falls outside the
survey region, and derives `site_categories` from `site_type` (the recorded text is kept).

If Supabase is configured and reachable, its `historical_sites` table replaces the bundled copy
at runtime; otherwise the bundled copy is used.

## Checks

```bash
npx tsc -b
npm run lint
npm run build
```

## Routes

- `/` home and search
- `/map` map, filters, site list, 3D view. The view is linkable:
  `/map?q=<search>&type=<category>&district=<district>&site=<id>` (`type` and `district` may repeat)
- `/browse` every site as a list, by district or by type (`?by=type`)
- `/data` downloads, data dictionary, citation
- `/atlas` statistics
- `/locations/:id` site details (ids look like `site-12`)
- `/about`

Older setup and deployment notes are kept in `docs/archive/` for reference; they are out of date.
