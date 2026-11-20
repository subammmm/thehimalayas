import { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import type { HistoricalSite, SiteType } from '../../types';
import { markerPositions } from '../../lib/sites';

// Type alias for backward compatibility
type Location = HistoricalSite;
type LocationType = SiteType | string;

// Get token from environment
const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_TOKEN;

if (MAPBOX_TOKEN) mapboxgl.accessToken = MAPBOX_TOKEN;

interface MapboxCanvasProps {
    locations: Location[];
    onLocationSelect: (location: Location) => void;
    focusedLocation: Location | null;
    showConnections?: boolean; // Draw lines when filtering is active
}

const getColorByType = (type: LocationType): string => {
    // Normalize type for matching (handle variations)
    const normalizedType = type.toLowerCase();

    if (normalizedType.includes('stele')) return '#fbbf24'; // amber
    if (normalizedType.includes('pillar')) return '#f97316'; // orange
    if (normalizedType.includes('deval')) return '#a855f7'; // purple
    if (normalizedType.includes('stupa')) return '#84cc16'; // lime
    if (normalizedType.includes('temple')) return '#ef4444'; // red
    if (normalizedType.includes('fountain')) return '#06b6d4'; // cyan
    if (normalizedType.includes('fort')) return '#92400e'; // brown
    if (normalizedType.includes('palace')) return '#dc2626'; // crimson
    if (normalizedType.includes('inscription')) return '#eab308'; // yellow
    if (normalizedType.includes('monastery') || normalizedType.includes('vihara')) return '#d946ef'; // fuchsia
    if (normalizedType.includes('remains')) return '#bc6c25'; // tan
    if (normalizedType.includes('museum')) return '#0ea5e9'; // sky
    if (normalizedType.includes('mounds')) return '#d97706'; // amber
    if (normalizedType.includes('sculpture')) return '#f97316'; // coral
    if (normalizedType.includes('pavilion')) return '#8b5cf6'; // violet

    return '#6b7280'; // gray
};

export const MapboxCanvas = ({ locations, onLocationSelect, focusedLocation, showConnections = false }: MapboxCanvasProps) => {
    const mapContainer = useRef<HTMLDivElement>(null);
    const map = useRef<mapboxgl.Map | null>(null);
    const markers = useRef<mapboxgl.Marker[]>([]);
    const [isMapLoaded, setIsMapLoaded] = useState(false);
    const [notice, setNotice] = useState(MAPBOX_TOKEN ? '' : 'No Mapbox access token is configured (VITE_MAPBOX_TOKEN).');

    // Initialize map
    useEffect(() => {

        if (!mapContainer.current) {
            console.error('❌ No map container!');
            console.error('Map container missing');
            return;
        }

        if (map.current) {
            return;
        }

        if (!MAPBOX_TOKEN) return; // the notice below explains



        try {
            map.current = new mapboxgl.Map({
                container: mapContainer.current,
                style: 'mapbox://styles/mapbox/satellite-streets-v12',
                // Extent of the mapped sites (Dailekh to Mugu). The old fixed view was centred on
                // central Nepal, which left every marker off-screen on a phone.
                bounds: [[81.55, 28.78], [82.40, 29.60]],
                fitBoundsOptions: { padding: 60 },
                pitch: 45, // Less aggressive pitch for initial load
                antialias: true
            });

            // Add navigation
            map.current.addControl(new mapboxgl.NavigationControl(), 'top-right');

            // Wait for map load
            let hasLoaded = false;
            map.current.on('load', () => {
                hasLoaded = true;

                try {
                    if (!map.current) return;

                    // Add 3D terrain
                    map.current.addSource('mapbox-dem', {
                        type: 'raster-dem',
                        url: 'mapbox://mapbox.mapbox-terrain-dem-v1',
                        tileSize: 512,
                        maxzoom: 14
                    });

                    map.current.setTerrain({
                        source: 'mapbox-dem',
                        exaggeration: 1.5
                    });

                    // Add sky
                    map.current.addLayer({
                        id: 'sky',
                        type: 'sky',
                        paint: {
                            'sky-type': 'atmosphere',
                            'sky-atmosphere-sun': [0.0, 0.0],
                            'sky-atmosphere-sun-intensity': 15
                        }
                    });

                    // Add connection lines source and layer
                    map.current.addSource('connection-lines', {
                        type: 'geojson',
                        data: {
                            type: 'FeatureCollection',
                            features: []
                        }
                    });

                    map.current.addLayer({
                        id: 'connection-lines-layer',
                        type: 'line',
                        source: 'connection-lines',
                        layout: {
                            'line-join': 'round',
                            'line-cap': 'round'
                        },
                        paint: {
                            'line-color': ['get', 'color'], // Use color from feature properties
                            'line-width': 3,
                            'line-opacity': 0.8,
                            'line-dasharray': [2, 2] // Dashed line
                        }
                    });

                    setIsMapLoaded(true);
                } catch (err) {
                    console.error('❌ Error adding terrain:', err);
                    console.error('Failed to add 3D terrain: ' + (err instanceof Error ? err.message : String(err)));
                }
            });

            // Handle errors
            map.current.on('error', (e) => {
                console.error('❌ Mapbox error event:', e);
                // Before the first load, 401 or 403 means the token was refused
                // (malformed, revoked or restricted to another URL)
                if (!hasLoaded && [401, 403].includes((e.error as { status?: number } | undefined)?.status ?? 0)) {
                    setNotice('The Mapbox access token was rejected (VITE_MAPBOX_TOKEN).');
                }
            });

        } catch (err) {
            console.error('❌ Failed to create map:', err);
            console.error('Failed to create map: ' + (err instanceof Error ? err.message : String(err)));
        }

        return () => {
            markers.current.forEach(m => m.remove());
            markers.current = [];
            map.current?.remove();
            map.current = null;
        };
    }, []);

    // Handle external focus changes (SEARCH or CLICK)
    useEffect(() => {
        if (!map.current || !isMapLoaded || !focusedLocation || !focusedLocation.coordinates) return;

        map.current.flyTo({
            center: [focusedLocation.coordinates.lng, focusedLocation.coordinates.lat],
            zoom: 14,
            pitch: 60,
            bearing: 0,
            duration: 3000,
            essential: true
        });

        // Add a pulsing marker effect or popup?
        // For now just moving the camera is sufficient.

    }, [focusedLocation, isMapLoaded]);

    // Update connection lines when locations or showConnections changes
    useEffect(() => {
        if (!map.current || !isMapLoaded) return;

        const source = map.current.getSource('connection-lines') as mapboxgl.GeoJSONSource;
        if (!source) return;

        // Only show connections if showConnections is true and we have 2+ locations
        if (!showConnections || locations.length < 2) {
            source.setData({
                type: 'FeatureCollection',
                features: []
            });
            return;
        }

        // Group locations by type and create line segments for each type
        const locationsByType = new Map<string, Location[]>();

        locations.forEach(loc => {
            const existing = locationsByType.get(loc.type) || [];
            existing.push(loc);
            locationsByType.set(loc.type, existing);
        });

        // Create line features for each type (connecting locations of same type)
        const features: GeoJSON.Feature[] = [];

        locationsByType.forEach((locs, type) => {
            // Filter out locations without coordinates
            const validLocs = locs.filter(loc => loc.coordinates !== null);
            if (validLocs.length < 2) return; // Need at least 2 to draw a line

            const color = getColorByType(type as LocationType);
            const coordinates: [number, number][] = validLocs
                .filter(loc => loc.coordinates)
                .map(loc => [
                    loc.coordinates!.lng,
                    loc.coordinates!.lat
                ]);

            features.push({
                type: 'Feature',
                properties: { color, type },
                geometry: {
                    type: 'LineString',
                    coordinates: coordinates
                }
            });
        });

        // Create GeoJSON with type-colored lines
        const geojsonData: GeoJSON.FeatureCollection = {
            type: 'FeatureCollection',
            features
        };

        source.setData(geojsonData);


    }, [locations, showConnections, isMapLoaded]);

    // Update markers when locations change
    useEffect(() => {
        if (!map.current || !isMapLoaded) return;

        // Remove existing markers
        markers.current.forEach(marker => marker.remove());
        markers.current = [];

        // Add new markers (only for locations with valid coordinates)
        const positions = markerPositions(locations);
        locations
            .forEach(location => {
                const coords = positions.get(location.id);
                if (!coords) return; // no coordinates recorded

                const color = getColorByType(location.type);

                // Create marker container (Mapbox positions this)
                // A real button, so markers can be reached and activated from the keyboard
                const container = document.createElement('button');
                container.type = 'button';
                container.className = 'marker-container';
                container.setAttribute('aria-label', `${location.name}, ${location.type}, ${location.entry_no}`);
                container.style.cssText = `
                    width: 20px;
                    height: 20px;
                    padding: 0;
                    border: 0;
                    border-radius: 50%;
                    background: none;
                    cursor: pointer;
                `;

                // Create visible inner dot (we animate this)
                const inner = document.createElement('div');
                inner.className = 'custom-mapbox-marker';
                inner.style.cssText = `
                    width: 100%;
                    height: 100%;
                    border-radius: 50%;
                    background-color: ${color};
                    border: 3px solid white;
                    box-shadow: 0 0 0 2px ${color}40, 0 4px 12px rgba(0,0,0,0.3);
                    transition: transform 0.2s ease;
                    transform-origin: center center;
                    will-change: transform;
                `;
                container.appendChild(inner);

                // Hover effects on the inner element
                container.addEventListener('mouseenter', () => {
                    inner.style.transform = 'scale(1.3)';
                    container.style.zIndex = '1000';
                });

                container.addEventListener('mouseleave', () => {
                    inner.style.transform = 'scale(1)';
                    container.style.zIndex = 'auto';
                });

                const marker = new mapboxgl.Marker({
                    element: container,
                    anchor: 'center'
                })
                    .setLngLat([coords.lng, coords.lat])
                    .addTo(map.current!);

                // Add click handler
                container.addEventListener('click', (e) => {
                    e.stopPropagation();
                    onLocationSelect(location);

                    // Fly to location with smooth animation
                    if (location.coordinates) {
                        map.current?.flyTo({
                            center: [location.coordinates.lng, location.coordinates.lat],
                            zoom: 13,
                            pitch: 70,
                            bearing: 30,
                            duration: 2000,
                            essential: true
                        });
                    }
                });

                markers.current.push(marker);
            });
    }, [locations, isMapLoaded, onLocationSelect]);

    return (
        <div className="relative w-full h-full">
            <div
                ref={mapContainer}
                className="absolute inset-0 w-full h-full"
                style={{ minHeight: '100dvh' }}
            />
            {notice && (
                <div role="alert" className="absolute inset-0 flex items-start justify-center bg-gray-100 px-6 pt-36">
                    <div className="max-w-sm text-center">
                        <p className="font-semibold text-gray-900 mb-2">The base map could not be loaded</p>
                        <p className="text-sm text-gray-600">{notice} Search, filters and the site list still work.</p>
                    </div>
                </div>
            )}
        </div>
    );
};
