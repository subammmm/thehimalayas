#!/usr/bin/env python3
"""Rebuild the dataset from scripts/khasa-malla-data-part*.sql.

Writes src/data/sites.json (bundled into the app), the open-data downloads in
public/data/ (sites.json, sites.geojson, sites.csv) and public/sitemap.xml.

Run: python3 scripts/build-sites-json.py && python3 scripts/validate-data.py
"""
import csv, glob, json, os, re

SITE_URL = 'https://thehimalayas.vercel.app'

# Plausible bounding box for the survey region; anything outside is a data error.
LAT_RANGE, LNG_RANGE = (26, 33), (78, 90)

DECIMAL = re.compile(r'\s*(-?\d+(?:\.\d+)?)\s*,\s*(-?\d+(?:\.\d+)?)\s*')
DMS = re.compile(r'\s*(\d+)°(\d+)\'(\d+(?:\.\d+)?)"([NS])\s+(\d+)°(\d+)\'(\d+(?:\.\d+)?)"([EW])\s*')

def parse_coordinates(text):
    """'28.85, 81.60' or 29°16'18.1"N 82°09'24.5"E -> (lat, lng), else None."""
    if m := DECIMAL.fullmatch(text):
        return float(m[1]), float(m[2])
    if m := DMS.fullmatch(text):
        lat = int(m[1]) + int(m[2]) / 60 + float(m[3]) / 3600
        lng = int(m[5]) + int(m[6]) / 60 + float(m[7]) / 3600
        return (-lat if m[4] == 'S' else lat), (-lng if m[8] == 'W' else lng)
    return None

# First matching keyword wins, per " / "-separated part of site_type. Inscriptions
# come first so "Baleshwar Temple Inscription" is an inscription, not a temple.
CATEGORIES = [
    ('Inscription', r'inscription|epigraph|copper ?plate|gold plate'),
    ('Pillar', r'pillar'), ('Stele', r'stele'), ('Deval', r'deval'), ('Stupa', r'stupa'),
    ('Temple', r'temple'), ('Fountain', r'fountain'), ('Fort / Palace', r'fort|palace'),
    ('Monastery / Vihara', r'monastery|vihara'), ('Sculpture', r'sculpture|carved stone'),
    ('Remains', r'remains|mounds'),
]

def categorise(site_type):
    """Normalised categories for filtering; the original site_type text is kept as is."""
    found = []
    for part in site_type.split(' / '):
        name = next((n for n, pattern in CATEGORIES if re.search(pattern, part, re.I)), 'Other')
        if name not in found:
            found.append(name)
    return found

def parse_values(sql):
    """Yield tuples from a VALUES list: quoted strings ('' escapes), NULL, numbers."""
    i, n = 0, len(sql)
    while i < n:
        if sql[i] != '(':
            i += 1
            continue
        i += 1
        row, cur, in_str, was_str = [], '', False, False
        while i < n:
            c = sql[i]
            if in_str:
                if c == "'" and sql[i + 1:i + 2] == "'":
                    cur += "'"; i += 1
                elif c == "'":
                    in_str = False
                else:
                    cur += c
            elif c == "'":
                in_str = was_str = True
                cur = ''
            elif c in ',)':
                v = cur if was_str else cur.strip()
                if not was_str:
                    v = None if v.upper() == 'NULL' else (int(v) if re.fullmatch(r'-?\d+', v) else v)
                row.append(v)
                cur, was_str = '', False
                if c == ')':
                    break
            else:
                cur += c
            i += 1
        yield row
        i += 1

sites = []
for path in sorted(glob.glob('scripts/khasa-malla-data-part*.sql')):
    sql = re.sub(r'^\s*--.*$', '', open(path, encoding='utf-8').read(), flags=re.M)
    for cols, body in re.findall(r'INSERT INTO historical_sites\s*\(([^)]*)\)\s*VALUES(.*?);\s*(?=INSERT|\Z)', sql, flags=re.S):
        names = [c.strip() for c in cols.split(',')]
        for row in parse_values(body):
            assert len(row) == len(names), (path, row)
            sites.append(dict(zip(names, row)))

fields = ['entry_no', 'country', 'district', 'location', 'coordinates', 'site_type', 'documentation',
          'description', 'visit_date', 'phase', 'language', 'translation', 'source']
out = []
for i, s in enumerate(sites):
    row = {'id': f'site-{i + 1}', **{f: s.get(f) for f in fields}, 'site_categories': categorise(s['site_type']),
           'latitude': None, 'longitude': None, 'created_at': '', 'updated_at': None}
    if row['coordinates']:
        point = parse_coordinates(row['coordinates'])
        if point is None:
            # Not a coordinate (N.D.D.4 has the place name "Uttarganga" here): the site is unmapped.
            print(f"{row['entry_no']}: coordinates {row['coordinates']!r} is not a coordinate, set to null")
            row['coordinates'] = None
        else:
            lat, lng = point
            assert LAT_RANGE[0] <= lat <= LAT_RANGE[1] and LNG_RANGE[0] <= lng <= LNG_RANGE[1], (row['entry_no'], point)
            row['latitude'], row['longitude'] = round(lat, 6), round(lng, 6)
    out.append(row)

assert len({r['entry_no'] for r in out}) == len(out), 'duplicate entry_no'

def dump(path, data):
    with open(path, 'w', encoding='utf-8') as f:
        json.dump(data, f, ensure_ascii=False, indent=1)
        f.write('\n')

os.makedirs('public/data', exist_ok=True)
dump('src/data/sites.json', out)

# Open-data downloads: the app-only bookkeeping columns are left out.
public_fields = ['id', *fields, 'site_categories', 'latitude', 'longitude']
records = [{f: r[f] for f in public_fields} for r in out]
dump('public/data/sites.json', records)
dump('public/data/sites.geojson', {
    'type': 'FeatureCollection',
    'features': [{
        'type': 'Feature',
        'id': r['id'],
        'geometry': None if r['latitude'] is None else {'type': 'Point', 'coordinates': [r['longitude'], r['latitude']]},
        'properties': {f: r[f] for f in public_fields if f not in ('id', 'latitude', 'longitude')},
    } for r in records],
})
with open('public/data/sites.csv', 'w', encoding='utf-8', newline='') as f:
    writer = csv.DictWriter(f, fieldnames=public_fields)
    writer.writeheader()
    writer.writerows({**r, 'site_categories': '; '.join(r['site_categories'])} for r in records)

pages = ['/', '/map', '/browse', '/atlas', '/data', '/about'] + [f"/locations/{r['id']}" for r in out]
with open('public/sitemap.xml', 'w', encoding='utf-8') as f:
    f.write('<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n')
    f.writelines(f'  <url><loc>{SITE_URL}{p}</loc></url>\n' for p in pages)
    f.write('</urlset>\n')

print(len(out), 'sites written,', sum(r['latitude'] is not None for r in out), 'with coordinates')
