import type { Coordinates, HistoricalSite } from '../types';

export interface SiteFilters {
    query: string;
    types: string[];     // normalised categories
    districts: string[];
}

export function matchesFilters(site: HistoricalSite, { query, types, districts }: SiteFilters): boolean {
    const q = query.trim().toLowerCase();
    return (q === '' || [site.name, site.region, site.type, site.entry_no].some(text => text.toLowerCase().includes(q))) &&
        (types.length === 0 || site.categories.some(category => types.includes(category))) &&
        (districts.length === 0 || districts.includes(site.region));
}

// Distinct values with how many sites carry each, most common first.
export function countBy(sites: HistoricalSite[], values: (site: HistoricalSite) => string[]): [string, number][] {
    const counts = new Map<string, number>();
    for (const site of sites) {
        for (const value of values(site)) counts.set(value, (counts.get(value) ?? 0) + 1);
    }
    return [...counts].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]));
}

// Link to the map with a shareable filter state. See HimalayanMapPage for the parameters.
export function mapUrl({ query = '', types = [], districts = [], site }: Partial<SiteFilters> & { site?: string }): string {
    const params = new URLSearchParams();
    if (query) params.set('q', query);
    types.forEach(type => params.append('type', type));
    districts.forEach(district => params.append('district', district));
    if (site) params.set('site', site);
    const search = params.toString();
    return search ? `/map?${search}` : '/map';
}

// Reads the state written by mapUrl back out of a query string.
export function parseMapParams(search: string): SiteFilters & { site?: string } {
    const params = new URLSearchParams(search);
    return {
        query: params.get('q') ?? '',
        types: params.getAll('type'),
        districts: params.getAll('district'),
        site: params.get('site') ?? undefined,
    };
}

const DECIMAL = /^\s*(-?\d+(?:\.\d+)?)\s*,\s*(-?\d+(?:\.\d+)?)\s*$/;
const DMS = /^\s*(\d+)°(\d+)'(\d+(?:\.\d+)?)"([NS])\s+(\d+)°(\d+)'(\d+(?:\.\d+)?)"([EW])\s*$/;

// '28.85, 81.60' or 29°16'18.1"N 82°09'24.5"E. Same rules as parse_coordinates in
// scripts/build-sites-json.py; only needed for Supabase rows without latitude/longitude.
export function parseCoordinates(text: string | null): Coordinates | null {
    const decimal = text?.match(DECIMAL);
    if (decimal) return { lat: Number(decimal[1]), lng: Number(decimal[2]) };
    const dms = text?.match(DMS);
    if (!dms) return null;
    const lat = Number(dms[1]) + Number(dms[2]) / 60 + Number(dms[3]) / 3600;
    const lng = Number(dms[5]) + Number(dms[6]) / 60 + Number(dms[7]) / 3600;
    return { lat: dms[4] === 'S' ? -lat : lat, lng: dms[8] === 'W' ? -lng : lng };
}

export function haversineKm(a: Coordinates, b: Coordinates): number {
    const rad = Math.PI / 180;
    const h = Math.sin((b.lat - a.lat) * rad / 2) ** 2 +
        Math.cos(a.lat * rad) * Math.cos(b.lat * rad) * Math.sin((b.lng - a.lng) * rad / 2) ** 2;
    return 2 * 6371 * Math.asin(Math.sqrt(h));
}

// The nearest mapped sites; for a site without coordinates, others in its district (km is null).
export function nearestSites(site: HistoricalSite, sites: HistoricalSite[], count: number): { site: HistoricalSite; km: number | null }[] {
    const origin = site.coordinates;
    if (!origin) {
        return sites.filter(s => s.region === site.region && s.id !== site.id).slice(0, count).map(s => ({ site: s, km: null }));
    }
    return sites
        .filter(s => s.coordinates && s.id !== site.id)
        .map(s => ({ site: s, km: haversineKm(origin, s.coordinates!) }))
        .sort((a, b) => a.km - b.km)
        .slice(0, count);
}

// Marker colour, from the site's first category so that a "Stupas / Stele" is a stupa, as in the
// legend. Also used for the header of a site without a photograph.
export function siteColor(site: HistoricalSite): string {
    const t = (site.categories[0] ?? site.type).toLowerCase();
    if (t.includes('stele')) return '#fbbf24'; // amber
    if (t.includes('pillar')) return '#f97316'; // orange
    if (t.includes('deval')) return '#a855f7'; // purple
    if (t.includes('stupa')) return '#84cc16'; // lime
    if (t.includes('temple')) return '#ef4444'; // red
    if (t.includes('fountain')) return '#06b6d4'; // cyan
    if (t.includes('fort')) return '#92400e'; // brown
    if (t.includes('palace')) return '#dc2626'; // crimson
    if (t.includes('inscription')) return '#eab308'; // yellow
    if (t.includes('monastery') || t.includes('vihara')) return '#d946ef'; // fuchsia
    if (t.includes('remains')) return '#bc6c25'; // tan
    if (t.includes('museum')) return '#0ea5e9'; // sky
    if (t.includes('mounds')) return '#d97706'; // amber
    if (t.includes('sculpture')) return '#f97316'; // coral
    if (t.includes('pavilion')) return '#8b5cf6'; // violet
    return '#6b7280'; // gray
}

// Where to draw each mapped site. Sites recorded at exactly the same point are spread on a
// ~15 m circle so every marker can be clicked; the stored coordinates are not changed.
export function markerPositions(sites: HistoricalSite[]): Map<string, Coordinates> {
    const stacks = new Map<string, HistoricalSite[]>();
    for (const site of sites) {
        if (!site.coordinates) continue;
        const key = `${site.coordinates.lat},${site.coordinates.lng}`;
        stacks.set(key, [...(stacks.get(key) ?? []), site]);
    }
    const positions = new Map<string, Coordinates>();
    for (const stack of stacks.values()) {
        stack.sort((a, b) => a.id.localeCompare(b.id)).forEach((site, i) => {
            const { lat, lng } = site.coordinates!;
            const angle = 2 * Math.PI * i / stack.length;
            positions.set(site.id, stack.length === 1
                ? { lat, lng }
                : { lat: lat + 0.00015 * Math.sin(angle), lng: lng + 0.00015 * Math.cos(angle) });
        });
    }
    return positions;
}
