import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import type { HistoricalSite, Coordinates } from '../types';
import type { DbHistoricalSite } from '../types/database.types';

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

// Transform database row to app HistoricalSite type with compatibility properties
function transformDbSite(row: DbHistoricalSite): HistoricalSite {
    const coords = parseCoordinates(row.coordinates);

    return {
        // Core fields
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
        source: row.source,
        created_at: row.created_at,

        // Compatibility aliases for map components
        name: row.location,           // Map uses 'name' for labels
        type: row.site_type,          // Map uses 'type' for colors
        region: row.district || 'N/A', // Map uses 'region' for grouping
        elevation: 0                   // Historical sites don't have elevation
    };
}

interface UseLocationsResult {
    locations: HistoricalSite[];
    loading: boolean;
    error: string | null;
    refetch: () => Promise<void>;
}

export function useLocations(): UseLocationsResult {
    const [locations, setLocations] = useState<HistoricalSite[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchLocations = useCallback(async () => {
        setLoading(true);
        setError(null);

        try {
            const { data, error: supabaseError } = await supabase
                .from('historical_sites')
                .select('*')
                .order('location');

            if (supabaseError) {
                throw supabaseError;
            }

            if (data && data.length > 0) {
                const transformedLocations = data.map(transformDbSite);
                // Filter out sites without coordinates (can't display on map)
                const mappableLocations = transformedLocations.filter(loc => loc.coordinates !== null);
                setLocations(mappableLocations);
                console.log(`✓ Loaded ${mappableLocations.length} mappable historical sites (${transformedLocations.length - mappableLocations.length} without coordinates)`);
            } else {
                console.warn('No historical sites found in Supabase');
                setLocations([]);
            }
        } catch (err) {
            console.error('Error fetching historical sites:', err);
            setError(err instanceof Error ? err.message : 'Failed to fetch historical sites');
            setLocations([]);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchLocations();
    }, [fetchLocations]);

    return { locations, loading, error, refetch: fetchLocations };
}
