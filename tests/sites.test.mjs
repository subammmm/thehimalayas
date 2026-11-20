// Run with `npm test` (Node's built-in runner; Node strips the TypeScript types on import).
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { siteColor, parseCoordinates, haversineKm, nearestSites, mapUrl, parseMapParams, matchesFilters, markerPositions } from '../src/lib/sites.ts';

const sites = JSON.parse(readFileSync(new URL('../public/data/sites.json', import.meta.url), 'utf8'));
const near = (actual, expected, tolerance) => assert.ok(Math.abs(actual - expected) <= tolerance, `${actual} is not within ${tolerance} of ${expected}`);

test('parseCoordinates reads decimal degrees', () => {
    assert.deepEqual(parseCoordinates('28.8662583, 81.6087778'), { lat: 28.8662583, lng: 81.6087778 });
});

test('parseCoordinates reads degrees, minutes and seconds', () => {
    const point = parseCoordinates('29°16\'18.1"N 82°09\'24.5"E');
    near(point.lat, 29.271694, 1e-6);
    near(point.lng, 82.156806, 1e-6);
});

test('parseCoordinates makes south and west negative', () => {
    const point = parseCoordinates('10°30\'00"S 20°15\'00"W');
    assert.deepEqual(point, { lat: -10.5, lng: -20.25 });
});

test('parseCoordinates returns null for text that is not a coordinate', () => {
    assert.equal(parseCoordinates('Uttarganga'), null); // N.D.D.4 has a place name in this column
    assert.equal(parseCoordinates(''), null);
    assert.equal(parseCoordinates(null), null);
});

test('parseCoordinates agrees with the latitude and longitude in the published data', () => {
    for (const site of sites.filter(s => s.coordinates)) {
        const point = parseCoordinates(site.coordinates);
        near(point.lat, site.latitude, 1e-6);
        near(point.lng, site.longitude, 1e-6);
    }
});

test('haversineKm measures a known distance', () => {
    assert.equal(haversineKm({ lat: 29, lng: 82 }, { lat: 29, lng: 82 }), 0);
    near(haversineKm({ lat: 0, lng: 0 }, { lat: 1, lng: 0 }), 111.19, 0.01); // one degree of latitude
    near(haversineKm({ lat: 27.7172, lng: 85.324 }, { lat: 28.2096, lng: 83.9856 }), 142.3, 1); // Kathmandu to Pokhara
});

const site = (id, lat, lng, extra = {}) => ({
    id, name: id, entry_no: id, type: 'Pillar', region: 'Dailekh', categories: ['Pillar'],
    coordinates: lat === null ? null : { lat, lng }, ...extra,
});

test('nearestSites returns the closest mapped sites, nearest first, without the site itself', () => {
    const all = [site('a', 29, 82), site('far', 30, 82), site('close', 29.001, 82), site('unmapped', null), site('mid', 29.1, 82)];
    const result = nearestSites(all[0], all, 2);
    assert.deepEqual(result.map(r => r.site.id), ['close', 'mid']);
    near(result[0].km, 0.111, 0.001);
});

test('nearestSites falls back to the same district for a site without coordinates', () => {
    const all = [site('a', null), site('b', 29, 82), site('c', 29, 82, { region: 'Jumla' })];
    assert.deepEqual(nearestSites(all[0], all, 5), [{ site: all[1], km: null }]);
});

test('mapUrl and parseMapParams round-trip the map state', () => {
    const state = { query: 'Dullu & co', types: ['Fort / Palace', 'Pillar'], districts: ['Dailekh'], site: 'site-42' };
    const url = mapUrl(state);
    assert.ok(url.startsWith('/map?'));
    assert.deepEqual(parseMapParams(url.slice('/map'.length)), state);
});

test('mapUrl is the bare path when there is no state, and parseMapParams gives empty defaults', () => {
    assert.equal(mapUrl({}), '/map');
    assert.deepEqual(parseMapParams(''), { query: '', types: [], districts: [], site: undefined });
});

test('matchesFilters combines search, category and district', () => {
    const s = site('Dullu', 29, 82, { categories: ['Deval', 'Fountain'] });
    assert.ok(matchesFilters(s, { query: 'dul', types: ['Fountain'], districts: ['Dailekh'] }));
    assert.ok(!matchesFilters(s, { query: '', types: ['Pillar'], districts: [] }));
    assert.ok(!matchesFilters(s, { query: '', types: [], districts: ['Jumla'] }));
});

test('markerPositions separates sites recorded at the same point and keeps single sites in place', () => {
    const positions = markerPositions([site('a', 29, 82), site('b', 29, 82), site('c', 30, 82), site('d', null)]);
    assert.deepEqual(positions.get('c'), { lat: 30, lng: 82 });
    assert.notDeepEqual(positions.get('a'), positions.get('b'));
    assert.ok(haversineKm(positions.get('a'), positions.get('b')) < 0.05);
    assert.equal(positions.has('d'), false);
});

test('siteColor follows the first category, as the map legend does', () => {
    const lime = siteColor(site('a', 29, 82, { type: 'Stupa', categories: ['Stupa'] }));
    assert.equal(siteColor(site('b', 29, 82, { type: 'Stupas / Stele', categories: ['Stupa', 'Stele'] })), lime);
    assert.notEqual(siteColor(site('c', 29, 82, { type: 'Stele', categories: ['Stele'] })), lime);
    assert.equal(siteColor(site('d', 29, 82, { type: 'Museum', categories: ['Other'] })), '#6b7280');
});
