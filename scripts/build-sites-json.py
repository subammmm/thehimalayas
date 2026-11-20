#!/usr/bin/env python3
"""Rebuild src/data/sites.json from scripts/khasa-malla-data-part*.sql.

Run: python3 scripts/build-sites-json.py
"""
import glob, json, re

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
out = [{'id': f'site-{i + 1}', **{f: s.get(f) for f in fields},
        'latitude': None, 'longitude': None, 'created_at': '', 'updated_at': None} for i, s in enumerate(sites)]
json.dump(out, open('src/data/sites.json', 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
print(len(out), 'sites written')
