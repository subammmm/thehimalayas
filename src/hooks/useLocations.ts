import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { mockLocations } from '../data/mockData';
import type { Location } from '../types';
import type { DbLocation } from '../types/database.types';

// Transform database row to app Location type
function transformDbLocation(row: DbLocation): Location {
    return {
        id: row.id,
        name: row.name,
        type: row.type as Location['type'],
        region: row.region as Location['region'],
        coordinates: {
            lat: row.latitude,
            lng: row.longitude,
        },
        elevation: row.elevation,
        description: row.description || '',
        images: row.images || [],
        tags: row.tags || [],
        relatedLocations: row.related_location_ids || [],
    };
}

interface UseLocationsResult {
    locations: Location[];
    loading: boolean;
    error: string | null;
    refetch: () => Promise<void>;
}

export function useLocations(): UseLocationsResult {
    const [locations, setLocations] = useState<Location[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchLocations = useCallback(async () => {
        setLoading(true);
        setError(null);

        try {
            const { data, error: supabaseError } = await supabase
                .from('locations')
                .select('*')
                .order('name');

            if (supabaseError) {
                throw supabaseError;
            }

            if (data && data.length > 0) {
                const transformedLocations = data.map(transformDbLocation);
                setLocations(transformedLocations);
            } else {
                // Fallback to mock data if no data in Supabase
                console.warn('No data in Supabase, using mock data fallback');
                setLocations(mockLocations);
            }
        } catch (err) {
            console.error('Error fetching locations:', err);
            setError(err instanceof Error ? err.message : 'Failed to fetch locations');
            // Fallback to mock data on error
            setLocations(mockLocations);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchLocations();
    }, [fetchLocations]);

    return { locations, loading, error, refetch: fetchLocations };
}
