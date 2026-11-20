#!/usr/bin/env python3
"""Write draft exports for Wikidata and Wikimedia Commons from public/data/sites.json.

Nothing is uploaded: this script only writes files for a person to review and submit by hand.
See the README it writes for the review steps.

Usage: export-wikimedia.py [output directory]   (default: exports)
"""
import csv, json, os, re, sys

out_dir = sys.argv[1] if len(sys.argv) > 1 else 'exports'
project = json.load(open('src/data/project.json', encoding='utf-8'))
sites = json.load(open('public/data/sites.json', encoding='utf-8'))
mapped = [s for s in sites if s['latitude'] is not None]

COUNTRY_QID = {'Nepal': 'Q837', 'India': 'Q668', 'China': 'Q148'}  # labels checked on wikidata.org

# "instance of" (P31) is deliberately not filled in. Each statement carries a placeholder that
# QuickStatements rejects, so the batch cannot run until a reviewer has chosen a class for every
# category. The candidates are real items whose labels were checked, not recommendations.
P31_CANDIDATES = {
    'Pillar': 'Q4817 column', 'Stele': 'Q178743 stele', 'Deval': 'Q842402 Hindu temple / Q44539 temple',
    'Stupa': 'Q180987 stupa', 'Temple': 'Q842402 Hindu temple / Q44539 temple', 'Fountain': 'Q483453 fountain',
    'Inscription': 'Q1640824 inscription', 'Fort / Palace': 'Q1785071 fort / Q16560 palace / Q109607 ruins',
    'Monastery / Vihara': 'Q44613 monastery', 'Sculpture': 'Q860861 sculpture',
    'Remains': 'Q109607 ruins / Q839954 archaeological site', 'Other': 'Q839954 archaeological site / Q33506 museum',
}
# Commons category stems, completed as "<stem> in <country>". Suggestions only: check each exists.
COMMONS_CATEGORY = {
    'Pillar': 'Pillars', 'Stele': 'Steles', 'Deval': 'Temples', 'Stupa': 'Stupas', 'Temple': 'Temples',
    'Fountain': 'Fountains', 'Inscription': 'Inscriptions', 'Fort / Palace': 'Forts',
    'Monastery / Vihara': 'Monasteries', 'Sculpture': 'Sculptures', 'Remains': 'Archaeological sites',
}
placeholder = lambda category: 'Q_REVIEW_' + re.sub(r'\W+', '_', category).strip('_').upper()

def url(site):
    return f"{project['siteUrl']}/locations/{site['id']}"

def place(site):
    district = site['district'] if site['district'] != 'N/A' else None
    if district and site['country'] == 'Nepal':
        district += ' District'
    return ', '.join(filter(None, [district, site['country']]))

def label(site):
    # "Dansangu Pillar" already names its type; "Dullu" does not.
    if site['site_type'].lower() in site['location'].lower():
        return site['location']
    return f"{site['location']} {site['site_type']}"

quoted = lambda text: '"' + text.replace('"', "'").replace('\t', ' ') + '"'  # V1 has no escape for quotes

os.makedirs(out_dir, exist_ok=True)

with open(f'{out_dir}/wikidata-quickstatements.txt', 'w', encoding='utf-8') as f:
    for site in mapped:
        assert site['country'] in COUNTRY_QID, site['entry_no']
        rows = [
            ['CREATE'],
            ['LAST', 'Len', quoted(label(site))],
            ['LAST', 'Den', quoted(f"{site['site_type']} of the Khasa Malla period in {place(site)} (atlas entry {site['entry_no']})")],
            *[['LAST', 'P31', placeholder(category)] for category in site['site_categories']],
            ['LAST', 'P17', COUNTRY_QID[site['country']]],
            ['LAST', 'P625', f"@{site['latitude']}/{site['longitude']}"],
            ['LAST', 'P973', quoted(url(site))],
        ]
        f.writelines('\t'.join(row) + '\n' for row in rows)

with open(f'{out_dir}/commons-descriptions.csv', 'w', encoding='utf-8', newline='') as f:
    writer = csv.writer(f)
    writer.writerow(['entry_no', 'atlas_url', 'file_name_stem', 'information_template', 'location_template', 'suggested_categories'])
    for site in sites:
        description = f"{site['site_type']} at {site['location']}, {place(site)}. Entry {site['entry_no']} in {project['datasetTitle']}, {url(site)}"
        writer.writerow([
            site['entry_no'], url(site),
            re.sub(r'\s+', ' ', re.sub(r'[^\w ().,-]', ' ', f"Khasa Malla site {site['entry_no']} {label(site)}")).strip(),
            # date, source, author and permission are for the photographer to fill in
            f"{{{{Information |description={{{{en|1={description}}}}} |date= |source= |author= |permission= }}}}",
            '' if site['latitude'] is None else f"{{{{Location|{site['latitude']}|{site['longitude']}}}}}",
            '; '.join(dict.fromkeys([place(site).split(',')[0], *[f"{COMMONS_CATEGORY[c]} in {site['country']}" for c in site['site_categories'] if c in COMMONS_CATEGORY]])),
        ])

with open(f'{out_dir}/README.md', 'w', encoding='utf-8') as f:
    f.write(f"""# Wikimedia exports (drafts for manual review)

Written by `python3 scripts/export-wikimedia.py` from `public/data/sites.json`. Regenerate after the data
changes; do not edit these files by hand.

**Nothing here is uploaded automatically.** The script calls no Wikimedia API. A person reviews the
files and submits them through the normal Wikimedia tools, under their own account.

## wikidata-quickstatements.txt

A [QuickStatements](https://www.wikidata.org/wiki/Help:QuickStatements) V1 batch (tab-separated) that
would create one item for each of the {len(mapped)} sites with coordinates. The {len(sites) - len(mapped)} sites without
coordinates are left out. Each item gets an English label and description, country (P17),
coordinate location (P625) and "described at URL" (P973) pointing at the site's atlas page.

Before running it:

1. **Search Wikidata for each site first** and remove the block of any site that already has an item
   (add the missing statements to the existing item instead). Creating duplicates is the main risk.
2. **Check notability.** Wikidata expects each item to be identifiable from serious public sources.
   An atlas page alone may not be enough; ask on Wikidata's project chat if unsure.
3. **Replace every `Q_REVIEW_…` placeholder** with the right "instance of" (P31) class. The
   placeholders are not valid item ids, so QuickStatements rejects the batch until this is done.
   Candidates to consider (labels checked on Wikidata; the choice is the reviewer's):

{chr(10).join(f'   - `{placeholder(category)}` ({category}): {candidates}' for category, candidates in P31_CANDIDATES.items())}

4. **Read the labels and descriptions.** They are generated from the recorded place name and site
   type ("Khasa Malla period" comes from the dataset's scope, not from a dating of each monument).
   Records flagged as possibly related ({', '.join(s['entry_no'] for s in mapped if s['possibly_related'])}) may be one site: decide before creating both.
5. **Confirm the coordinate datum.** {project['datum']}{'' if project['datumConfirmed'] else ' is assumed; the documentation does not state it'}.
6. **Confirm the licence of the dataset** ({project['licence']}). Wikidata content is CC0.
7. Paste the reviewed batch into QuickStatements, run a few items first, and check them.

## commons-descriptions.csv

One row per site ({len(sites)}), to copy from when uploading photographs to Wikimedia Commons:
a suggested file-name stem (add a short subject and the extension), an `{{{{Information}}}}`
description, a `{{{{Location}}}}` template for sites with coordinates, and suggested categories.

Before uploading:

1. Only upload photographs the photographer has agreed to release under a free licence; fill in
   date, source, author and permission in the template.
2. The categories are suggestions built from the district and site type. Check that each exists on
   Commons, or pick the closest existing one.
3. Use Commons' Upload Wizard or another standard tool; nothing in this repository uploads files.
""")

print(f'{len(mapped)} Wikidata item drafts and {len(sites)} Commons rows written to {out_dir}/')
