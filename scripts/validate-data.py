#!/usr/bin/env python3
"""Check the generated open-data files. Run after scripts/build-sites-json.py.

Usage: validate-data.py [directory]   (default: public/data)
"""
import csv, json, sys

data = sys.argv[1] if len(sys.argv) > 1 else 'public/data'
sites = json.load(open(f'{data}/sites.json', encoding='utf-8'))
geo = json.load(open(f'{data}/sites.geojson', encoding='utf-8'))
rows = list(csv.DictReader(open(f'{data}/sites.csv', encoding='utf-8', newline='')))

assert geo['type'] == 'FeatureCollection'
assert len(sites) == len(geo['features']) == len(rows) == 127, (len(sites), len(geo['features']), len(rows))
assert len({f['id'] for f in geo['features']}) == 127, 'feature ids are not unique'

mapped = 0
for site, feature, row in zip(sites, geo['features'], rows):
    assert feature['type'] == 'Feature' and feature['id'] == site['id'] == row['id']
    assert feature['properties']['entry_no'] == site['entry_no'] == row['entry_no']
    geometry = feature['geometry']
    if geometry is None:
        assert site['latitude'] is None and site['longitude'] is None and row['latitude'] == ''
        continue
    mapped += 1
    lng, lat = geometry['coordinates']  # GeoJSON order is [longitude, latitude]
    assert geometry['type'] == 'Point' and len(geometry['coordinates']) == 2
    assert 26 <= lat <= 33 and 78 <= lng <= 90, (site['entry_no'], lng, lat)
    assert (lat, lng) == (site['latitude'], site['longitude']) == (float(row['latitude']), float(row['longitude']))

print(f'OK: 127 features, {mapped} with Point geometry in [lng, lat] order and in range, {127 - mapped} with null geometry')
