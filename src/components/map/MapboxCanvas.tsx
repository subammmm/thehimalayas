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

export const MapboxCanvas = ({ locations, onLocationSelect }: MapboxCanvasProps) => {
    const mapContainer = useRef<HTMLDivElement>(null);
    const map = useRef<mapboxgl.Map | null>(null);
    const markers = useRef<mapboxgl.Marker[]>([]);
    const [isMapLoaded, setIsMapLoaded] = useState(false);

    // Initialize map
    useEffect(() => {
        console.log('🗺️ MapboxCanvas: Starting initialization...');

        if (!mapContainer.current) {
            console.error('❌ No map container!');
            setError('Map container missing');
            return;
        }

        if (map.current) {
            console.log('ℹ️ Map already initialized');
            return;
        }

        if (!MAPBOX_TOKEN || !mapboxgl.accessToken) {
            const msg = 'Missing Mapbox token - check .env file has VITE_MAPBOX_TOKEN';
            console.error('❌', msg);
            setError(msg);
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

                    console.log('✓ 3D terrain added');
                    setIsMapLoaded(true);
                } catch (err) {
                    console.error('❌ Error adding terrain:', err);
                    setError('Failed to add 3D terrain: ' + (err instanceof Error ? err.message : String(err)));
                }
            });

            // Handle errors
            map.current.on('error', (e) => {
                console.error('❌ Mapbox error event:', e);
                setError('Map error: ' + (e.error?.message || 'Unknown error'));
            });

        } catch (err) {
            console.error('❌ Failed to create map:', err);
            setError('Failed to create map: ' + (err instanceof Error ? err.message : String(err)));
        }

        return () => {
            console.log('MapboxCanvas: Cleanup');
            markers.current.forEach(m => m.remove());
            markers.current = [];
            map.current?.remove();
            map.current = null;
        };
    }, []);

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
                style={{ minHeight: '100vh' }}
            />
        </div>
    );
};
