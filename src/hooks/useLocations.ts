import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import type { HistoricalSite, Coordinates } from '../types';
import type { DbHistoricalSite } from '../types/database.types';
import bundledSites from '../data/sites.json';

// Parse coordinates string like "29.2717, 82.1568" to Coordinates object
function parseCoordinates(coordStr: string | null): Coordinates | null {
    if (!coordStr) return null;

    // Try different formats
    // Format 1: "29.2717, 82.1568"
    // Format 2: "29°16'18.1"N 82°09'24.5"E"

    // Simple decimal format
    const simpleMatch = coordStr.match(/(-?\d+\.?\d*),\s*(-?\d+\.?\d*)/);
    if (simpleMatch) {
        return {
            lat: parseFloat(simpleMatch[1]),
            lng: parseFloat(simpleMatch[2])
        };
    }

    // DMS format: 29°16'18.1"N 82°09'24.5"E
    const dmsMatch = coordStr.match(/(\d+)[°](\d+)['''](\d+\.?\d*)[""']?\s*([NS])\s+(\d+)[°](\d+)['''](\d+\.?\d*)[""']?\s*([EW])/);
    if (dmsMatch) {
        const lat = parseInt(dmsMatch[1]) + parseInt(dmsMatch[2]) / 60 + parseFloat(dmsMatch[3]) / 3600;
        const lng = parseInt(dmsMatch[5]) + parseInt(dmsMatch[6]) / 60 + parseFloat(dmsMatch[7]) / 3600;
        return {
            lat: dmsMatch[4] === 'S' ? -lat : lat,
            lng: dmsMatch[8] === 'W' ? -lng : lng
        };
    }

    return null;
}

// Transform database row to app HistoricalSite type with all fields
function transformDbSite(row: DbHistoricalSite): HistoricalSite {
    const coords = parseCoordinates(row.coordinates);

    return {
        // Core fields from database
        id: row.id,
        entry_no: row.entry_no || '',
        country: row.country,
        district: row.district || 'N/A',
        location: row.location,
        coordinates: coords,
        site_type: row.site_type,
        documentation: row.documentation,
        description: row.description,
        visit_date: row.visit_date,
        phase: row.phase,
        language: row.language,
        translation: row.translation,
        source: row.source,
        created_at: row.created_at,

        // Compatibility aliases for map components
        name: row.location,           // Map uses 'name' for labels
        type: row.site_type,          // Map uses 'type' for colors
        region: row.district || 'N/A', // Map uses 'region' for grouping
        elevation: 0                   // Historical sites don't have elevation
    };
}

// Dataset shipped with the app (built by scripts/build-sites-json.py). Rendered
// immediately; replaced only if a configured Supabase project answers.
const bundledLocations = (bundledSites as DbHistoricalSite[]).map(transformDbSite);

// One request per page load, shared by every component using the hook.
let remoteLocations: Promise<HistoricalSite[] | null> | undefined;

function fetchRemoteLocations(): Promise<HistoricalSite[] | null> {
    if (!supabase) return Promise.resolve(null);
    const client = supabase;
    remoteLocations ??= (async () => {
        try {
            const { data, error } = await client
                .from('historical_sites')
                .select('*')
                .order('location')
                .abortSignal(AbortSignal.timeout(8000));
            if (error) throw error;
            return data && data.length > 0 ? data.map(transformDbSite) : null;
        } catch (err) {
            console.warn('Supabase unavailable, using bundled data:', err);
            return null;
        }
    })();
    return remoteLocations;
}

interface UseLocationsResult {
    // Every site, including those without coordinates (map views skip those).
    locations: HistoricalSite[];
    loading: boolean;
}

export function useLocations(): UseLocationsResult {
    const [locations, setLocations] = useState(bundledLocations);
    const [loading, setLoading] = useState(supabase !== null);

    useEffect(() => {
        let cancelled = false;
        fetchRemoteLocations().then(remote => {
            if (cancelled) return;
            if (remote) setLocations(remote);
            setLoading(false);
        });
        return () => { cancelled = true; };
    }, []);

    return { locations, loading };
}
