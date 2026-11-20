# Wikimedia exports (drafts for manual review)

Written by `python3 scripts/export-wikimedia.py` from `public/data/sites.json`. Regenerate after the data
changes; do not edit these files by hand.

**Nothing here is uploaded automatically.** The script calls no Wikimedia API. A person reviews the
files and submits them through the normal Wikimedia tools, under their own account.

## wikidata-quickstatements.txt

A [QuickStatements](https://www.wikidata.org/wiki/Help:QuickStatements) V1 batch (tab-separated) that
would create one item for each of the 87 sites with coordinates. The 40 sites without
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

   - `Q_REVIEW_PILLAR` (Pillar): Q4817 column
   - `Q_REVIEW_STELE` (Stele): Q178743 stele
   - `Q_REVIEW_DEVAL` (Deval): Q842402 Hindu temple / Q44539 temple
   - `Q_REVIEW_STUPA` (Stupa): Q180987 stupa
   - `Q_REVIEW_TEMPLE` (Temple): Q842402 Hindu temple / Q44539 temple
   - `Q_REVIEW_FOUNTAIN` (Fountain): Q483453 fountain
   - `Q_REVIEW_INSCRIPTION` (Inscription): Q1640824 inscription
   - `Q_REVIEW_FORT_PALACE` (Fort / Palace): Q1785071 fort / Q16560 palace / Q109607 ruins
   - `Q_REVIEW_MONASTERY_VIHARA` (Monastery / Vihara): Q44613 monastery
   - `Q_REVIEW_SCULPTURE` (Sculpture): Q860861 sculpture
   - `Q_REVIEW_REMAINS` (Remains): Q109607 ruins / Q839954 archaeological site
   - `Q_REVIEW_OTHER` (Other): Q839954 archaeological site / Q33506 museum

4. **Read the labels and descriptions.** They are generated from the recorded place name and site
   type ("Khasa Malla period" comes from the dataset's scope, not from a dating of each monument).
   Records flagged as possibly related (N.D.D.120, N.D.D.125, N.D.D.126, N.D.D.127) may be one site: decide before creating both.
5. **Confirm the coordinate datum.** WGS 84 is assumed; the documentation does not state it.
6. **Confirm the licence of the dataset** (to be confirmed by the author). Wikidata content is CC0.
7. Paste the reviewed batch into QuickStatements, run a few items first, and check them.

## commons-descriptions.csv

One row per site (127), to copy from when uploading photographs to Wikimedia Commons:
a suggested file-name stem (add a short subject and the extension), an `{{Information}}`
description, a `{{Location}}` template for sites with coordinates, and suggested categories.

Before uploading:

1. Only upload photographs the photographer has agreed to release under a free licence; fill in
   date, source, author and permission in the template.
2. The categories are suggestions built from the district and site type. Check that each exists on
   Commons, or pick the closest existing one.
3. Use Commons' Upload Wizard or another standard tool; nothing in this repository uploads files.
