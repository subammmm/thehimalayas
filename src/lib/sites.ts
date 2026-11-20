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

export function haversineKm(a: Coordinates, b: Coordinates): number {
    const rad = Math.PI / 180;
    const h = Math.sin((b.lat - a.lat) * rad / 2) ** 2 +
        Math.cos(a.lat * rad) * Math.cos(b.lat * rad) * Math.sin((b.lng - a.lng) * rad / 2) ** 2;
    return 2 * 6371 * Math.asin(Math.sqrt(h));
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
