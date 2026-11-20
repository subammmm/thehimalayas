// Checks on the generated data files and on scripts/validate-data.py itself.
import test from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { cpSync, mkdtempSync, readFileSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

const root = new URL('..', import.meta.url).pathname;
const read = file => JSON.parse(readFileSync(join(root, file), 'utf8'));
const sites = read('public/data/sites.json');
const validate = dir => spawnSync('python3', ['scripts/validate-data.py', dir], { cwd: root, encoding: 'utf8' });

// The normalisation lives in scripts/build-sites-json.py, so it is tested through its output.
test('site_categories normalise the recorded site_type', () => {
    const categories = Object.fromEntries(sites.map(s => [s.site_type, s.site_categories]));
    assert.deepEqual(categories['Pillars'], ['Pillar']);
    assert.deepEqual(categories['Deval / Fountain'], ['Deval', 'Fountain']);
    assert.deepEqual(categories['Baleshwar Temple Inscription'], ['Inscription']); // an inscription, not a temple
    assert.deepEqual(categories['Potential Fort Ruins'], ['Fort / Palace']);
    assert.deepEqual(categories['Museum'], ['Other']);
    assert.deepEqual(categories['Stele / Pillars'], ['Stele', 'Pillar']);
});

test('every site has at least one category and an images list', () => {
    for (const s of sites) {
        assert.ok(s.site_categories.length > 0, s.entry_no);
        assert.ok(Array.isArray(s.images), s.entry_no);
    }
});

test('possibly_related cross-references point both ways at existing entries', () => {
    const byEntry = new Map(sites.map(s => [s.entry_no, s]));
    assert.deepEqual(byEntry.get('N.D.D.120').possibly_related, ['N.D.D.125']);
    assert.deepEqual(byEntry.get('N.D.D.127').possibly_related, ['N.D.D.126']);
    for (const s of sites) {
        for (const other of s.possibly_related) assert.ok(byEntry.get(other).possibly_related.includes(s.entry_no), `${s.entry_no} -> ${other}`);
    }
});

test('the bundled copy and the published copy hold the same records', () => {
    const bundled = read('src/data/sites.json');
    assert.deepEqual(bundled.map(s => s.entry_no), sites.map(s => s.entry_no));
});

test('datapackage.json describes every column of sites.csv', () => {
    const header = readFileSync(join(root, 'public/data/sites.csv'), 'utf8').split('\n')[0].trim().split(',');
    const resource = read('public/data/datapackage.json').resources.find(r => r.path === 'sites.csv');
    assert.deepEqual(resource.schema.fields.map(f => f.name), header);
});

test('validate-data.py accepts the published files', () => {
    const result = validate('public/data');
    assert.equal(result.status, 0, result.stderr);
    assert.match(result.stdout, /OK: 127 features, 87 with Point geometry/);
});

test('validate-data.py rejects GeoJSON with latitude and longitude swapped', () => {
    const dir = mkdtempSync(join(tmpdir(), 'himalayas-'));
    cpSync(join(root, 'public/data'), dir, { recursive: true });
    const geo = JSON.parse(readFileSync(join(dir, 'sites.geojson'), 'utf8'));
    geo.features.find(f => f.geometry).geometry.coordinates.reverse();
    writeFileSync(join(dir, 'sites.geojson'), JSON.stringify(geo));
    assert.notEqual(validate(dir).status, 0);
});

test('validate-data.py rejects a file with a record missing', () => {
    const dir = mkdtempSync(join(tmpdir(), 'himalayas-'));
    cpSync(join(root, 'public/data'), dir, { recursive: true });
    writeFileSync(join(dir, 'sites.json'), JSON.stringify(sites.slice(1)));
    assert.notEqual(validate(dir).status, 0);
});

test('the committed Wikimedia exports match the data and stay unrunnable until reviewed', () => {
    const dir = mkdtempSync(join(tmpdir(), 'himalayas-'));
    const result = spawnSync('python3', ['scripts/export-wikimedia.py', dir], { cwd: root, encoding: 'utf8' });
    assert.equal(result.status, 0, result.stderr);
    for (const file of ['wikidata-quickstatements.txt', 'commons-descriptions.csv', 'README.md']) {
        assert.equal(readFileSync(join(dir, file), 'utf8'), readFileSync(join(root, 'exports', file), 'utf8'), `${file} is stale: run scripts/export-wikimedia.py`);
    }
    const lines = readFileSync(join(dir, 'wikidata-quickstatements.txt'), 'utf8').trim().split('\n').map(l => l.split('\t'));
    const mapped = sites.filter(s => s.latitude !== null);
    assert.equal(lines.filter(l => l[0] === 'CREATE').length, mapped.length);
    assert.deepEqual(lines.filter(l => l[1] === 'P625').map(l => l[2]), mapped.map(s => `@${s.latitude}/${s.longitude}`));
    assert.ok(lines.filter(l => l[1] === 'P31').every(l => /^Q_REVIEW_[A-Z_]+$/.test(l[2])), 'instance-of must stay a placeholder');
    assert.ok(lines.filter(l => l[1] === 'P17').every(l => l[2] === 'Q837'), 'every mapped site is in Nepal');
});
