import { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import type { Location, LocationType } from '../../types';

// Get token from environment
const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_TOKEN;

// Set token immediately
if (MAPBOX_TOKEN) {
    mapboxgl.accessToken = MAPBOX_TOKEN;
    console.log('✓ Mapbox token SET:', MAPBOX_TOKEN.substring(0, 20) + '...');
} else {
    console.error('✗ MAPBOX TOKEN MISSING! Check .env file');
}

interface MapboxCanvasProps {
    locations: Location[];
    onLocationSelect: (location: Location) => void;
    focusedLocation: Location | null;
    showConnections?: boolean; // Draw lines when filtering is active
}

const getColorByType = (type: LocationType): string => {
    switch (type) {
        case 'Peak': return '#f97316';
        case 'Valley': return '#22c55e';
        case 'Lake': return '#0ea5e9';
        case 'Monastery': return '#a855f7';
        case 'Village': return '#eab308';
        case 'Route/Trek': return '#3b82f6';
        case 'Glacier': return '#06b6d4';
        case 'Basecamp': return '#ef4444';
        default: return '#6b7280';
    }
};

export const MapboxCanvas = ({ locations, onLocationSelect, focusedLocation, showConnections = false }: MapboxCanvasProps) => {
    const mapContainer = useRef<HTMLDivElement>(null);
    const map = useRef<mapboxgl.Map | null>(null);
    const markers = useRef<mapboxgl.Marker[]>([]);
    const [isMapLoaded, setIsMapLoaded] = useState(false);

    // Initialize map
    useEffect(() => {
        console.log('🗺️ MapboxCanvas: Starting initialization...');

        if (!mapContainer.current) {
            console.error('❌ No map container!');
            ('Map container missing');
            return;
        }

        if (map.current) {
            console.log('ℹ️ Map already initialized');
            return;
        }

        if (!MAPBOX_TOKEN || !mapboxgl.accessToken) {
            const msg = 'Missing Mapbox token - check .env file has VITE_MAPBOX_TOKEN';
            console.error('❌', msg);
            (msg);
            return;
        }

        console.log('🎯 Creating Mapbox map...');

        try {
            map.current = new mapboxgl.Map({
                container: mapContainer.current,
                style: 'mapbox://styles/mapbox/satellite-streets-v12',
                center: [84.1240, 28.3949],
                zoom: 6.5,
                pitch: 45, // Less aggressive pitch for initial load
                antialias: true
            });

            console.log('✓ Map instance created');

            // Add navigation
            map.current.addControl(new mapboxgl.NavigationControl(), 'top-right');

            // Wait for map load
            map.current.on('load', () => {
                console.log('🎉 Map loaded successfully!');

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
                            'line-color': '#f97316', // Orange to match existing style
                            'line-width': 3,
                            'line-opacity': 0.8,
                            'line-dasharray': [2, 2] // Dashed line
                        }
                    });

                    console.log('✓ 3D terrain and connection lines layer added');
                    setIsMapLoaded(true);
                } catch (err) {
                    console.error('❌ Error adding terrain:', err);
                    ('Failed to add 3D terrain: ' + (err instanceof Error ? err.message : String(err)));
                }
            });

            // Handle errors
            map.current.on('error', (e) => {
                console.error('❌ Mapbox error event:', e);
                ('Map error: ' + (e.error?.message || 'Unknown error'));
            });

        } catch (err) {
            console.error('❌ Failed to create map:', err);
            ('Failed to create map: ' + (err instanceof Error ? err.message : String(err)));
        }

        return () => {
            console.log('MapboxCanvas: Cleanup');
            markers.current.forEach(m => m.remove());
            markers.current = [];
            map.current?.remove();
            map.current = null;
        };
    }, []);

    // Handle external focus changes (SEARCH or CLICK)
    useEffect(() => {
        if (!map.current || !isMapLoaded || !focusedLocation) return;

        console.log('🦅 Flying to:', focusedLocation.name);

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
            console.log('🔗 Connection lines cleared');
            return;
        }

        // Create a chain of connections between all filtered locations
        const coordinates: [number, number][] = locations.map(loc => [
            loc.coordinates.lng,
            loc.coordinates.lat
        ]);

        // Create GeoJSON LineString connecting all points
        const geojsonData: GeoJSON.FeatureCollection = {
            type: 'FeatureCollection',
            features: [{
                type: 'Feature',
                properties: {},
                geometry: {
                    type: 'LineString',
                    coordinates: coordinates
                }
            }]
        };

        source.setData(geojsonData);
        console.log(`🔗 Connection lines drawn between ${locations.length} locations`);

    }, [locations, showConnections, isMapLoaded]);

    // Update markers when locations change
    useEffect(() => {
        if (!map.current || !isMapLoaded) return;

        console.log(`MapboxCanvas: Updating ${locations.length} markers`);

        // Remove existing markers
        markers.current.forEach(marker => marker.remove());
        markers.current = [];

        // Add new markers
        locations.forEach(location => {
            const color = getColorByType(location.type);

            // Create marker element with custom styling
            const el = document.createElement('div');
            el.className = 'custom-mapbox-marker';
            el.style.cssText = `
                width: 20px;
                height: 20px;
                border-radius: 50%;
                background-color: ${color};
                border: 3px solid white;
                box-shadow: 0 0 0 2px ${color}40, 0 4px 12px rgba(0,0,0,0.3);
                cursor: pointer;
                transition: all 0.2s ease;
            `;

            el.addEventListener('mouseenter', () => {
                el.style.transform = 'scale(1.3)';
                el.style.zIndex = '1000';
            });

            el.addEventListener('mouseleave', () => {
                el.style.transform = 'scale(1)';
                el.style.zIndex = 'auto';
            });

            // Create marker
            const marker = new mapboxgl.Marker({
                element: el,
                anchor: 'center'
            })
                .setLngLat([location.coordinates.lng, location.coordinates.lat])
                .addTo(map.current!);

            // Add click handler
            el.addEventListener('click', (e) => {
                e.stopPropagation();
                onLocationSelect(location);

                // Fly to location with smooth animation
                map.current?.flyTo({
                    center: [location.coordinates.lng, location.coordinates.lat],
                    zoom: 13,
                    pitch: 70,
                    bearing: 30,
                    duration: 2000,
                    essential: true
                });
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
        </div>
    );
};
