import { useEffect, useRef, useState } from 'react';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import type { Location, LocationType } from '../../types';

console.log('🗺️ MapLibre GL initialized (free, no token needed)');

interface MapLibreCanvasProps {
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

export const MapLibreCanvas = ({ locations, onLocationSelect }: MapLibreCanvasProps) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const mapRef = useRef<maplibregl.Map | null>(null);
    const markersRef = useRef<maplibregl.Marker[]>([]);
    const [isLoaded, setIsLoaded] = useState(false);
    const [error, setError] = useState('');

    // Initialize map
    useEffect(() => {
        if (!containerRef.current || mapRef.current) return;

        console.log('🎯 Creating MapLibre map...');

        try {
            const map = new maplibregl.Map({
                container: containerRef.current,
                style: {
                    version: 8,
                    sources: {
                        'raster-tiles': {
                            type: 'raster',
                            tiles: ['https://tile.openstreetmap.org/{z}/{x}/{y}.png'],
                            tileSize: 256,
                            attribution: '© OpenStreetMap contributors'
                        },
                        'terrarium': {
                            type: 'raster-dem',
                            tiles: ['https://s3.amazonaws.com/elevation-tiles-prod/terrarium/{z}/{x}/{y}.png'],
                            encoding: 'terrarium',
                            tileSize: 256
                        }
                    },
                    layers: [{
                        id: 'osm-tiles',
                        type: 'raster',
                        source: 'raster-tiles'
                    }],
                    terrain: {
                        source: 'terrarium',
                        exaggeration: 1.5
                    }
                },
                center: [84.1240, 28.3949],
                zoom: 7,
                pitch: 60,
                bearing: 0
            });

            mapRef.current = map;

            // Add navigation controls
            map.addControl(new maplibregl.NavigationControl({
                visualizePitch: true
            }), 'top-right');

            map.on('load', () => {
                console.log('✓ MapLibre loaded with terrain!');
                setIsLoaded(true);
            });

            map.on('error', (e) => {
                console.error('❌ MapLibre error:', e);
                setError('Map failed to load');
            });

        } catch (err) {
            console.error('❌ Failed to create map:', err);
            setError(err instanceof Error ? err.message : 'Failed to initialize map');
        }

        return () => {
            markersRef.current.forEach(m => m.remove());
            markersRef.current = [];
            mapRef.current?.remove();
            mapRef.current = null;
        };
    }, []);

    // Add markers
    useEffect(() => {
        if (!mapRef.current || !isLoaded || locations.length === 0) return;

        console.log(`📍 Adding ${locations.length} markers`);

        // Remove existing
        markersRef.current.forEach(m => m.remove());
        markersRef.current = [];

        // Add new markers
        locations.forEach(location => {
            if (!mapRef.current) return;

            const color = getColorByType(location.type);

            // Create marker element
            const el = document.createElement('div');
            el.style.cssText = `
                width: 16px;
                height: 16px;
                border-radius: 50%;
                background-color: ${color};
                border: 3px solid white;
                box-shadow: 0 0 0 2px ${color}80, 0 4px 8px rgba(0,0,0,0.3);
                cursor: pointer;
                transition: all 0.2s ease;
            `;

            el.addEventListener('mouseenter', () => {
                el.style.transform = 'scale(1.4)';
            });

            el.addEventListener('mouseleave', () => {
                el.style.transform = 'scale(1)';
            });

            el.addEventListener('click', () => {
                onLocationSelect(location);
                mapRef.current?.flyTo({
                    center: [location.coordinates.lng, location.coordinates.lat],
                    zoom: 12,
                    pitch: 70,
                    duration: 2000
                });
            });

            const marker = new maplibregl.Marker({ element: el })
                .setLngLat([location.coordinates.lng, location.coordinates.lat])
                .addTo(mapRef.current);

            markersRef.current.push(marker);
        });
    }, [locations, isLoaded, onLocationSelect]);

    return (
        <div className="relative w-full h-full">
            <div ref={containerRef} className="absolute inset-0" />

            {!isLoaded && !error && (
                <div className="absolute inset-0 flex items-center justify-center bg-gray-100 z-10">
                    <div className="text-center">
                        <div className="w-12 h-12 border-4 border-gray-300 border-t-gray-800 rounded-full animate-spin mx-auto mb-4" />
                        <p className="text-gray-600 font-medium">Loading 3D Map...</p>
                        <p className="text-gray-400 text-xs mt-2">Free & Open Source</p>
                    </div>
                </div>
            )}

            {error && (
                <div className="absolute inset-0 flex items-center justify-center bg-red-50 z-10">
                    <div className="text-center p-8 bg-white rounded-xl shadow-lg max-w-md mx-4">
                        <p className="text-red-600 font-bold mb-2">⚠️ Map Error</p>
                        <p className="text-gray-700 text-sm mb-4 font-mono bg-gray-100 p-3 rounded">{error}</p>
                        <button
                            onClick={() => window.location.reload()}
                            className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                        >
                            Reload
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};
